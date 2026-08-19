import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe2,
  Building,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { api, formatMinutes } from '../../services/api';
import { EventItem, EventStatus } from '../../types';
import { StaffEventModal } from './StaffEventModal';
import { useAuth } from '../../context/AuthContext';

interface StaffEventsViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const StaffEventsView: React.FC<StaffEventsViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<EventItem | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getAllEventsStaff(true);
      setEvents(res.events || []);
    } catch (err) {
      console.error('Error loading staff events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.publishEvent(id);
      loadEvents();
    } catch (err: any) {
      alert(err.message || 'Error al publicar evento.');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await api.closeEvent(id);
      loadEvents();
    } catch (err: any) {
      alert(err.message || 'Error al cerrar convocatoria.');
    }
  };

  const handleCancelEventSubmit = async () => {
    if (!eventToCancel) return;
    setCancelling(true);
    try {
      await api.cancelEvent(eventToCancel.id, cancelReason);
      setShowCancelModal(false);
      setEventToCancel(null);
      setCancelReason('');
      loadEvents();
    } catch (err: any) {
      alert(err.message || 'Error al cancelar el evento.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: EventStatus, availableSpots?: number) => {
    if (status === 'DRAFT') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700/60 text-slate-300 border border-slate-600">
          Borrador
        </span>
      );
    }
    if (status === 'CLOSED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Cerrado
        </span>
      );
    }
    if (status === 'CANCELLED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          Cancelado
        </span>
      );
    }

    if (availableSpots !== undefined && availableSpots <= 0) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          Cupos Llenos
        </span>
      );
    }

    if (availableSpots !== undefined && availableSpots <= 3) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Últimos Cupos
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        Abierto
      </span>
    );
  };

  const filteredEvents = events.filter(e => {
    if (filterStatus !== 'ALL' && e.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countTotal = events.length;
  const countOpen = events.filter(e => e.status === 'OPEN').length;
  const countDraft = events.filter(e => e.status === 'DRAFT').length;
  const countClosed = events.filter(e => e.status === 'CLOSED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gestión de Eventos Comunitarios
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-sky-300 border border-blue-500/30">
              Staff Portal
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Crea, publica, edita y supervisa los cupos disponibles y solicitudes de participación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('staff-applications')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>Ver Solicitudes</span>
          </button>

          <button
            onClick={() => {
              setEventToEdit(null);
              setShowEventModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Evento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'ALL'
              ? 'bg-blue-950/40 border-blue-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block">Total Eventos</span>
          <span className="text-xl sm:text-2xl font-black text-white">{countTotal}</span>
        </button>

        <button
          onClick={() => setFilterStatus('OPEN')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'OPEN'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-emerald-400">
            Abiertos / Activos
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{countOpen}</span>
        </button>

        <button
          onClick={() => setFilterStatus('DRAFT')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'DRAFT'
              ? 'bg-slate-800 border-slate-600 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-300">
            Borradores
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{countDraft}</span>
        </button>

        <button
          onClick={() => setFilterStatus('CLOSED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'CLOSED'
              ? 'bg-amber-950/40 border-amber-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-amber-400">
            Cerrados / Pasados
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{countClosed}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar evento por título, código, organizador o sede..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadEvents()}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
            title="Refrescar lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Cargando eventos...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-[#07111F] rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-sky-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No se encontraron eventos</h3>
            <p className="text-xs text-slate-400">
              No hay eventos que coincidan con los criterios seleccionados.
            </p>
          </div>
          <button
            onClick={() => {
              setEventToEdit(null);
              setShowEventModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primer Evento</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#07111F] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#050A14] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Código & Título</th>
                  <th className="py-3.5 px-4 font-bold">Fecha / Horas</th>
                  <th className="py-3.5 px-4 font-bold">Sede / Organizador</th>
                  <th className="py-3.5 px-4 font-bold text-center">Cupos Ocupados</th>
                  <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredEvents.map(evt => {
                  const availableSpots = evt.available_spots !== undefined ? evt.available_spots : evt.total_spots;
                  const acceptedCount = evt.accepted_count !== undefined ? evt.accepted_count : (evt.total_spots - availableSpots);
                  const occupancyPct = Math.min(100, Math.round((acceptedCount / evt.total_spots) * 100));

                  return (
                    <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Title & Code */}
                      <td className="py-4 px-4 space-y-1">
                        <span className="font-mono text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 font-semibold">
                          {evt.code}
                        </span>
                        <div className="font-bold text-white text-sm line-clamp-1 max-w-[240px]">
                          {evt.title}
                        </div>
                      </td>

                      {/* Date & Hours */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-white font-medium">
                          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{evt.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>
                            {evt.start_time} - {evt.end_time} ({formatMinutes(evt.estimated_minutes)})
                          </span>
                        </div>
                      </td>

                      {/* Location & Organizer */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="text-slate-300 truncate max-w-[180px] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{evt.organizer}</span>
                        </div>
                      </td>

                      {/* Cupos Gauge */}
                      <td className="py-4 px-4 text-center space-y-1.5">
                        <div className="flex items-center justify-center gap-1.5 font-bold">
                          <span className="text-white">{acceptedCount}</span>
                          <span className="text-slate-500">/</span>
                          <span className="text-slate-400">{evt.total_spots}</span>
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            ({availableSpots} disp.)
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                          <div
                            className={`h-full ${
                              occupancyPct >= 100 ? 'bg-rose-500' : occupancyPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${occupancyPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(evt.status, availableSpots)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-1">
                        <button
                          onClick={() => onNavigate('staff-applications', { initialEventId: evt.id })}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 transition-all text-xs font-bold inline-flex items-center gap-1"
                          title="Gestionar solicitudes de este evento"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Solicitudes</span>
                        </button>

                        <button
                          onClick={() => onNavigate('event-detail', { eventId: evt.id })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                          title="Ver ficha pública"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setEventToEdit(evt);
                            setShowEventModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
                          title="Editar evento"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        </button>

                        {evt.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePublish(evt.id)}
                            className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
                            title="Publicar evento"
                          >
                            Publicar
                          </button>
                        )}

                        {evt.status === 'OPEN' && (
                          <button
                            onClick={() => handleClose(evt.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-all"
                            title="Cerrar inscripciones"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {evt.status !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              setEventToCancel(evt);
                              setShowCancelModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Cancelar evento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Staff Event Create / Edit Modal */}
      {showEventModal && (
        <StaffEventModal
          eventToEdit={eventToEdit}
          onClose={() => {
            setShowEventModal(false);
            setEventToEdit(null);
          }}
          onSuccess={() => {
            setShowEventModal(false);
            setEventToEdit(null);
            loadEvents();
          }}
        />
      )}

      {/* Cancel Event Modal */}
      {showCancelModal && eventToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">¿Cancelar este Evento?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Estás a punto de cancelar el evento <strong className="text-white">"{eventToCancel.title}"</strong>. Se notificará a todos los voluntarios inscritos y no se admitirán nuevas solicitudes.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 block">
                Motivo de cancelación (se incluirá en la notificación):
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Ej. Condiciones climáticas adversas, reprogramación de fecha..."
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
                onClick={handleCancelEventSubmit}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5"
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
