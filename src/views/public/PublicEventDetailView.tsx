import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Share2,
  LogIn,
  UserPlus,
  HeartHandshake,
  ShieldCheck,
  Building,
  Hourglass,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { api, formatMinutes } from '../../services/api';
import { EventItem, EventApplication } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface PublicEventDetailViewProps {
  eventId: string;
  onNavigate: (view: string) => void;
  onBack: () => void;
}

export const PublicEventDetailView: React.FC<PublicEventDetailViewProps> = ({
  eventId,
  onNavigate,
  onBack,
}) => {
  const { user, profile } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [existingApp, setExistingApp] = useState<EventApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showApplyConfirmModal, setShowApplyConfirmModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadEventAndApplication();
  }, [eventId, user?.id]);

  const loadEventAndApplication = async () => {
    setLoading(true);
    try {
      const res = await api.getPublicEventDetail(eventId);
      setEvent(res.event);

      if (user && user.role === 'VOLUNTEER') {
        try {
          const appRes = await api.getMyApplications();
          const found = (appRes.applications || []).find((a: any) => a.event_id === res.event.id);
          if (found) {
            setExistingApp(found);
          } else {
            setExistingApp(null);
          }
        } catch (e) {
          console.error('Error loading volunteer applications:', e);
        }
      }
    } catch (err) {
      console.error('Error loading event detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      // Store intended event redirect in sessionStorage
      try {
        sessionStorage.setItem('redirect_after_auth_event', eventId);
      } catch {}
      setShowAuthModal(true);
      return;
    }

    if (user.role !== 'VOLUNTEER') {
      onNavigate('staff-applications');
      return;
    }

    setApplyError(null);
    setShowApplyConfirmModal(true);
  };

  const handleConfirmApply = async () => {
    if (!event) return;
    setApplying(true);
    setApplyError(null);
    try {
      const res = await api.applyToEvent(event.id);
      setApplySuccess(true);
      setExistingApp(res.application);
      // Reload event to get updated computed spots
      const updatedEventRes = await api.getPublicEventDetail(event.id);
      setEvent(updatedEventRes.event);
    } catch (err: any) {
      setApplyError(err.message || 'Error al enviar la solicitud.');
    } finally {
      setApplying(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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

  const calculateDaysLeft = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return '¡HOY!';
      if (diffDays === 1) return 'Mañana';
      if (diffDays > 1) return `Faltan ${diffDays} días`;
      if (diffDays < 0) return 'Evento concluido';
      return '';
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-300">
        <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold">Cargando información del evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Evento no encontrado</h2>
        <p className="text-slate-400 text-sm">
          El evento solicitado no existe o ya no está disponible.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
        >
          Volver a Eventos
        </button>
      </div>
    );
  }

  const availableSpots = event.available_spots !== undefined ? event.available_spots : event.total_spots;
  const isFull = availableSpots <= 0;
  const isFewSpots = availableSpots > 0 && availableSpots <= 3;
  const daysLeftLabel = calculateDaysLeft(event.date);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button & actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="btn-back-to-events"
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Eventos</span>
        </button>

        <div className="flex items-center gap-2">
          {daysLeftLabel && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20">
              {daysLeftLabel}
            </span>
          )}
          <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
            {event.code}
          </span>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs flex items-center gap-1.5"
            title="Compartir evento"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Compartir'}</span>
          </button>
        </div>
      </div>

      {/* Staff Management Banner (If authenticated as Staff/Admin) */}
      {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-indigo-200">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <strong className="text-white block font-semibold">Panel de Coordinación Staff</strong>
              <span>
                Cupos: {availableSpots} disponibles de {event.total_spots}. Solicitudes aceptadas: {event.accepted_count || 0}.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('staff-applications')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Ver Solicitudes de Eventos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Application Status Banner for Volunteer */}
      {user?.role === 'VOLUNTEER' && existingApp && (
        <div className={`p-6 rounded-2xl border shadow-xl ${
          existingApp.status === 'ACCEPTED'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : existingApp.status === 'PENDING'
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : existingApp.status === 'WAITLIST'
            ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
            : existingApp.status === 'REJECTED'
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            : 'bg-slate-900/60 border-slate-700 text-slate-300'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {existingApp.status === 'ACCEPTED' && <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />}
              {existingApp.status === 'PENDING' && <Hourglass className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 animate-pulse" />}
              {existingApp.status === 'WAITLIST' && <Clock className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />}
              {existingApp.status === 'REJECTED' && <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />}
              {existingApp.status === 'CANCELLED' && <AlertCircle className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" />}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Tu Estado para este Evento:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                    existingApp.status === 'ACCEPTED' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' :
                    existingApp.status === 'PENDING' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                    existingApp.status === 'WAITLIST' ? 'bg-sky-500/30 text-sky-300 border border-sky-500/50' :
                    existingApp.status === 'REJECTED' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {existingApp.status === 'ACCEPTED' ? 'ACEPTADO' :
                     existingApp.status === 'PENDING' ? 'PENDIENTE DE REVISIÓN' :
                     existingApp.status === 'WAITLIST' ? 'EN LISTA DE ESPERA' :
                     existingApp.status === 'REJECTED' ? 'NO ACEPTADA' : 'CANCELADA'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200">
                  {existingApp.status === 'ACCEPTED' && '¡Felicidades! Tu lugar está confirmado. Revisa los detalles y asiste puntual.'}
                  {existingApp.status === 'PENDING' && 'Tu solicitud está siendo revisada por el equipo de coordinación.'}
                  {existingApp.status === 'WAITLIST' && 'Estás en lista de espera. Si un voluntario libera su lugar, te notificaremos de inmediato.'}
                  {existingApp.status === 'REJECTED' && 'Para este evento no fue posible aceptar tu solicitud.'}
                  {existingApp.status === 'CANCELLED' && 'Has cancelado previamente tu postulación a este evento.'}
                </p>

                {existingApp.staff_message && (
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-xs text-slate-300 mt-2">
                    <strong className="text-white">Mensaje del equipo:</strong> "{existingApp.staff_message}"
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigate(existingApp.status === 'ACCEPTED' ? 'my-events' : 'my-applications')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600 transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>{existingApp.status === 'ACCEPTED' ? 'Ver en Mis Eventos' : 'Ver Mis Solicitudes'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Event Card */}
      <div className="bg-[#07111F]/90 border border-slate-800/90 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
        {/* Title & Organization Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {isFull ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Cupos Completos
              </span>
            ) : isFewSpots ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ¡Últimos {availableSpots} Cupos!
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Inscripciones Abiertas
              </span>
            )}

            <span className="text-xs text-sky-400 font-semibold flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              {event.organizer}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {event.title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {event.short_description}
          </p>
        </div>

        {/* Highlight Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[#050A14]/80 border border-slate-800 rounded-xl">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Fecha
            </span>
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="capitalize">{formatDateSpanish(event.date)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Horario & Horas
            </span>
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <Clock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                {event.start_time} - {event.end_time} ({formatMinutes(event.estimated_minutes)})
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ubicación
            </span>
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Cupos Disponibles
            </span>
            <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
              <Users className="w-4 h-4 text-sky-400 shrink-0" />
              <span className={isFull ? 'text-rose-400 font-bold' : isFewSpots ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                {availableSpots} restantes / {event.total_spots}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-3 pt-2">
          <h2 className="text-lg font-bold text-white">Descripción Completa</h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {/* Requirements & Languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-400" />
              <span>Requisitos para Participar</span>
            </h3>
            {event.requirements && event.requirements.length > 0 ? (
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {event.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">Sin requisitos especiales especificados.</p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-sky-400" />
              <span>Idiomas & Edad Mínima</span>
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-slate-300">
              <div className="flex flex-wrap gap-1.5">
                {event.languages && event.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    {lang}
                  </span>
                ))}
              </div>
              {(event.min_age || event.minimum_age) && (
                <p className="text-xs text-slate-400 pt-1">
                  Edad mínima sugerida: <strong className="text-white">{event.min_age || event.minimum_age} años</strong>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Important Info Notice */}
        {(event.important_info || event.instructions) && (
          <div className="p-4 bg-blue-950/30 border border-sky-500/20 rounded-xl flex items-start gap-3 text-xs text-sky-200">
            <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold mb-0.5">Información Importante:</strong>
              {event.important_info || event.instructions}
            </div>
          </div>
        )}

        {/* Main Action Banner */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">¿Listo para colaborar con la comunidad?</span>
            <span className="text-sm font-bold text-white">
              Gana {formatMinutes(event.estimated_minutes)} de voluntariado certificado
            </span>
          </div>

          {user?.role === 'VOLUNTEER' && existingApp && existingApp.status !== 'CANCELLED' ? (
            <button
              onClick={() => onNavigate(existingApp.status === 'ACCEPTED' ? 'my-events' : 'my-applications')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-extrabold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-all flex items-center justify-center gap-2"
            >
              <span>{existingApp.status === 'ACCEPTED' ? 'VER EN MIS EVENTOS' : 'VER MI SOLICITUD'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-apply-event-main"
              disabled={isFull}
              onClick={handleApplyClick}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-extrabold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl ${
                isFull
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-blue-900/40'
              }`}
            >
              <HeartHandshake className="w-5 h-5" />
              <span>{isFull ? 'EVENTO COMPLETO' : 'SOLICITAR PARTICIPACIÓN'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal to Apply */}
      {showApplyConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-sky-500/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirmar Solicitud de Participación</h3>
                <span className="text-xs text-slate-400">DMPS Connect Hub</span>
              </div>
            </div>

            {applySuccess ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white">¡Solicitud Enviada con Éxito!</h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Tu postulación para <strong className="text-sky-300">"{event.title}"</strong> está en estado <span className="text-amber-300 font-bold">PENDIENTE</span>. El equipo de Staff la revisará a la brevedad.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowApplyConfirmModal(false);
                      setApplySuccess(false);
                      onNavigate('my-applications');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg"
                  >
                    Ver Mis Solicitudes
                  </button>
                  <button
                    onClick={() => {
                      setShowApplyConfirmModal(false);
                      setApplySuccess(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                  >
                    Permanecer en el Evento
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-[#050A14] rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Voluntario:</span>
                    <span className="text-white font-semibold">{profile?.first_name} {profile?.last_name} ({profile?.volunteer_id})</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Escuela:</span>
                    <span className="text-white font-semibold">{profile?.school || 'DMPS'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Evento:</span>
                    <span className="text-white font-semibold truncate max-w-[220px]">{event.title}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Fecha & Horario:</span>
                    <span className="text-white font-semibold">{event.date} ({event.start_time} - {event.end_time})</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Horas estimadas:</span>
                    <span className="text-sky-400 font-bold">{formatMinutes(event.estimated_minutes)}</span>
                  </div>
                </div>

                {applyError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{applyError}</span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Al enviar tu solicitud, te comprometes a asistir puntualmente si eres aceptado por el equipo de coordinación.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={applying}
                    onClick={() => setShowApplyConfirmModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={applying}
                    onClick={handleConfirmApply}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2"
                  >
                    {applying ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <HeartHandshake className="w-4 h-4" />
                        <span>Enviar Solicitud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Prompt Modal if clicked without login */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-sky-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 mx-auto">
              <HeartHandshake className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Necesitas una cuenta para solicitar participar
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Inicia sesión o crea tu cuenta gratuita de voluntario para postularte al evento{' '}
                <strong className="text-sky-300">"{event.title}"</strong> y certificar tus horas de servicio.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  onNavigate('login');
                }}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>INICIAR SESIÓN</span>
              </button>

              <button
                onClick={() => {
                  setShowAuthModal(false);
                  onNavigate('register');
                }}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-sky-400" />
                <span>CREAR CUENTA</span>
              </button>

              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 pt-2"
              >
                Cancelar y continuar explorando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
