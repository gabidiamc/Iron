import { Router, Response } from 'express';
import { db, HourSubmission, HourStatus } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest, calculateMinutesFromTimeRange, formatMinutesToSpanish } from '../auth.js';

const router = Router();

// Check for duplicate submission before submitting
router.post('/check-duplicate', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.profile) {
      res.status(400).json({ error: 'Perfil de voluntario no encontrado.' });
      return;
    }

    const { date, activity_name, start_time, event_id } = req.body;

    if (event_id) {
      const activeEventSub = db.checkActiveEventSubmission(req.profile.id, event_id);
      if (activeEventSub) {
        res.json({
          is_duplicate: true,
          message: 'Ya existe un registro de horas activo para este evento.',
          existing_submission: {
            id: activeEventSub.id,
            activity_name: activeEventSub.activity_name,
            date: activeEventSub.date,
            status: activeEventSub.status,
          },
        });
        return;
      }
    }

    if (!date || !activity_name) {
      res.json({ is_duplicate: false });
      return;
    }

    const duplicate = db.checkDuplicateSubmission(req.profile.id, date, activity_name, start_time || '');
    if (duplicate) {
      res.json({
        is_duplicate: true,
        message: 'Parece que ya enviaste un registro para esta actividad en la misma fecha.',
        existing_submission: {
          id: duplicate.id,
          activity_name: duplicate.activity_name,
          date: duplicate.date,
          status: duplicate.status,
        },
      });
      return;
    }

    res.json({ is_duplicate: false });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al verificar duplicados.' });
  }
});

