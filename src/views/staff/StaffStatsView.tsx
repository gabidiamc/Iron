import React, { useState, useEffect } from 'react';
import { api, formatMinutes } from '../../services/api';
import { SystemStats } from '../../types';
import {
  BarChart3,
  Award,
  GraduationCap,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building,
} from 'lucide-react';

export const StaffStatsView: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSystemStats().then((res) => {
      setStats(res.stats);
      setLoading(false);
    }).catch((err) => {
      console.error('Error fetching stats:', err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const schoolStats = stats?.school_stats || [];
  const topVolunteers = stats?.top_volunteers || [];
  const monthlyBreakdown = stats?.monthly_breakdown || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Estadísticas & Reportes de Impacto
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Análisis del servicio comunitario acumulado en el portal
        </p>
      </div>

      {/* Global Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#07111F] border border-[#16263D] rounded-2xl p-5 shadow-lg">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Aprobadas</span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">
            {formatMinutes(stats?.total_approved_minutes || 0)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Horas certificadas</span>
        </div>

        <div className="bg-[#07111F] border border-[#16263D] rounded-2xl p-5 shadow-lg">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Voluntarios</span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#258BFF] font-mono mt-1 block">
            {stats?.total_volunteers || 0}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Comunidad activa</span>
        </div>

        <div className="bg-[#07111F] border border-[#16263D] rounded-2xl p-5 shadow-lg">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Envíos</span>
          <span className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-1 block">
            {stats?.total_submissions || 0}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Registros históricos</span>
        </div>

        <div className="bg-[#07111F] border border-[#16263D] rounded-2xl p-5 shadow-lg">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Tasa de Aprobación</span>
          <span className="text-xl sm:text-2xl font-extrabold text-purple-400 font-mono mt-1 block">
            {stats?.total_submissions
              ? Math.round(((stats.approved_submissions || 0) / stats.total_submissions) * 100)
              : 100}
            %
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Validaciones exitosas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Volunteers Ranking */}
        <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#16263D] pb-3">
            <Award size={20} className="text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Cuadro de Honor - Voluntarios Destacados
            </h2>
          </div>

          {topVolunteers.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aún no hay suficientes registros aprobados.
            </p>
          ) : (
            <div className="space-y-3">
              {topVolunteers.map((vol, idx) => (
                <div
                  key={vol.volunteer_id}
                  className="p-3.5 bg-[#0B192E] border border-[#16263D] rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : idx === 1
                          ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{vol.name}</h4>
                      <span className="text-[11px] text-slate-400">{vol.school}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 font-mono block">
                      {formatMinutes(vol.minutes)}
                    </span>
                    <span className="text-[10px] text-slate-500">{vol.submissions} actividades</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hours by School */}
        <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#16263D] pb-3">
            <GraduationCap size={20} className="text-[#258BFF]" />
            <h2 className="text-base font-bold text-white">
              Distribución por Escuela / Institución
            </h2>
          </div>

          {schoolStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No hay datos registrados por escuela.
            </p>
          ) : (
            <div className="space-y-3">
              {schoolStats.map((school) => {
                const maxSchoolMin = Math.max(...schoolStats.map((s) => s.minutes), 1);
                const percent = Math.round((school.minutes / maxSchoolMin) * 100);

                return (
                  <div key={school.school} className="p-3.5 bg-[#0B192E] border border-[#16263D] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{school.school}</span>
                      <span className="font-mono font-bold text-[#258BFF]">
                        {formatMinutes(school.minutes)} ({school.volunteers_count} vol.)
                      </span>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full bg-[#07111F] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#1677FF] to-[#258BFF] h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
