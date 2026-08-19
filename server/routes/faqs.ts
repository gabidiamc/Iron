import { Router, Request, Response } from 'express';
import { db, FaqItem } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/faqs - Public FAQs
router.get('/', (req: Request, res: Response): void => {
  try {
    const { category } = req.query;
    let items = db.getFaqs();
    if (category && typeof category === 'string' && category !== 'ALL') {
      items = items.filter(f => f.category === category);
    }
    res.json({ faqs: items });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener preguntas frecuentes.' });
  }
});

// POST /api/faqs - Admin/Staff create FAQ
router.post('/', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { question, answer, category, order } = req.body;

    if (!question || !answer) {
      res.status(400).json({ error: 'La pregunta y la respuesta son obligatorias.' });
      return;
    }

    const faq: FaqItem = {
      id: `faq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      question: question.trim(),
      answer: answer.trim(),
      category: category ? category.trim() : 'General',
      published: true,
      order: order ? Number(order) : 0,
      created_at: new Date().toISOString(),
    };

    const created = db.createFaq(faq);
    res.status(201).json({ message: 'Pregunta frecuente creada.', faq: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al crear la pregunta frecuente.' });
  }
});

// PUT /api/faqs/:id - Update FAQ
router.put('/:id', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { question, answer, category, order } = req.body;

    const updated = db.updateFaq(id, {
      question: question ? question.trim() : undefined,
      answer: answer ? answer.trim() : undefined,
      category: category ? category.trim() : undefined,
      order: order !== undefined ? Number(order) : undefined,
    });

    if (!updated) {
      res.status(404).json({ error: 'Pregunta no encontrada.' });
      return;
    }

    res.json({ message: 'Pregunta actualizada.', faq: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al actualizar FAQ.' });
  }
});

// DELETE /api/faqs/:id - Delete FAQ
router.delete('/:id', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const deleted = db.deleteFaq(id);
    if (!deleted) {
      res.status(404).json({ error: 'Pregunta no encontrada.' });
      return;
    }
    res.json({ message: 'Pregunta eliminada.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al eliminar FAQ.' });
  }
});

export default router;
