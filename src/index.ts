import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { PrismaClient, Rol } from '@prisma/client';
import { verificarRol, AuthRequest } from './middlewares/authRole';
import { loginUsuarioCorporativo, loginOperarioPorDNI } from './modules/auth';
import { crearEmpresaCliente, crearUsuarioPorSuperAdmin } from './modules/admin';
import { procesarExcelOperarios, generarPlantillaExcelBuffer } from './modules/cargaMasiva';
import {
  proponerTurnoClinica,
  aprobarTurnoEmpresa,
  confirmarTurnoPaciente,
  solicitarReprogramacionTurno,
  reprogramarFechaClinica,
  listarTurnosPorRol,
} from './modules/turnos';
import { emitirAptoMedico, consultarAptosSeguros } from './modules/aptos';
import { generarQRApto } from './modules/credenciales';
import { obtenerEstadisticasCompliance } from './modules/estadisticas';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// ==========================================
// 1. HEALTH CHECK & AUTENTICACIÓN
// ==========================================
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', message: 'CheckPoint Salud API operativa en Vaca Muerta' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error });
  }
});

// Login para SUPERADMIN, MEDICO, RECEPCION y EMPRESA (Email + Password)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const resultado = await loginUsuarioCorporativo(email, password);
    res.json({ success: true, ...resultado });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

