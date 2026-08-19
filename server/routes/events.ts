import { Router, Request, Response } from 'express';
import { db, EventItem, EventStatus, EventApplication, ApplicationStatus } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// ==========================================
// PUBLIC & DISCOVERY ENDPOINTS
// ==========================================

// GET /api/events - List events (Public or Staff with drafts)
router.get('/', (req: Request, res: Response): void => {
  try {
    const { status, search, include_drafts, timeframe } = req.query;
    
    // Check if token was provided optionally to allow staff to see drafts
    let isStaff = false;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        // verify token lightly if present
      } catch {}
    }

    const allowDrafts = include_drafts === 'true';
    let events = db.getEvents(allowDrafts);

    if (status && typeof status === 'string' && status !== 'ALL') {
      events = events.filter(e => e.computed_status === status || e.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.short_description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        (e.code && e.code.toLowerCase().includes(q))
      );
    }

    // Timeframe filters (e.g. 'THIS_MONTH', 'UPCOMING')
    if (timeframe === 'THIS_MONTH') {
      const now = new Date();
      const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      events = events.filter(e => e.date.startsWith(prefix));
    } else if (timeframe === 'UPCOMING') {
      const todayStr = new Date().toISOString().split('T')[0];
      events = events.filter(e => e.date >= todayStr);
    }

    res.json({ events });
  } catch (err: any) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Error al obtener eventos.' });
  }
});

// GET /api/events/user/my-applications - Volunteer's applications list
router.get('/user/my-applications', authenticateToken, requireRole('VOLUNTEER'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.profile) {
      res.status(400).json({ error: 'Perfil de voluntario no encontrado.' });
      return;
    }

    const applications = db.getApplicationsByVolunteer(req.profile.id);
    res.json({ applications });
  } catch (err: any) {
    console.error('Error fetching volunteer applications:', err);
    res.status(500).json({ error: 'Error al obtener tus solicitudes.' });
  }
});

// GET /api/events/user/my-events - Volunteer's confirmed/accepted events
router.get('/user/my-events', authenticateToken, requireRole('VOLUNTEER'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.profile) {
      res.status(400).json({ error: 'Perfil de voluntario no encontrado.' });
      return;
    }

    const allApps = db.getApplicationsByVolunteer(req.profile.id);
    const acceptedApps = allApps.filter(a => a.status === 'ACCEPTED');

    res.json({
      events: acceptedApps.map(a => ({
        application_id: a.id,
        application_status: a.status,
        applied_at: a.applied_at,
        accepted_at: a.accepted_at,
        staff_message: a.staff_message,
        volunteer_code: req.profile?.volunteer_id,
        event: a.event,
      })),
    });
  } catch (err: any) {
    console.error('Error fetching volunteer accepted events:', err);
    res.status(500).json({ error: 'Error al obtener tus eventos confirmados.' });
  }
});

// GET /api/events/staff/applications - Staff: All applications with counters
router.get('/staff/applications', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { event_id, status, school, search } = req.query;
    let apps = db.getAllApplications();

    if (event_id && typeof event_id === 'string' && event_id !== 'ALL') {
      apps = apps.filter(a => a.event_id === event_id);
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      apps = apps.filter(a => a.status === status);
    }

    if (school && typeof school === 'string' && school !== 'ALL') {
      apps = apps.filter(a => a.school === school);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      apps = apps.filter(a =>
        a.volunteer_name.toLowerCase().includes(q) ||
        a.volunteer_code.toLowerCase().includes(q) ||
        (a.event && a.event.title.toLowerCase().includes(q)) ||
        a.school.toLowerCase().includes(q)
      );
    }

    const allRaw = db.getAllApplications();
    const counters = {
      pending: allRaw.filter(a => a.status === 'PENDING').length,
      accepted: allRaw.filter(a => a.status === 'ACCEPTED').length,
      waitlist: allRaw.filter(a => a.status === 'WAITLIST').length,
      rejected: allRaw.filter(a => a.status === 'REJECTED').length,
      total: allRaw.length,
    };

    res.json({ applications: apps, counters });
  } catch (err: any) {
    console.error('Error fetching staff applications:', err);
    res.status(500).json({ error: 'Error al obtener las solicitudes de eventos.' });
  }
});

