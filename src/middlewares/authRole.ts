import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Rol, Sede } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'checkpoint_salud_vaca_muerta_secret_2026';

export interface AuthRequest extends Request {
  usuario?: {
    id: string;
    rol: Rol;
    empresaId?: string | null;
    sede?: Sede | null;
    dni?: string;
    email?: string;
  };
}

export function verificarRol(rolesPermitidos: Rol[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Acceso denegado. Token de autenticación no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['usuario'];

      if (!decoded || !rolesPermitidos.includes(decoded.rol)) {
        return res.status(403).json({
          success: false,
          error: `Acceso prohibido. Su rol (${decoded?.rol}) no tiene permisos para realizar esta acción.`,
        });
      }

      req.usuario = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado. Por favor, inicie sesión nuevamente.',
      });
    }
  };
}