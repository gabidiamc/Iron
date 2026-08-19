import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, MessageSquare, Clock, Globe2, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';

interface ContactViewProps {
  onNavigate: (view: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Consulta General',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Por favor completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.sendContactMessage(formData);
      setSuccessMsg(res.message || 'Mensaje enviado exitosamente.');
      setFormData({
        name: '',
        email: '',
        subject: 'Consulta General',
        message: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold">
          <Mail className="w-3.5 h-3.5" />
          <span>Comunícate con Nosotros</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Contacto DMPS Connect
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          ¿Tienes dudas sobre el portal, quieres proponer un evento comunitario o necesitas asistencia con tu cuenta? Déjanos tu mensaje.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side Info Cards */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-[#07111F]/90 border border-slate-800/90 rounded-2xl p-6 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Atención a Voluntarios</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dudas sobre acreditación de horas, certificados o inscripción a eventos.
            </p>
          </div>

          <div className="bg-[#07111F]/90 border border-slate-800/90 rounded-2xl p-6 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Tiempo de Respuesta</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nuestro equipo de Staff responde habitualmente en un plazo de 24 a 48 horas hábiles.
            </p>
          </div>

          <div className="bg-[#07111F]/90 border border-slate-800/90 rounded-2xl p-6 space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">¿Dudas Frecuentes?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Revisa antes nuestra sección de preguntas frecuentes para obtener respuestas instantáneas.
            </p>
            <button
              onClick={() => onNavigate('faq')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 block pt-1"
            >
              Ir a Preguntas Frecuentes →
            </button>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#07111F]/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">Envíanos un Mensaje</h2>

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-semibold mb-0.5">¡Mensaje Enviado!</strong>
                  {successMsg}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-200">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Tu Nombre Completo *</label>
                  <input
                    id="contact-name-input"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Ana Martínez"
                    className="w-full bg-[#050A14] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Correo Electrónico *</label>
                  <input
                    id="contact-email-input"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu.correo@ejemplo.com"
                    className="w-full bg-[#050A14] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Asunto</label>
                <select
                  id="contact-subject-select"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#050A14] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Consulta General">Consulta General</option>
                  <option value="Soporte con Horas o Certificado">Soporte con Horas o Certificado</option>
                  <option value="Duda sobre un Evento">Duda sobre un Evento</option>
                  <option value="Propuesta de Alianza o Voluntariado">Propuesta de Alianza o Voluntariado</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Mensaje *</label>
                <textarea
                  id="contact-message-input"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Escribe tu mensaje con el mayor detalle posible..."
                  className="w-full bg-[#050A14] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 custom-scrollbar resize-none"
                />
              </div>

              <button
                id="btn-submit-contact"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-xl shadow-blue-900/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Enviando Mensaje...' : 'Enviar Mensaje'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