// GET /api/events/applications/:id - Detailed application view
router.get('/applications/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const application = db.getApplicationById(id);
    if (!application) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    const isOwner = req.profile && req.profile.id === application.volunteer_id;
    const isStaff = req.user?.role === 'STAFF' || req.user?.role === 'ADMIN';

    if (!isOwner && !isStaff) {
      res.status(403).json({ error: 'No tienes permiso para ver esta solicitud.' });
      return;
    }

    // Include volunteer profile info for staff
    let volunteerProfile = undefined;
    if (isStaff) {
      volunteerProfile = db.getProfileById(application.volunteer_id);
    }

    res.json({ application, volunteerProfile });
  } catch (err: any) {
    console.error('Error fetching application detail:', err);
    res.status(500).json({ error: 'Error al obtener detalle de la solicitud.' });
  }
});

// GET /api/events/:id - Get event detail by ID or code
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    let event = db.getEventById(id);
    if (!event) {
      const all = db.getEvents(true);
      event = all.find(e => e.code?.toUpperCase() === id.toUpperCase());
    }

    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado.' });
      return;
    }

    res.json({ event });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener detalle del evento.' });
  }
});

// ==========================================
// VOLUNTEER ACTIONS
// ==========================================

// POST /api/events/:id/apply - Apply to participate in an event
router.post('/:id/apply', authenticateToken, requireRole('VOLUNTEER'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const profile = req.profile;
    const user = req.user;

    if (!profile || !user) {
      res.status(400).json({ error: 'No se encontró el perfil de voluntario.' });
      return;
    }

    if (!profile.profile_completed) {
      res.status(400).json({ error: 'Debes completar tu perfil antes de solicitar participar en eventos.' });
      return;
    }

    const event = db.getEventById(id);
    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado.' });
      return;
    }

    // Check event status
    if (['DRAFT', 'ARCHIVED', 'CLOSED', 'CANCELLED', 'COMPLETED'].includes(event.status)) {
      res.status(400).json({ error: 'Este evento ya no acepta solicitudes.' });
      return;
    }

    // Check dynamic spots availability
    const availableSpots = db.getAvailableSpotsForEvent(event.id);
    if (availableSpots <= 0) {
      res.status(400).json({ error: 'El evento ya no cuenta con cupos disponibles.' });
      return;
    }

    // Anti-duplicate check
    const activeApp = db.checkActiveApplication(profile.id, event.id);
    if (activeApp) {
      res.status(400).json({
        error: 'Ya tienes una solicitud activa para este evento.',
        application: activeApp,
      });
      return;
    }

    // Check if previously rejected to avoid spamming
    const anyApp = db.checkAnyExistingApplication(profile.id, event.id);
    if (anyApp && anyApp.status === 'REJECTED') {
      res.status(400).json({
        error: 'Tu solicitud previa para este evento no fue aceptada. Consulta con el equipo de Staff si necesitas información adicional.',
      });
      return;
    }

    const now = new Date().toISOString();
    const newApplication: EventApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event_id: event.id,
      volunteer_id: profile.id,
      user_id: user.id,
      volunteer_name: `${profile.first_name} ${profile.last_name}`.trim(),
      volunteer_code: profile.volunteer_id,
      school: profile.school || 'Sin Escuela',
      grade: profile.grade,
      languages: profile.languages || ['Español'],
      status: 'PENDING',
      applied_at: now,
      created_at: now,
      updated_at: now,
    };

    db.createApplication(newApplication);

    // Notify Staff
    db.notifyAllStaff(
      'Nueva solicitud de evento',
      `${newApplication.volunteer_name} (${newApplication.volunteer_code}) solicitó participar en "${event.title}".`,
      undefined,
      event.id,
      newApplication.id
    );

    // Notify Volunteer
    db.notifyUser(
      user.id,
      'Solicitud de evento enviada',
      `Tu solicitud para participar en "${event.title}" fue enviada al equipo para revisión.`,
      'info',
      undefined,
      event.id,
      newApplication.id
    );

    // Audit Log
    db.createAuditLog({
      id: `log_${Date.now()}`,
      user_id: user.id,
      user_name: newApplication.volunteer_name,
      role: 'VOLUNTEER',
      action: 'EVENT_APPLICATION_SUBMITTED',
      target_id: newApplication.id,
      new_value: { event_id: event.id, event_title: event.title, status: 'PENDING' },
      timestamp: now,
    });

    res.status(201).json({
      message: 'Solicitud enviada exitosamente al equipo de coordinación.',
      application: {
        ...newApplication,
        event,
      },
    });
  } catch (err: any) {
    console.error('Error applying to event:', err);
    res.status(500).json({ error: 'Error al procesar tu solicitud.' });
  }
});

