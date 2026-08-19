import { Router, Request, Response } from 'express';
import { db, Announcement } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/announcements - Get announcements
router.get('/', (req: Request, res: Response): void => {
  try {
    const { target_role } = req.query;
    let items = db.getAnnouncements();

    if (target_role && typeof target_role === 'string' && target_role !== 'ALL') {
      items = items.filter(a => a.target_role === 'ALL' || a.target_role === target_role);
    }

    res.json({ announcements: items });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener avisos.' });
  }
});

// POST /api/announcements - Staff/Admin create announcement (Bloque E1)
router.post('/', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { title, content, priority, target_role, is_banner } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'El título y el contenido son obligatorios.' });
      return;
    }

    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff';
    const now = new Date().toISOString();

    const ann: Announcement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      content: content.trim(),
      priority: priority || 'normal',
      target_role: target_role || 'ALL',
      is_banner: Boolean(is_banner),
      created_by: staffName,
      created_at: now,
      updated_at: now,
    };

    const created = db.createAnnouncement(ann);

    db.logAudit(
      req.user!.id,
      staffName,
      req.user!.role,
      'ANNOUNCEMENT_CREATED',
      created.id,
      null,
      created,
      'Nuevo aviso publicado'
    );

    res.status(201).json({ message: 'Aviso publicado exitosamente.', announcement: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al crear el aviso.' });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const deleted = db.deleteAnnouncement(id);
    if (!deleted) {
      res.status(404).json({ error: 'Aviso no encontrado.' });
      return;
    }

    db.logAudit(
      req.user!.id,
      req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : 'Staff',
      req.user!.role,
      'ANNOUNCEMENT_DELETED',
      id
    );

    res.json({ message: 'Aviso eliminado exitosamente.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al eliminar el aviso.' });
  }
});

export default router;
