/*
  Warnings:

  - The values [PENDIENTE,CONFIRMADO,AUSENTE] on the enum `EstadoTurno` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDIENTE] on the enum `ResultadoApto` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN] on the enum `Rol` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deletedAt` on the `AptoMedico` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `fechaNacimiento` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Turno` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the `PuestoRequisito` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `fechaEmision` on table `AptoMedico` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fechaVencimiento` on table `AptoMedico` required. This step will fail if there are existing NULL values in that column.
  - Made the column `detalleClinico` on table `AptoMedico` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `empresaId` to the `Paciente` table without a default value. This is not possible if the table is not empty.
  - Made the column `cuil` on table `Paciente` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `sede` on the `Turno` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `nombre` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Sede" AS ENUM ('NEUQUEN_CAPITAL', 'RINCON_DE_LOS_SAUCES');

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoTurno_new" AS ENUM ('PROPUESTO_CLINICA', 'APROBADO_EMPRESA', 'CONFIRMADO_PACIENTE', 'REPROGRAMACION_SOLICITADA', 'ATENDIDO', 'CANCELADO');
ALTER TABLE "Turno" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Turno" ALTER COLUMN "estado" TYPE "EstadoTurno_new" USING ("estado"::text::"EstadoTurno_new");
ALTER TYPE "EstadoTurno" RENAME TO "EstadoTurno_old";
ALTER TYPE "EstadoTurno_new" RENAME TO "EstadoTurno";
DROP TYPE "EstadoTurno_old";
ALTER TABLE "Turno" ALTER COLUMN "estado" SET DEFAULT 'PROPUESTO_CLINICA';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ResultadoApto_new" AS ENUM ('APTO', 'APTO_CON_PREEXISTENCIAS', 'NO_APTO');
ALTER TABLE "AptoMedico" ALTER COLUMN "resultado" DROP DEFAULT;
ALTER TABLE "AptoMedico" ALTER COLUMN "resultado" TYPE "ResultadoApto_new" USING ("resultado"::text::"ResultadoApto_new");
ALTER TYPE "ResultadoApto" RENAME TO "ResultadoApto_old";
ALTER TYPE "ResultadoApto_new" RENAME TO "ResultadoApto";
DROP TYPE "ResultadoApto_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Rol_new" AS ENUM ('SUPERADMIN', 'MEDICO', 'RECEPCION', 'EMPRESA', 'PACIENTE');
ALTER TABLE "Usuario" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "Usuario" ALTER COLUMN "rol" TYPE "Rol_new" USING ("rol"::text::"Rol_new");
ALTER TYPE "Rol" RENAME TO "Rol_old";
ALTER TYPE "Rol_new" RENAME TO "Rol";
DROP TYPE "Rol_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "PuestoRequisito" DROP CONSTRAINT "PuestoRequisito_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "Turno" DROP CONSTRAINT "Turno_puestoId_fkey";

-- AlterTable
ALTER TABLE "AptoMedico" DROP COLUMN "deletedAt",
ALTER COLUMN "resultado" DROP DEFAULT,
ALTER COLUMN "fechaEmision" SET NOT NULL,
ALTER COLUMN "fechaEmision" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "fechaVencimiento" SET NOT NULL,
ALTER COLUMN "detalleClinico" SET NOT NULL;

-- AlterTable
ALTER TABLE "Empresa" DROP COLUMN "deletedAt",
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "deletedAt",
DROP COLUMN "fechaNacimiento",
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "empresaId" TEXT NOT NULL,
ALTER COLUMN "cuil" SET NOT NULL;

-- AlterTable
ALTER TABLE "Turno" DROP COLUMN "deletedAt",
ADD COLUMN     "aprobadoPorEmpresa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "confirmadoPorPaciente" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "motivoCambioFecha" TEXT,
DROP COLUMN "sede",
ADD COLUMN     "sede" "Sede" NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'PROPUESTO_CLINICA';

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "sede" "Sede",
ALTER COLUMN "rol" DROP DEFAULT;

-- DropTable
DROP TABLE "PuestoRequisito";

-- CreateTable
CREATE TABLE "Puesto" (
    "id" TEXT NOT NULL,
    "nombrePuesto" TEXT NOT NULL,
    "vigenciaMeses" INTEGER NOT NULL DEFAULT 12,

    CONSTRAINT "Puesto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Puesto_nombrePuesto_key" ON "Puesto"("nombrePuesto");

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