// POST /api/events/applications/:id/cancel - Cancel application
router.post('/applications/:id/cancel', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const application = db.getApplicationById(id);

    if (!application) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    const isOwner = req.profile && req.profile.id === application.volunteer_id;
    const isStaff = req.user?.role === 'STAFF' || req.user?.role === 'ADMIN';

    if (!isOwner && !isStaff) {
      res.status(403).json({ error: 'No tienes permiso para cancelar esta solicitud.' });
      return;
    }

    const previousStatus = application.status;
    if (previousStatus === 'CANCELLED') {
      res.status(400).json({ error: 'Esta solicitud ya se encuentra cancelada.' });
      return;
    }

    const now = new Date().toISOString();
    const event = db.getEventById(application.event_id);

    db.updateApplication(id, {
      status: 'CANCELLED',
      cancelled_at: now,
      cancellation_reason: reason || 'Cancelado por el usuario',
    });

    // If it was ACCEPTED, notify staff that a spot has been freed
    if (previousStatus === 'ACCEPTED') {
      db.notifyAllStaff(
        'Cupo liberado en evento',
        `${application.volunteer_name} canceló su participación en "${event?.title || 'Evento'}". Se ha liberado 1 cupo.`,
        undefined,
        application.event_id,
        application.id
      );
    }

    // Notify volunteer
    db.notifyUser(
      application.user_id,
      'Participación cancelada',
      `Has cancelado tu participación en "${event?.title || 'Evento'}".`,
      'warning',
      undefined,
      application.event_id,
      application.id
    );

    // Audit log
    db.createAuditLog({
      id: `log_${Date.now()}`,
      user_id: req.user?.id || 'unknown',
      user_name: req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff',
      role: req.user?.role || 'VOLUNTEER',
      action: 'EVENT_APPLICATION_CANCELLED',
      target_id: application.id,
      previous_value: { status: previousStatus },
      new_value: { status: 'CANCELLED', reason },
      timestamp: now,
    });

    res.json({ message: 'Solicitud cancelada exitosamente.', status: 'CANCELLED' });
  } catch (err: any) {
    console.error('Error cancelling application:', err);
    res.status(500).json({ error: 'Error al cancelar la solicitud.' });
  }
});

// DELETE /api/events/applications/:id - Delete / remove an application
router.delete('/applications/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const application = db.getApplicationById(id);

    if (!application) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    const isOwner = req.profile && req.profile.id === application.volunteer_id;
    const isStaff = req.user?.role === 'STAFF' || req.user?.role === 'ADMIN';

    if (!isOwner && !isStaff) {
      res.status(403).json({ error: 'No tienes permiso para eliminar esta solicitud.' });
      return;
    }

    const deleted = db.deleteApplication(id);
    if (!deleted) {
      res.status(400).json({ error: 'No se pudo eliminar la solicitud.' });
      return;
    }

    res.json({ message: 'Solicitud eliminada correctamente.' });
  } catch (err: any) {
    console.error('Error deleting application:', err);
    res.status(500).json({ error: 'Error al eliminar la solicitud.' });
  }
});