// Login directo para PACIENTE / OPERARIO (Solo DNI)
app.post('/api/auth/login-operario', async (req, res) => {
  try {
    const { dni } = req.body;
    const resultado = await loginOperarioPorDNI(dni);
    res.json({ success: true, ...resultado });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. GESTIÓN EXCLUSIVA SUPERADMIN & CATÁLOGOS
// ==========================================
app.get(
  '/api/admin/empresas',
  verificarRol([Rol.SUPERADMIN, Rol.RECEPCION]),
  async (_req, res) => {
    try {
      const empresas = await prisma.empresa.findMany({
        orderBy: { razonSocial: 'asc' },
        select: { id: true, razonSocial: true, cuit: true, emailAlertas: true },
      });
      res.json({ success: true, data: empresas });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

app.post('/api/admin/empresas', verificarRol([Rol.SUPERADMIN]), async (req, res) => {
  try {
    const empresa = await crearEmpresaCliente(req.body);
    res.status(201).json({ success: true, data: empresa });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/usuarios', verificarRol([Rol.SUPERADMIN]), async (req, res) => {
  try {
    const usuario = await crearUsuarioPorSuperAdmin(req.body);
    res.status(201).json({ success: true, data: usuario });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Catálogo de puestos parametrizados para desplegables
app.get(
  '/api/puestos',
  verificarRol([Rol.SUPERADMIN, Rol.RECEPCION, Rol.MEDICO, Rol.EMPRESA]),
  async (_req, res) => {
    try {
      const puestos = await prisma.puesto.findMany({
        orderBy: { nombrePuesto: 'asc' },
      });
      res.json({ success: true, data: puestos });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Listado de operarios/pacientes con aislamiento estricto por empresa
app.get(
  '/api/pacientes',
  verificarRol([Rol.SUPERADMIN, Rol.RECEPCION, Rol.MEDICO, Rol.EMPRESA]),
  async (req: AuthRequest, res) => {
    try {
      const filtroWhere =
        req.usuario!.rol === Rol.EMPRESA ? { empresaId: req.usuario!.empresaId! } : {};

      const pacientes = await prisma.paciente.findMany({
        where: filtroWhere,
        orderBy: { nombreCompleto: 'asc' },
        include: {
          empresa: { select: { id: true, razonSocial: true, cuit: true } },
        },
      });
      res.json({ success: true, total: pacientes.length, data: pacientes });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ==========================================
// 3. CARGA MASIVA EXCEL (EMPRESA / SUPERADMIN)
// ==========================================
app.get(
  '/api/operarios/plantilla-excel',
  verificarRol([Rol.EMPRESA, Rol.SUPERADMIN]),
  (_req, res) => {
    const buffer = generarPlantillaExcelBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename="Plantilla_Operarios_CheckPoint.xlsx"');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buffer);
  }
);

app.post(
  '/api/operarios/carga-masiva',
  verificarRol([Rol.EMPRESA, Rol.SUPERADMIN]),
  upload.single('archivo'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Debe adjuntar un archivo .xlsx' });
      }

      const empresaId =
        req.usuario!.rol === Rol.EMPRESA ? req.usuario!.empresaId : req.body.empresaId;

      if (!empresaId) {
        return res
          .status(400)
          .json({ success: false, error: 'Falta identificar la empresa destino.' });
      }

      const reporte = await procesarExcelOperarios(req.file.buffer, empresaId);
      res.json({ success: true, data: reporte });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

// ==========================================
// 4. FLUJO DE TURNOS BIDIRECCIONAL
// ==========================================
app.get(
  '/api/turnos',
  verificarRol([Rol.SUPERADMIN, Rol.RECEPCION, Rol.MEDICO, Rol.EMPRESA, Rol.PACIENTE]),
  async (req: AuthRequest, res) => {
    try {
      const turnos = await listarTurnosPorRol(req.usuario!);
      res.json({ success: true, total: turnos.length, data: turnos });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

// Clínica propone turno
app.post(
  '/api/turnos/proponer',
  verificarRol([Rol.RECEPCION, Rol.SUPERADMIN]),
  async (req, res) => {
    try {
      const turno = await proponerTurnoClinica(req.body);
      res.status(201).json({ success: true, data: turno });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

// Empresa aprueba turno de su operario
app.patch(
  '/api/turnos/:id/aprobar-empresa',
  verificarRol([Rol.EMPRESA]),
  async (req: AuthRequest, res) => {
    try {
      const turno = await aprobarTurnoEmpresa(String(req.params.id), req.usuario!.empresaId!);
      res.json({ success: true, data: turno });
    } catch (error: any) {
      res.status(403).json({ success: false, error: error.message });
    }
  }
);

// Operario confirma turno definitivo
app.patch(
  '/api/turnos/:id/confirmar-paciente',
  verificarRol([Rol.PACIENTE]),
  async (req: AuthRequest, res) => {
    try {
      const turno = await confirmarTurnoPaciente(String(req.params.id), req.usuario!.id);
      res.json({ success: true, data: turno });
    } catch (error: any) {
      res.status(403).json({ success: false, error: error.message });
    }
  }
);

// Operario o Empresa solicita reprogramación
app.patch(
  '/api/turnos/:id/solicitar-reprogramacion',
  verificarRol([Rol.PACIENTE, Rol.EMPRESA]),
  async (req: AuthRequest, res) => {
    try {
      const turno = await solicitarReprogramacionTurno(
        String(req.params.id),
        req.body.motivo,
        req.usuario!
      );
      res.json({ success: true, data: turno });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

// Clínica reasigna fecha tras solicitud de cambio
app.patch(
  '/api/turnos/:id/reprogramar-clinica',
  verificarRol([Rol.RECEPCION, Rol.SUPERADMIN]),
  async (req, res) => {
    try {
      const { nuevaFechaHora, nuevaSede } = req.body;
      const turno = await reprogramarFechaClinica(String(req.params.id), nuevaFechaHora, nuevaSede);
      res.json({ success: true, data: turno });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

// ==========================================
// 5. APTOS MÉDICOS, COMPLIANCE Y CREDENCIAL QR
// ==========================================
app.post('/api/aptos/emitir', verificarRol([Rol.MEDICO]), async (req, res) => {
  try {
    const apto = await emitirAptoMedico(req.body);
    res.status(201).json({ success: true, data: apto });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get(
  '/api/aptos',
  verificarRol([Rol.MEDICO, Rol.EMPRESA, Rol.SUPERADMIN, Rol.RECEPCION, Rol.PACIENTE]),
  async (req: AuthRequest, res) => {
    try {
      const aptos = await consultarAptosSeguros(req.usuario!);
      res.json({ success: true, rolAcceso: req.usuario!.rol, total: aptos.length, data: aptos });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

app.get(
  '/api/compliance',
  verificarRol([Rol.MEDICO, Rol.EMPRESA, Rol.SUPERADMIN]),
  async (req: AuthRequest, res) => {
    try {
      const stats = await obtenerEstadisticasCompliance({
        rol: req.usuario!.rol,
        empresaId: req.usuario!.empresaId || undefined,
      });
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Credencial QR protegida por rol y validación de identidad
app.get(
  '/api/credencial/:dni',
  verificarRol([Rol.PACIENTE, Rol.EMPRESA, Rol.SUPERADMIN, Rol.RECEPCION, Rol.MEDICO]),
  async (req: AuthRequest, res) => {
    try {
      const dniSolicitado = String(req.params.dni).trim();

      if (req.usuario!.rol === Rol.PACIENTE && req.usuario!.dni !== dniSolicitado) {
        return res.status(403).json({
          success: false,
          error: 'Acceso denegado: solo puede consultar su propia credencial.',
        });
      }

      if (req.usuario!.rol === Rol.EMPRESA) {
        const paciente = await prisma.paciente.findUnique({ where: { dni: dniSolicitado } });
        if (!paciente || paciente.empresaId !== req.usuario!.empresaId) {
          return res.status(403).json({
            success: false,
            error: 'Acceso denegado: el operario no pertenece a su empresa.',
          });
        }
      }

      const credencial = await generarQRApto(dniSolicitado);
      res.json({ success: true, data: credencial });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }
);

// Verificación pública en portería de yacimiento (sin login ni datos clínicos)
app.get('/api/public/verificar/:dni', async (req, res) => {
  try {
    const dniSolicitado = String(req.params.dni).replace(/\D/g, '').trim();
    const credencial = await generarQRApto(dniSolicitado);

    res.json({
      success: true,
      data: {
        operario: credencial.operario,
        dni: credencial.dni,
        empresa: credencial.empresa,
        puesto: credencial.puesto,
        resultado: credencial.resultado,
        vigente: credencial.vigente,
        fechaVencimiento: credencial.fechaVencimiento,
      },
    });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CheckPoint Salud API corriendo en http://localhost:${PORT}`);
});