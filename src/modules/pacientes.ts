import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function registrarPaciente(datos: {
  dni: string;
  cuil?: string;
  nombreCompleto: string;
  fechaNacimiento: string; // Formato "YYYY-MM-DD"
  telefono?: string;
}) {
  try {
    const nuevoPaciente = await prisma.paciente.create({
      data: {
        dni: datos.dni,
        cuil: datos.cuil,
        nombreCompleto: datos.nombreCompleto,
        fechaNacimiento: new Date(datos.fechaNacimiento),
        telefono: datos.telefono,
      },
    });
    console.log('✅ Paciente registrado con éxito:', nuevoPaciente.nombreCompleto);
    return nuevoPaciente;
  } catch (error: any) {
    console.error('❌ Error al registrar paciente (¿DNI duplicado?):', error.message);
    throw error;
  }
}

export async function listarPacientes() {
  const pacientes = await prisma.paciente.findMany({
    include: { turnos: true },
  });
  console.log(`📋 Total de pacientes en el sistema: ${pacientes.length}`);
  return pacientes;
}