// ==========================================
// STAFF REVIEW ENDPOINTS
// ==========================================

// POST /api/events/staff/applications/:id/accept - Staff accepts an application
router.post('/staff/applications/:id/accept', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { staff_message } = req.body;
    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff';

    const result = db.acceptApplicationWithConcurrencyCheck(id, staffName, staff_message);

    if (!result.success) {
      if (result.reason === 'NO_SPOTS_AVAILABLE') {
        res.status(400).json({
          error: 'El evento acaba de completar sus cupos disponibles.',
          can_waitlist: true,
        });
        return;
      }
      if (result.reason === 'EVENT_INACTIVE') {
        res.status(400).json({ error: 'El evento se encuentra inactivo o cancelado.' });
        return;
      }
      res.status(404).json({ error: 'Solicitud o evento no encontrado.' });
      return;
    }

    const updatedApp = result.application!;
    const event = db.getEventById(updatedApp.event_id);

    // Notify Volunteer
    db.notifyUser(
      updatedApp.user_id,
      '🎉 ¡Tu solicitud fue aceptada!',
      `Has sido aceptado para participar en "${event?.title}". ${staff_message ? `Mensaje del equipo: "${staff_message}"` : ''}`,
      'success',
      undefined,
      updatedApp.event_id,
      updatedApp.id
    );

    // Audit Log
    db.createAuditLog({
      id: `log_${Date.now()}`,
      user_id: req.user?.id || 'staff',
      user_name: staffName,
      role: req.user?.role || 'STAFF',
      action: 'EVENT_APPLICATION_ACCEPTED',
      target_id: updatedApp.id,
      new_value: { status: 'ACCEPTED', staff_message },
      timestamp: new Date().toISOString(),
    });

    res.json({
      message: `Solicitud de ${updatedApp.volunteer_name} aceptada exitosamente.`,
      application: updatedApp,
      available_spots: result.availableSpots,
    });
  } catch (err: any) {
    console.error('Error accepting application:', err);
    res.status(500).json({ error: 'Error al aceptar la solicitud.' });
  }
});

// POST /api/events/staff/applications/:id/reject - Staff rejects an application
router.post('/staff/applications/:id/reject', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { staff_message, rejection_reason } = req.body;
    const app = db.getApplicationById(id);

    if (!app) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    const now = new Date().toISOString();
    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff';

    const updated = db.updateApplication(id, {
      status: 'REJECTED',
      reviewed_by: staffName,
      reviewed_at: now,
      rejected_at: now,
      staff_message: staff_message || rejection_reason || '',
      rejection_reason: rejection_reason || 'No especificado',
    });

    const event = db.getEventById(app.event_id);

    // Notify Volunteer with respectful and clear wording
    db.notifyUser(
      app.user_id,
      'Actualización de tu solicitud',
      `Tenemos una actualización sobre tu solicitud para "${event?.title || 'Evento'}". Estado: No aceptada. ${staff_message ? `Nota: ${staff_message}` : ''}`,
      'info',
      undefined,
      app.event_id,
      app.id
    );

    // Audit Log
    db.createAuditLog({
      id: `log_${Date.now()}`,
      user_id: req.user?.id || 'staff',
      user_name: staffName,
      role: req.user?.role || 'STAFF',
      action: 'EVENT_APPLICATION_REJECTED',
      target_id: app.id,
      new_value: { status: 'REJECTED', rejection_reason, staff_message },
      timestamp: now,
    });

    res.json({
      message: 'Solicitud marcada como no aceptada.',
      application: updated,
    });
  } catch (err: any) {
    console.error('Error rejecting application:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
});

