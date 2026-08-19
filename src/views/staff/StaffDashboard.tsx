import React, { useState, useEffect } from 'react';
import { api, formatMinutes } from '../../services/api';
import { HourSubmission, SystemStats, EventItem, EventApplication } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { StaffReviewModal } from './StaffReviewModal';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Inbox,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
  Building,
  Eye,
  ShieldCheck,
  HeartHandshake,
  PlusCircle,
} from 'lucide-react';

interface StaffDashboardProps {
  onNavigate: (view: string) => void;
  onOpenSubmission: (id: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onNavigate,
  onOpenSubmission,
}) => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<HourSubmission[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [pendingApplications, setPendingApplications] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedSubmission, setSelectedSubmission] = useState<HourSubmission | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const [statsData, subsData, eventsData, appsData] = await Promise.all([
        api.getSystemStats(),
        api.getAllSubmissions('PENDING'),
        api.getStaffEvents().catch(() => ({ events: [] })),
        api.getStaffApplications({ status: 'PENDING' }).catch(() => ({ applications: [] })),
      ]);
      setStats(statsData.stats);
      setPendingSubmissions(subsData.submissions || []);
      setEvents(eventsData.events || []);
      setPendingApplications(appsData.applications || []);
    } catch (err) {
      console.error('Error fetching staff dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleReview = (sub: HourSubmission) => {
    setSelectedSubmission(sub);
    setIsReviewModalOpen(true);
  };

  const activeEventsCount = events.filter((e) => e.status === 'PUBLISHED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#07111F] via-[#0B192E] to-[#07111F] border border-[#16263D] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Panel de Coordinación y Staff DMPS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Gestión de Eventos y Horas Comunitarias
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Publica convocatorias de voluntariado, revisa postulaciones de estudiantes y valida horas de servicio con control concurrente.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigate('staff-events')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all shrink-0"
            >
              <Calendar size={15} />
              <span>Gestionar Eventos</span>
            </button>
            <button
              onClick={() => onNavigate('staff-applications')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0"
            >
              <HeartHandshake size={15} />
              <span>Solicitudes ({pendingApplications.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Volunteers */}
        <div className="bg-[#07111F] border border-[#16263D] hover:border-[#1677FF]/40 rounded-2xl p-4 transition-all shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Voluntarios
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#1677FF]/15 text-[#258BFF] flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {stats?.total_volunteers || 0}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Cuentas activas</p>
        </div>

        {/* Active Events */}
        <div className="bg-[#07111F] border border-[#16263D] hover:border-blue-500/40 rounded-2xl p-4 transition-all shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Eventos Activos
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Calendar size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-400">
            {activeEventsCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Convocatorias públicas</p>
        </div>

        {/* Pending Event Applications */}
        <div className="bg-[#07111F] border border-[#16263D] hover:border-purple-500/40 rounded-2xl p-4 transition-all shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Postulaciones
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <HeartHandshake size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-400">
            {pendingApplications.length}
          </div>
          <p className="text-[10px] text-purple-400/80 mt-1 font-medium">Por responder</p>
        </div>

        {/* Pending Hour Submissions */}
        <div className="bg-[#07111F] border border-[#16263D] hover:border-amber-500/40 rounded-2xl p-4 transition-all shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Horas x Revisar
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {stats?.pending_submissions || 0}
          </div>
          <p className="text-[10px] text-amber-400/80 mt-1 font-medium">
            Solicitudes pendientes
          </p>
        </div>

        {/* Approved Total Hours */}
        <div className="bg-[#07111F] border border-[#16263D] hover:border-emerald-500/40 rounded-2xl p-4 transition-all shadow-lg col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Horas
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-lg font-extrabold text-emerald-400 font-mono">
            {formatMinutes(stats?.total_approved_minutes || 0)}
          </div>
          <p className="text-[10px] text-emerald-400/80 mt-1 font-medium">Acreditadas</p>
        </div>
      </div>

      {/* Quick Navigation Cards for Staff */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('staff-events')}
          className="p-5 rounded-2xl bg-[#07111F] border border-[#16263D] hover:border-blue-500/60 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calendar size={20} />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
            Gestión de Eventos
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Crear, editar, abrir cupos y publicar eventos del distrito.
          </p>
        </button>

        <button
          onClick={() => onNavigate('staff-applications')}
          className="p-5 rounded-2xl bg-[#07111F] border border-[#16263D] hover:border-purple-500/60 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <HeartHandshake size={20} />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
            Solicitudes de Eventos
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Aceptar voluntarios, gestionar lista de espera y asistencia.
          </p>
        </button>

        <button
          onClick={() => onNavigate('staff-submissions')}
          className="p-5 rounded-2xl bg-[#07111F] border border-[#16263D] hover:border-amber-500/60 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Inbox size={20} />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
            Aprobación de Horas
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Aprobar, rechazar o solicitar correcciones de horas.
          </p>
        </button>

        <button
          onClick={() => onNavigate('staff-volunteers')}
          className="p-5 rounded-2xl bg-[#07111F] border border-[#16263D] hover:border-emerald-500/60 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
            Directorio de Voluntarios
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Consulta perfiles, horas acumuladas y datos de contacto.
          </p>
        </button>
      </div>

      {/* Pending Queue Priority Section */}
      <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Bandeja de Aprobación de Horas (Pendientes)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('staff-submissions')}
            className="text-xs font-semibold text-[#258BFF] hover:underline"
          >
            Ver todas las horas →
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pendingSubmissions.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <CheckCircle2 size={40} className="mx-auto mb-2 text-emerald-400 opacity-60" />
            <h4 className="text-sm font-semibold text-slate-200">¡Bandeja de horas al día!</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              No hay horas pendientes de revisión en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingSubmissions.slice(0, 5).map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-[#0B192E]/70 border border-amber-500/20 hover:border-amber-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#258BFF] bg-[#1677FF]/20 px-2 py-0.5 rounded-md">
                      {sub.volunteer_code}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">
                      {sub.activity_name}
                    </h4>
                    <StatusBadge status={sub.status} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400 mt-1.5">
                    <span className="text-slate-200 font-semibold">{sub.volunteer_name}</span>
                    <span>•</span>
                    <span>{sub.school}</span>
                    <span>•</span>
                    <span>{sub.organization_name}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-amber-300">
                      {formatMinutes(sub.submitted_minutes)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#16263D]">
                  <button
                    onClick={() => handleReview(sub)}
                    className="px-4 py-2 bg-gradient-to-r from-[#1677FF] to-[#258BFF] hover:from-[#1366dc] hover:to-[#1e78e0] text-white rounded-xl text-xs font-bold shadow-md shadow-[#1677FF]/20 flex items-center gap-1.5 transition-all"
                  >
                    <span>Revisar & Aprobar</span>
                  </button>
                  <button
                    onClick={() => onOpenSubmission(sub.id)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                    title="Ver Detalles"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <StaffReviewModal
        submission={selectedSubmission}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedSubmission(null);
        }}
        onSuccess={() => {
          fetchStaffData();
        }}
      />
    </div>
  );
};
