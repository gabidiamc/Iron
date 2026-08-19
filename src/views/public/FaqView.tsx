import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

interface FaqViewProps {
  onNavigate: (view: string) => void;
}

export const FaqView: React.FC<FaqViewProps> = ({ onNavigate }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿Quiénes pueden registrarse como voluntarios en DMPS Connect?',
      a: 'Cualquier estudiante, familiar o miembro de la comunidad que desee apoyar en eventos escolares, talleres educativos y actividades cívicas puede registrarse de forma gratuita. Los estudiantes reciben un Volunteer ID único (VOL-XXXXX) para registrar y certificar sus horas de servicio.',
    },
    {
      q: '¿Cómo se calculan y aprueban las horas de voluntariado?',
      a: 'Las horas se registran en minutos exactos a partir de la hora de inicio y fin del servicio. Una vez enviada la solicitud con la descripción y el comprobante correspondiente, el equipo de Staff o Admin revisa y aprueba o solicita correcciones.',
    },
    {
      q: '¿Qué es el Volunteer ID (ejemplo: VOL-00001)?',
      a: 'Es tu código identificador permanente dentro de la plataforma. Con este código puedes firmar listas de asistencia en eventos, vincular solicitudes y verificar la autenticidad de tus constancias ante escuelas y universidades.',
    },
    {
      q: '¿Qué diferencia hay entre DMPS Connect, DMPS Info y DMPS Status?',
      a: 'DMPS Connect es el Hub Central de voluntariado y participación. DMPS Info (info.familiasdmps.app) es un portal público con guías y recursos distritales para familias. DMPS Status (status.familiasdmps.app) es una herramienta operativa independiente utilizada en terreno para monitorear actividades en vivo.',
    },
    {
      q: '¿Qué ocurre si me equivoco al enviar un registro de horas?',
      a: 'Si el Staff detecta alguna discrepancia (por ejemplo en el horario o comprobante), marcará la solicitud en estado "Requiere Corrección" y te enviará una nota explicativa para que puedas editarla y reenviarla sin perder tu registro original.',
    },
    {
      q: '¿Cómo obtengo un certificado oficial de mis horas acumuladas?',
      a: 'Desde tu panel de voluntario (Mi Cuenta -> Constancia) puedes generar y descargar en cualquier momento tu Certificado Oficial en PDF con desglose de horas verificadas, sello digital y código de validación.',
    },
    {
      q: '¿Es obligatorio asistir a todos los eventos a los que me postule?',
      a: 'Te pedimos postularte únicamente a los eventos en los que tengas plena disponibilidad. Si por algún motivo no puedes asistir, notifícalo con antelación para que el cupo pueda liberarse a otro voluntario en lista de espera.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Centro de Ayuda</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Preguntas Frecuentes
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Respuestas claras sobre el funcionamiento del Hub, registro de eventos, aprobación de horas y certificaciones.
        </p>
      </div>

      {/* Accordion list */}
      <div className="space-y-3">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen
                  ? 'bg-[#07111F] border-sky-500/40 shadow-xl'
                  : 'bg-[#07111F]/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="text-sm sm:text-base font-bold text-white leading-snug">
                  {item.q}
                </span>
                <span className="p-1 rounded-lg bg-slate-800 text-sky-400 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-blue-950/40 via-[#07111F] to-sky-950/30 border border-sky-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white">¿Tienes otra pregunta específica?</h3>
          <p className="text-xs text-slate-300">
            Nuestro equipo de coordinación con gusto te orientará.
          </p>
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Mail className="w-4 h-4" />
          <span>Escríbenos a Contacto</span>
        </button>
      </div>
    </div>
  );
};
