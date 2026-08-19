import React from 'react';
import { HourSubmission } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { formatMinutes } from '../../services/api';
import {
  X,
  Calendar,
  Clock,
  Building,
  MapPin,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Download,
  FileCheck,
} from 'lucide-react';

interface SubmissionDetailModalProps {
  submission: HourSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCorrection?: (id: string) => void;
  isStaff?: boolean;
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  isOpen,
  onClose,
  onOpenCorrection,
  isStaff = false,
}) => {
  if (!isOpen || !submission) return null;

  const durationMin = submission.status === 'APPROVED' && submission.approved_minutes
    ? submission.approved_minutes
    : submission.submitted_minutes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#07111F] border border-[#16263D] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#16263D] bg-[#0B192E]/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <StatusBadge status={submission.status} size="md" />
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                {submission.volunteer_code}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {submission.activity_name}
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Status specific banners */}
          {submission.status === 'APPROVED' && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-300">
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-200 block font-semibold text-sm">
                  Horas Aprobadas y Certificadas
                </strong>
                <p className="mt-0.5">
                  Aprobado por: <strong>{submission.reviewed_by || 'Staff Autorizado'}</strong>
                </p>
                {submission.reviewed_at && (
                  <p className="text-[11px] text-emerald-400/80 mt-0.5">
                    Fecha de aprobación: {new Date(submission.reviewed_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          )}

          {submission.status === 'REJECTED' && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
              <XCircle size={20} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-200 block font-semibold text-sm">
                  Solicitud No Aprobada
                </strong>
                <p className="mt-0.5">
                  Motivo: <strong>{submission.rejection_reason || 'Información no validada'}</strong>
                </p>
                {submission.rejection_comment && (
                  <p className="mt-1 text-slate-300 italic bg-[#050A14] p-2 rounded-lg border border-rose-500/20">
                    "{submission.rejection_comment}"
                  </p>
                )}
                {submission.reviewed_at && (
                  <p className="text-[11px] text-rose-400/80 mt-1">
                    Revisado por: {submission.reviewed_by} el {new Date(submission.reviewed_at).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
            </div>
          )}

          {submission.status === 'NEEDS_CORRECTION' && (
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3 text-xs text-orange-300">
              <AlertCircle size={20} className="text-orange-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="text-orange-200 block font-semibold text-sm">
                  Requiere Corrección del Voluntario
                </strong>
                <p className="mt-1 text-orange-100 bg-[#050A14] p-2.5 rounded-xl border border-orange-500/20 leading-relaxed font-medium">
                  {submission.staff_message || 'Por favor verifica la información ingresada.'}
                </p>
                {!isStaff && onOpenCorrection && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCorrection(submission.id);
                    }}
                    className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
                  >
                    Corregir Registro Ahora
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-[#0B192E]/60 border border-[#16263D] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1677FF]/15 text-[#258BFF] flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Duración {submission.status === 'APPROVED' ? 'Aprobada' : 'Solicitada'}
                </span>
                <span className="text-base font-extrabold text-white font-mono">
                  {formatMinutes(durationMin)}
                </span>
                <span className="text-[10px] text-slate-500 block">({durationMin} minutos registrados)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0B192E]/60 border border-[#16263D] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Fecha de la Actividad
                </span>
                <span className="text-sm font-bold text-white">
                  {submission.date}
                </span>
                {submission.start_time && submission.end_time && (
                  <span className="text-[10px] text-slate-400 block">
                    Horario: {submission.start_time} - {submission.end_time}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0B192E]/60 border border-[#16263D] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                <Building size={20} />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Organización
                </span>
                <span className="text-sm font-bold text-white truncate max-w-[180px] block">
                  {submission.organization_name}
                </span>
                {submission.location && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {submission.location}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0B192E]/60 border border-[#16263D] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Supervisor Responsable
                </span>
                <span className="text-sm font-bold text-white truncate max-w-[180px] block">
                  {submission.supervisor_name}
                </span>
                <span className="text-[10px] text-slate-400 block">Verificador de Sitio</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-[#0B192E]/40 border border-[#16263D] space-y-1.5">
            <span className="text-[11px] uppercase font-bold text-slate-400 block">
              Descripción de la Actividad
            </span>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {submission.description}
            </p>
          </div>

          {/* Proof Image / File if exists */}
          {submission.proof_file_url && (
            <div className="p-4 rounded-2xl bg-[#0B192E]/40 border border-[#16263D] space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">
                Comprobante de Asistencia Adjunto
              </span>
              <div className="max-h-60 rounded-xl overflow-hidden border border-slate-700 bg-black/40 flex items-center justify-center p-2">
                <img
                  src={submission.proof_file_url}
                  alt="Comprobante"
                  className="max-h-56 max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Audit & Timestamps */}
          <div className="text-[11px] text-slate-500 flex flex-wrap justify-between gap-2 border-t border-[#16263D] pt-3">
            <span>Enviado: {new Date(submission.submitted_at).toLocaleString('es-ES')}</span>
            <span>ID Registro: {submission.id}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#16263D] bg-[#0B192E]/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
