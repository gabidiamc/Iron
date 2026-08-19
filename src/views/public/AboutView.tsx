import React from 'react';
import {
  Users,
  Compass,
  Eye,
  CheckCircle2,
  ShieldAlert,
  Heart,
  Sparkles,
  Award,
  Globe2,
  Handshake,
} from 'lucide-react';

interface AboutViewProps {
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const values = [
    {
      title: 'Comunidad',
      desc: 'El corazón de nuestro trabajo es unir a familias, estudiantes y aliados en un espacio de apoyo mutuo y crecimiento.',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-600/20',
    },
    {
      title: 'Accesibilidad',
      desc: 'Diseñamos herramientas claras, multilingües y fáciles de usar desde cualquier teléfono o dispositivo.',
      icon: Globe2,
      color: 'text-sky-400',
      bg: 'bg-sky-600/20',
    },
    {
      title: 'Colaboración',
      desc: 'Sumamos esfuerzos con escuelas, organizaciones cívicas y líderes comunitarios para maximizar el impacto social.',
      icon: Handshake,
      color: 'text-emerald-400',
      bg: 'bg-emerald-600/20',
    },
    {
      title: 'Innovación',
      desc: 'Aprovechamos la tecnología moderna para simplificar procesos complejos de voluntariado y gestión de horas.',
      icon: Sparkles,
      color: 'text-amber-400',
      bg: 'bg-amber-600/20',
    },
    {
      title: 'Servicio',
      desc: 'Fomentamos el voluntariado con propósito, transparencia y reconocimiento del tiempo dedicado por cada voluntario.',
      icon: Heart,
      color: 'text-rose-400',
      bg: 'bg-rose-600/20',
    },
    {
      title: 'Confianza',
      desc: 'Mantenemos un sistema transparente y verificado donde cada hora cuenta y cada certificado tiene validez real.',
      icon: Award,
      color: 'text-indigo-400',
      bg: 'bg-indigo-600/20',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest bg-sky-500/10 text-sky-300 border border-sky-500/20 px-3 py-1 rounded-full">
          Nuestra Identidad
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Sobre DMPS Connect
        </h1>
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
          Un espacio creado para conectar recursos, oportunidades, herramientas y personas en un mismo lugar.
        </p>
      </div>

      {/* Quiénes Somos */}
      <div className="bg-[#07111F]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-xl space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2.5 h-6 rounded-full bg-blue-500" />
          Quiénes Somos
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          DMPS Connect es una iniciativa comunitaria dedicada a fortalecer los canales de comunicación, participación ciudadana y voluntariado para estudiantes y familias. Nacemos de la necesidad de contar con un punto de encuentro centralizado donde cualquier persona pueda informarse sobre programas escolares, participar en eventos comunitarios y certificar sus horas de servicio de manera organizada y moderna.
        </p>
      </div>

      {/* Misión y Visión (Grid de 2 columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#07111F]/90 border border-sky-500/20 rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Nuestra Misión</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Conectar a estudiantes, familias y organizaciones comunitarias con herramientas accesibles y oportunidades significativas de voluntariado, facilitando el acceso a la información y reconociendo el impacto del servicio en nuestra comunidad.
          </p>
        </div>

        <div className="bg-[#07111F]/90 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Nuestra Visión</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Consolidarnos como el centro de enlace de referencia donde la participación cívica, la tecnología accesible y la colaboración escolar se integren para empoderar a cada familia y voluntario.
          </p>
        </div>
      </div>

      {/* Qué Hacemos */}
      <div className="bg-[#07111F]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-10 space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="w-2.5 h-6 rounded-full bg-sky-500" />
          Qué Hacemos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Difusión de Oportunidades:</strong>
              Publicamos eventos y proyectos donde los estudiantes pueden servir como voluntarios activos.
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Certificación de Horas:</strong>
              Proporcionamos un sistema de verificación oficial con cálculo exacto en minutos y certificados descargables.
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Central de Recursos:</strong>
              Conectamos a las familias con guías bilingües, directorios de ayuda y soporte institucional a través de DMPS Info.
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/40 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Apoyo Operativo:</strong>
              Brindamos herramientas especializadas para coordinadores y líderes en el terreno.
            </div>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Nuestros Valores</h2>
          <p className="text-slate-400 text-sm mt-1">
            Principios éticos que guían cada línea de código y cada evento comunitario.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v, idx) => {
            const Icon = v.icon;
            return (
              <div
                key={idx}
                className="bg-[#07111F]/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-3 hover:border-slate-700 transition-all shadow-md"
              >
                <div className={`w-10 h-10 rounded-xl ${v.bg} flex items-center justify-center ${v.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{v.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aviso de Proyecto Independiente */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 sm:p-6 flex items-start gap-4 text-xs text-slate-300 leading-relaxed">
        <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-semibold block text-sm mb-1">
            Aviso de Proyecto Independiente
          </strong>
          DMPS Connect es una plataforma comunitaria y tecnológica creada de forma independiente para apoyar a estudiantes y familias en la búsqueda de recursos y certificación de voluntariado. Los nombres de programas y enlaces de referencia son propiedad de sus respectivas organizaciones.
        </div>
      </div>
    </div>
  );
};