// Volunteer: Submit new hours (Manual or from Event)
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.user || !req.profile) {
      res.status(400).json({ error: 'Perfil de voluntario incompleto o no encontrado.' });
      return;
    }

    if (req.user.role !== 'VOLUNTEER' && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Solo los voluntarios pueden registrar solicitudes de horas.' });
      return;
    }

    const {
      activity_name,
      organization_name,
      date,
      start_time,
      end_time,
      manual_hours,
      manual_minutes,
      location,
      description,
      supervisor_name,
      proof_file_url,
      proof_file_name,
      event_id,
      event_application_id,
    } = req.body;

    if (!activity_name || !organization_name || !date || !description || !supervisor_name) {
      res.status(400).json({ error: 'Por favor completa todos los campos obligatorios.' });
      return;
    }

    let eventScheduledMinutes: number | undefined = undefined;
    let applicationRef: any = null;

    // Bloque A: If submitting hours for an Event
    if (event_id) {
      const event = db.getEventById(event_id);
      if (!event) {
        res.status(404).json({ error: 'El evento especificado no existe.' });
        return;
      }
      eventScheduledMinutes = event.estimated_minutes;

      // Find user application for this event
      const userApps = db.getApplicationsByVolunteer(req.profile.id);
      applicationRef = userApps.find(a => a.event_id === event_id);

      if (!applicationRef || applicationRef.status !== 'ACCEPTED') {
        res.status(400).json({ error: 'Solo los voluntarios con solicitud ACEPTADA pueden registrar horas de este evento.' });
        return;
      }

      // Check if attendance marked as NO_SHOW (Bloque A13)
      if (applicationRef.attended === false) {
        res.status(400).json({ error: 'No se registró asistencia para este evento. Comunícate con Staff si consideras que es un error.' });
        return;
      }

      // Check if event has concluded (Rule A2)
      const now = new Date();
      const eventDate = new Date(`${event.date}T${event.end_time || '23:59'}:00`);
      if (now < eventDate) {
        res.status(400).json({ error: 'Podrás registrar tus horas después de finalizar el evento.' });
        return;
      }

      // Check if duplicate submission for this event already exists (Rule A7)
      const existingEventSub = db.checkActiveEventSubmission(req.profile.id, event_id);
      if (existingEventSub) {
        res.status(400).json({ error: 'Ya existe un registro de horas activo para este evento.' });
        return;
      }
    }

    // Calculate duration in minutes strictly
    let totalMinutes = 0;
    if (start_time && end_time) {
      totalMinutes = calculateMinutesFromTimeRange(start_time, end_time);
    }

    if (totalMinutes === 0 && (manual_hours !== undefined || manual_minutes !== undefined)) {
      const h = parseInt(manual_hours, 10) || 0;
      const m = parseInt(manual_minutes, 10) || 0;
      totalMinutes = h * 60 + m;
    }

    if (totalMinutes <= 0) {
      res.status(400).json({ error: 'La duración calculada debe ser mayor a 0 minutos. Revisa las horas de inicio y salida.' });
      return;
    }

    if (totalMinutes > 1440) {
      res.status(400).json({ error: 'El registro no puede exceder las 24 horas en un solo día.' });
      return;
    }

    const now = new Date().toISOString();
    const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const submission: HourSubmission = {
      id: subId,
      volunteer_id: req.profile.id,
      user_id: req.user.id,
      volunteer_code: req.profile.volunteer_id,
      volunteer_name: `${req.profile.first_name} ${req.profile.last_name}`.trim(),
      school: req.profile.school || 'No especificada',
      activity_name: activity_name.trim(),
      organization_name: organization_name.trim(),
      date: date.trim(),
      start_time: start_time || '',
      end_time: end_time || '',
      submitted_minutes: totalMinutes,
      approved_minutes: null, // Critical: Only set by staff on approval
      location: location ? location.trim() : '',
      description: description.trim(),
      supervisor_name: supervisor_name.trim(),
      proof_file_url: proof_file_url || '',
      proof_file_name: proof_file_name || '',
      status: 'PENDING',
      submitted_at: now,
      reviewed_at: null,
      reviewed_by: null,
      // Event Linkage
      event_id: event_id || undefined,
      event_application_id: applicationRef?.id || event_application_id || undefined,
      event_scheduled_minutes: eventScheduledMinutes,
      source: event_id ? 'EVENT' : 'MANUAL',
      arrival_time: start_time || undefined,
      departure_time: end_time || undefined,
      is_attended: true,
      created_at: now,
      updated_at: now,
    };

    const created = db.createSubmission(submission);

    // If linked to event application, mark hours_submitted on application
    if (applicationRef) {
      db.updateApplication(applicationRef.id, {
        hours_submitted: true,
        hour_submission_id: subId,
      });
    }

    // Notify Staff
    db.notifyAllStaff(
      'Nueva Solicitud de Horas Recibida',
      `${submission.volunteer_name} (${submission.volunteer_code}) ha enviado ${formatMinutesToSpanish(totalMinutes)} para la actividad "${submission.activity_name}".`,
      submission.id,
      event_id || undefined
    );

    // Log Audit
    db.logAudit(
      req.user.id,
      submission.volunteer_name,
      'VOLUNTEER',
      event_id ? 'SUBMIT_EVENT_HOURS' : 'SUBMIT_MANUAL_HOURS',
      subId,
      null,
      {
        activity_name: submission.activity_name,
        date: submission.date,
        minutes: totalMinutes,
        event_id: event_id || null,
      },
      'Solicitud de horas enviada para revisión'
    );

    res.status(201).json({
      message: '¡Tus horas han sido enviadas para revisión con éxito!',
      submission: created,
    });
  } catch (err: any) {
    console.error('Error submitting hours:', err);
    res.status(500).json({ error: 'Error al enviar registro de horas.' });
  }
});

// Volunteer: Get own submissions
router.get('/my', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.profile) {
      res.status(400).json({ error: 'Perfil no encontrado.' });
      return;
    }

    const submissions = db.getSubmissionsByVolunteer(req.profile.id);
    const approved_minutes = db.getApprovedMinutesForVolunteer(req.profile.id);
    const pending_minutes = db.getPendingMinutesForVolunteer(req.profile.id);
    const this_month_minutes = db.getApprovedMinutesThisMonthForVolunteer(req.profile.id);
    const this_year_minutes = db.getApprovedMinutesThisYearForVolunteer(req.profile.id);
    const rejected_count = db.getRejectedCountForVolunteer(req.profile.id);

    res.json({
      submissions,
      stats: {
        approved_minutes,
        pending_minutes,
        this_month_minutes,
        this_year_minutes,
        rejected_count,
        total_submissions: submissions.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener tus horas.' });
  }
});

