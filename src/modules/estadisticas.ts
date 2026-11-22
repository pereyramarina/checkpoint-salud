import { PrismaClient, Rol } from '@prisma/client';

const prisma = new PrismaClient();

export async function obtenerEstadisticasCompliance(usuario: { rol: Rol; empresaId?: string }) {
  try {
    // Si es EMPRESA, filtramos estrictamente por su ID. Si es MÉDICO/ADMIN, ve el global de la clínica.
    const filtroEmpresaTurno =
      usuario.rol === Rol.EMPRESA && usuario.empresaId
        ? { empresaId: usuario.empresaId }
        : {};

    // 1. Obtenemos todos los aptos médicos aplicando el mismo criterio de seguridad
    const aptos = await prisma.aptoMedico.findMany({
      where: {
        turno: filtroEmpresaTurno,
      },
      include: {
        turno: {
          include: {
            empresa: { select: { razonSocial: true, cuit: true } },
            puesto: { select: { nombrePuesto: true } },
          },
        },
      },
    });

    const hoy = new Date();
    let totalVigentes = 0;
    let totalVencidos = 0;
    let totalProximosAVencer = 0; // Menos de 30 días

    const limiteAlerta = new Date();
    limiteAlerta.setDate(hoy.getDate() + 30);

    aptos.forEach((apto) => {
      if (!apto.fechaVencimiento) return;

      if (apto.fechaVencimiento < hoy) {
        totalVencidos++;
      } else if (apto.fechaVencimiento <= limiteAlerta) {
        totalProximosAVencer++;
        totalVigentes++; // Sigue vigente pero en alerta
      } else {
        totalVigentes++;
      }
    });

    const totalDotacion = aptos.length;
    const porcentajeCompliance = totalDotacion > 0 ? Math.round((totalVigentes / totalDotacion) * 100) : 100;

    console.log(`📊 Estadísticas calculadas con éxito para rol: ${usuario.rol} (Compliance: ${porcentajeCompliance}%)`);

    return {
      resumenGeneral: {
        totalDotacion,
        aptosAlDia: totalVigentes,
        vencidos: totalVencidos,
        proximosAVencer30Dias: totalProximosAVencer,
        indiceCompliancePorcentaje: porcentajeCompliance,
      },
      detallePorApto: aptos.map((a) => ({
        idApto: a.id,
        resultado: a.resultado,
        emision: a.fechaEmision,
        vencimiento: a.fechaVencimiento,
        empresa: a.turno.empresa.razonSocial,
        puesto: a.turno.puesto.nombrePuesto,
        estadoActual: a.fechaVencimiento && a.fechaVencimiento < hoy ? 'VENCIDO ❌' : 'VIGENTE ✅',
      })),
    };
  } catch (error: any) {
    console.error('❌ Error al calcular estadísticas de compliance:', error.message);
    throw error;
  }
}