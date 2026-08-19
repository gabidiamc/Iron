import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Globe2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { api, formatMinutes } from '../../services/api';
import { EventItem, EventStatus } from '../../types';

interface PublicEventsViewProps {
  onNavigate: (view: string) => void;
  onSelectEvent: (eventId: string) => void;
}

export const PublicEventsView: React.FC<PublicEventsViewProps> = ({
  onNavigate,
  onSelectEvent,
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadEvents();
  }, [statusFilter]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getPublicEvents({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search ? search : undefined,
      });
      setEvents(res.events || []);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  const getStatusBadge = (status: EventStatus, availableSpots: number) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Abierto
          </span>
        );
      case 'FEW_SPOTS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Pocos Cupos ({availableSpots})
          </span>
        );
      case 'FULL':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Completo
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            Cerrado
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Finalizado
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
            {status}
          </span>
        );
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
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Oportunidades de Voluntariado</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Eventos Comunitarios
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Explora todas las oportunidades de servicio disponibles. No necesitas iniciar sesión para consultar los eventos y requisitos.
          </p>
        </div>

        <button
          onClick={() => onNavigate('volunteer-info')}
          className="self-start md:self-auto text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 bg-slate-800/60 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 transition-all"
        >
          <span>¿Cómo participar?</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#07111F]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-3.5 items-center justify-between shadow-lg">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-events-input"
            type="text"
            placeholder="Buscar por título, lugar u organizador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#050A14] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
        </form>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'OPEN', label: 'Abiertos' },
            { id: 'FEW_SPOTS', label: 'Pocos Cupos' },
            { id: 'FULL', label: 'Completos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[#07111F]/60 border border-slate-800 rounded-2xl p-6 h-72 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-6 bg-slate-800 rounded w-3/4" />
              <div className="h-16 bg-slate-800/50 rounded" />
              <div className="h-8 bg-slate-800 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[#07111F]/80 border border-slate-800/80 rounded-2xl p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">
            No se encontraron eventos disponibles
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            {search || statusFilter !== 'ALL'
              ? 'Prueba modificando tus filtros o término de búsqueda.'
              : 'Actualmente no hay eventos públicos programados. Vuelve a consultar pronto.'}
          </p>
          {(search || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-all"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-[#07111F]/90 border border-slate-800/90 hover:border-sky-500/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-blue-950/20 transition-all group"
            >
              <div className="space-y-4">
                {/* Status & Code */}
                <div className="flex items-center justify-between gap-2">
                  {getStatusBadge(evt.status, evt.available_spots)}
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60">
                    {evt.code}
                  </span>
                </div>

                {/* Title & Short Description */}
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                    {evt.title}
                  </h3>
                  <p className="text-slate-300 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {evt.short_description}
                  </p>
                </div>

                {/* Event Details Meta */}
                <div className="space-y-2 pt-2 text-xs text-slate-300 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="capitalize">{formatDateSpanish(evt.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>
                      {evt.start_time} - {evt.end_time} ({formatMinutes(evt.estimated_minutes)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>
                      {evt.available_spots} cupos disponibles de {evt.total_spots}
                    </span>
                  </div>
                </div>

                {/* Languages / Requirements Pills */}
                {evt.languages && evt.languages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {evt.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                      >
                        {lang}
                      </span>
                    ))}
                    {evt.min_age && (
                      <span className="text-[10px] bg-blue-950/60 text-sky-300 px-2 py-0.5 rounded-md border border-sky-500/20">
                        Min. {evt.min_age} años
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-800/80">
                <button
                  id={`btn-view-event-${evt.id}`}
                  onClick={() => onSelectEvent(evt.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-blue-950/40 transition-all active:scale-98"
                >
                  <span>VER EVENTO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