// Get single submission details
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const submission = db.getSubmissionById(id);

    if (!submission) {
      res.status(404).json({ error: 'Registro de horas no encontrado.' });
      return;
    }

    if (req.user?.role === 'VOLUNTEER' && req.profile?.id !== submission.volunteer_id) {
      res.status(403).json({ error: 'Acceso denegado a este registro.' });
      return;
    }

    res.json({ submission });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al cargar detalles de la solicitud.' });
  }
});

// Volunteer: Correct submission (ONLY if status is NEEDS_CORRECTION)
router.put('/:id/correct', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const submission = db.getSubmissionById(id);

    if (!submission) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    if (submission.volunteer_id !== req.profile?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'No tienes permiso para modificar esta solicitud.' });
      return;
    }

    if (submission.status !== 'NEEDS_CORRECTION') {
      res.status(400).json({ error: 'Solo se pueden corregir solicitudes con estado "Necesita Corrección".' });
      return;
    }

    const {
      activity_name,
      organization_name,
      date,
      start_time,
      end_time,
      manual_hours,
      manual_minutes,
      location,
      description,
      supervisor_name,
      correction_notes,
    } = req.body;

    let totalMinutes = 0;
    if (start_time && end_time) {
      totalMinutes = calculateMinutesFromTimeRange(start_time, end_time);
    }
    if (totalMinutes === 0 && (manual_hours !== undefined || manual_minutes !== undefined)) {
      const h = parseInt(manual_hours, 10) || 0;
      const m = parseInt(manual_minutes, 10) || 0;
      totalMinutes = h * 60 + m;
    }
    if (totalMinutes <= 0) {
      totalMinutes = submission.submitted_minutes;
    }

    const now = new Date().toISOString();
    const previousSnapshot = {
      activity_name: submission.activity_name,
      organization_name: submission.organization_name,
      date: submission.date,
      start_time: submission.start_time,
      end_time: submission.end_time,
      submitted_minutes: submission.submitted_minutes,
      description: submission.description,
      supervisor_name: submission.supervisor_name,
      status: submission.status,
    };

    const updated = db.updateSubmission(id, {
      activity_name: activity_name ? activity_name.trim() : submission.activity_name,
      organization_name: organization_name ? organization_name.trim() : submission.organization_name,
      date: date ? date.trim() : submission.date,
      start_time: start_time !== undefined ? start_time : submission.start_time,
      end_time: end_time !== undefined ? end_time : submission.end_time,
      submitted_minutes: totalMinutes,
      location: location !== undefined ? location.trim() : submission.location,
      description: description ? description.trim() : submission.description,
      supervisor_name: supervisor_name ? supervisor_name.trim() : submission.supervisor_name,
      status: 'CORRECTED',
      previous_data: previousSnapshot,
      correction_notes: correction_notes ? correction_notes.trim() : 'Registro actualizado por el voluntario',
      updated_at: now,
    });

    db.notifyAllStaff(
      'Solicitud Corregida por Voluntario',
      `${submission.volunteer_name} corrigió la solicitud de "${submission.activity_name}". Lista para revisión.`,
      submission.id
    );

    db.logAudit(
      req.user!.id,
      submission.volunteer_name,
      'VOLUNTEER',
      'VOLUNTEER_CORRECTED_SUBMISSION',
      id,
      previousSnapshot,
      {
        activity_name: updated?.activity_name,
        date: updated?.date,
        minutes: totalMinutes,
        status: 'CORRECTED',
      },
      correction_notes || 'Corrección completada por el voluntario'
    );

    res.json({
      message: 'Tu solicitud ha sido corregida y enviada nuevamente al staff para revisión.',
      submission: updated,
    });
  } catch (err: any) {
    console.error('Error correcting submission:', err);
    res.status(500).json({ error: 'Error al corregir la solicitud.' });
  }
});

