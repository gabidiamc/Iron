import React, { useState, useEffect } from 'react';
import { api, formatMinutes } from '../../services/api';
import { VolunteerProfile, HourSubmission } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Users,
  Search,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Award,
  Clock,
  Eye,
  X,
  FileCheck,
  ChevronRight,
  Shield,
  FileDown,
} from 'lucide-react';

export const StaffVolunteersView: React.FC = () => {
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected Volunteer Modal
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerProfile | null>(null);
  const [volunteerSubmissions, setVolunteerSubmissions] = useState<HourSubmission[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await api.getVolunteers(searchQuery);
      setVolunteers(data.volunteers);
    } catch (err) {
      console.error('Error fetching volunteers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [searchQuery]);

  const handleOpenVolunteer = async (vol: VolunteerProfile) => {
    setSelectedVolunteer(vol);
    try {
      setModalLoading(true);
      const res = await api.getVolunteerProfile(vol.user_id);
      setSelectedVolunteer(res.profile);
      setVolunteerSubmissions(res.submissions || []);
    } catch (err) {
      console.error('Error fetching volunteer details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Directorio de Voluntarios
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1677FF]/20 text-[#258BFF] text-xs font-bold font-mono">
              {volunteers.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consulta los registros individuales y horas acumuladas de cada estudiante
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#07111F] border border-[#16263D] rounded-2xl p-3 sm:p-4 flex items-center shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, ID de voluntario (VOL-...), correo o escuela..."
            className="w-full pl-10 pr-4 py-2 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Volunteers Table / Cards */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : volunteers.length === 0 ? (
        <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-12 text-center text-slate-400 shadow-xl">
          <Users size={48} className="mx-auto mb-3 opacity-25 text-slate-500" />
          <h3 className="text-base font-bold text-slate-200">
            No se encontraron voluntarios
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'Prueba con otro término de búsqueda.' : 'Aún no hay voluntarios registrados en el sistema.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volunteers.map((vol) => (
            <div
              key={vol.id}
              onClick={() => handleOpenVolunteer(vol)}
              className="bg-[#07111F] border border-[#16263D] hover:border-[#1677FF]/50 rounded-2xl p-5 transition-all shadow-md cursor-pointer hover:shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1677FF] to-[#258BFF] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#1677FF]/20">
                      {vol.first_name[0]}{vol.last_name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#258BFF] transition-colors truncate max-w-[150px]">
                        {vol.first_name} {vol.last_name}
                      </h3>
                      <span className="font-mono text-[11px] font-bold text-[#258BFF] bg-[#1677FF]/15 px-2 py-0.5 rounded border border-[#1677FF]/20">
                        {vol.volunteer_id}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                  <p className="flex items-center gap-1.5 truncate">
                    <GraduationCap size={13} className="text-slate-500 shrink-0" />
                    <span className="truncate">{vol.school || 'Sin escuela asignada'}</span>
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail size={13} className="text-slate-500 shrink-0" />
                    <span className="truncate">{vol.email}</span>
                  </p>
                </div>
              </div>

              {/* Stats footer */}
              <div className="pt-3 border-t border-[#16263D] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Aprobadas</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {formatMinutes(vol.approved_minutes || 0)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Registros</span>
                  <span className="text-xs font-semibold text-slate-300 font-mono">
                    {vol.total_submissions || 0} envíos
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Volunteer Detail Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-[#16263D] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#16263D] bg-[#0B192E]/70 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#258BFF] flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {selectedVolunteer.first_name[0]}{selectedVolunteer.last_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">
                      {selectedVolunteer.first_name} {selectedVolunteer.last_name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1677FF]/20 text-[#258BFF] font-mono text-xs font-bold border border-[#1677FF]/30">
                      {selectedVolunteer.volunteer_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedVolunteer.school} {selectedVolunteer.grade ? `• ${selectedVolunteer.grade}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#0B192E] rounded-2xl border border-[#16263D]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Horas Aprobadas</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                    {formatMinutes(selectedVolunteer.approved_minutes || 0)}
                  </span>
                </div>
                <div className="p-3.5 bg-[#0B192E] rounded-2xl border border-[#16263D]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Horas Pendientes</span>
                  <span className="text-lg font-bold text-amber-400 font-mono mt-0.5 block">
                    {formatMinutes(selectedVolunteer.pending_minutes || 0)}
                  </span>
                </div>
                <div className="p-3.5 bg-[#0B192E] rounded-2xl border border-[#16263D]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Solicitudes</span>
                  <span className="text-lg font-bold text-white font-mono mt-0.5 block">
                    {selectedVolunteer.total_submissions || volunteerSubmissions.length}
                  </span>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0B192E]/40 p-4 rounded-2xl border border-[#16263D]">
                <div>
                  <span className="text-slate-400">Correo Electrónico:</span>
                  <p className="font-semibold text-white mt-0.5">{selectedVolunteer.email}</p>
                </div>
                <div>
                  <span className="text-slate-400">Teléfono:</span>
                  <p className="font-semibold text-white mt-0.5">{selectedVolunteer.phone || 'No registrado'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Organización o Club:</span>
                  <p className="font-semibold text-white mt-0.5">{selectedVolunteer.organization || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Idiomas:</span>
                  <p className="font-semibold text-white mt-0.5">
                    {selectedVolunteer.languages?.join(', ') || 'Español'}
                  </p>
                </div>
              </div>

              {/* Individual Submissions History for this volunteer */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">
                  Historial de Registros de este Voluntario ({volunteerSubmissions.length})
                </h3>

                {modalLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : volunteerSubmissions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    Este voluntario aún no ha registrado horas.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {volunteerSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 bg-[#0B192E] rounded-xl border border-[#16263D] flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">{sub.activity_name}</span>
                            <StatusBadge status={sub.status} size="sm" />
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {sub.date} • {sub.organization_name}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-200 shrink-0 ml-3">
                          {formatMinutes(sub.approved_minutes || sub.submitted_minutes)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#16263D] bg-[#0B192E]/60 flex items-center justify-end">
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
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
