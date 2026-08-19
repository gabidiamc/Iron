import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, formatMinutes } from '../../services/api';
import { Certificate } from '../../types';
import { Logo } from '../../components/Logo';
import { InfiniteCampusSyncModal } from '../../components/InfiniteCampusSyncModal';
import {
  Award,
  Shield,
  Star,
  CheckCircle2,
  Calendar,
  Download,
  Printer,
  ExternalLink,
  QrCode,
  Sparkles,
  Lock,
  ChevronRight,
  GraduationCap,
  Eye,
  X,
  Share2,
  Check,
  Building,
  User,
  Clock,
  FileCheck2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyCertificatesViewProps {
  onNavigate?: (view: string) => void;
}

export const MyCertificatesView: React.FC<MyCertificatesViewProps> = ({ onNavigate }) => {
  const { profile, stats, refreshUserData } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const approvedMinutes = profile?.approved_minutes || stats?.approved_minutes || 0;
  const approvedHours = approvedMinutes / 60;

  const milestones = [
    {
      hours: 10,
      title: 'Certificado de Plata - 10 Horas',
      subtitle: 'Iniciación de Impacto Comunitario',
      badgeColor: 'from-slate-400 to-slate-600',
      textColor: 'text-slate-200',
      borderColor: 'border-slate-400/40',
      description: 'Reconocimiento oficial por superar las primeras 10 horas de servicio solidario en DMPS.',
    },
    {
      hours: 25,
      title: 'Diploma de Honor - 25 Horas',
      subtitle: 'Voluntario de Excelencia',
      badgeColor: 'from-yellow-400 to-amber-600',
      textColor: 'text-yellow-300',
      borderColor: 'border-yellow-500/40',
      description: 'Distinción cívica por dedicación sobresaliente con las escuelas y familias del distrito.',
    },
    {
      hours: 50,
      title: 'Galardón de Liderazgo - 50 Horas',
      subtitle: 'Líder Juvenil Comunitario',
      badgeColor: 'from-cyan-400 to-blue-600',
      textColor: 'text-cyan-300',
      borderColor: 'border-cyan-400/40',
      description: 'Acreditación de liderazgo, proactividad y coordinación en eventos masivos escolares.',
    },
    {
      hours: 100,
      title: 'Máximo Galardón de Honor - 100 Horas',
      subtitle: 'Excelencia Cívica Silver Cord DMPS',
      badgeColor: 'from-purple-400 via-indigo-500 to-pink-500',
      textColor: 'text-purple-200',
      borderColor: 'border-purple-400/40',
      description: 'La más alta distinción honorífica del Distrito Escolar de Des Moines.',
    },
  ];

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.getMyCertificates();
      setCertificates(res.certificates || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Award size={12} />
              <span>Acreditación Oficial DMPS</span>
            </span>
            <span className="text-xs text-slate-400">
              Des Moines Public Schools • Silver Cord
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Mis Certificados y Reconocimientos</span>
            <Sparkles size={22} className="text-amber-400" />
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Tus certificados se generan y desbloquean automáticamente al acumular horas aprobadas en DMPS Connect o al sincronizar tu cuenta de Infinite Campus.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-500/40 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <GraduationCap size={15} className="text-cyan-400" />
            <span>Sincronizar Infinite Campus</span>
          </button>
        </div>
      </div>

      {/* Overview Stats & Next Milestone Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#07111F] border border-white/10 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Certificados Obtenidos
            </span>
            <div className="text-2xl font-bold text-white mt-0.5">
              {certificates.length}{' '}
              <span className="text-xs font-normal text-slate-400">
                de {milestones.length} hitos oficiales
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#07111F] border border-white/10 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Horas Verificadas
            </span>
            <div className="text-2xl font-bold text-white mt-0.5">
              {approvedHours.toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400">horas acumuladas</span>
            </div>
          </div>
        </div>

        <div className="bg-[#07111F] border border-white/10 rounded-3xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Autenticidad Digital
            </span>
            <div className="text-sm font-bold text-emerald-300 mt-0.5 flex items-center gap-1">
              <span>Código QR & Firma DMPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Progress Path */}
      <div className="bg-[#07111F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Star size={18} className="text-amber-400" />
              <span>Ruta de Hitos Silver Cord DMPS</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Acumula horas de voluntariado para desbloquear tus diplomas oficiales progresivamente.
            </p>
          </div>
          <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full self-start sm:self-auto">
            {approvedHours.toFixed(1)} / 100 horas para el Máximo Galardón
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((ms) => {
            const isUnlocked = approvedHours >= ms.hours;
            const progress = Math.min(100, Math.round((approvedHours / ms.hours) * 100));
            const hoursRemaining = Math.max(0, ms.hours - approvedHours);
            const issuedCert = certificates.find((c) => c.hours_milestone === ms.hours);

            return (
              <div
                key={ms.hours}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-[#0B192E] border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-[#07111F]/50 border-white/5 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                        isUnlocked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <CheckCircle2 size={11} /> Desbloqueado
                        </>
                      ) : (
                        <>
                          <Lock size={11} /> Bloqueado
                        </>
                      )}
                    </span>
                    <span className="text-sm font-bold text-white font-mono">{ms.hours} hrs</span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{ms.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{ms.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isUnlocked ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{progress}% completado</span>
                    {isUnlocked ? (
                      <span className="text-emerald-400 font-bold">¡Completado!</span>
                    ) : (
                      <span>Faltan {hoursRemaining.toFixed(1)}h</span>
                    )}
                  </div>

                  {issuedCert && (
                    <button
                      onClick={() => setSelectedCert(issuedCert)}
                      className="w-full mt-2 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>Ver Diploma Oficial</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issued Certificates Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award size={20} className="text-amber-400" />
            <span>Certificados Emitidos ({certificates.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-[#07111F] rounded-3xl border border-white/5">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Cargando certificados...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-[#07111F] rounded-3xl border border-white/10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <Award size={32} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-white">Aún no tienes certificados emitidos</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Alcanza 10 horas de servicio comunitario voluntario o enlaza tu cuenta de Infinite Campus con horas previas para desbloquear tu primer diploma oficial.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                <GraduationCap size={15} />
                <span>Enlazar Infinite Campus Ahora</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-[#07111F] border border-amber-500/30 hover:border-amber-500/60 rounded-3xl p-6 transition-all shadow-xl hover:shadow-amber-500/5 space-y-4 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
                      <Award size={26} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                        DMPS SILVER CORD
                      </span>
                      <h3 className="text-base font-bold text-white leading-tight">
                        Certificado de {cert.hours_milestone} Horas
                      </h3>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold shrink-0 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Válido
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0B192E] border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Titular:</span>
                    <strong className="text-white font-medium">{cert.volunteer_name}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Escuela:</span>
                    <span>{cert.school || 'Des Moines Public Schools'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Fecha de Emisión:</span>
                    <span>{cert.issue_date || new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/5">
                    <span className="text-slate-400">Código de Verificación:</span>
                    <div className="flex items-center gap-1.5">
                      <code className="text-amber-300 font-mono text-[11px] font-bold">
                        {cert.certificate_code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(cert.certificate_code)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="Copiar código"
                      >
                        {copiedCode === cert.certificate_code ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Share2 size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    <span>Ver y Descargar Diploma</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Certificate Visual Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#050A14] border border-amber-500/40 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
            {/* Modal Controls Bar */}
            <div className="p-4 border-b border-white/10 bg-[#07111F] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={16} />
                  <span>Vista Previa del Diploma Oficial</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">({selectedCert.certificate_code})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer size={14} />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Certificate Parchment */}
            <div className="p-6 sm:p-10 overflow-y-auto flex justify-center bg-slate-950">
              <div className="w-full max-w-2xl bg-[#091528] border-4 border-double border-amber-500/50 rounded-3xl p-8 sm:p-12 text-center text-slate-100 shadow-2xl relative overflow-hidden space-y-6">
                {/* Certificate Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <Logo size="lg" />
                </div>

                {/* Top District Header */}
                <div className="space-y-1">
                  <div className="flex justify-center mb-2">
                    <Logo size="md" />
                  </div>
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                    DES MOINES PUBLIC SCHOOLS • SILVER CORD PROGRAM
                  </h4>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                    CERTIFICADO DE MÉRITO Y SERVICIO COMUNITARIO
                  </h2>
                </div>

                <p className="text-xs text-slate-300 italic">
                  El Distrito Escolar de Des Moines otorga el presente reconocimiento oficial a:
                </p>

                <div className="py-2 border-b-2 border-amber-500/40 inline-block px-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-amber-300 font-serif tracking-wider">
                    {selectedCert.volunteer_name}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{selectedCert.school}</p>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Por haber completado y validado con honor un total de{' '}
                  <strong className="text-white font-bold">{selectedCert.hours_milestone} Horas</strong> de
                  servicio voluntario en beneficio de las escuelas, estudiantes y familias de la comunidad.
                </p>

                {/* Seals & Signatures */}
                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-6 text-left text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Supervisión y Acreditación:
                    </span>
                    <p className="font-bold text-white mt-1">Brenda Lucero</p>
                    <p className="text-[11px] text-slate-400">Coordinación Silver Cord DMPS</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Fecha: {selectedCert.issue_date}</p>
                  </div>

                  <div className="text-right flex flex-col items-end justify-center">
                    <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
                      <QrCode size={56} className="text-slate-900" />
                    </div>
                    <span className="text-[9px] font-mono text-amber-300 mt-1">
                      {selectedCert.certificate_code}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Infinite Campus Modal */}
      <InfiniteCampusSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSuccess={() => {
          fetchCertificates();
          refreshUserData();
        }}
      />
    </div>
  );
};