// Volunteer: Cancel own pending submission
router.delete('/:id/cancel', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const submission = db.getSubmissionById(id);

    if (!submission) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    if (submission.volunteer_id !== req.profile?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'No tienes permiso para cancelar esta solicitud.' });
      return;
    }

    if (submission.status !== 'PENDING' && submission.status !== 'NEEDS_CORRECTION') {
      res.status(400).json({ error: 'Solo se pueden cancelar solicitudes pendientes o en corrección.' });
      return;
    }

    const updated = db.updateSubmission(id, {
      status: 'CANCELLED',
      updated_at: new Date().toISOString(),
    });

    db.logAudit(
      req.user!.id,
      `${req.profile?.first_name} ${req.profile?.last_name}`,
      req.user!.role,
      'VOLUNTEER_CANCELLED_SUBMISSION',
      id,
      { status: submission.status },
      { status: 'CANCELLED' }
    );

    res.json({ message: 'Solicitud cancelada.', submission: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al cancelar la solicitud.' });
  }
});

// ==========================================
// STAFF ENDPOINTS
// ==========================================

// Staff: List all submissions
router.get('/', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { status, search, school } = req.query;
    let submissions = db.getAllSubmissions();

    if (status && typeof status === 'string' && status !== 'ALL') {
      submissions = submissions.filter(s => s.status === status);
    }

    if (school && typeof school === 'string' && school !== 'ALL') {
      submissions = submissions.filter(s => s.school === school);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      submissions = submissions.filter(s =>
        s.volunteer_name.toLowerCase().includes(q) ||
        s.volunteer_code.toLowerCase().includes(q) ||
        s.activity_name.toLowerCase().includes(q) ||
        s.organization_name.toLowerCase().includes(q) ||
        s.school.toLowerCase().includes(q)
      );
    }

    res.json({ submissions });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener solicitudes.' });
  }
});

// Staff: Approve submission
router.post('/:id/approve', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { approved_minutes, review_note } = req.body;
    const submission = db.getSubmissionById(id);

    if (!submission) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    const minutesToApprove = typeof approved_minutes === 'number' && approved_minutes > 0
      ? approved_minutes
      : submission.submitted_minutes;

    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : 'Staff Autorizado';
    const staffIdCode = req.profile?.volunteer_id || req.user?.id || 'STAFF';
    const now = new Date().toISOString();

    const previousSnapshot = {
      status: submission.status,
      approved_minutes: submission.approved_minutes,
    };

    const updated = db.updateSubmission(id, {
      status: 'APPROVED',
      approved_minutes: minutesToApprove,
      reviewed_at: now,
      reviewed_by: `${staffName} (${staffIdCode})`,
      staff_message: review_note || submission.staff_message,
      updated_at: now,
    });

    // Auto-check for milestone certificates (Bloque D1, D2)
    db.checkAndIssueMilestoneCertificates(submission.volunteer_id);

    // Notify volunteer
    db.notifyUser(
      submission.user_id,
      '¡Horas Aprobadas y Verificadas!',
      `Se han aprobado ${formatMinutesToSpanish(minutesToApprove)} para tu actividad "${submission.activity_name}".`,
      'success',
      submission.id,
      submission.event_id
    );

    // Log Audit
    db.logAudit(
      req.user!.id,
      staffName,
      req.user!.role,
      'STAFF_APPROVED_HOURS',
      id,
      previousSnapshot,
      {
        status: 'APPROVED',
        approved_minutes: minutesToApprove,
        reviewed_by: staffName,
      },
      review_note || 'Aprobación oficial de horas'
    );

    res.json({
      message: `Se han aprobado ${formatMinutesToSpanish(minutesToApprove)} correctamente para ${submission.volunteer_name}.`,
      submission: updated,
    });
  } catch (err: any) {
    console.error('Error approving submission:', err);
    res.status(500).json({ error: 'Error al aprobar la solicitud.' });
  }
});

