import { PrismaClient, EstadoTurno, Rol, Sede } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Clínica (RECEPCION / SUPERADMIN) propone un turno para un operario
export async function proponerTurnoClinica(datos: {
  pacienteId: string;
  puestoId: string;
  fechaHora: string; // Formato ISO
  sede: Sede;
}) {
  const paciente = await prisma.paciente.findUnique({
    where: { id: datos.pacienteId },
  });

  if (!paciente) {
    throw new Error('Operario no encontrado en el padrón.');
  }

  const puesto = await prisma.puesto.findUnique({
    where: { id: datos.puestoId },
  });

  if (!puesto) {
    throw new Error('Puesto laboral no parametrizado.');
  }

  return await prisma.turno.create({
    data: {
      fechaHora: new Date(datos.fechaHora),
      sede: datos.sede,
      estado: EstadoTurno.PROPUESTO_CLINICA,
      aprobadoPorEmpresa: false,
      confirmadoPorPaciente: false,
      pacienteId: paciente.id,
      empresaId: paciente.empresaId,
      puestoId: puesto.id,
    },
    include: {
      paciente: { select: { dni: true, nombreCompleto: true } },
      empresa: { select: { razonSocial: true } },
      puesto: { select: { nombrePuesto: true } },
    },
  });
}

// 2. Empresa (RRHH) aprueba el turno propuesto para su operario
export async function aprobarTurnoEmpresa(turnoId: string, empresaIdUsuario: string) {
  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
  });

  if (!turno) {
    throw new Error('Turno no encontrado.');
  }

  // Aislamiento estricto: una empresa solo puede aprobar turnos de su propia dotación
  if (turno.empresaId !== empresaIdUsuario) {
    throw new Error('Acceso denegado: este turno pertenece a otra empresa.');
  }

  if (turno.estado === EstadoTurno.CANCELADO || turno.estado === EstadoTurno.ATENDIDO) {
    throw new Error(`No se puede aprobar un turno en estado ${turno.estado}.`);
  }

  // Si el paciente ya había confirmado antes, pasa a CONFIRMADO_PACIENTE; si no, APROBADO_EMPRESA
  const nuevoEstado = turno.confirmadoPorPaciente
    ? EstadoTurno.CONFIRMADO_PACIENTE
    : EstadoTurno.APROBADO_EMPRESA;

  return await prisma.turno.update({
    where: { id: turnoId },
    data: {
      aprobadoPorEmpresa: true,
      estado: nuevoEstado,
    },
  });
}

// 3. Operario (PACIENTE autenticado por DNI) confirma asistencia definitiva
export async function confirmarTurnoPaciente(turnoId: string, pacienteIdUsuario: string) {
  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
  });

  if (!turno) {
    throw new Error('Turno no encontrado.');
  }

  if (turno.pacienteId !== pacienteIdUsuario) {
    throw new Error('Acceso denegado: solo puede confirmar sus propios turnos.');
  }

  if (turno.estado === EstadoTurno.CANCELADO || turno.estado === EstadoTurno.ATENDIDO) {
    throw new Error(`No se puede confirmar un turno en estado ${turno.estado}.`);
  }

  return await prisma.turno.update({
    where: { id: turnoId },
    data: {
      confirmadoPorPaciente: true,
      estado: EstadoTurno.CONFIRMADO_PACIENTE,
    },
  });
}

// 4. Operario o Empresa solicita reprogramación (cambio de fecha)
export async function solicitarReprogramacionTurno(
  turnoId: string,
  motivo: string,
  actor: { id: string; rol: Rol; empresaId?: string | null }
) {
  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
  });

  if (!turno) {
    throw new Error('Turno no encontrado.');
  }

  // Validar propiedad según el rol que solicita el cambio
  if (actor.rol === Rol.PACIENTE && turno.pacienteId !== actor.id) {
    throw new Error('Acceso denegado: no puede modificar turnos de otro operario.');
  }

  if (actor.rol === Rol.EMPRESA && turno.empresaId !== actor.empresaId) {
    throw new Error('Acceso denegado: este turno pertenece a otra empresa.');
  }

  if (!motivo || motivo.trim().length < 5) {
    throw new Error('Debe indicar un motivo válido para solicitar la reprogramación.');
  }

  return await prisma.turno.update({
    where: { id: turnoId },
    data: {
      estado: EstadoTurno.REPROGRAMACION_SOLICITADA,
      motivoCambioFecha: `[${actor.rol}]: ${motivo.trim()}`,
      aprobadoPorEmpresa: false,
      confirmadoPorPaciente: false,
    },
  });
}

// 5. Clínica (RECEPCION / SUPERADMIN) reasigna nueva fecha tras solicitud de cambio
export async function reprogramarFechaClinica(
  turnoId: string,
  nuevaFechaHora: string,
  nuevaSede?: Sede
) {
  const turno = await prisma.turno.findUnique({
    where: { id: turnoId },
  });

  if (!turno) {
    throw new Error('Turno no encontrado.');
  }

  return await prisma.turno.update({
    where: { id: turnoId },
    data: {
      fechaHora: new Date(nuevaFechaHora),
      sede: nuevaSede || turno.sede,
      estado: EstadoTurno.PROPUESTO_CLINICA,
      motivoCambioFecha: null,
      aprobadoPorEmpresa: false,
      confirmadoPorPaciente: false,
    },
  });
}

// 6. Consulta de turnos filtrada estrictamente por rol
export async function listarTurnosPorRol(usuario: {
  id: string;
  rol: Rol;
  empresaId?: string | null;
  sede?: Sede | null;
}) {
  let filtroWhere: any = {};

  if (usuario.rol === Rol.PACIENTE) {
    filtroWhere = { pacienteId: usuario.id };
  } else if (usuario.rol === Rol.EMPRESA) {
    if (!usuario.empresaId) throw new Error('Usuario de empresa sin empresaId asignada.');
    filtroWhere = { empresaId: usuario.empresaId };
  } else if ((usuario.rol === Rol.MEDICO || usuario.rol === Rol.RECEPCION) && usuario.sede) {
    filtroWhere = { sede: usuario.sede };
  }
  // SUPERADMIN ve todos los turnos sin filtro restrictivo

  return await prisma.turno.findMany({
    where: filtroWhere,
    orderBy: { fechaHora: 'asc' },
    include: {
      paciente: { select: { id: true, dni: true, cuil: true, nombreCompleto: true, telefono: true } },
      empresa: { select: { id: true, razonSocial: true, cuit: true } },
      puesto: { select: { id: true, nombrePuesto: true, vigenciaMeses: true } },
      // Regla de Oro: Nunca incluimos detalleClinico en listados generales de turnos
      aptoMedico: {
        select: {
          id: true,
          resultado: true,
          fechaEmision: true,
          fechaVencimiento: true,
        },
      },
    },
  });
}