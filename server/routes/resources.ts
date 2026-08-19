import { Router, Request, Response } from 'express';
import { db, ResourceItem } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Public: Get all resources
router.get('/', (req: Request, res: Response): void => {
  try {
    const { category } = req.query;
    let resources = db.getResources();
    if (category && typeof category === 'string' && category !== 'ALL') {
      resources = resources.filter(r => r.category === category);
    }
    res.json({ resources });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener recursos.' });
  }
});

// Staff/Admin: Add resource
router.post('/', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { title, description, category, url, icon } = req.body;
    if (!title || !description) {
      res.status(400).json({ error: 'Título y descripción son requeridos.' });
      return;
    }

    const newRes: ResourceItem = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      description: description.trim(),
      category: category || 'informacion',
      url: url?.trim() || '',
      icon: icon || '',
      created_at: new Date().toISOString(),
    };

    db.createResource(newRes);
    res.status(201).json({ message: 'Recurso creado exitosamente.', resource: newRes });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al crear recurso.' });
  }
});

export default router;