// POST /api/events/staff/applications/:id/waitlist - Move to waitlist
router.post('/staff/applications/:id/waitlist', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { staff_message } = req.body;
    const app = db.getApplicationById(id);

    if (!app) {
      res.status(404).json({ error: 'Solicitud no encontrada.' });
      return;
    }

    const now = new Date().toISOString();
    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff';

    const updated = db.updateApplication(id, {
      status: 'WAITLIST',
      reviewed_by: staffName,
      reviewed_at: now,
      waitlisted_at: now,
      staff_message: staff_message || app.staff_message || '',
    });

    const event = db.getEventById(app.event_id);

    // Notify Volunteer
    db.notifyUser(
      app.user_id,
      'Tu solicitud está en lista de espera',
      `Actualmente no podemos confirmar tu lugar para "${event?.title || 'Evento'}", pero tu solicitud permanece activa en lista de espera ante cualquier cupo libre.`,
      'warning',
      undefined,
      app.event_id,
      app.id
    );

    // Audit Log
    db.createAuditLog({
      id: `log_${Date.now()}`,
      user_id: req.user?.id || 'staff',
      user_name: staffName,
      role: req.user?.role || 'STAFF',
      action: 'EVENT_APPLICATION_WAITLISTED',
      target_id: app.id,
      new_value: { status: 'WAITLIST', staff_message },
      timestamp: now,
    });

    res.json({
      message: 'Solicitud movida a lista de espera.',
      application: updated,
    });
  } catch (err: any) {
    console.error('Error moving to waitlist:', err);
    res.status(500).json({ error: 'Error al mover a lista de espera.' });
  }
});

// ==========================================
// EVENT MANAGEMENT (STAFF / ADMIN)
// ==========================================

// POST /api/events - Create new event
router.post('/', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const {
      title,
      short_description,
      description,
      image_url,
      date,
      start_time,
      end_time,
      location,
      estimated_minutes,
      total_spots,
      languages,
      requirements,
      min_age,
      minimum_age,
      important_info,
      instructions,
      organizer,
      status,
    } = req.body;

    if (!title || !description || !date || !start_time || !end_time || !location) {
      res.status(400).json({ error: 'Faltan campos obligatorios para el evento.' });
      return;
    }

    const totalSpotsNum = Number(total_spots);
    if (!totalSpotsNum || totalSpotsNum <= 0) {
      res.status(400).json({ error: 'Los cupos deben ser mayores a 0.' });
      return;
    }

    if (end_time <= start_time) {
      res.status(400).json({ error: 'La hora de fin debe ser posterior a la hora de inicio.' });
      return;
    }

    const randomCode = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newEvent: EventItem = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      short_description: (short_description || title).trim(),
      description: description.trim(),
      image_url: image_url || '',
      date: date.trim(),
      start_time: start_time.trim(),
      end_time: end_time.trim(),
      location: location.trim(),
      estimated_minutes: Number(estimated_minutes) > 0 ? Number(estimated_minutes) : 120,
      total_spots: totalSpotsNum,
      languages: Array.isArray(languages) && languages.length > 0 ? languages : ['Español', 'Inglés'],
      requirements: Array.isArray(requirements) ? requirements : [],
      min_age: min_age ? Number(min_age) : (minimum_age ? Number(minimum_age) : undefined),
      minimum_age: min_age ? Number(min_age) : (minimum_age ? Number(minimum_age) : undefined),
      important_info: (important_info || instructions || '').trim(),
      instructions: (instructions || important_info || '').trim(),
      organizer: organizer?.trim() || 'DMPS Connect',
      status: (status as EventStatus) || 'DRAFT',
      code: randomCode,
      created_by: req.user?.email || 'Staff',
      created_at: now,
      updated_at: now,
    };

    const saved = db.createEvent(newEvent);

    db.createAuditLog({
      id: `log_${Date.now()}`,
      user_id: req.user?.id || 'staff',
      user_name: req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff',
      role: req.user?.role || 'STAFF',
      action: 'EVENT_CREATED',
      target_id: newEvent.id,
      new_value: { title: newEvent.title, date: newEvent.date, spots: newEvent.total_spots, status: newEvent.status },
      timestamp: now,
    });

    res.status(201).json({ message: 'Evento creado exitosamente.', event: saved });
  } catch (err: any) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Error al crear el evento.' });
  }
});

