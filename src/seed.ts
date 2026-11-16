import { PrismaClient, Rol, Sede } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inicializando CheckPoint Salud con arquitectura definitiva...');

  // 1. Crear cuenta SUPERADMIN inicial
  const adminPass = await bcrypt.hash('AdminCheckPoint2026!', 10);
  const superAdmin = await prisma.usuario.upsert({
    where: { email: 'admin@checkpointsalud.com' },
    update: {},
    create: {
      email: 'admin@checkpointsalud.com',
      passwordHash: adminPass,
      nombre: 'Marina - Gerencia CheckPoint Salud',
      rol: Rol.SUPERADMIN,
    },
  });
  console.log(`✅ SuperAdmin listo: ${superAdmin.email}`);

  // 2. Crear Empresa Petrolera de ejemplo
  const empresa = await prisma.empresa.upsert({
    where: { cuit: '30-71234567-8' },
    update: {},
    create: {
      razonSocial: 'Petrolera Vaca Muerta S.A.',
      cuit: '30-71234567-8',
      emailAlertas: 'rrhh@vacamuertapetrolera.com',
    },
  });
  console.log(`✅ Empresa creada: ${empresa.razonSocial}`);

  // 3. Crear usuario RRHH asignado a esa empresa
  const rrhhPass = await bcrypt.hash('Empresa2026!', 10);
  await prisma.usuario.upsert({
    where: { email: 'rrhh.vacamuerta@gmail.com' },
    update: {},
    create: {
      email: 'rrhh.vacamuerta@gmail.com',
      passwordHash: rrhhPass,
      nombre: 'Lucía Fernández (RRHH)',
      rol: Rol.EMPRESA,
      empresaId: empresa.id,
    },
  });

  // 4. Crear Médico en Sede Neuquén
  const medicoPass = await bcrypt.hash('Medico2026!', 10);
  await prisma.usuario.upsert({
    where: { email: 'dr.martinez.nqn@gmail.com' },
    update: {},
    create: {
      email: 'dr.martinez.nqn@gmail.com',
      passwordHash: medicoPass,
      nombre: 'Dr. Roberto Martínez',
      rol: Rol.MEDICO,
      sede: Sede.NEUQUEN_CAPITAL,
    },
  });

  // 5. Crear Puestos parametrizados
  await prisma.puesto.upsert({
    where: { nombrePuesto: 'Operario de Yacimiento' },
    update: {},
    create: {
      nombrePuesto: 'Operario de Yacimiento',
      vigenciaMeses: 12,
    },
  });

  // 6. Crear Operario de prueba (acceso por DNI)
  await prisma.paciente.upsert({
    where: { dni: '35123456' },
    update: {},
    create: {
      dni: '35123456',
      cuil: '20-35123456-4',
      nombreCompleto: 'Carlos Gómez',
      telefono: '299-4567890',
      empresaId: empresa.id,
    },
  });

  console.log('🚀 Base de datos inicializada correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });