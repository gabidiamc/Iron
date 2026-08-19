import { Router, Request, Response } from 'express';
import { db, GalleryItem } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/gallery - Get gallery photos
router.get('/', (req: Request, res: Response): void => {
  try {
    const { event_id } = req.query;
    let items = db.getGallery();
    if (event_id && typeof event_id === 'string') {
      items = items.filter(g => g.event_id === event_id);
    }
    res.json({ gallery: items });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener galería de fotos.' });
  }
});

// POST /api/gallery - Staff/Admin upload gallery photo
router.post('/', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { title, image_url, event_id, event_title, date, description } = req.body;

    if (!title || !image_url) {
      res.status(400).json({ error: 'El título y la URL de la imagen son obligatorios.' });
      return;
    }

    const item: GalleryItem = {
      id: `gal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      image_url: image_url.trim(),
      event_id: event_id || undefined,
      event_title: event_title || undefined,
      date: date || new Date().toISOString().split('T')[0],
      description: description ? description.trim() : undefined,
      uploaded_by: req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : 'Staff',
      created_at: new Date().toISOString(),
    };

    const created = db.createGalleryItem(item);
    res.status(201).json({ message: 'Foto agregada a la galería con éxito.', item: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al agregar foto a la galería.' });
  }
});

// DELETE /api/gallery/:id - Delete gallery photo
router.delete('/:id', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const deleted = db.deleteGalleryItem(id);
    if (!deleted) {
      res.status(404).json({ error: 'Foto no encontrada.' });
      return;
    }
    res.json({ message: 'Foto eliminada de la galería.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al eliminar foto de la galería.' });
  }
});

export default router;