// Staff: Request correction
router.post('/:id/request-correction', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { staff_message } = req.body;

    if (!staff_message || !staff_message.trim()) {
      res.status(400).json({ error: 'Debes proporcionar un mensaje explicando qué debe corregirse.' });
      return;
    }

    const submission = db.getSubmissionById(id);
    if (!submission) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : 'Staff Autorizado';
    const now = new Date().toISOString();

    const previousSnapshot = {
      status: submission.status,
      staff_message: submission.staff_message,
    };

    const updated = db.updateSubmission(id, {
      status: 'NEEDS_CORRECTION',
      staff_message: staff_message.trim(),
      reviewed_at: now,
      reviewed_by: staffName,
      updated_at: now,
    });

    // Notify volunteer
    db.notifyUser(
      submission.user_id,
      'Se requiere corrección en tu registro de horas',
      `Staff solicita corrección en "${submission.activity_name}": ${staff_message.trim()}`,
      'warning',
      submission.id,
      submission.event_id
    );

    db.logAudit(
      req.user!.id,
      staffName,
      req.user!.role,
      'STAFF_REQUESTED_CORRECTION',
      id,
      previousSnapshot,
      { status: 'NEEDS_CORRECTION', staff_message: staff_message.trim() },
      staff_message.trim()
    );

    res.json({
      message: 'Se ha solicitado corrección al voluntario.',
      submission: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al solicitar corrección.' });
  }
});

// Staff: Reject submission
router.post('/:id/reject', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { rejection_reason, rejection_comment } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      res.status(400).json({ error: 'Debes especificar el motivo del rechazo.' });
      return;
    }

    const submission = db.getSubmissionById(id);
    if (!submission) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : 'Staff Autorizado';
    const now = new Date().toISOString();

    const previousSnapshot = {
      status: submission.status,
      rejection_reason: submission.rejection_reason,
    };

    const updated = db.updateSubmission(id, {
      status: 'REJECTED',
      rejection_reason: rejection_reason.trim(),
      rejection_comment: rejection_comment ? rejection_comment.trim() : '',
      reviewed_at: now,
      reviewed_by: staffName,
      updated_at: now,
    });

    // Notify volunteer
    db.notifyUser(
      submission.user_id,
      'Solicitud de Horas No Aprobada',
      `Tu registro para "${submission.activity_name}" no fue aprobado. Motivo: ${rejection_reason.trim()}`,
      'error',
      submission.id,
      submission.event_id
    );

    db.logAudit(
      req.user!.id,
      staffName,
      req.user!.role,
      'STAFF_REJECTED_HOURS',
      id,
      previousSnapshot,
      {
        status: 'REJECTED',
        rejection_reason: rejection_reason.trim(),
        rejection_comment,
      },
      rejection_reason.trim()
    );

    res.json({
      message: 'Solicitud rechazada.',
      submission: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al rechazar solicitud.' });
  }
});

