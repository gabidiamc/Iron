import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Get current user's notifications
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado.' });
      return;
    }

    const notifications = db.getNotificationsByUser(req.user.id);
    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({ notifications, unreadCount });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener notificaciones.' });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado.' });
      return;
    }

    const { id } = req.params;
    const success = db.markNotificationAsRead(id, req.user.id);

    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Notificación no encontrada.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Error al actualizar notificación.' });
  }
});

// Mark all as read
router.post('/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado.' });
      return;
    }

    db.markAllNotificationsAsRead(req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al actualizar notificaciones.' });
  }
});

export default router;
