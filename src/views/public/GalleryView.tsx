import React from 'react';
import { Image as ImageIcon, Calendar, Users, Heart, MapPin, Sparkles } from 'lucide-react';

interface GalleryViewProps {
  onNavigate: (view: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onNavigate }) => {
  const highlights = [
    {
      title: 'Feria de Recursos & Salud para Familias',
      date: 'Agosto 2026',
      location: 'Centro Lincoln',
      description: 'Más de 25 voluntarios brindando orientación bilingüe y facilitando el acceso a servicios comunitarios a cientos de familias.',
      volunteersCount: '28 voluntarios',
      category: 'Salud & Orientación',
      gradient: 'from-blue-600/30 to-sky-600/10',
    },
    {
      title: 'Taller de Conectividad & Portal Escolar',
      date: 'Julio 2026',
      location: 'Biblioteca East Side',
      description: 'Estudiantes voluntarios guiando a padres y abuelos en la instalación de aplicaciones escolares y consulta de boletines.',
      volunteersCount: '15 voluntarios',
      category: 'Alfabetización Digital',
      gradient: 'from-indigo-600/30 to-blue-600/10',
    },
    {
      title: 'Jornada Solidaria de Mochilas y Útiles',
      date: 'Junio 2026',
      location: 'Almacén Central',
      description: 'Clasificación y entrega de más de 600 paquetes de útiles escolares para el inicio de clases.',
      volunteersCount: '34 voluntarios',
      category: 'Logística & Entrega',
      gradient: 'from-sky-600/30 to-teal-600/10',
    },
    {
      title: 'Encuentro Bilingüe de Bienvenida Escolar',
      date: 'Mayo 2026',
      location: 'High School Auditorium',
      description: 'Traducción simultánea español-inglés en la sesión informativa para nuevos estudiantes del distrito.',
      volunteersCount: '18 voluntarios',
      category: 'Traducción & Enlace',
      gradient: 'from-blue-700/30 to-purple-600/10',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Comunidad en Acción</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Galería & Momentos de Impacto
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Un recorrido visual por las jornadas, talleres y actividades comunitarias impulsadas por nuestros voluntarios y familias.
        </p>
      </div>

      {/* Grid of highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {highlights.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#07111F]/90 border border-slate-800/90 hover:border-sky-500/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
          >
            {/* Visual Header Banner */}
            <div
              className={`h-40 bg-gradient-to-br ${item.gradient} p-6 flex flex-col justify-between border-b border-slate-800/80 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#050A14]/80 text-sky-300 px-2.5 py-1 rounded-lg border border-sky-500/30 backdrop-blur-sm">
                  {item.category}
                </span>
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 bg-[#050A14]/60 px-2.5 py-0.5 rounded-md">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  {item.date}
                </span>
              </div>

              <div className="flex items-center gap-2 text-white text-xs font-semibold relative z-10">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>{item.location}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{item.volunteersCount}</span>
                </div>
                <span className="text-[11px] text-slate-500">DMPS Connect Hub</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div className="bg-[#07111F]/80 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
        <h3 className="text-xl font-bold text-white">¿Quieres ser parte del próximo evento?</h3>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Explora los eventos abiertos y envía tu solicitud en segundos.
        </p>
        <button
          onClick={() => onNavigate('public-events')}
          className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all"
        >
          Ver Eventos Abiertos
        </button>
      </div>
    </div>
  );
};
