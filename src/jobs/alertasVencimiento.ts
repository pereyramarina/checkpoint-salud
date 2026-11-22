import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function verificarVencimientosYAplicarAlertas() {
  console.log('🔍 Ejecutando Job: Verificando aptos médicos próximos a vencer...');

  const hoy = new Date();
  const limiteAlerta = new Date();
  limiteAlerta.setDate(hoy.getDate() + 30); // Alerta con 30 días de anticipación

  try {
    // Buscamos aptos cuya fecha de vencimiento esté entre hoy y los próximos 30 días
    const aptosProximosAVencer = await prisma.aptoMedico.findMany({
      where: {
        fechaVencimiento: {
          lte: limiteAlerta,
          gte: hoy,
        },
      },
      include: {
        paciente: true,
        turno: {
          include: {
            empresa: true,
            puesto: true,
          },
        },
      },
    });

    console.log(`⚠️ Se encontraron ${aptosProximosAVencer.length} aptos próximos a vencer.`);

    // Simulamos el disparo de notificaciones por email a cada empresa
    for (const apto of aptosProximosAVencer) {
      const empresa = apto.turno.empresa;
      console.log(
        `📧 [ALERTA ENVIADA A: ${empresa.emailAlertas}] Empresa: ${empresa.razonSocial} | ` +
        `Operario: ${apto.paciente.nombreCompleto} | ` +
        `Puesto: ${apto.turno.puesto.nombrePuesto} | ` +
        `Vence el: ${apto.fechaVencimiento?.toLocaleDateString()}`
      );
    }

    return aptosProximosAVencer;
  } catch (error: any) {
    console.error('❌ Error al ejecutar el job de alertas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecución directa si se corre por terminal
verificarVencimientosYAplicarAlertas();