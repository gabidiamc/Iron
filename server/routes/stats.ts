import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Staff: Real Statistics Endpoint
router.get('/', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const submissions = db.getAllSubmissions();
    const volunteers = db.getAllVolunteers();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const thisMonthPrefix = `${currentYear}-${currentMonth}`;
    const thisYearPrefix = `${currentYear}-`;

    // 1. Overall counts
    const pendingSubmissions = submissions.filter(s => s.status === 'PENDING' || s.status === 'CORRECTED');
    const approvedSubmissions = submissions.filter(s => s.status === 'APPROVED');
    const rejectedSubmissions = submissions.filter(s => s.status === 'REJECTED');
    const needsCorrectionSubmissions = submissions.filter(s => s.status === 'NEEDS_CORRECTION');

    // 2. Total Approved Minutes strictly from APPROVED records
    const approvedMinutesTotal = approvedSubmissions.reduce(
      (acc, s) => acc + (s.approved_minutes ?? s.submitted_minutes ?? 0), 0
    );

    const approvedMinutesThisMonth = approvedSubmissions
      .filter(s => s.date.startsWith(thisMonthPrefix))
      .reduce((acc, s) => acc + (s.approved_minutes ?? s.submitted_minutes ?? 0), 0);

    const approvedMinutesThisYear = approvedSubmissions
      .filter(s => s.date.startsWith(thisYearPrefix))
      .reduce((acc, s) => acc + (s.approved_minutes ?? s.submitted_minutes ?? 0), 0);

    const pendingMinutesTotal = pendingSubmissions.reduce(
      (acc, s) => acc + (s.submitted_minutes || 0), 0
    );

    // 3. Active Volunteers (volunteers who have at least one approved or submitted record)
    const activeVolunteerIds = new Set(submissions.map(s => s.volunteer_id));
    const activeVolunteersCount = volunteers.filter(v => activeVolunteerIds.has(v.id)).length;

    // 4. Monthly Trend (last 6 months)
    const monthsNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyData: { month: string; horas: number; solicitudes: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const prefix = `${y}-${m}`;
      const label = `${monthsNames[d.getMonth()]} ${y}`;

      const monthApprovedMin = approvedSubmissions
        .filter(s => s.date.startsWith(prefix))
        .reduce((acc, s) => acc + (s.approved_minutes ?? s.submitted_minutes ?? 0), 0);

      const monthCount = submissions.filter(s => s.date.startsWith(prefix)).length;

      monthlyData.push({
        month: label,
        horas: Number((monthApprovedMin / 60).toFixed(1)),
        solicitudes: monthCount,
      });
    }

    // 5. Distribution by School
    const schoolMap = new Map<string, { school: string; horas: number; voluntarios: Set<string> }>();
    volunteers.forEach(v => {
      const schoolName = v.school?.trim() || 'No especificada';
      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, { school: schoolName, horas: 0, voluntarios: new Set() });
      }
      schoolMap.get(schoolName)!.voluntarios.add(v.id);
    });

    approvedSubmissions.forEach(s => {
      const schoolName = s.school?.trim() || 'No especificada';
      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, { school: schoolName, horas: 0, voluntarios: new Set() });
      }
      const item = schoolMap.get(schoolName)!;
      item.horas += (s.approved_minutes ?? s.submitted_minutes ?? 0) / 60;
    });

    const schoolDistribution = Array.from(schoolMap.values()).map(item => ({
      school: item.school,
      horas: Number(item.horas.toFixed(1)),
      voluntarios: item.voluntarios.size,
    })).sort((a, b) => b.horas - a.horas);

    // 6. Top Volunteers Leaderboard (strictly based on approved minutes)
    const topVolunteers = volunteers.map(v => {
      const min = db.getApprovedMinutesForVolunteer(v.id);
      return {
        id: v.id,
        volunteer_id: v.volunteer_id,
        name: `${v.first_name} ${v.last_name}`,
        school: v.school || 'Sin escuela',
        approved_minutes: min,
        hours_formatted: `${Math.floor(min / 60)} h ${min % 60} min`,
        hours_number: Number((min / 60).toFixed(1)),
        avatar_url: v.avatar_url,
      };
    })
    .sort((a, b) => b.approved_minutes - a.approved_minutes)
    .slice(0, 10);

    // 7. Event & Application Stats for Phase 2 & Final Phase
    const allEvents = db.getEvents(true);
    const allEventApps = db.getAllApplications();
    const pendingEventApps = allEventApps.filter(a => a.status === 'PENDING').length;
    const acceptedEventApps = allEventApps.filter(a => a.status === 'ACCEPTED').length;
    const activeEventsCount = allEvents.filter(e => e.status === 'OPEN' || e.status === 'FEW_SPOTS').length;
    const certificatesIssuedCount = db.getAllCertificates().length;

    res.json({
      summary: {
        total_volunteers: volunteers.length,
        active_volunteers: activeVolunteersCount,
        approved_minutes_total: approvedMinutesTotal,
        approved_minutes_this_month: approvedMinutesThisMonth,
        approved_minutes_this_year: approvedMinutesThisYear,
        pending_submissions_count: pendingSubmissions.length,
        pending_minutes_total: pendingMinutesTotal,
        approved_submissions_count: approvedSubmissions.length,
        rejected_submissions_count: rejectedSubmissions.length,
        needs_correction_count: needsCorrectionSubmissions.length,
        pending_event_applications: pendingEventApps,
        accepted_event_applications: acceptedEventApps,
        active_events_count: activeEventsCount,
        total_events_count: allEvents.length,
        certificates_count: certificatesIssuedCount,
      },
      monthlyData,
      schoolDistribution,
      topVolunteers,
    });
  } catch (err: any) {
    console.error('Error getting stats:', err);
    res.status(500).json({ error: 'Error al generar las estadísticas.' });
  }
});