// PUT /api/events/:id - Update event with notification on critical changes
router.put('/:id', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const existing = db.getRawEventById(id);
    if (!existing) {
      res.status(404).json({ error: 'Evento no encontrado.' });
      return;
    }

    const {
      title,
      short_description,
      description,
      image_url,
      date,
      start_time,
      end_time,
      location,
      estimated_minutes,
      total_spots,
      languages,
      requirements,
      min_age,
      minimum_age,
      important_info,
      instructions,
      organizer,
      status,
    } = req.body;

    if (start_time && end_time && end_time <= start_time) {
      res.status(400).json({ error: 'La hora de fin debe ser posterior a la hora de inicio.' });
      return;
    }

    const hasSignificantChanges =
      (date && date !== existing.date) ||
      (start_time && start_time !== existing.start_time) ||
      (end_time && end_time !== existing.end_time) ||
      (location && location !== existing.location);

    const updated = db.updateEvent(id, {
      title: title ? title.trim() : existing.title,
      short_description: short_description ? short_description.trim() : existing.short_description,
      description: description ? description.trim() : existing.description,
      image_url: image_url !== undefined ? image_url : existing.image_url,
      date: date ? date.trim() : existing.date,
      start_time: start_time ? start_time.trim() : existing.start_time,
      end_time: end_time ? end_time.trim() : existing.end_time,
      location: location ? location.trim() : existing.location,
      estimated_minutes: estimated_minutes ? Number(estimated_minutes) : existing.estimated_minutes,
      total_spots: total_spots ? Number(total_spots) : existing.total_spots,
      languages: Array.isArray(languages) ? languages : existing.languages,
      requirements: Array.isArray(requirements) ? requirements : existing.requirements,
      min_age: min_age !== undefined ? Number(min_age) : existing.min_age,
      minimum_age: minimum_age !== undefined ? Number(minimum_age) : existing.minimum_age,
      important_info: important_info !== undefined ? important_info : existing.important_info,
      instructions: instructions !== undefined ? instructions : existing.instructions,
      organizer: organizer ? organizer.trim() : existing.organizer,
      status: status || existing.status,
    });

    // Notify accepted volunteers if significant details changed
    if (hasSignificantChanges) {
      const acceptedApps = db.getApplicationsByEvent(id).filter(a => a.status === 'ACCEPTED');
      acceptedApps.forEach(a => {
        db.notifyUser(
          a.user_id,
          'Información actualizada del evento',
          `Se actualizó la información de "${updated?.title}". Revisa los nuevos detalles de fecha, horario o ubicación.`,
          'info',
          undefined,
          id,
          a.id
        );
      });
    }

    db.createAuditLog({
      id: `log_${Date.now()}`,
      user_id: req.user?.id || 'staff',
      user_name: req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff',
      role: req.user?.role || 'STAFF',
      action: 'EVENT_UPDATED',
      target_id: id,
      previous_value: existing,
      new_value: updated,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Evento actualizado exitosamente.', event: updated });
  } catch (err: any) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Error al actualizar el evento.' });
  }
});

// POST /api/events/:id/publish - Publish DRAFT to OPEN
router.post('/:id/publish', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const updated = db.updateEvent(id, { status: 'OPEN' });
    if (!updated) {
      res.status(404).json({ error: 'Evento no encontrado.' });
      return;
    }

    db.createAuditLog({
      id: `log_${Date.now()}`,
      user_id: req.user?.id || 'staff',
      user_name: req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff',
      role: req.user?.role || 'STAFF',
      action: 'EVENT_PUBLISHED',
      target_id: id,
      new_value: { status: 'OPEN' },
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Evento publicado exitosamente.', event: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al publicar el evento.' });
  }
});

