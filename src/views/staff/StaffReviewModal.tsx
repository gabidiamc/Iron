import React, { useState, useEffect } from 'react';
import { HourSubmission } from '../../types';
import { api, formatMinutes } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Building,
  User,
  Calendar,
  MapPin,
  FileCheck,
  Edit2,
} from 'lucide-react';

interface StaffReviewModalProps {
  submission: HourSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffReviewModal: React.FC<StaffReviewModalProps> = ({
  submission,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'CORRECTION'>('APPROVE');

  // Approval state
  const [adjustHours, setAdjustHours] = useState(false);
  const [approvedMinutes, setApprovedMinutes] = useState<number>(0);
  const [reviewNote, setReviewNote] = useState('');

  // Rejection state
  const [rejectionReason, setRejectionReason] = useState('Información insuficiente o no verificable');
  const [rejectionComment, setRejectionComment] = useState('');

  // Correction state
  const [staffMessage, setStaffMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submission) {
      setApprovedMinutes(submission.submitted_minutes);
      setAdjustHours(false);
      setReviewNote('');
      setRejectionReason('Información insuficiente o no verificable');
      setRejectionComment('');
      setStaffMessage('');
      setActionType('APPROVE');
      setError(null);
    }
  }, [submission]);

  if (!isOpen || !submission) return null;

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.approveSubmission(
        submission.id,
        adjustHours ? approvedMinutes : undefined,
        reviewNote
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al aprobar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      setError('Selecciona un motivo de rechazo.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await api.rejectSubmission(submission.id, rejectionReason, rejectionComment);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al rechazar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCorrection = async () => {
    if (!staffMessage.trim()) {
      setError('Por favor indica qué correcciones debe realizar el voluntario.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await api.requestCorrection(submission.id, staffMessage.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al solicitar la corrección.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#07111F] border border-[#16263D] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#16263D] bg-[#0B192E]/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusBadge status={submission.status} size="sm" />
              <span className="text-xs font-mono font-bold text-[#258BFF] bg-[#1677FF]/20 px-2.5 py-0.5 rounded-full border border-[#1677FF]/30">
                {submission.volunteer_code}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
              Revisión de Solicitud de Horas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Voluntario: <strong className="text-slate-200">{submission.volunteer_name}</strong> • {submission.school}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submission Info Summary Box */}
          <div className="p-4 rounded-2xl bg-[#0B192E]/60 border border-[#16263D] space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Actividad:</span>
              <span className="font-bold text-white text-sm">{submission.activity_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Organización:</span>
              <span className="text-slate-200">{submission.organization_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Fecha del Servicio:</span>
              <span className="text-slate-200">{submission.date}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Supervisor:</span>
              <span className="text-slate-200">{submission.supervisor_name}</span>
            </div>
            <div className="flex justify-between items-center border-t border-[#16263D] pt-2">
              <span className="text-slate-400">Tiempo Solicitado por Voluntario:</span>
              <span className="text-sm font-bold text-[#258BFF] font-mono">
                {formatMinutes(submission.submitted_minutes)} ({submission.submitted_minutes} min)
              </span>
            </div>

            <div className="pt-2 border-t border-[#16263D]">
              <span className="text-slate-400 block mb-1">Descripción:</span>
              <p className="text-slate-300 leading-relaxed bg-[#050A14] p-3 rounded-xl border border-slate-800">
                {submission.description}
              </p>
            </div>

            {submission.proof_file_url && (
              <div className="pt-2">
                <span className="text-slate-400 block mb-1">Comprobante Adjunto:</span>
                <div className="max-h-48 rounded-xl overflow-hidden border border-slate-700 bg-black/30 p-2 flex justify-center">
                  <img
                    src={submission.proof_file_url}
                    alt="Comprobante"
                    className="max-h-44 max-w-full object-contain rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Acción a Tomar por el Staff:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActionType('APPROVE')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-[#0B192E] text-slate-400 hover:text-white border border-[#16263D]'
                }`}
              >
                <CheckCircle2 size={16} />
                <span>Aprobar</span>
              </button>

              <button
                type="button"
                onClick={() => setActionType('CORRECTION')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  actionType === 'CORRECTION'
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-[#0B192E] text-slate-400 hover:text-white border border-[#16263D]'
                }`}
              >
                <AlertCircle size={16} />
                <span>Pedir Corrección</span>
              </button>

              <button
                type="button"
                onClick={() => setActionType('REJECT')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  actionType === 'REJECT'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-[#0B192E] text-slate-400 hover:text-white border border-[#16263D]'
                }`}
              >
                <XCircle size={16} />
                <span>Rechazar</span>
              </button>
            </div>
          </div>

          {/* Tab 1: APPROVE options */}
          {actionType === 'APPROVE' && (
            <div className="space-y-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-200 text-sm">Aprobación Oficial</h4>
                  <p className="text-emerald-300/80 mt-0.5">
                    Estas horas se sumarán inmediatamente al acumulado del voluntario.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdjustHours(!adjustHours)}
                  className="text-xs text-[#258BFF] hover:underline font-semibold"
                >
                  {adjustHours ? 'Mantener horas originales' : 'Ajustar tiempo a aprobar'}
                </button>
              </div>

              {adjustHours && (
                <div className="p-3 bg-[#07111F] rounded-xl border border-emerald-500/30 space-y-2">
                  <label className="block text-slate-300 font-semibold">
                    Minutos Aprobados por Staff:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={approvedMinutes}
                      onChange={(e) => setApprovedMinutes(Math.max(1, parseInt(e.target.value, 10) || 0))}
                      className="w-32 px-3 py-2 bg-[#0B192E] border border-slate-700 rounded-xl text-white font-mono text-sm"
                    />
                    <span className="font-bold text-white text-sm">
                      = {formatMinutes(approvedMinutes)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nota interna o comentario de aprobación (Opcional):
                </label>
                <input
                  type="text"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Ej. Asistencia confirmada con el supervisor de sitio."
                  className="w-full px-3.5 py-2 bg-[#07111F] border border-emerald-500/30 rounded-xl text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Tab 2: CORRECTION options */}
          {actionType === 'CORRECTION' && (
            <div className="space-y-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-xs">
              <div>
                <h4 className="font-bold text-orange-200 text-sm">Solicitud de Corrección</h4>
                <p className="text-orange-300/80 mt-0.5">
                  El voluntario recibirá una notificación y podrá editar los datos antes de re-evaluar.
                </p>
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1">
                  Instrucciones precisas para el voluntario *
                </label>
                <textarea
                  value={staffMessage}
                  onChange={(e) => setStaffMessage(e.target.value)}
                  rows={3}
                  placeholder="Ej. Por favor corrige el horario de salida para que coincida con la bitácora del supervisor (terminó a las 12:00 PM en lugar de 2:00 PM)."
                  required
                  className="w-full px-3.5 py-2 bg-[#07111F] border border-orange-500/30 rounded-xl text-white placeholder:text-slate-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Tab 3: REJECT options */}
          {actionType === 'REJECT' && (
            <div className="space-y-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs">
              <div>
                <h4 className="font-bold text-rose-200 text-sm">Rechazar Solicitud de Horas</h4>
                <p className="text-rose-300/80 mt-0.5">
                  Esta solicitud quedará marcada como rechazada y NO sumará horas al voluntario.
                </p>
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1">
                  Motivo de Rechazo *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#07111F] border border-rose-500/30 rounded-xl text-white outline-none"
                >
                  <option value="Información insuficiente o no verificable">
                    Información insuficiente o no verificable
                  </option>
                  <option value="La actividad no califica para servicio comunitario">
                    La actividad no califica para servicio comunitario
                  </option>
                  <option value="El supervisor no confirmó la asistencia">
                    El supervisor no confirmó la asistencia
                  </option>
                  <option value="Registro duplicado detectado">
                    Registro duplicado detectado
                  </option>
                  <option value="Otro motivo">Otro motivo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1">
                  Comentario explicativo (Opcional):
                </label>
                <textarea
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  rows={2}
                  placeholder="Detalla la razón para que el voluntario comprenda el motivo..."
                  className="w-full px-3.5 py-2 bg-[#07111F] border border-rose-500/30 rounded-xl text-white placeholder:text-slate-500 outline-none resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#16263D] bg-[#0B192E]/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Cancelar
          </button>

          {actionType === 'APPROVE' && (
            <button
              type="button"
              disabled={loading}
              onClick={handleApprove}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{loading ? 'Procesando...' : 'Confirmar Aprobación'}</span>
            </button>
          )}

          {actionType === 'CORRECTION' && (
            <button
              type="button"
              disabled={loading}
              onClick={handleRequestCorrection}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <AlertCircle size={16} />
              <span>{loading ? 'Enviando...' : 'Enviar Solicitud de Corrección'}</span>
            </button>
          )}

          {actionType === 'REJECT' && (
            <button
              type="button"
              disabled={loading}
              onClick={handleReject}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <XCircle size={16} />
              <span>{loading ? 'Procesando...' : 'Confirmar Rechazo'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