// Staff: Manual hour accreditation (Bloque A14)
router.post('/manual-credit', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      volunteer_profile_id,
      activity_name,
      organization_name,
      date,
      hours,
      minutes,
      reason,
      location,
      supervisor_name,
    } = req.body;

    if (!volunteer_profile_id || !activity_name || !organization_name || !date) {
      res.status(400).json({ error: 'Completa todos los datos requeridos para la acreditación.' });
      return;
    }

    const profile = db.getProfileById(volunteer_profile_id);
    if (!profile) {
      res.status(404).json({ error: 'Perfil de voluntario no encontrado.' });
      return;
    }

    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    const totalMinutes = h * 60 + m;

    if (totalMinutes <= 0) {
      res.status(400).json({ error: 'Los minutos a acreditar deben ser mayores a 0.' });
      return;
    }

    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : 'Staff Autorizado';
    const now = new Date().toISOString();
    const subId = `sub_staff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const submission: HourSubmission = {
      id: subId,
      volunteer_id: profile.id,
      user_id: profile.user_id,
      volunteer_code: profile.volunteer_id,
      volunteer_name: `${profile.first_name} ${profile.last_name}`.trim(),
      school: profile.school,
      activity_name: activity_name.trim(),
      organization_name: organization_name.trim(),
      date: date.trim(),
      start_time: '00:00',
      end_time: '00:00',
      submitted_minutes: totalMinutes,
      approved_minutes: totalMinutes,
      location: location || 'Acreditación Directa',
      description: reason ? `Acreditación directa por Staff: ${reason.trim()}` : 'Acreditación manual autorizada por Staff',
      supervisor_name: supervisor_name || staffName,
      status: 'APPROVED',
      source: 'STAFF_CREDIT',
      submitted_at: now,
      reviewed_at: now,
      reviewed_by: `${staffName} (Acreditación Manual)`,
      created_at: now,
      updated_at: now,
    };

    const created = db.createSubmission(submission);

    // Auto-check for milestone certificates
    db.checkAndIssueMilestoneCertificates(profile.id);

    // Notify volunteer
    db.notifyUser(
      profile.user_id,
      'Acreditación Directa de Horas',
      `El equipo de Staff te ha acreditado directamente ${formatMinutesToSpanish(totalMinutes)} por "${activity_name}".`,
      'success',
      subId
    );

    // Audit log
    db.logAudit(
      req.user!.id,
      staffName,
      req.user!.role,
      'STAFF_MANUAL_CREDIT',
      subId,
      null,
      {
        volunteer_code: profile.volunteer_id,
        volunteer_name: submission.volunteer_name,
        minutes: totalMinutes,
        activity_name,
        reason,
      },
      reason || 'Acreditación manual autorizada'
    );

    res.status(201).json({
      message: `Se han acreditado ${formatMinutesToSpanish(totalMinutes)} exitosamente a ${profile.first_name} ${profile.last_name}.`,
      submission: created,
    });
  } catch (err: any) {
    console.error('Error in manual credit:', err);
    res.status(500).json({ error: 'Error al acreditar horas manualmente.' });
  }
});

// Staff: Batch approve submissions (Bloque C11)
router.post('/batch-approve', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { submission_ids } = req.body;

    if (!Array.isArray(submission_ids) || submission_ids.length === 0) {
      res.status(400).json({ error: 'Debes seleccionar al menos una solicitud para aprobar.' });
      return;
    }

    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : 'Staff Autorizado';
    const now = new Date().toISOString();
    let approvedCount = 0;

    for (const id of submission_ids) {
      const sub = db.getSubmissionById(id);
      if (sub && (sub.status === 'PENDING' || sub.status === 'CORRECTED')) {
        db.updateSubmission(id, {
          status: 'APPROVED',
          approved_minutes: sub.submitted_minutes,
          reviewed_at: now,
          reviewed_by: staffName,
          updated_at: now,
        });

        db.checkAndIssueMilestoneCertificates(sub.volunteer_id);

        db.notifyUser(
          sub.user_id,
          'Horas Aprobadas',
          `Se han aprobado ${formatMinutesToSpanish(sub.submitted_minutes)} para "${sub.activity_name}".`,
          'success',
          sub.id
        );

        approvedCount++;
      }
    }

    db.logAudit(
      req.user!.id,
      staffName,
      req.user!.role,
      'STAFF_BATCH_APPROVE_HOURS',
      'batch',
      null,
      { count: approvedCount, ids: submission_ids },
      `Aprobación masiva de ${approvedCount} registros`
    );

    res.json({
      message: `Se han aprobado ${approvedCount} registros de horas exitosamente.`,
      approved_count: approvedCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error en la aprobación masiva.' });
  }
});

// DELETE /api/submissions/:id - Delete a rejected, cancelled, or pending submission
router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const submission = db.getSubmissionById(id);

    if (!submission) {
      res.status(404).json({ error: 'Registro de horas no encontrado.' });
      return;
    }

    const isOwner = req.profile && req.profile.id === submission.volunteer_id;
    const isStaff = req.user?.role === 'STAFF' || req.user?.role === 'ADMIN';

    if (!isOwner && !isStaff) {
      res.status(403).json({ error: 'No tienes permiso para eliminar este registro.' });
      return;
    }

    const deleted = db.deleteSubmission(id);
    if (!deleted) {
      res.status(400).json({ error: 'No se pudo eliminar el registro.' });
      return;
    }

    res.json({ message: 'Registro de horas eliminado exitosamente.' });
  } catch (err: any) {
    console.error('Error deleting submission:', err);
    res.status(500).json({ error: 'Error al eliminar el registro de horas.' });
  }
});

export default router;
