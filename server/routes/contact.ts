import { Router, Request, Response } from 'express';
import { db, ContactMessage } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Public: Submit a contact message
router.post('/', (req: Request, res: Response): void => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Por favor completa tu nombre, correo y mensaje.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Por favor ingresa un correo electrónico válido.' });
      return;
    }

    const contactMsg: ContactMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || 'Consulta General DMPS Connect',
      message: message.trim(),
      read: false,
      created_at: new Date().toISOString(),
    };

    db.createContactMessage(contactMsg);

    // Notify staff internally
    db.notifyAllStaff(
      'Nuevo Mensaje de Contacto',
      `De: ${contactMsg.name} (${contactMsg.email}) - Asunto: ${contactMsg.subject}`
    );

    res.status(201).json({
      message: '¡Gracias por comunicarte con DMPS Connect! Hemos recibido tu mensaje.',
      success: true,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al enviar tu mensaje. Intenta nuevamente.' });
  }
});

// Staff/Admin: Read contact messages
router.get('/', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const messages = db.getContactMessages();
    res.json({ messages });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener mensajes de contacto.' });
  }
});

export default router;
