import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export interface FilaExcelOperario {
  DNI?: string | number;
  CUIL?: string | number;
  NOMBRE_COMPLETO?: string;
  TELEFONO?: string | number;
}

export async function procesarExcelOperarios(bufferArchivo: Buffer, empresaId: string) {
  // 1. Leer el libro de Excel desde el buffer en memoria
  const workbook = XLSX.read(bufferArchivo, { type: 'buffer' });
  const nombrePrimeraHoja = workbook.SheetNames[0];

  if (!nombrePrimeraHoja) {
    throw new Error('El archivo Excel está vacío o no contiene hojas válidas.');
  }

  const hoja = workbook.Sheets[nombrePrimeraHoja];
  const filas: FilaExcelOperario[] = XLSX.utils.sheet_to_json(hoja);

  if (filas.length === 0) {
    throw new Error('No se encontraron registros de operarios en la hoja.');
  }

  let insertados = 0;
  let actualizados = 0;
  const errores: { fila: number; motivo: string; datos: any }[] = [];

  // 2. Iterar, validar e impactar en PostgreSQL vinculados estrictamente a empresaId
  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];
    const numeroFilaExcel = i + 2; // +2 considerando encabezado en fila 1

    const dniLimpio = fila.DNI ? String(fila.DNI).replace(/\D/g, '').trim() : '';
    const cuilLimpio = fila.CUIL ? String(fila.CUIL).trim() : '';
    const nombreLimpio = fila.NOMBRE_COMPLETO ? String(fila.NOMBRE_COMPLETO).trim() : '';
    const telefonoLimpio = fila.TELEFONO ? String(fila.TELEFONO).trim() : null;

    // Validación de campos obligatorios
    if (!dniLimpio || !cuilLimpio || !nombreLimpio) {
      errores.push({
        fila: numeroFilaExcel,
        motivo: 'Faltan datos obligatorios (DNI, CUIL o NOMBRE_COMPLETO).',
        datos: fila,
      });
      continue;
    }

    try {
      // Verificar si el operario ya existe para evitar conflictos entre empresas
      const existente = await prisma.paciente.findUnique({
        where: { dni: dniLimpio },
      });

      if (existente) {
        if (existente.empresaId !== empresaId) {
          errores.push({
            fila: numeroFilaExcel,
            motivo: `El DNI ${dniLimpio} ya se encuentra registrado bajo otra empresa en el sistema.`,
            datos: fila,
          });
          continue;
        }

        // Si pertenece a la misma empresa, actualizamos sus datos
        await prisma.paciente.update({
          where: { dni: dniLimpio },
          data: {
            cuil: cuilLimpio,
            nombreCompleto: nombreLimpio,
            telefono: telefonoLimpio,
          },
        });
        actualizados++;
      } else {
        // Si es nuevo, lo creamos vinculado a la empresa
        await prisma.paciente.create({
          data: {
            dni: dniLimpio,
            cuil: cuilLimpio,
            nombreCompleto: nombreLimpio,
            telefono: telefonoLimpio,
            empresaId,
          },
        });
        insertados++;
      }
    } catch (err: any) {
      errores.push({
        fila: numeroFilaExcel,
        motivo: `Error de integridad en base de datos (posible CUIL duplicado): ${err.message}`,
        datos: fila,
      });
    }
  }

  return {
    resumen: {
      totalFilasProcesadas: filas.length,
      nuevosIngresos: insertados,
      registrosActualizados: actualizados,
      filasConError: errores.length,
    },
    detalleErrores: errores,
  };
}
export function generarPlantillaExcelBuffer(): Buffer {
  const datosEjemplo = [
    {
      DNI: '36987654',
      CUIL: '20-36987654-3',
      NOMBRE_COMPLETO: 'Juan Pablo Sosa',
      TELEFONO: '299-5112233',
    },
    {
      DNI: '38456123',
      CUIL: '27-38456123-9',
      NOMBRE_COMPLETO: 'María Laura Peralta',
      TELEFONO: '299-4998877',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(datosEjemplo);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nomina_Operarios');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}