import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  Hourglass,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Building,
  ChevronRight,
  Info,
} from 'lucide-react';
import { api, formatMinutes } from '../../services/api';
import { EventApplication, ApplicationStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface MyApplicationsViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const MyApplicationsView: React.FC<MyApplicationsViewProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<EventApplication | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appToCancel, setAppToCancel] = useState<EventApplication | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getMyApplications();
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!appToCancel) return;
    setCancelling(true);
    try {
      await api.cancelApplication(appToCancel.id, cancelReason);
      // Automatically remove from list if cancelled or deleted so it doesn't linger
      setApplications(prev => prev.filter(a => a.id !== appToCancel.id));
      setShowCancelModal(false);
      setAppToCancel(null);
      setCancelReason('');
      if (selectedApp?.id === appToCancel.id) {
        setSelectedApp(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error al cancelar la solicitud.');
    } finally {
      setCancelling(false);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('¿Deseas eliminar esta solicitud de tu lista?')) return;
    try {
      await api.deleteApplication(id);
      setApplications(prev => prev.filter(a => a.id !== id));
      if (selectedApp?.id === id) {
        setSelectedApp(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la solicitud.');
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Aceptada</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Hourglass className="w-3.5 h-3.5 animate-pulse" />
            <span>Pendiente de Revisión</span>
          </span>
        );
      case 'WAITLIST':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>En Lista de Espera</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            <span>No Aceptada</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-700/60 text-slate-400 border border-slate-600">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Cancelada</span>
          </span>
        );
      default:
        return null;
    }
  };

  const filteredApps = applications.filter(app => {
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'ACTIVE' && (app.status === 'PENDING' || app.status === 'WAITLIST')) return true;
      if (app.status !== filterStatus) return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const title = app.event?.title?.toLowerCase() || '';
      const location = app.event?.location?.toLowerCase() || '';
      const code = app.event?.code?.toLowerCase() || '';
      return title.includes(q) || location.includes(q) || code.includes(q);
    }
    return true;
  });

  const countPending = applications.filter(a => a.status === 'PENDING').length;
  const countAccepted = applications.filter(a => a.status === 'ACCEPTED').length;
  const countWaitlist = applications.filter(a => a.status === 'WAITLIST').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mis Solicitudes de Eventos
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Revisa el estado de tus postulaciones a oportunidades comunitarias en DMPS Connect.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('events')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2"
          >
            <span>Explorar Eventos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary metric pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'ALL'
              ? 'bg-blue-950/40 border-blue-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block">Todas</span>
          <span className="text-xl sm:text-2xl font-black text-white">{applications.length}</span>
        </button>

        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'PENDING'
              ? 'bg-amber-950/40 border-amber-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-amber-400">
            Pendientes
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{countPending}</span>
        </button>

        <button
          onClick={() => setFilterStatus('ACCEPTED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'ACCEPTED'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-emerald-400">
            Aceptadas
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{countAccepted}</span>
        </button>

        <button
          onClick={() => setFilterStatus('WAITLIST')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterStatus === 'WAITLIST'
              ? 'bg-sky-950/40 border-sky-500/50 text-white'
              : 'bg-[#07111F] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block text-sky-400">
            Lista de Espera
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{countWaitlist}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de evento, código o ubicación..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'ACCEPTED', 'WAITLIST', 'REJECTED', 'CANCELLED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                filterStatus === st
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-[#07111F] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Todas' :
               st === 'PENDING' ? 'Pendientes' :
               st === 'ACCEPTED' ? 'Aceptadas' :
               st === 'WAITLIST' ? 'Lista de Espera' :
               st === 'REJECTED' ? 'No Aceptadas' : 'Canceladas'}
            </button>
          ))}
        </div>
      </div>

      {/* Application List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Cargando tus solicitudes...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-[#07111F] rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-sky-400 flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No hay solicitudes en esta sección</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Explora las oportunidades de voluntariado disponibles en Des Moines y postúlate para sumar horas certificadas.
            </p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg inline-flex items-center gap-1.5"
          >
            <span>Ver Oportunidades Abiertas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map(app => {
            const event = app.event;
            return (
              <div
                key={app.id}
                className="p-5 sm:p-6 bg-[#07111F] border border-slate-800/90 hover:border-slate-700 rounded-2xl shadow-xl flex flex-col justify-between transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        {event?.code || 'REG-EVT'}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-1">
                        {event?.title || 'Evento Comunitario'}
                      </h3>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{event?.date} ({event?.start_time} - {event?.end_time})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{event?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Horas estimadas: <strong>{formatMinutes(event?.estimated_minutes)}</strong></span>
                    </div>
                  </div>

                  {app.staff_message && (
                    <div className="p-3 bg-[#050A14] rounded-xl border border-slate-800 text-xs text-slate-300">
                      <strong className="text-sky-300 block mb-0.5">Mensaje de Staff:</strong>
                      "{app.staff_message}"
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Enviada el {new Date(app.applied_at).toLocaleDateString('es-ES')}
                  </span>

                  <div className="flex items-center gap-2">
                    {app.status === 'ACCEPTED' ? (
                      <button
                        onClick={() => onNavigate('my-events')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <span>Ver en Mis Eventos</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        <span>Detalles</span>
                      </button>
                    )}

                    {['PENDING', 'WAITLIST', 'ACCEPTED'].includes(app.status) && (
                      <button
                        onClick={() => {
                          setAppToCancel(app);
                          setShowCancelModal(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Cancelar y eliminar solicitud"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {['CANCELLED', 'REJECTED'].includes(app.status) && (
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1"
                        title="Eliminar de mi lista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Detail Timeline Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-sky-500/30 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  {selectedApp.event?.code}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedApp.event?.title}</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Timeline Visual */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Seguimiento de la Solicitud
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#07111F] flex items-center justify-center" />
                  <div>
                    <strong className="text-xs font-bold text-white block">1. Solicitud Enviada</strong>
                    <span className="text-[11px] text-slate-400">
                      Fecha: {new Date(selectedApp.applied_at).toLocaleString('es-ES')}
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-[#07111F] flex items-center justify-center ${
                    selectedApp.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <strong className="text-xs font-bold text-white block">2. Revisión de Staff</strong>
                    <span className="text-[11px] text-slate-400">
                      {selectedApp.status === 'PENDING'
                        ? 'En espera de revisión por el equipo organizador'
                        : `Revisado ${selectedApp.reviewed_by ? `por ${selectedApp.reviewed_by}` : ''}`}
                    </span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-[#07111F] flex items-center justify-center ${
                    selectedApp.status === 'ACCEPTED' ? 'bg-emerald-500' :
                    selectedApp.status === 'WAITLIST' ? 'bg-sky-500' :
                    selectedApp.status === 'REJECTED' ? 'bg-rose-500' :
                    selectedApp.status === 'CANCELLED' ? 'bg-slate-600' : 'bg-slate-800'
                  }`} />
                  <div>
                    <strong className="text-xs font-bold text-white block">
                      3. Resolución Final:{' '}
                      <span className={
                        selectedApp.status === 'ACCEPTED' ? 'text-emerald-400' :
                        selectedApp.status === 'WAITLIST' ? 'text-sky-400' :
                        selectedApp.status === 'REJECTED' ? 'text-rose-400' : 'text-slate-400'
                      }>
                        {selectedApp.status === 'ACCEPTED' ? 'Aceptada' :
                         selectedApp.status === 'WAITLIST' ? 'En Lista de Espera' :
                         selectedApp.status === 'REJECTED' ? 'No Aceptada' :
                         selectedApp.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
                      </span>
                    </strong>
                    {selectedApp.staff_message && (
                      <p className="text-xs text-slate-300 mt-1 p-2 bg-[#050A14] rounded-lg border border-slate-800">
                        "{selectedApp.staff_message}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && appToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">¿Cancelar esta Solicitud?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de cancelar tu postulación al evento{' '}
              <strong className="text-white">"{appToCancel.event?.title}"</strong>?
              {appToCancel.status === 'ACCEPTED' && ' Al cancelar, tu cupo quedará disponible para otro voluntario en lista de espera.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 block">
                Motivo de cancelación (opcional):
              </label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Ej. Conflicto de horario escolar, transporte..."
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white text-xs focus:outline-none focus:border-rose-500 resize-none h-20"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={cancelling}
                onClick={() => {
                  setShowCancelModal(false);
                  setAppToCancel(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Volver
              </button>
              <button
                disabled={cancelling}
                onClick={handleCancelApplication}
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
