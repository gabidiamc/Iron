import React, { useState } from 'react';
import { Logo } from './Logo';
import { formatMinutes } from '../services/api';
import {
  Shield,
  Award,
  Star,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  QrCode,
  Share2,
  Calendar,
  User,
  GraduationCap,
  Building,
  HeartHandshake,
  BookOpen,
  Users,
  Flame,
} from 'lucide-react';

export interface RankTier {
  id: string;
  name: string;
  minHours: number;
  maxHours: number | null;
  shieldColor: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
  iconName: string;
  title: string;
  description: string;
  whyAwarded: string;
  rewards: string[];
  certificateMilestone: number | null;
}

export interface AchievementBadge {
  id: string;
  title: string;
  category: string;
  icon: any;
  color: string;
  description: string;
  whyAwarded: string;
  rewardText: string;
  isUnlocked: (approvedMinutes: number, totalSubmissions: number) => boolean;
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 'bronze',
    name: 'Bronce',
    title: 'Iniciado de la Comunidad',
    minHours: 0,
    maxHours: 10,
    shieldColor: 'from-amber-700 to-amber-900',
    badgeBg: 'bg-amber-950/40',
    borderColor: 'border-amber-600/40',
    textColor: 'text-amber-300',
    glowColor: 'shadow-amber-900/40',
    iconName: 'Shield',
    description: 'Etapa inicial del voluntario en la red comunitaria de escuelas y programas DMPS Connect.',
    whyAwarded:
      'Se otorga al registrarse e iniciar activamente el camino del voluntariado escolar, reconociendo el primer compromiso solidario de brindar tiempo a la comunidad educativa.',
    rewards: [
      'Acceso al portal oficial de registro de horas DMPS Connect',
      'Inscripción prioritaria en convocatorias de eventos escolares',
      'Bitácora digital activa con trazabilidad oficial de actividades',
    ],
    certificateMilestone: null,
  },
  {
    id: 'silver',
    name: 'Plata',
    title: 'Servidor Comprometido',
    minHours: 10,
    maxHours: 25,
    shieldColor: 'from-slate-400 to-slate-600',
    badgeBg: 'bg-slate-800/60',
    borderColor: 'border-slate-400/50',
    textColor: 'text-slate-200',
    glowColor: 'shadow-slate-500/30',
    iconName: 'Shield',
    description: 'Nivel alcanzado al completar 10 horas de servicio voluntario verificado.',
    whyAwarded:
      'Reconoce la perseverancia, responsabilidad y dedicación demostrada al superar las primeras 10 horas de servicio comunitario de alto impacto.',
    rewards: [
      'Certificado Oficial de 10 Horas con código QR verificable',
      'Validación curricular para requisitos escolares y de servicio social',
      'Insignia de Servidor Destacado en el perfil público',
    ],
    certificateMilestone: 10,
  },
  {
    id: 'gold',
    name: 'Oro',
    title: 'Voluntario de Impacto',
    minHours: 25,
    maxHours: 50,
    shieldColor: 'from-yellow-400 to-amber-600',
    badgeBg: 'bg-yellow-950/40',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-300',
    glowColor: 'shadow-yellow-500/40',
    iconName: 'Award',
    description: 'Nivel de excelencia al completar más de 25 horas de servicio comunitario.',
    whyAwarded:
      'Se otorga en reconocimiento a un compromiso sobresaliente con las familias y la comunidad educativa, convirtiéndose en un pilar esencial en actividades y eventos.',
    rewards: [
      'Diploma de Honor de 25 Horas firmado por la coordinación de voluntarios',
      'Carta oficial de recomendación y mérito cívico institucional',
      'Distintivo dorado de honor en la credencial digital de voluntario',
    ],
    certificateMilestone: 25,
  },
  {
    id: 'platinum',
    name: 'Platino',
    title: 'Líder Comunitario',
    minHours: 50,
    maxHours: 100,
    shieldColor: 'from-cyan-400 to-blue-600',
    badgeBg: 'bg-cyan-950/40',
    borderColor: 'border-cyan-400/50',
    textColor: 'text-cyan-300',
    glowColor: 'shadow-cyan-500/40',
    iconName: 'Star',
    description: 'Nivel de liderazgo alcanzado tras 50 horas de voluntariado continuo.',
    whyAwarded:
      'Se entrega a voluntarios excepcionales que no solo sirven, sino que guían a nuevos integrantes, coordinan áreas logísticas y son ejemplo de empatía y liderazgo social.',
    rewards: [
      'Certificado de Liderazgo y Excelencia Comunitaria de 50 Horas',
      'Habilitación para coordinar grupos en eventos masivos de la comunidad',
      'Mención de honor en los reportes anuales de DMPS',
    ],
    certificateMilestone: 50,
  },
  {
    id: 'diamond',
    name: 'Diamante',
    title: 'Héroe Comunitario DMPS',
    minHours: 100,
    maxHours: null,
    shieldColor: 'from-purple-400 via-indigo-500 to-pink-500',
    badgeBg: 'bg-indigo-950/50',
    borderColor: 'border-purple-400/60',
    textColor: 'text-purple-200',
    glowColor: 'shadow-purple-500/50',
    iconName: 'Sparkles',
    description: 'La máxima distinción cívica y honorífica para voluntarios con más de 100 horas.',
    whyAwarded:
      'El Máximo Galardón de Honor reconoce a los miembros más comprometidos y transformadores de nuestra comunidad, cuyo impacto positivo ha dejado una huella imborrable en cientos de familias.',
    rewards: [
      'Máximo Galardón al Mérito Ciudadano y Excelencia Escolar de 100 Horas',
      'Carta de respaldo de honor para aplicaciones universitarias y becas',
      'Placa conmemorativa digital y reconocimiento en la gala anual',
    ],
    certificateMilestone: 100,
  },
];

