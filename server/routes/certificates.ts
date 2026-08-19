import { Router, Response } from 'express';
import { db, Certificate } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Volunteer: Get own certificates
router.get('/my', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.profile) {
      res.status(400).json({ error: 'Perfil de voluntario no encontrado.' });
      return;
    }

    const certificates = db.getCertificatesByVolunteer(req.profile.id);
    res.json({ certificates });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener certificados.' });
  }
});

// Get certificate by ID or Certificate Code (for verification / viewing)
router.get('/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const certificate = db.getCertificateById(id);

    if (!certificate) {
      res.status(404).json({ error: 'Certificado no encontrado o código no válido.' });
      return;
    }

    res.json({ certificate });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al cargar el certificado.' });
  }
});

// Staff/Admin: Get all certificates
router.get('/staff/all', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const certificates = db.getAllCertificates();
    res.json({ certificates });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener lista de certificados.' });
  }
});

// Staff/Admin: Issue manual certificate (Bloque D4)
router.post('/manual', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { volunteer_id, hours_milestone, reason } = req.body;

    if (!volunteer_id || !hours_milestone) {
      res.status(400).json({ error: 'Debes seleccionar el voluntario y especificar el hito de horas.' });
      return;
    }

    const profile = db.getProfileById(volunteer_id) || db.getProfileByVolunteerId(volunteer_id);
    if (!profile) {
      res.status(404).json({ error: 'Perfil de voluntario no encontrado.' });
      return;
    }

    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff';
    const codeNumber = Math.floor(10000 + Math.random() * 90000);
    const milestoneHours = Number(hours_milestone);
    const approvedMinutes = db.getApprovedMinutesForVolunteer(profile.id);

    const cert: Certificate = {
      id: `cert_manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      volunteer_id: profile.id,
      user_id: profile.user_id,
      volunteer_code: profile.volunteer_id,
      volunteer_name: `${profile.first_name} ${profile.last_name}`.trim(),
      school: profile.school,
      hours_milestone: milestoneHours,
      certificate_code: `CERT-DMPS-${new Date().getFullYear()}-${codeNumber}`,
      issue_date: new Date().toISOString().split('T')[0],
      verified_minutes: approvedMinutes,
      created_by: `${staffName} (Emisión Manual)`,
      reason: reason ? reason.trim() : 'Certificado especial emitido por mérito de servicio comunitario',
      created_at: new Date().toISOString(),
    };

    const created = db.createCertificate(cert);

    // Notify volunteer
    db.notifyUser(
      profile.user_id,
      'Nuevo Certificado de Reconocimiento',
      `El equipo de Staff te ha emitido un certificado oficial por ${milestoneHours} horas de voluntariado.`,
      'success'
    );

    // Audit log
    db.logAudit(
      req.user!.id,
      staffName,
      req.user!.role,
      'STAFF_MANUAL_CERTIFICATE_ISSUED',
      created.id,
      null,
      created,
      reason || 'Emisión manual de certificado'
    );

    res.status(201).json({
      message: `Certificado emitido exitosamente para ${profile.first_name} ${profile.last_name}.`,
      certificate: created,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al emitir el certificado.' });
  }
});

export default router;
