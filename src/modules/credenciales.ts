import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export async function generarQRApto(dni: string) {
  const paciente = await prisma.paciente.findUnique({
    where: { dni: dni.trim() },
    include: {
      empresa: true,
      aptos: {
        orderBy: { fechaEmision: 'desc' },
        take: 1,
        include: {
          turno: {
            include: { puesto: true },
          },
        },
      },
    },
  });

  if (!paciente) {
    throw new Error(`No existe ningún operario registrado con DNI ${dni}.`);
  }

  const ultimoApto = paciente.aptos[0];
  if (!ultimoApto) {
    throw new Error(`El operario ${paciente.nombreCompleto} aún no posee certificados de aptitud emitidos.`);
  }

  const hoy = new Date();
  const vigente = ultimoApto.fechaVencimiento >= hoy && ultimoApto.resultado !== 'NO_APTO';

  const payloadQR = JSON.stringify({
    sistema: 'CheckPoint Salud',
    dni: paciente.dni,
    operario: paciente.nombreCompleto,
    empresa: paciente.empresa.razonSocial,
    puesto: ultimoApto.turno.puesto.nombrePuesto,
    resultado: ultimoApto.resultado,
    vencimiento: ultimoApto.fechaVencimiento.toISOString().split('T')[0],
    vigente,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(payloadQR);

  return {
    operario: paciente.nombreCompleto,
    dni: paciente.dni,
    empresa: paciente.empresa.razonSocial,
    puesto: ultimoApto.turno.puesto.nombrePuesto,
    resultado: ultimoApto.resultado,
    fechaVencimiento: ultimoApto.fechaVencimiento,
    vigente,
    qrCodeDataUrl,
  };
}