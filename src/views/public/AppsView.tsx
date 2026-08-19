import React from 'react';
import { ExternalLink, Layers, Info, Activity, ShieldCheck, HeartHandshake } from 'lucide-react';

interface AppsViewProps {
  onNavigate: (view: string) => void;
}

export const AppsView: React.FC<AppsViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Ecosistema Digital DMPS Connect</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Nuestras Plataformas & Herramientas
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Herramientas diseñadas para conectar información, familias, voluntarios y apoyo operativo en un solo ecosistema integrado y accesible.
        </p>
      </div>

      {/* Main Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* App 1: DMPS INFO */}
        <div className="bg-[#07111F]/90 border border-sky-500/25 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl hover:border-sky-500/50 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
                <Info className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                Portal Informativo
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white group-hover:text-sky-300 transition-colors">
                DMPS INFO
              </h2>
              <p className="text-xs text-sky-400/80 font-mono mt-0.5">
                info.familiasdmps.app
              </p>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Plataforma informativa para encontrar recursos, programas, guías prácticas e información útil para familias y estudiantes del distrito.
            </p>

            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Programas escolares y recursos familiares</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Guías de apoyo comunitario multilingüe</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Contenido actualizado para la comunidad</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80">
            <a
              id="open-dmps-info-btn"
              href="https://info.familiasdmps.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition-all"
            >
              <span>ABRIR DMPS INFO</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* App 2: DMPS STATUS */}
        <div className="bg-[#07111F]/90 border border-amber-500/25 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl hover:border-amber-500/50 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                HERRAMIENTA OPERATIVA
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white group-hover:text-amber-300 transition-colors">
                DMPS STATUS
              </h2>
              <p className="text-xs text-amber-400/80 font-mono mt-0.5">
                status.familiasdmps.app
              </p>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Herramienta separada e independiente utilizada para apoyar la operación y el monitoreo durante determinados eventos y actividades en terreno.
            </p>

            <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 leading-normal">
              <strong>Nota de operación:</strong> Esta aplicación funciona de manera autónoma como soporte logístico en vivo. No intercambia ni sincroniza automáticamente datos con el portal de horas.
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80">
            <a
              id="open-dmps-status-btn"
              href="https://status.familiasdmps.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold bg-amber-600/90 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/40 transition-all"
            >
              <span>ABRIR DMPS STATUS</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Volunteer Hub Card */}
      <div className="bg-gradient-to-r from-blue-950/40 via-[#07111F] to-sky-950/30 border border-sky-500/30 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              DMPS Connect Hub & Voluntariado
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Portal central para encontrar oportunidades de servicio comunitario, solicitar participación en eventos y certificar tus horas de forma oficial.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => onNavigate('public-events')}
            className="w-full md:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all text-center"
          >
            Ver Eventos
          </button>
          <button
            onClick={() => onNavigate('volunteer-info')}
            className="w-full md:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-center"
          >
            Cómo Funciona
          </button>
        </div>
      </div>
    </div>
  );
};
