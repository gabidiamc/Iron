import React, { useState, useEffect } from 'react';
import { HourSubmission } from '../../types';
import { api, formatMinutes } from '../../services/api';
import {
  X,
  AlertCircle,
  Clock,
  Calendar,
  Building,
  User,
  CheckCircle2,
  FileText,
  Plus,
} from 'lucide-react';

interface CorrectionModalProps {
  submissionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  submissionId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [submission, setSubmission] = useState<HourSubmission | null>(null);
  const [activityName, setActivityName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submissionId && isOpen) {
      api.getSubmissionDetails(submissionId).then((res) => {
        const s = res.submission;
        setSubmission(s);
        setActivityName(s.activity_name);
        setOrganizationName(s.organization_name);
        setDate(s.date);
        setStartTime(s.start_time || '09:00');
        setEndTime(s.end_time || '12:00');
        setDescription(s.description);
        setSupervisorName(s.supervisor_name);
        setCorrectionNotes('');
      }).catch((err) => {
        setError('No se pudo cargar la información de la solicitud.');
      });
    }
  }, [submissionId, isOpen]);

  if (!isOpen || !submission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await api.correctSubmission(submission.id, {
        activity_name: activityName.trim(),
        organization_name: organizationName.trim(),
        date,
        start_time: startTime,
        end_time: endTime,
        description: description.trim(),
        supervisor_name: supervisorName.trim(),
        correction_notes: correctionNotes.trim(),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al enviar la corrección.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#07111F] border border-orange-500/40 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#16263D] bg-orange-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <AlertCircle size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Corregir Registro de Horas</h2>
              <p className="text-xs text-orange-300">
                Ajusta los campos solicitados por el equipo de staff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Staff Message Banner */}
          {submission.staff_message && (
            <div className="p-4 rounded-2xl bg-[#0B192E] border border-orange-500/30 text-xs">
              <span className="text-[11px] uppercase font-bold text-orange-400 block mb-1">
                Instrucciones del Coordinador Staff:
              </span>
              <p className="text-slate-200 leading-relaxed font-medium">
                "{submission.staff_message}"
              </p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form id="correction-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Nombre de la Actividad *
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Organización *
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Hora de Entrada *
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Hora de Salida *
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Supervisor / Coordinador Responsable *</span>
                {supervisorName === 'Brenda Lucero' && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={11} /> Coordinadora Oficial
                  </span>
                )}
              </label>
              <div className="space-y-2">
                <select
                  value={supervisorName === 'Brenda Lucero' ? 'Brenda Lucero' : '__CUSTOM__'}
                  onChange={(e) => {
                    if (e.target.value === 'Brenda Lucero') {
                      setSupervisorName('Brenda Lucero');
                    } else if (supervisorName === 'Brenda Lucero') {
                      setSupervisorName('');
                    }
                  }}
                  required
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-sky-500/40 focus:border-[#258BFF] rounded-xl text-sm text-white font-medium outline-none cursor-pointer"
                >
                  <option value="Brenda Lucero">Brenda Lucero (Coordinadora General de Voluntariado)</option>
                  <option value="__CUSTOM__">+ Otro supervisor (Personalizado)...</option>
                </select>

                {supervisorName !== 'Brenda Lucero' && (
                  <input
                    type="text"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    placeholder="Nombre y cargo del supervisor"
                    required
                    className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none animate-fadeIn"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Descripción Actualizada *
              </label>

              {/* Quick helper phrases */}
              <div className="mb-2 flex flex-wrap items-center gap-1">
                {[
                  { label: 'Guía a familias', text: 'Apoyé orientando y guiando a las familias asistentes durante el evento.' },
                  { label: 'Traducción bilingüe', text: 'Brindé apoyo de interpretación y traducción bilingüe español-inglés.' },
                  { label: 'Cuidado de niños', text: 'Supervisé y coordiné actividades recreativas seguras para los niños.' },
                  { label: 'Soporte tecnológico', text: 'Brindé asistencia técnica y soporte digital a los asistentes.' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDescription((prev) => {
                        if (!prev.trim()) return chip.text;
                        return `${prev.trim()} ${chip.text}`;
                      });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-[#07111F] border border-[#16263D] text-slate-300 hover:text-white hover:border-[#258BFF]/50 transition-colors flex items-center gap-0.5"
                  >
                    <Plus size={10} className="text-[#258BFF]" />
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Comentarios de tu corrección (Opcional)
              </label>
              <input
                type="text"
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                placeholder="Ej. Se corrigió el horario de salida según la bitácora."
                className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#16263D] bg-[#0B192E]/40 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            El estado cambiará a <strong className="text-sky-400">CORREGIDA</strong> para re-evaluación.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="correction-form"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-[#1677FF] to-[#258BFF] hover:from-[#1366dc] hover:to-[#1e78e0] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#1677FF]/20 flex items-center gap-1.5"
            >
              {loading ? 'Enviando...' : 'Re-enviar para Revisión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