// Volunteer: Generate Official Hours Report (Bloque D3)
router.get('/report', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    if (!req.profile) {
      res.status(400).json({ error: 'Perfil no encontrado.' });
      return;
    }

    const volunteerId = req.profile.id;
    const submissions = db.getSubmissionsByVolunteer(volunteerId);
    const approvedSubmissions = submissions.filter(s => s.status === 'APPROVED');

    const totalApprovedMinutes = approvedSubmissions.reduce(
      (acc, s) => acc + (s.approved_minutes || s.submitted_minutes || 0), 0
    );

    const applications = db.getApplicationsByVolunteer(volunteerId);
    const attendedEvents = applications.filter(a => a.attended === true || (a.status === 'ACCEPTED' && a.hours_submitted));

    const report = {
      volunteer: {
        id: req.profile.id,
        code: req.profile.volunteer_id,
        name: `${req.profile.first_name} ${req.profile.last_name}`,
        email: req.user?.email,
        phone: req.profile.phone,
        school: req.profile.school,
        grade: req.profile.grade,
      },
      summary: {
        total_approved_hours: (totalApprovedMinutes / 60).toFixed(1),
        total_approved_minutes: totalApprovedMinutes,
        hours_formatted: `${Math.floor(totalApprovedMinutes / 60)} horas ${totalApprovedMinutes % 60} minutos`,
        approved_activities_count: approvedSubmissions.length,
        events_attended_count: attendedEvents.length,
        generated_at: new Date().toISOString(),
        issuer: 'Des Moines Public Schools — Community Engagement Department',
        verification_url: `${req.protocol}://${req.get('host')}/verify?id=${req.profile.volunteer_id}`,
      },
      records: approvedSubmissions.map(s => ({
        id: s.id,
        activity: s.activity_name,
        organization: s.organization_name,
        date: s.date,
        hours: ((s.approved_minutes || s.submitted_minutes) / 60).toFixed(1),
        minutes: s.approved_minutes || s.submitted_minutes,
        supervisor: s.supervisor_name,
        source: s.source || 'MANUAL',
        verified_by: s.reviewed_by || 'Staff DMPS',
      })),
    };

    res.json({ report });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al generar el reporte de horas.' });
  }
});

// Staff/Admin: Export Submissions to CSV format
router.get('/export/csv', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const submissions = db.getAllSubmissions();
    const headers = [
      'ID',
      'Código Voluntario',
      'Nombre',
      'Escuela',
      'Actividad',
      'Organización',
      'Fecha',
      'Minutos Enviados',
      'Minutos Aprobados',
      'Horas Aprobadas',
      'Estado',
      'Tipo/Origen',
      'Supervisor',
      'Revisado Por',
      'Fecha Envio',
    ];

    const rows = submissions.map(s => [
      `"${s.id}"`,
      `"${s.volunteer_code}"`,
      `"${s.volunteer_name.replace(/"/g, '""')}"`,
      `"${(s.school || '').replace(/"/g, '""')}"`,
      `"${s.activity_name.replace(/"/g, '""')}"`,
      `"${s.organization_name.replace(/"/g, '""')}"`,
      `"${s.date}"`,
      s.submitted_minutes,
      s.approved_minutes || 0,
      ((s.approved_minutes || 0) / 60).toFixed(2),
      `"${s.status}"`,
      `"${s.source || 'MANUAL'}"`,
      `"${(s.supervisor_name || '').replace(/"/g, '""')}"`,
      `"${(s.reviewed_by || '').replace(/"/g, '""')}"`,
      `"${s.submitted_at}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="dmps_report_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: 'Error al exportar datos.' });
  }
});

export default router;
