import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Staff: Get list of all volunteers with real metrics
router.get('/', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { search, school, min_hours, max_hours, sort_by } = req.query;
    const volunteers = db.getAllVolunteers();

    // Map volunteers with their calculated live statistics
    let volunteerList = volunteers.map(v => {
      const approvedMinutes = db.getApprovedMinutesForVolunteer(v.id);
      const pendingMinutes = db.getPendingMinutesForVolunteer(v.id);
      const rejectedCount = db.getRejectedCountForVolunteer(v.id);
      const allSubmissions = db.getSubmissionsByVolunteer(v.id);

      return {
        id: v.id,
        user_id: v.user_id,
        volunteer_id: v.volunteer_id,
        first_name: v.first_name,
        last_name: v.last_name,
        email: v.email,
        phone: v.phone,
        school: v.school,
        grade: v.grade,
        organization: v.organization,
        languages: v.languages,
        join_date: v.join_date,
        bio: v.bio,
        avatar_url: v.avatar_url,
        profile_completed: v.profile_completed,
        stats: {
          approved_minutes: approvedMinutes,
          pending_minutes: pendingMinutes,
          total_submissions: allSubmissions.length,
          rejected_count: rejectedCount,
        },
      };
    });

    // Filters
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      volunteerList = volunteerList.filter(v =>
        v.first_name.toLowerCase().includes(q) ||
        v.last_name.toLowerCase().includes(q) ||
        v.volunteer_id.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        (v.school && v.school.toLowerCase().includes(q))
      );
    }

    if (school && typeof school === 'string' && school !== 'ALL') {
      volunteerList = volunteerList.filter(v => v.school === school);
    }

    if (min_hours && typeof min_hours === 'string') {
      const minMin = parseInt(min_hours, 10) * 60;
      volunteerList = volunteerList.filter(v => v.stats.approved_minutes >= minMin);
    }

    if (max_hours && typeof max_hours === 'string') {
      const maxMin = parseInt(max_hours, 10) * 60;
      volunteerList = volunteerList.filter(v => v.stats.approved_minutes <= maxMin);
    }

    // Sort
    if (sort_by === 'hours_desc') {
      volunteerList.sort((a, b) => b.stats.approved_minutes - a.stats.approved_minutes);
    } else if (sort_by === 'name_asc') {
      volunteerList.sort((a, b) => a.first_name.localeCompare(b.first_name));
    } else {
      // Default newest join date
      volunteerList.sort((a, b) => new Date(b.join_date).getTime() - new Date(a.join_date).getTime());
    }

    res.json({ volunteers: volunteerList });
  } catch (err: any) {
    console.error('Error fetching volunteers:', err);
    res.status(500).json({ error: 'Error al obtener la lista de voluntarios.' });
  }
});

// Staff: Get complete volunteer profile with history and statistics
router.get('/:id', authenticateToken, requireRole('STAFF', 'ADMIN'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { id } = req.params;
    const profile = db.getProfileById(id);

    if (!profile) {
      res.status(404).json({ error: 'Voluntario no encontrado.' });
      return;
    }

    const approvedMinutes = db.getApprovedMinutesForVolunteer(profile.id);
    const pendingMinutes = db.getPendingMinutesForVolunteer(profile.id);
    const thisMonthMinutes = db.getApprovedMinutesThisMonthForVolunteer(profile.id);
    const rejectedCount = db.getRejectedCountForVolunteer(profile.id);
    const submissions = db.getSubmissionsByVolunteer(profile.id);

    res.json({
      profile,
      stats: {
        approved_minutes: approvedMinutes,
        pending_minutes: pendingMinutes,
        this_month_minutes: thisMonthMinutes,
        rejected_count: rejectedCount,
        total_submissions: submissions.length,
      },
      submissions,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al cargar perfil de voluntario.' });
  }
});

export default router;
