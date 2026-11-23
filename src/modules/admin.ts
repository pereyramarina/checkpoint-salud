import { Prisma, PrismaClient, Rol, Sede } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function crearEmpresaCliente(datos: {
  razonSocial: string;
  cuit: string;
  emailAlertas: string;
}) {
  try {
    return await prisma.empresa.create({
      data: {
        razonSocial: datos.razonSocial.trim(),
        cuit: datos.cuit.trim(),
        emailAlertas: datos.emailAlertas.toLowerCase().trim(),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Ya existe una empresa registrada con ese CUIT.');
    }
    throw error;
  }
}

export async function crearUsuarioPorSuperAdmin(datos: {
  email: string;
  passwordPlain: string;
  nombre: string;
  rol: Rol;
  sede?: Sede;
  empresaId?: string;
}) {
  if (datos.rol === Rol.PACIENTE) {
    throw new Error('Los pacientes no usan cuentas con email; se cargan en nómina y acceden por DNI.');
  }

  if (datos.rol === Rol.EMPRESA && !datos.empresaId) {
    throw new Error('Debe asignar obligatoriamente una empresaId para los usuarios de rol EMPRESA.');
  }

  const passwordHash = await bcrypt.hash(datos.passwordPlain, 10);

  try {
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email: datos.email.toLowerCase().trim(),
        passwordHash,
        nombre: datos.nombre.trim(),
        rol: datos.rol,
        sede: datos.sede || null,
        empresaId: datos.empresaId || null,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        sede: true,
        empresaId: true,
        activo: true,
      },
    });

    return nuevoUsuario;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Ya existe una cuenta registrada con ese correo electrónico.');
    }
    throw error;
  }
}