import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  FileCheck2,
  Lock,
  UserPlus,
  LogIn,
  CheckCircle,
  FileText,
  Clock,
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#050A14] text-white flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#07111F]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText />
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <LogIn size={14} />
              <span>Iniciar Sesión</span>
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus size={14} />
              <span>Registrarse</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold shadow-inner animate-fadeIn">
            <Sparkles size={14} />
            <span>Sistema Seguro de Registro y Certificación Comunitaria</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
            Valida, Registra y Certifica tus{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
              Horas de Voluntariado
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            La plataforma oficial para que voluntarios lleven el control exacto de su servicio comunitario con datos reales, envíen comprobantes respaldados y obtengan constancias oficiales validadas por coordinadores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Crear Cuenta de Voluntario</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Acceder con mi Cuenta</span>
            </button>
          </div>
        </section>

        {/* 3 Step Process */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">¿Cómo funciona el portal?</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Flujo simple, seguro y transparente para voluntarios y coordinadores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#07111F]/60 border border-white/5 backdrop-blur-sm relative space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-white">Crea tu Cuenta y Perfil</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Regístrate con tus datos reales y recibe un identificador único de voluntario (ej. <code className="text-blue-400 font-mono font-semibold">VOL-00001</code>). Vincula tu institución educativa y datos de contacto.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#07111F]/60 border border-white/5 backdrop-blur-sm relative space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-white">Registra tus Actividades</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ingresa la fecha, horas exactas realizadas, institución beneficiaria, supervisor y comprobantes o firmas con cálculo automático de minutos.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#07111F]/60 border border-white/5 backdrop-blur-sm relative space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-white">Revisión & Certificación</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                El equipo coordinador revisa cada solicitud individualmente. Al aprobarse, las horas se suman a tu historial oficial y puedes emitir constancias.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Features Banner */}
        <section className="bg-[#07111F]/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Seguridad y Privacidad</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Cifrado de contraseñas con bcrypt, sesiones autenticadas mediante JWT y registro de auditoría de todas las revisiones.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                <FileCheck2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Comprobantes y Evidencias</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Adjunta constancias fotográficas, cartas de supervisores o firmas digitales para respaldo inalterable de tus horas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 shrink-0">
                <Award size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Constancias Oficiales</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Generación y descarga de certificados de horas acumuladas con desglose por institución y firma de coordinación.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#07111F]/50 py-6 text-center text-xs text-slate-500">
        <p>Portal de Horas de Voluntariado • Plataforma Oficial de Registro y Certificación</p>
      </footer>
    </div>
  );
};
