import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Hourglass,
  AlertTriangle,
  Eye,
  Check,
  X,
  Building,
  School,
  Globe2,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { api, formatMinutes } from '../../services/api';
import { EventApplication, EventItem, ApplicationStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface StaffApplicationsViewProps {
  onNavigate: (view: string, params?: any) => void;
  initialEventId?: string;
}

export const StaffApplicationsView: React.FC<StaffApplicationsViewProps> = ({
  onNavigate,
  initialEventId,
}) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [counters, setCounters] = useState({
    pending: 0,
    accepted: 0,
    waitlist: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSchool, setSelectedSchool] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals & Action states
  const [selectedAppDetail, setSelectedAppDetail] = useState<EventApplication | null>(null);
  const [actionModal, setActionModal] = useState<{
    type: 'ACCEPT' | 'REJECT' | 'WAITLIST';
    app: EventApplication;
  } | null>(null);
  const [staffMessage, setStaffMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Cupos completos');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedEventId, selectedStatus, selectedSchool]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsRes, eventsRes] = await Promise.all([
        api.getStaffApplications({
          event_id: selectedEventId,
          status: selectedStatus,
          school: selectedSchool,
          search: searchTerm,
        }),
        api.getAllEventsStaff(true),
      ]);

      setApplications(appsRes.applications || []);
      if (appsRes.counters) {
        setCounters(appsRes.counters);
      }
      setEventsList(eventsRes.events || []);
    } catch (err) {
      console.error('Error loading staff applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleExecuteAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    setActionError(null);

    const { type, app } = actionModal;

    try {
      if (type === 'ACCEPT') {
        const res = await api.acceptApplication(app.id, staffMessage);
        // Success
      } else if (type === 'REJECT') {
        await api.rejectApplication(app.id, rejectionReason, staffMessage);
      } else if (type === 'WAITLIST') {
        await api.waitlistApplication(app.id, staffMessage);
      }

      setActionModal(null);
      setStaffMessage('');
      setRejectionReason('Cupos completos');
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aceptada</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Hourglass className="w-3.5 h-3.5 animate-pulse" />
            <span>Pendiente</span>
          </span>
        );
      case 'WAITLIST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Lista de Espera</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>No Aceptada</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-700/60 text-slate-400 border border-slate-600">
            <span>Cancelada</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Distinct schools list for filter
  const schoolOptions = Array.from(new Set(applications.map(a => a.school).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Solicitudes de Participación en Eventos
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-sky-300 border border-blue-500/30">
              Staff Portal
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Revisa, aprueba cupos en tiempo real y gestiona la lista de espera de los voluntarios postulados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('staff-events')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Gestión de Eventos</span>
          </button>

          <button
            onClick={() => loadData()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Refrescar solicitudes"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedStatus('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatus === 'ALL'
              ? 'bg-blue-950/40 border-blue-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block">Total</span>
          <span className="text-xl sm:text-2xl font-black text-white">{counters.total}</span>
        </button>

        <button
          onClick={() => setSelectedStatus('PENDING')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatus === 'PENDING'
              ? 'bg-amber-950/40 border-amber-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-amber-400">
            Pendientes
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{counters.pending}</span>
        </button>

        <button
          onClick={() => setSelectedStatus('ACCEPTED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatus === 'ACCEPTED'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-emerald-400">
            Aceptadas
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{counters.accepted}</span>
        </button>

        <button
          onClick={() => setSelectedStatus('WAITLIST')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatus === 'WAITLIST'
              ? 'bg-sky-950/40 border-sky-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-sky-400">
            Lista de Espera
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{counters.waitlist}</span>
        </button>

        <button
          onClick={() => setSelectedStatus('REJECTED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatus === 'REJECTED'
              ? 'bg-rose-950/40 border-rose-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-rose-400">
            No Aceptadas
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{counters.rejected}</span>
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-[#07111F] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por voluntario, VOL-ID o evento..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#050A14] border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#050A14] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">Todos los eventos</option>
              {eventsList.map(e => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.code}) — {e.available_spots} cupos disp.
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedSchool}
              onChange={e => setSelectedSchool(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#050A14] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">Todas las escuelas</option>
              {schoolOptions.map(sch => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow flex items-center justify-center"
            >
              Filtrar
            </button>
          </div>
        </form>
      </div>

      {/* Applications Table / Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Cargando solicitudes de eventos...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-[#07111F] rounded-2xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No se encontraron solicitudes</h3>
          <p className="text-xs text-slate-400">
            No hay solicitudes que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="bg-[#07111F] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#050A14] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Voluntario</th>
                  <th className="py-3.5 px-4 font-bold">Escuela & Idiomas</th>
                  <th className="py-3.5 px-4 font-bold">Evento Solicitado</th>
                  <th className="py-3.5 px-4 font-bold">Fecha / Horas</th>
                  <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acciones de Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {applications.map(app => {
                  const event = app.event;
                  const availableSpots = event?.available_spots !== undefined ? event.available_spots : 0;

                  return (
                    <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Volunteer Column */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-bold text-white text-sm">{app.volunteer_name}</div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] bg-blue-950/60 text-sky-300 px-1.5 py-0.5 rounded border border-blue-500/20 font-semibold">
                            {app.volunteer_code}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Postulado: {new Date(app.applied_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </td>

                      {/* School & Languages */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="text-white font-medium flex items-center gap-1">
                          <School className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{app.school || 'DMPS'} {app.grade ? `(${app.grade})` : ''}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {app.languages && app.languages.map((l, i) => (
                            <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                              {l}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Event */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="font-bold text-white line-clamp-1 max-w-[200px]">
                          {event?.title || 'Evento'}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-mono text-sky-400">{event?.code}</span>
                          <span>•</span>
                          <span className={availableSpots <= 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-semibold'}>
                            {availableSpots} cupos disponibles
                          </span>
                        </div>
                      </td>

                      {/* Date & Hours */}
                      <td className="py-4 px-4 space-y-1 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{event?.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{formatMinutes(event?.estimated_minutes)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(app.status)}
                        {app.staff_message && (
                          <div className="text-[10px] text-slate-400 italic mt-1 truncate max-w-[140px] mx-auto" title={app.staff_message}>
                            "{app.staff_message}"
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedAppDetail(app)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs"
                          title="Ver detalle completo"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                        </button>

                        {app.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => {
                                setActionError(null);
                                setStaffMessage('');
                                setActionModal({ type: 'ACCEPT', app });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow inline-flex items-center gap-1"
                              title="Aceptar solicitud"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aceptar</span>
                            </button>

                            <button
                              onClick={() => {
                                setActionError(null);
                                setStaffMessage('');
                                setActionModal({ type: 'WAITLIST', app });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-sky-600/90 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow inline-flex items-center gap-1"
                              title="Mover a lista de espera"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Waitlist</span>
                            </button>

                            <button
                              onClick={() => {
                                setActionError(null);
                                setStaffMessage('');
                                setActionModal({ type: 'REJECT', app });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow inline-flex items-center gap-1"
                              title="Rechazar solicitud"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazar</span>
                            </button>
                          </>
                        )}

                        {app.status === 'WAITLIST' && (
                          <button
                            onClick={() => {
                              setActionError(null);
                              setStaffMessage('');
                              setActionModal({ type: 'ACCEPT', app });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow inline-flex items-center gap-1"
                            title="Promover y Aceptar cupo"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aceptar Cupo</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Execution Modal (Accept / Reject / Waitlist) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-sky-500/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                actionModal.type === 'ACCEPT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                actionModal.type === 'WAITLIST' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {actionModal.type === 'ACCEPT' && <Check className="w-5 h-5" />}
                {actionModal.type === 'WAITLIST' && <Clock className="w-5 h-5" />}
                {actionModal.type === 'REJECT' && <X className="w-5 h-5" />}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {actionModal.type === 'ACCEPT' && 'Aceptar Solicitud de Participación'}
                  {actionModal.type === 'WAITLIST' && 'Mover Solicitud a Lista de Espera'}
                  {actionModal.type === 'REJECT' && 'No Aceptar Solicitud'}
                </h3>
                <span className="text-xs text-slate-400">
                  Voluntario: {actionModal.app.volunteer_name} ({actionModal.app.volunteer_code})
                </span>
              </div>
            </div>

            {/* Event Summary */}
            <div className="p-4 bg-[#050A14] rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Evento:</span>
                <span className="text-white font-semibold">{actionModal.app.event?.title}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fecha:</span>
                <span className="text-white font-semibold">{actionModal.app.event?.date}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cupos Disponibles:</span>
                <span className={
                  (actionModal.app.event?.available_spots || 0) > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                }>
                  {actionModal.app.event?.available_spots} restantes de {actionModal.app.event?.total_spots}
                </span>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Rejection Reason Selector */}
            {actionModal.type === 'REJECT' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Motivo principal:
                </label>
                <select
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="Cupos completos">Cupos completos</option>
                  <option value="No cumple requisitos de idioma o edad">No cumple requisitos de idioma o edad</option>
                  <option value="Disponibilidad u horario incompatible">Disponibilidad u horario incompatible</option>
                  <option value="Cancelado por solicitud del voluntario">Cancelado por solicitud del voluntario</option>
                  <option value="Otro motivo administrativo">Otro motivo administrativo</option>
                </select>
              </div>
            )}

            {/* Custom Message to Volunteer */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Mensaje o instrucciones para el voluntario (opcional):
              </label>
              <textarea
                value={staffMessage}
                onChange={e => setStaffMessage(e.target.value)}
                placeholder={
                  actionModal.type === 'ACCEPT'
                    ? 'Ej. Recuerda presentarte 10 minutos antes en la entrada principal...'
                    : actionModal.type === 'WAITLIST'
                    ? 'Ej. Tu solicitud está en prioridad 1 para cuando se libere un lugar...'
                    : 'Ej. Te invitamos a postularte a las siguientes oportunidades de este mes...'
                }
                className="w-full p-3 rounded-xl bg-[#050A14] border border-slate-800 text-white text-xs focus:outline-none focus:border-sky-500 resize-none h-24"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setActionModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                disabled={actionLoading}
                onClick={handleExecuteAction}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  actionModal.type === 'ACCEPT' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' :
                  actionModal.type === 'WAITLIST' ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/40' :
                  'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
                }`}
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirmar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail View Modal */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-sky-500/30 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  {selectedAppDetail.volunteer_code}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedAppDetail.volunteer_name}</h3>
                <p className="text-xs text-slate-400">
                  Escuela: {selectedAppDetail.school} • Idiomas: {selectedAppDetail.languages?.join(', ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#050A14] rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Detalles del Evento
                </span>
                <div className="text-white font-semibold">{selectedAppDetail.event?.title}</div>
                <div className="text-slate-400">Fecha: {selectedAppDetail.event?.date}</div>
                <div className="text-slate-400">Horario: {selectedAppDetail.event?.start_time} - {selectedAppDetail.event?.end_time}</div>
                <div className="text-slate-400">Ubicación: {selectedAppDetail.event?.location}</div>
                <div className="text-sky-400 font-bold">Horas: {formatMinutes(selectedAppDetail.event?.estimated_minutes)}</div>
              </div>

              <div className="p-4 bg-[#050A14] rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Estado de Solicitud
                </span>
                <div>{getStatusBadge(selectedAppDetail.status)}</div>
                <div className="text-slate-400">
                  Postulado el: {new Date(selectedAppDetail.applied_at).toLocaleString('es-ES')}
                </div>
                {selectedAppDetail.reviewed_by && (
                  <div className="text-slate-400">
                    Revisado por: <strong className="text-white">{selectedAppDetail.reviewed_by}</strong>
                  </div>
                )}
                {selectedAppDetail.rejection_reason && (
                  <div className="text-rose-400">
                    Motivo: {selectedAppDetail.rejection_reason}
                  </div>
                )}
              </div>
            </div>

            {selectedAppDetail.staff_message && (
              <div className="p-4 bg-blue-950/30 border border-sky-500/20 rounded-xl text-xs space-y-1">
                <strong className="text-sky-300 block">Mensaje de Staff Registrado:</strong>
                <p className="text-slate-200">"{selectedAppDetail.staff_message}"</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