export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: 'first_step',
    title: 'Primer Servicio Aprobado',
    category: 'Iniciación',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500 text-cyan-300',
    description: 'Completaste y tuviste tu primer registro de horas validado por un supervisor.',
    whyAwarded:
      'Marca el inicio formal de tu bitácora de servicio comunitario validada.',
    rewardText: 'Insignia de Iniciación Oficial en tu perfil público.',
    isUnlocked: (approvedMin, totalSubs) => approvedMin > 0 || totalSubs > 0,
  },
  {
    id: 'family_guide',
    title: 'Guía de Familias & Traducción',
    category: 'Atención Comunitaria',
    icon: Users,
    color: 'from-emerald-500 to-teal-500 text-emerald-300',
    description: 'Apoyo activo en orientación de padres, recepción, registro o interpretación lingüística.',
    whyAwarded:
      'Reconoce la labor solidaria de acoger y derribar barreras de comunicación para nuestras familias.',
    rewardText: 'Acreditación en Habilidades Interculturales y Servicio al Público.',
    isUnlocked: (approvedMin) => approvedMin >= 5 * 60,
  },
  {
    id: 'education_guardian',
    title: 'Guardián Educativo',
    category: 'Apoyo Académico',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-500 text-amber-300',
    description: 'Participación en tutorías, cuidado de niños, bibliotecas o eventos de lectura.',
    whyAwarded:
      'Premia el fomento directo de la educación, el aprendizaje y el bienestar de la niñez.',
    rewardText: 'Mención de Mérito en Apoyo Pedagógico Escolar.',
    isUnlocked: (approvedMin) => approvedMin >= 15 * 60,
  },
  {
    id: 'active_volunteer',
    title: 'Constancia & Compromiso',
    category: 'Dedicación',
    icon: Flame,
    color: 'from-rose-500 to-pink-500 text-rose-300',
    description: 'Mantiene una participación regular en actividades comunitarias y escolares.',
    whyAwarded:
      'Valora la puntualidad y el espíritu constante de servicio que enriquece a la comunidad.',
    rewardText: 'Estatus de Voluntario Activo Destacado.',
    isUnlocked: (approvedMin) => approvedMin >= 20 * 60,
  },
];

