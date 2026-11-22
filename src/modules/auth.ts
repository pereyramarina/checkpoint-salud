import { PrismaClient, Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'checkpoint_salud_vaca_muerta_secret_2026';

// 1. Login para Clínica, Médicos, Recepción y RRHH de Empresas (por Email)
export async function loginUsuarioCorporativo(email: string, password: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { empresa: true },
  });

  if (!usuario || !usuario.activo) {
    throw new Error('Credenciales inválidas o usuario deshabilitado.');
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) {
    throw new Error('Credenciales inválidas.');
  }

  const payload = {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
    sede: usuario.sede,
    empresaId: usuario.empresaId,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      sede: usuario.sede,
      empresa: usuario.empresa ? usuario.empresa.razonSocial : null,
    },
  };
}

// 2. Login Directo por DNI para Operarios / Pacientes (Sin fricción)
export async function loginOperarioPorDNI(dni: string) {
  const paciente = await prisma.paciente.findUnique({
    where: { dni: dni.trim() },
    include: { empresa: true },
  });

  if (!paciente) {
    throw new Error('No se encontró un operario registrado con ese DNI. Consulte con su empresa o recepción.');
  }

  const payload = {
    id: paciente.id,
    dni: paciente.dni,
    nombre: paciente.nombreCompleto,
    rol: Rol.PACIENTE,
    empresaId: paciente.empresaId,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

  return {
    token,
    operario: {
      id: paciente.id,
      nombre: paciente.nombreCompleto,
      dni: paciente.dni,
      rol: Rol.PACIENTE,
      empresa: paciente.empresa.razonSocial,
    },
  };
}