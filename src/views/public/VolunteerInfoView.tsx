import React from 'react';
import {
  HeartHandshake,
  UserPlus,
  CalendarCheck,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Globe2,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface VolunteerInfoViewProps {
  onNavigate: (view: string) => void;
}

export const VolunteerInfoView: React.FC<VolunteerInfoViewProps> = ({ onNavigate }) => {
  const steps = [
    {
      step: '01',
      title: 'Crea tu Cuenta de Voluntario',
      desc: 'Regístrate en menos de 2 minutos. Se te asignará un Volunteer ID permanente (VOL-XXXXX) para gestionar todo tu historial.',
      icon: UserPlus,
    },
    {
      step: '02',
      title: 'Explora y Postula a Eventos',
      desc: 'Revisa las oportunidades abiertas en el Hub Comunitario y envía tu solicitud con un solo clic.',
      icon: CalendarCheck,
    },
    {
      step: '03',
      title: 'Participa y Brinda tu Servicio',
      desc: 'Asiste puntualmente al evento, colabora con el equipo organizador y apoya a las familias y estudiantes.',
      icon: HeartHandshake,
    },
    {
      step: '04',
      title: 'Registra y Certifica tus Horas',
      desc: 'Ingresa los minutos de servicio con tu comprobante. Nuestro Staff revisará y emitirá tu acreditación oficial.',
      icon: Award,
    },
  ];

  const categories = [
    {
      title: 'Traducción & Enlace Bilingüe',
      desc: 'Apoyo a familias hispanohablantes en ferias, reuniones escolares y jornadas de registro.',
      icon: Globe2,
    },
    {
      title: 'Apoyo Digital & Tecnológico',
      desc: 'Asistencia individual en el uso de plataformas educativas, computadoras y aplicaciones móviles.',
      icon: Sparkles,
    },
    {
      title: 'Logística de Eventos & Alimentos',
      desc: 'Recepción, empaque de útiles, clasificación de despensas y orientación general a asistentes.',
      icon: Clock,
    },
    {
      title: 'Acompañamiento & Guía Familiar',
      desc: 'Orientación en eventos masivos y coordinación de stands comunitarios informativos.',
      icon: BookOpen,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Programa de Voluntariado DMPS Connect</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Haz la Diferencia en tu Comunidad
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Suma tus habilidades para apoyar a estudiantes y familias, desarrolla experiencia cívica y obtén certificaciones oficiales de horas para tus metas académicas.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('register')}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-xl shadow-blue-900/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Crear Cuenta Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('public-events')}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            Ver Oportunidades Abiertas
          </button>
        </div>
      </div>

      {/* 4 Steps Section */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Cómo Funciona el Proceso
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Un flujo transparente, ágil y 100% verificado en cada etapa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-[#07111F]/90 border border-slate-800/90 rounded-2xl p-6 relative flex flex-col justify-between shadow-xl space-y-4 hover:border-sky-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-700 font-mono">
                    {s.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Types of Volunteering */}
      <div className="bg-[#07111F]/90 border border-slate-800/90 rounded-2xl p-6 sm:p-10 space-y-8 shadow-xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-2.5 h-6 rounded-full bg-blue-500" />
            Áreas de Impacto
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Encuentra la oportunidad que mejor se alinee con tus talentos e intereses.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="bg-[#050A14]/70 border border-slate-800/80 rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">{cat.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{cat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Card */}
      <div className="bg-gradient-to-r from-blue-950/40 via-[#07111F] to-sky-950/40 border border-sky-500/30 rounded-2xl p-6 sm:p-10 space-y-6 shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Beneficios de Certificar con DMPS Connect
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-300">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Horas Exactas:</strong>
              Cálculo auditado en minutos para garantizar máxima precisión en tus reportes.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Certificados Oficiales:</strong>
              Documentos en PDF con código QR y verificación institucional inmediata.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">Historial Permanente:</strong>
              Acceso a todas tus constancias y actividades desde tu portal en cualquier momento.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
