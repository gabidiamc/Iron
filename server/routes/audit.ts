import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Staff/Admin: Get audit logs with filter by action and user
router.get('/', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { action, search, limit } = req.query;
    let logs = db.getAuditLogs();

    if (action && typeof action === 'string' && action !== 'ALL') {
      logs = logs.filter(l => l.action === action);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      logs = logs.filter(l =>
        l.user_name.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.reason && l.reason.toLowerCase().includes(q))
      );
    }

    const maxItems = limit && typeof limit === 'string' ? parseInt(limit, 10) : 100;
    logs = logs.slice(0, maxItems);

    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener registros de auditoría.' });
  }
});

export default router;