// POST /api/events/:id/close - Close event applications
router.post('/:id/close', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const updated = db.updateEvent(id, { status: 'CLOSED' });
    if (!updated) {
      res.status(404).json({ error: 'Evento no encontrado.' });
      return;
    }

    db.createAuditLog({
      id: `log_${Date.now()}`,
      user_id: req.user?.id || 'staff',
      user_name: req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff',
      role: req.user?.role || 'STAFF',
      action: 'EVENT_CLOSED',
      target_id: id,
      new_value: { status: 'CLOSED' },
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Solicitudes del evento cerradas.', event: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al cerrar solicitudes del evento.' });
  }
});

// POST /api/events/:id/cancel - Cancel event and notify all participants
router.post('/:id/cancel', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const updated = db.updateEvent(id, { status: 'CANCELLED' });
    if (!updated) {
      res.status(404).json({ error: 'Evento no encontrado.' });
      return;
    }

    const apps = db.getApplicationsByEvent(id);
    apps.forEach(a => {
      if (['ACCEPTED', 'PENDING', 'WAITLIST'].includes(a.status)) {
        db.notifyUser(
          a.user_id,
          'Evento Cancelado',
          `El evento "${updated.title}" ha sido cancelado. ${reason ? `Motivo: ${reason}` : ''}`,
          'error',
          undefined,
          id,
          a.id
        );
      }
    });

    db.createAuditLog({
      id: `log_${Date.now()}`,
      user_id: req.user?.id || 'staff',
      user_name: req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff',
      role: req.user?.role || 'STAFF',
      action: 'EVENT_CANCELLED',
      target_id: id,
      new_value: { status: 'CANCELLED', reason },
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Evento cancelado y participantes notificados.', event: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al cancelar el evento.' });
  }
});

// POST /api/events/staff/applications/:id/attendance - Mark attendance (Bloque A13, C8)
router.post('/staff/applications/:id/attendance', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { attended, note } = req.body;

    if (typeof attended !== 'boolean') {
      res.status(400).json({ error: 'Debes indicar si el voluntario asistió o no (true/false).' });
      return;
    }

    const staffName = req.profile ? `${req.profile.first_name} ${req.profile.last_name}` : req.user?.email || 'Staff';
    const result = db.markAttendance(id, attended, staffName, req.user!.id, note);

    if (!result.success) {
      res.status(400).json({ error: result.error || 'Error al registrar asistencia.' });
      return;
    }

    res.json({
      message: attended ? 'Asistencia confirmada exitosamente.' : 'Marcado como No asistió.',
      application: result.application,
    });
  } catch (err: any) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: 'Error al marcar asistencia.' });
  }
});

// POST /api/events/applications/:id/cancel-participation - Volunteer cancels accepted event participation (Bloque E9)
router.post('/applications/:id/cancel-participation', authenticateToken, requireRole('VOLUNTEER'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = db.cancelAcceptedParticipation(id, req.user!.id, reason);
    if (!result.success) {
      res.status(400).json({ error: result.error || 'Error al cancelar la participación.' });
      return;
    }

    res.json({ message: 'Participación cancelada y cupo liberado exitosamente.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al procesar la cancelación.' });
  }
});

// GET /api/events/code/:code - Find event by short code
router.get('/code/:code', (req: Request, res: Response): void => {
  try {
    const { code } = req.params;
    const event = db.getEventById(code.toUpperCase());
    if (!event) {
      res.status(404).json({ error: 'Evento no encontrado con ese código.' });
      return;
    }
    res.json({ event });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al buscar el evento.' });
  }
});

export default router;