interface VolunteerRankShieldsProps {
  approvedMinutes: number;
  totalSubmissions: number;
  volunteerProfile?: {
    first_name?: string;
    last_name?: string;
    volunteer_id?: string;
    school?: string;
    grade?: string;
    join_date?: string;
    phone?: string;
    email?: string;
  };
  onOpenCertificate?: (hours: number) => void;
}

export const VolunteerRankShields: React.FC<VolunteerRankShieldsProps> = ({
  approvedMinutes,
  totalSubmissions,
  volunteerProfile,
  onOpenCertificate,
}) => {
  const [selectedRank, setSelectedRank] = useState<RankTier | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [showPublicCardModal, setShowPublicCardModal] = useState<boolean>(false);

  const approvedHours = approvedMinutes / 60;

  // Determine current active rank
  const currentRankIndex = RANK_TIERS.reduce((acc, tier, idx) => {
    if (approvedHours >= tier.minHours) return idx;
    return acc;
  }, 0);

  const currentRank = RANK_TIERS[currentRankIndex];
  const nextRank = currentRankIndex < RANK_TIERS.length - 1 ? RANK_TIERS[currentRankIndex + 1] : null;

  // Progress to next rank
  let progressPercent = 100;
  let hoursNeededForNext = 0;
  if (nextRank) {
    const range = nextRank.minHours - currentRank.minHours;
    const progressInCurrent = approvedHours - currentRank.minHours;
    progressPercent = Math.min(100, Math.max(0, (progressInCurrent / range) * 100));
    hoursNeededForNext = Math.max(0, nextRank.minHours - approvedHours);
  }

  return (
    <div className="space-y-6">
      {/* Current Rank Banner with Official Logo */}
      <div className="bg-[#07111F] border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 blur-[110px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Official Logo Integration */}
            <div className="shrink-0 p-1 rounded-2xl bg-[#0B192E] border border-sky-400/30 shadow-lg">
              <Logo size="md" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-extrabold text-sky-400 tracking-wider">
                  Escudo de Rango Actual
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${currentRank.badgeBg} ${currentRank.borderColor} border ${currentRank.textColor}`}>
                  Nivel: {currentRank.name}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {currentRank.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {currentRank.description}
              </p>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedRank(currentRank)}
              className="px-4 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
            >
              <Info size={15} />
              <span>Ver Beneficios y Méritos</span>
            </button>

            <button
              onClick={() => setShowPublicCardModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1677FF] to-[#258BFF] hover:brightness-110 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
            >
              <QrCode size={15} />
              <span>Credencial y Perfil Público</span>
            </button>
          </div>
        </div>

        {/* Progress Bar towards next rank */}
        {nextRank && (
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <span>Progreso hacia rango: </span>
                <strong className={nextRank.textColor}>{nextRank.name} ({nextRank.minHours}h)</strong>
              </span>
              <span className="font-mono text-sky-400 font-bold">
                {approvedHours.toFixed(1)} / {nextRank.minHours} horas ({progressPercent.toFixed(0)}%)
              </span>
            </div>

            <div className="w-full bg-[#0B192E] rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${nextRank.shieldColor} transition-all duration-700 shadow-sm`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Te faltan <strong className="text-white font-mono">{hoursNeededForNext.toFixed(1)} horas aprobadas</strong> para desbloquear el <strong>{nextRank.title}</strong> y su certificado oficial.
            </p>
          </div>
        )}
      </div>

      {/* Ranks Tier Shields Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Shield className="text-sky-400" size={18} />
              <span>Escudos de Rango por Horas de Voluntariado</span>
            </h3>
            <p className="text-xs text-slate-400">
              Haz clic en cualquier escudo para ver por qué se otorga, sus requisitos y los logros que desbloquea.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {RANK_TIERS.map((tier, idx) => {
            const isUnlocked = approvedHours >= tier.minHours;
            const isCurrent = idx === currentRankIndex;

            return (
              <button
                key={tier.id}
                onClick={() => setSelectedRank(tier)}
                className={`text-left rounded-2xl p-4 transition-all duration-200 relative overflow-hidden border flex flex-col justify-between group cursor-pointer ${
                  isCurrent
                    ? `${tier.badgeBg} ${tier.borderColor} ring-2 ring-sky-500/40 shadow-lg ${tier.glowColor}`
                    : isUnlocked
                    ? `${tier.badgeBg} ${tier.borderColor} hover:border-sky-400/50 hover:bg-[#0B192E]`
                    : 'bg-[#07111F]/70 border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                {/* Status chip */}
                <div className="flex items-center justify-between mb-3">
                  {isUnlocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 size={11} /> {isCurrent ? 'Actual' : 'Conseguido'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                      <Lock size={11} /> Bloqueado
                    </span>
                  )}
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {tier.minHours}h+
                  </span>
                </div>

                {/* Big Shield Graphic */}
                <div className="my-2 flex flex-col items-center justify-center text-center">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${tier.shieldColor} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 p-1 relative`}
                  >
                    <div className="w-full h-full rounded-xl bg-[#07111F]/30 backdrop-blur-xs flex items-center justify-center border border-white/20">
                      <Shield size={26} className="text-white drop-shadow-md" />
                    </div>
                  </div>
                  <h4 className={`text-sm font-extrabold mt-3 ${tier.textColor}`}>
                    {tier.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                    {tier.title}
                  </p>
                </div>

                {/* Footer hint */}
                <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between group-hover:text-sky-400 transition-colors">
                  <span>Ver detalles</span>
                  <ChevronRight size={13} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Special Achievements Medals */}
      <div className="space-y-4 pt-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Award className="text-amber-400" size={18} />
            <span>Medallas de Logros & Méritos Especiales</span>
          </h3>
          <p className="text-xs text-slate-400">
            Reconocimientos por impacto en la comunidad, apoyo escolar e idiomas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ACHIEVEMENT_BADGES.map((badge) => {
            const unlocked = badge.isUnlocked(approvedMinutes, totalSubmissions);
            const IconComp = badge.icon;

            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`text-left rounded-2xl p-4 transition-all duration-200 border flex items-start gap-3.5 relative overflow-hidden group cursor-pointer ${
                  unlocked
                    ? 'bg-[#0B192E] border-sky-500/30 hover:border-sky-400/60 shadow-md'
                    : 'bg-[#07111F]/60 border-slate-800/80 opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${badge.color} flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105`}
                >
                  <IconComp size={20} className="text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {badge.category}
                    </span>
                    {unlocked && (
                      <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5">
                    {badge.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {badge.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal: Rank Shield Details */}
      {selectedRank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-sky-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
            {/* Top decorative glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${selectedRank.shieldColor} opacity-15 blur-[80px] pointer-events-none`} />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${selectedRank.shieldColor} flex items-center justify-center shadow-lg shrink-0 p-1`}
                >
                  <div className="w-full h-full rounded-xl bg-[#07111F]/30 backdrop-blur-xs flex items-center justify-center border border-white/20">
                    <Shield size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedRank.badgeBg} ${selectedRank.borderColor} border ${selectedRank.textColor}`}>
                    Escudo de Rango: {selectedRank.name}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    {selectedRank.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedRank(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Requisitos & Status */}
            <div className="space-y-4 relative z-10">
              <div className="p-3.5 rounded-2xl bg-[#0B192E] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                    Requisito de Horas
                  </span>
                  <span className="text-sm font-bold text-white font-mono">
                    {selectedRank.minHours} horas aprobadas en DMPS
                  </span>
                </div>
                <div>
                  {approvedHours >= selectedRank.minHours ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Desbloqueado
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                      <Lock size={13} /> {(selectedRank.minHours - approvedHours).toFixed(1)}h restantes
                    </span>
                  )}
                </div>
              </div>

              {/* ¿Por qué se da esta recompensa y logro? */}
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-1.5">
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Star size={14} className="text-sky-400" />
                  <span>¿Por qué se otorga esta recompensa y logro?</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedRank.whyAwarded}
                </p>
              </div>

              {/* Beneficios & Reconocimientos */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Recompensas y Beneficios Incluidos:
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {selectedRank.rewards.map((reward, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{reward}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 relative z-10">
              <button
                onClick={() => setSelectedRank(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cerrar
              </button>

              {selectedRank.certificateMilestone && approvedHours >= selectedRank.certificateMilestone && onOpenCertificate && (
                <button
                  onClick={() => {
                    const milestone = selectedRank.certificateMilestone!;
                    setSelectedRank(null);
                    onOpenCertificate(milestone);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                >
                  <Award size={15} />
                  <span>Ver Certificado de {selectedRank.certificateMilestone} Horas</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Achievement Badge Details */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#07111F] border border-sky-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${selectedBadge.color} flex items-center justify-center shrink-0 shadow-md`}
                >
                  <selectedBadge.icon size={22} className="text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {selectedBadge.category}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {selectedBadge.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#0B192E] rounded-xl border border-slate-800">
                <strong className="text-slate-300 block mb-1">Descripción del Logro:</strong>
                <p className="text-slate-400">{selectedBadge.description}</p>
              </div>

              <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1">
                <strong className="text-amber-300 block uppercase tracking-wider text-[11px] font-bold">
                  ¿Por qué se otorga este logro?
                </strong>
                <p className="text-slate-300 leading-relaxed">{selectedBadge.whyAwarded}</p>
              </div>

              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                <strong className="text-emerald-300 block uppercase tracking-wider text-[11px] font-bold">
                  Recompensa:
                </strong>
                <p className="text-emerald-200">{selectedBadge.rewardText}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Public Digital Volunteer Credential Card with Official Logo */}
      {showPublicCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#050C1A] border-2 border-sky-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden space-y-6">
            {/* Background seal */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 blur-[100px] pointer-events-none" />

            {/* Header with Official Portal Logo */}
            <div className="flex items-center justify-between pb-4 border-b border-sky-500/20">
              <div className="flex items-center gap-3">
                <Logo size="md" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    DMPS CONNECT
                  </h3>
                  <span className="text-[10px] text-sky-400 font-bold tracking-widest uppercase block">
                    Credencial Oficial de Voluntario
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPublicCardModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80"
              >
                ✕
              </button>
            </div>

            {/* Digital Card Body */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0B1A30] to-[#071324] border border-sky-400/30 shadow-xl space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#258BFF] flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-sky-500/25 shrink-0">
                    {`${volunteerProfile?.first_name?.[0] || 'V'}${volunteerProfile?.last_name?.[0] || 'O'}`.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">
                      {volunteerProfile?.first_name} {volunteerProfile?.last_name}
                    </h4>
                    <span className="text-xs text-slate-300 block">
                      {volunteerProfile?.school || 'Escuela Pública de Des Moines'}
                    </span>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 size={10} /> Voluntario Activo Verificado
                    </span>
                  </div>
                </div>

                {/* Current Rank Shield Badge */}
                <div className="text-center shrink-0">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${currentRank.shieldColor} mx-auto flex items-center justify-center shadow-md p-0.5`}
                  >
                    <div className="w-full h-full rounded-lg bg-[#07111F]/30 backdrop-blur-xs flex items-center justify-center border border-white/20">
                      <Shield size={22} className="text-white" />
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold ${currentRank.textColor} block mt-1`}>
                    {currentRank.name}
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-700/60 text-xs">
                <div className="p-2.5 rounded-xl bg-[#060E1A] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">ID Oficial</span>
                  <span className="font-mono font-black text-sky-400 text-sm">{volunteerProfile?.volunteer_id}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060E1A] border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Horas Acreditadas</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{formatMinutes(approvedMinutes)}</span>
                </div>
              </div>

              {/* Verified Seal */}
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Award className="text-sky-400 shrink-0" size={18} />
                  <div>
                    <span className="font-bold text-white block text-[11px]">Validación Oficial por DMPS</span>
                    <span className="text-[10px] text-slate-400">Revisión a cargo de Brenda Lucero</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                  VERIFICADO
                </span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[11px] text-slate-400">
              Esta credencial certifica la participación comunitaria activa y el cumplimiento ético en el programa de voluntariado escolar.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
