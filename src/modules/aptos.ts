import { PrismaClient, ResultadoApto, Rol } from '@prisma/client';

const prisma = new PrismaClient();

// Emitir un nuevo Apto Médico (Exclusivo rol MEDICO)
export async function emitirAptoMedico(datos: {
  turnoId: string;
  resultado: ResultadoApto;
  detalleClinico: string;
}) {
  const turno = await prisma.turno.findUnique({
    where: { id: datos.turnoId },
    include: { puesto: true },
  });

  if (!turno) {
    throw new Error('Turno no encontrado.');
  }

  const fechaEmision = new Date();
  const fechaVencimiento = new Date(fechaEmision);
  fechaVencimiento.setMonth(fechaVencimiento.getMonth() + turno.puesto.vigenciaMeses);

  // Transacción: crear apto y marcar turno como ATENDIDO
  const [apto] = await prisma.$transaction([
    prisma.aptoMedico.create({
      data: {
        resultado: datos.resultado,
        fechaEmision,
        fechaVencimiento,
        detalleClinico: datos.detalleClinico,
        turnoId: turno.id,
        pacienteId: turno.pacienteId,
      },
    }),
    prisma.turno.update({
      where: { id: turno.id },
      data: { estado: 'ATENDIDO' },
    }),
  ]);

  return apto;
}

// Consultar aptos aplicando la Regla de Oro de segregación de datos
export async function consultarAptosSeguros(usuario: {
  id: string;
  rol: Rol;
  empresaId?: string | null;
}) {
  const esMedico = usuario.rol === Rol.MEDICO;

  let filtroWhere: any = {};
  if (usuario.rol === Rol.EMPRESA) {
    if (!usuario.empresaId) throw new Error('Usuario de empresa sin empresaId.');
    filtroWhere = { turno: { empresaId: usuario.empresaId } };
  } else if (usuario.rol === Rol.PACIENTE) {
    filtroWhere = { pacienteId: usuario.id };
  }

  return await prisma.aptoMedico.findMany({
    where: filtroWhere,
    orderBy: { fechaEmision: 'desc' },
    select: {
      id: true,
      resultado: true,
      fechaEmision: true,
      fechaVencimiento: true,
      // REGLA DE ORO: Solo el médico accede al detalleClinico
      detalleClinico: esMedico,
      paciente: {
        select: { dni: true, cuil: true, nombreCompleto: true },
      },
      turno: {
        select: {
          sede: true,
          empresa: { select: { razonSocial: true, cuit: true } },
          puesto: { select: { nombrePuesto: true } },
        },
      },
    },
  });
}