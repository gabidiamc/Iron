import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User, VolunteerProfile, UserRole } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'volunteer-portal-secure-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
  profile?: VolunteerProfile;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({ error: 'No autorizado. Por favor inicia sesión.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: UserRole };
    const user = db.findUserById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado o sesión inválida.' });
      return;
    }

    req.user = user;
    const profile = db.getProfileByUserId(user.id);
    if (profile) {
      req.profile = profile;
    }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado. Inicia sesión de nuevo.' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado.' });
      return;
    }

    // ADMIN has all STAFF permissions
    const userRole = req.user.role;
    const isAllowed = roles.includes(userRole) || (roles.includes('STAFF') && userRole === 'ADMIN');

    if (!isAllowed) {
      res.status(403).json({ error: 'Acceso denegado. No tienes permisos para realizar esta acción.' });
      return;
    }

    next();
  };
}

/**
 * Parses times in format "HH:MM" (24h or with AM/PM) into duration minutes
 */
export function calculateMinutesFromTimeRange(startTime: string, endTime: string): number {
  function parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const clean = timeStr.trim().toUpperCase();

    // Check if 12-hour format with AM/PM
    const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = parseInt(match12[2], 10);
      const ampm = match12[3];

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }

    // Fallback 24-hour format "HH:MM"
    const parts = clean.split(':');
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      return h * 60 + m;
    }

    return 0;
  }

  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  if (endMin > startMin) {
    return endMin - startMin;
  } else if (endMin > 0 && endMin <= startMin) {
    // Overnight or cross midnight
    return (1440 - startMin) + endMin;
  }
  return 0;
}

/**
 * Formats duration minutes into human-readable Spanish string, e.g. "4 h 30 min", "2 h", "45 min"
 */
export function formatMinutesToSpanish(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0 min';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} h ${minutes} min`;
  } else if (hours > 0) {
    return `${hours} h`;
  } else {
    return `${minutes} min`;
  }
}
