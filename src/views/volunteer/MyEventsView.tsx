import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  ArrowRight,
  Lock,
  Trash2,
  Info,
  Timer,
  Share2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { api, formatMinutes } from '../../services/api';
import { EventItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface MyEventsViewProps {
  onNavigate: (view: string, params?: any) => void;
}

interface AcceptedEventItem {
  application_id: string;
  application_status: string;
  applied_at: string;
  accepted_at?: string;
  staff_message?: string;
  volunteer_code?: string;
  event: EventItem;
}

export const MyEventsView: React.FC<MyEventsViewProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<AcceptedEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTimeframe, setFilterTimeframe] = useState<'ALL' | 'UPCOMING' | 'TODAY' | 'PAST'>('ALL');
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [selectedEventForHours, setSelectedEventForHours] = useState<AcceptedEventItem | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<AcceptedEventItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadMyEvents();
  }, []);

  const loadMyEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getMyAcceptedEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error('Error loading my accepted events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelParticipation = async () => {
    if (!eventToCancel) return;
    setCancelling(true);
    try {
      await api.cancelApplication(eventToCancel.application_id, cancelReason);
      setShowCancelModal(false);
      setEventToCancel(null);
      setCancelReason('');
      loadMyEvents();
    } catch (err: any) {
      alert(err.message || 'Error al cancelar tu participación.');
    } finally {
      setCancelling(false);
    }
  };

  const calculateCountdown = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return { label: '¡ES HOY!', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse', isToday: true, isPast: false };
      }
      if (diffDays === 1) {
        return { label: 'Mañana', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40', isToday: false, isPast: false };
      }
      if (diffDays > 1) {
        return { label: `Faltan ${diffDays} días`, badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40', isToday: false, isPast: false };
      }
      return { label: 'Finalizado', badgeColor: 'bg-slate-800 text-slate-400 border-slate-700', isToday: false, isPast: true };
    } catch {
      return { label: dateStr, badgeColor: 'bg-slate-800 text-slate-300', isToday: false, isPast: false };
    }
  };

  const formatDateSpanish = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const filteredEvents = events.filter(item => {
    if (!item.event) return false;
    const { isToday, isPast } = calculateCountdown(item.event.date);

    if (filterTimeframe === 'TODAY') return isToday;
    if (filterTimeframe === 'UPCOMING') return !isPast;
    if (filterTimeframe === 'PAST') return isPast;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Mis Eventos Confirmados
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {events.length} Aceptados
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Aquí tienes tus oportunidades de voluntariado aceptadas, con sus instrucciones y cuenta regresiva.
          </p>
        </div>

        <button
          onClick={() => onNavigate('events')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2 w-fit"
        >
          <span>Buscar Más Eventos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'Todos los confirmados' },
          { id: 'UPCOMING', label: 'Próximos & Hoy' },
          { id: 'TODAY', label: 'Hoy' },
          { id: 'PAST', label: 'Concluidos' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterTimeframe(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterTimeframe === tab.id
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/30'
                : 'bg-[#07111F] text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Cargando tus eventos confirmados...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-[#07111F] rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No tienes eventos en esta sección</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Cuando el equipo de Staff acepte tus solicitudes de participación, aparecerán organizados aquí con todos sus detalles.
            </p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg inline-flex items-center gap-1.5"
          >
            <span>Explorar Oportunidades</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(item => {
            const event = item.event;
            const countdown = calculateCountdown(event.date);

            return (
              <div
                key={item.application_id}
                className="p-6 sm:p-8 bg-[#07111F] border border-slate-800/90 hover:border-emerald-500/30 rounded-2xl shadow-xl transition-all space-y-6"
              >
                {/* Card Header with Countdown & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${countdown.badgeColor} flex items-center gap-1.5`}>
                      <Timer className="w-3.5 h-3.5" />
                      <span>{countdown.label}</span>
                    </span>
                    <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                      {event.code}
                    </span>
                    <span className="text-xs text-sky-400 font-semibold flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      {event.organizer}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">ID Voluntario:</span>
                    <span className="px-2.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-sky-300 font-mono text-xs font-bold">
                      {profile?.volunteer_id}
                    </span>
                  </div>
                </div>

                {/* Event Core Info */}
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    {event.title}
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    {event.short_description || event.description}
                  </p>
                </div>

                {/* Event Schedule & Location Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#050A14] rounded-xl border border-slate-800 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Fecha
                    </span>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="capitalize">{formatDateSpanish(event.date)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Horario & Horas
                    </span>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{event.start_time} - {event.end_time} ({formatMinutes(event.estimated_minutes)})</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ubicación
                    </span>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>

                {/* Staff Instructions if any */}
                {(item.staff_message || event.important_info || event.instructions) && (
                  <div className="p-4 bg-blue-950/30 border border-sky-500/20 rounded-xl space-y-1 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-sky-300 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Instrucciones de Asistencia:</span>
                    </div>
                    <p className="text-slate-200">
                      {item.staff_message || event.important_info || event.instructions}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setEventToCancel(item);
                      setShowCancelModal(true);
                    }}
                    className="w-full sm:w-auto text-xs font-semibold text-slate-400 hover:text-rose-400 flex items-center justify-center gap-1.5 transition-colors py-2 px-3 rounded-lg hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Cancelar mi participación</span>
                  </button>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => onNavigate('event-detail', { eventId: event.id })}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                      <span>Ver Ficha Pública</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedEventForHours(item);
                        setShowHoursModal(true);
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Registrar Horas de este Evento</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Information Modal for Hour Registration (Phase 2 constraint notice) */}
      {showHoursModal && selectedEventForHours && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-sky-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                Registro de Horas de Eventos
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Has sido aceptado para <strong className="text-sky-300">"{selectedEventForHours.event.title}"</strong>. Podrás solicitar la acreditación de tus{' '}
                <strong className="text-emerald-300">{formatMinutes(selectedEventForHours.event.estimated_minutes)}</strong> de servicio una vez completada la jornada presencial o virtual.
              </p>
            </div>

            <div className="p-3.5 bg-[#050A14] rounded-xl border border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Fecha del Evento:</span>
                <span className="text-white font-semibold">{selectedEventForHours.event.date}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Horas acordadas:</span>
                <span className="text-emerald-400 font-bold">{formatMinutes(selectedEventForHours.event.estimated_minutes)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Supervisor / Coordinador:</span>
                <span className="text-white font-semibold">{selectedEventForHours.event.organizer}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowHoursModal(false);
                  onNavigate('submit-hours');
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                Registrar Otras Horas Independientes
              </button>

              <button
                onClick={() => setShowHoursModal(false)}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Participation Modal */}
      {showCancelModal && eventToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">¿Liberar tu lugar en este evento?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Al cancelar tu participación en <strong className="text-white">"{eventToCancel.event.title}"</strong>, tu cupo quedará libre de forma inmediata para otro voluntario en lista de espera.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 block">
                Motivo de cancelación (opcional):
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Ej. Imprevisto familiar, examen escolar..."
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500 resize-none h-20"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={cancelling}
                onClick={() => {
                  setShowCancelModal(false);
                  setEventToCancel(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Volver
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancelParticipation}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5"
              >
                {cancelling ? 'Liberando cupo...' : 'Confirmar y Liberar Cupo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
