import React, { useState, useEffect } from 'react';
import { api, formatMinutes } from '../../services/api';
import { HourSubmission } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { StaffReviewModal } from './StaffReviewModal';
import { SubmissionDetailModal } from '../volunteer/SubmissionDetailModal';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  User,
  Calendar,
  FileDown,
  Eye,
  FileCheck,
} from 'lucide-react';

export const StaffSubmissionsView: React.FC = () => {
  const [submissions, setSubmissions] = useState<HourSubmission[]>([]);
  const [activeStatus, setActiveStatus] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Review modal
  const [reviewSubmission, setReviewSubmission] = useState<HourSubmission | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Detail modal
  const [detailSubmission, setDetailSubmission] = useState<HourSubmission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await api.getAllSubmissions(activeStatus, searchQuery);
      setSubmissions(data.submissions);
    } catch (err) {
      console.error('Error fetching submissions for staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [activeStatus, searchQuery]);

  const tabs = [
    { id: 'PENDING', label: 'Pendientes' },
    { id: 'APPROVED', label: 'Aprobadas' },
    { id: 'NEEDS_CORRECTION', label: 'En Corrección' },
    { id: 'REJECTED', label: 'Rechazadas' },
    { id: 'ALL', label: 'Todas' },
  ];

  const handleOpenReview = (sub: HourSubmission) => {
    setReviewSubmission(sub);
    setIsReviewOpen(true);
  };

  const handleOpenDetail = (sub: HourSubmission) => {
    setDetailSubmission(sub);
    setIsDetailOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Voluntario_Codigo', 'Voluntario_Nombre', 'Escuela', 'Actividad', 'Organizacion', 'Fecha', 'Minutos_Aprobados', 'Estado', 'Revisor'];
    const rows = submissions.map((s) => [
      s.id,
      s.volunteer_code,
      `"${s.volunteer_name}"`,
      `"${s.school}"`,
      `"${s.activity_name}"`,
      `"${s.organization_name}"`,
      s.date,
      s.approved_minutes || s.submitted_minutes,
      s.status,
      `"${s.reviewed_by || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `solicitudes_voluntariado_${activeStatus}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Bandeja de Solicitudes de Horas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1677FF]/20 text-[#258BFF] text-xs font-bold font-mono">
              {submissions.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Revisión, aprobación y gestión de registros de voluntarios
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-[#0B192E] border border-[#16263D] hover:border-[#1677FF]/50 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <FileDown size={16} className="text-[#258BFF]" />
          <span>Exportar a CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#07111F] border border-[#16263D] rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por voluntario, actividad, escuela u organización..."
            className="w-full pl-10 pr-4 py-2 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeStatus === tab.id
                  ? 'bg-[#1677FF] text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-12 text-center text-slate-400 shadow-xl">
          <Inbox size={48} className="mx-auto mb-3 opacity-25 text-slate-500" />
          <h3 className="text-base font-bold text-slate-200">
            No se encontraron solicitudes
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No hay registros que coincidan con el estado "{activeStatus}" o el criterio de búsqueda.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const isApproved = sub.status === 'APPROVED';
            const durationMin = isApproved && sub.approved_minutes ? sub.approved_minutes : sub.submitted_minutes;

            return (
              <div
                key={sub.id}
                className="bg-[#07111F] border border-[#16263D] hover:border-[#1677FF]/40 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-bold text-[#258BFF] bg-[#1677FF]/20 px-2 py-0.5 rounded-md">
                      {sub.volunteer_code}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                      {sub.activity_name}
                    </h3>
                    <StatusBadge status={sub.status} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400 mt-1.5">
                    <span className="text-slate-200 font-semibold flex items-center gap-1">
                      <User size={13} className="text-slate-500" />
                      {sub.volunteer_name} ({sub.school})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building size={13} className="text-slate-500" />
                      {sub.organization_name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-500" />
                      {sub.date}
                    </span>
                    <span>•</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatMinutes(durationMin)}
                    </span>
                  </div>

                  {sub.proof_file_url && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#258BFF] mt-2 font-medium">
                      <FileCheck size={13} /> Tiene comprobante adjunto
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#16263D]">
                  <button
                    onClick={() => handleOpenReview(sub)}
                    className="px-4 py-2 bg-[#1677FF] hover:bg-[#258BFF] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#1677FF]/20"
                  >
                    Evaluar / Decidir
                  </button>

                  <button
                    onClick={() => handleOpenDetail(sub)}
                    className="p-2 bg-[#0B192E] hover:bg-slate-800 border border-[#16263D] text-slate-300 hover:text-white rounded-xl transition-colors"
                    title="Ver Detalles Completos"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <StaffReviewModal
        submission={reviewSubmission}
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setReviewSubmission(null);
        }}
        onSuccess={() => {
          fetchSubmissions();
        }}
      />

      <SubmissionDetailModal
        submission={detailSubmission}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailSubmission(null);
        }}
        isStaff={true}
      />
    </div>
  );
};
