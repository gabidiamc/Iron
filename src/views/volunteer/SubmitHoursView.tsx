import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, formatMinutes } from '../../services/api';
import confetti from 'canvas-confetti';
import { ActivityPresetsAssistant } from '../../components/ActivityPresetsAssistant';
import { InfiniteCampusSyncModal } from '../../components/InfiniteCampusSyncModal';
import {
  Clock,
  Building,
  Calendar,
  MapPin,
  FileText,
  User,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Info,
  X,
  FileCheck,
  Plus,
  GraduationCap,
  Link2,
} from 'lucide-react';

interface SubmitHoursViewProps {
  onNavigate: (view: string) => void;
  onOpenMyHours: () => void;
}

export const SubmitHoursView: React.FC<SubmitHoursViewProps> = ({
  onNavigate,
  onOpenMyHours,
}) => {
  const { profile, refreshUserData } = useAuth();

  const [activityName, setActivityName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:30');
  const [useDirectHours, setUseDirectHours] = useState(false);
  const [directHours, setDirectHours] = useState<number>(3);
  const [directMinutes, setDirectMinutes] = useState<number>(30);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorSelection, setSupervisorSelection] = useState<string>('Brenda Lucero');
  const [customSupervisorName, setCustomSupervisorName] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [isDuplicateWarning, setIsDuplicateWarning] = useState<string | null>(null);
  const [isInfiniteCampusModalOpen, setIsInfiniteCampusModalOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [submittedMinutesResult, setSubmittedMinutesResult] = useState<number>(0);

  const effectiveSupervisorName = supervisorSelection === '__CUSTOM__' 
    ? customSupervisorName.trim() 
    : supervisorSelection;

  // Automatic duration calculation from Start/End time
  const calculateDuration = (): number => {
    if (useDirectHours) {
      return (Number(directHours) || 0) * 60 + (Number(directMinutes) || 0);
    }
    if (!startTime || !endTime) return 0;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (endTotal > startTotal) {
      return endTotal - startTotal;
    } else if (endTotal > 0 && endTotal <= startTotal) {
      return (1440 - startTotal) + endTotal;
    }
    return 0;
  };

  const calculatedMinutes = calculateDuration();

  // Check duplicate asynchronously as user types activity and date
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (activityName.trim().length > 3 && date) {
        try {
          const res = await api.checkDuplicate(date, activityName.trim(), startTime);
          if (res.is_duplicate) {
            setIsDuplicateWarning(res.message || 'Parece que ya enviaste horas para esta actividad en esta fecha.');
          } else {
            setIsDuplicateWarning(null);
          }
        } catch {
          setIsDuplicateWarning(null);
        }
      } else {
        setIsDuplicateWarning(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activityName, date, startTime]);

  // Handle proof file upload as Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo comprobante no debe superar los 5MB.');
        return;
      }
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activityName.trim() || !organizationName.trim() || !date || !description.trim() || !effectiveSupervisorName) {
      setError('Por favor completa todos los campos obligatorios marcados con asterisco (*), incluyendo el supervisor.');
      return;
    }

    if (calculatedMinutes <= 0) {
      setError('La duración de la actividad debe ser mayor a 0 minutos.');
      return;
    }

    try {
      setLoading(true);
      await api.submitHours({
        activity_name: activityName.trim(),
        organization_name: organizationName.trim(),
        date,
        start_time: !useDirectHours ? startTime : '',
        end_time: !useDirectHours ? endTime : '',
        manual_hours: useDirectHours ? directHours : undefined,
        manual_minutes: useDirectHours ? directMinutes : undefined,
        location: location.trim(),
        description: description.trim(),
        supervisor_name: effectiveSupervisorName,
        proof_file_url: proofUrl,
        proof_file_name: proofFileName,
      });

      setSubmittedMinutesResult(calculatedMinutes);
      setSubmittedSuccess(true);
      await refreshUserData();

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  // Render Post-Submission Confirmation Screen
  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-6 sm:p-10 shadow-2xl text-center backdrop-blur-xl animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock size={34} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Solicitud enviada
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Tus horas fueron enviadas al equipo de staff y coordinadores para su debida revisión y validación.
          </p>

          {/* Submission Details Card */}
          <div className="my-6 p-4 rounded-2xl bg-[#0B192E] border border-[#16263D] text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#16263D]/60 pb-2.5">
              <span className="text-xs text-slate-400">Estado de la Solicitud:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                <Clock size={13} />
                <span>PENDIENTE</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Actividad:</span>
              <span className="text-xs font-semibold text-white truncate max-w-[200px]">{activityName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Organización:</span>
              <span className="text-xs text-slate-200">{organizationName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Tiempo Solicitado:</span>
              <span className="text-sm font-bold text-[#258BFF] font-mono">
                {formatMinutes(submittedMinutesResult)}
              </span>
            </div>
          </div>

          {/* Critical Policy Banner */}
          <div className="p-3.5 rounded-xl bg-[#050A14] border border-blue-500/20 text-xs text-slate-400 flex items-start gap-2.5 text-left mb-6">
            <Info size={16} className="text-[#258BFF] shrink-0 mt-0.5" />
            <span>
              <strong>Nota de Seguridad:</strong> El voluntario no puede auto-aprobar horas. Tu total de horas aprobadas se actualizará automáticamente tan pronto el staff valide este registro.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onOpenMyHours}
              className="px-6 py-3 bg-[#1677FF] hover:bg-[#258BFF] text-white rounded-xl text-xs font-semibold shadow-lg shadow-[#1677FF]/20 transition-colors"
            >
              Ver en Mi Historial
            </button>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setActivityName('');
                setOrganizationName('');
                setDescription('');
                setSupervisorSelection('Brenda Lucero');
                setCustomSupervisorName('');
                setLocation('');
                setProofUrl('');
                setProofFileName('');
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Registrar Otra Actividad
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-xl bg-[#07111F] border border-[#16263D] text-slate-400 hover:text-white hover:border-slate-600 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Registrar Horas de Voluntariado
            </h1>
            <p className="text-xs text-slate-400">
              Ingresa los detalles de tu actividad comunitaria o enlaza tus horas escolares oficiales
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsInfiniteCampusModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs shadow-lg shadow-cyan-500/10 transition-all"
        >
          <GraduationCap size={16} className="text-cyan-400" />
          <span>Enlazar Infinite Campus</span>
        </button>
      </div>

      {/* Infinite Campus Integration Hero Card */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#07111F] to-blue-950/40 border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <Link2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                ¿Tienes horas en Infinite Campus (Silver Cord)?
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Acreditación Inmediata
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Enlaza tu portal DMPS para transferir tus horas de Silver Cord. Ya están validadas oficialmente y no requieren revisión adicional.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsInfiniteCampusModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <GraduationCap size={15} />
          <span>Sincronizar Infinite Campus</span>
        </button>
      </div>

      {/* Duplicate Warning Alert */}
      {isDuplicateWarning && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 animate-fadeIn">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-amber-300">Posible Registro Duplicado</h4>
            <p className="mt-0.5 text-amber-200/90">{isDuplicateWarning}</p>
            <p className="mt-1 text-[11px] text-amber-300/70">
              Por favor revisa tu historial para evitar enviar dos veces la misma actividad.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-fadeIn">
          <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Smart Activity Presets & Description Generator */}
      <ActivityPresetsAssistant
        currentActivityName={activityName}
        currentOrganizationName={organizationName}
        currentDescription={description}
        onApplyPreset={(presetData) => {
          setActivityName(presetData.activityName);
          if (presetData.organizationName && (!organizationName || organizationName.trim().length === 0)) {
            setOrganizationName(presetData.organizationName);
          }
          setDescription(presetData.description);
        }}
      />

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#16263D]/60 pb-3 mb-2">
            <Building size={18} className="text-[#258BFF]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Datos de la Actividad y Organización
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Nombre del Evento o Actividad *
            </label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Ej. Jornada de Reforestación o Tutoría Escolar"
              required
              className="w-full px-4 py-3 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] focus:ring-1 focus:ring-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Organización donde realizó el voluntariado *
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Ej. Banco de Alimentos / Cruz Roja"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Fecha del Servicio *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Time and Automatic Calculation */}
        <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#16263D]/60 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#258BFF]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                2. Horario y Cálculo de Duración
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setUseDirectHours(!useDirectHours)}
              className="text-xs text-[#258BFF] hover:underline font-medium"
            >
              {useDirectHours ? 'Usar hora de inicio y fin' : 'Ingresar horas directamente'}
            </button>
          </div>

          {!useDirectHours ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Hora de Inicio *
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
                  Hora de Finalización *
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
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Horas
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={directHours}
                  onChange={(e) => setDirectHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Minutos
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={directMinutes}
                  onChange={(e) => setDirectMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none font-mono"
                />
              </div>
            </div>
          )}

          {/* Real-time Automatic Calculation Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B192E] to-[#16263D]/60 border border-[#1677FF]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1677FF]/20 text-[#258BFF] flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block">
                  Cálculo Automático de Tiempo
                </span>
                <span className="text-xs text-slate-300">
                  Guardado internamente como <strong className="text-white font-mono">{calculatedMinutes} minutos</strong> (sin decimales)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl sm:text-2xl font-extrabold text-[#258BFF] font-mono">
                {formatMinutes(calculatedMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Description, Supervisor and Proof */}
        <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#16263D]/60 pb-3 mb-2">
            <FileText size={18} className="text-[#258BFF]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Descripción, Supervisor y Comprobante
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Ubicación del Servicio (Opcional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej. Parque Central / Sede Comunitaria"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>Supervisor / Coordinador Encargado *</span>
                {supervisorSelection === 'Brenda Lucero' && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Coordinadora Oficial
                  </span>
                )}
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" size={17} />
                  <select
                    value={supervisorSelection}
                    onChange={(e) => setSupervisorSelection(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-sky-500/40 focus:border-[#258BFF] rounded-xl text-sm text-white font-medium outline-none cursor-pointer"
                  >
                    <option value="Brenda Lucero">Brenda Lucero (Coordinadora General de Voluntariado)</option>
                    <option value="__CUSTOM__">+ Agregar / Especificar otro supervisor...</option>
                  </select>
                </div>

                {supervisorSelection === '__CUSTOM__' && (
                  <div className="animate-fadeIn">
                    <input
                      type="text"
                      value={customSupervisorName}
                      onChange={(e) => setCustomSupervisorName(e.target.value)}
                      placeholder="Nombre y cargo del supervisor (Ej: Carlos Ramos - Coordinador)"
                      required
                      className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Indica el nombre del coordinador o responsable de la organización.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Descripción de las Actividades Realizadas *
              </label>
              <span className="text-[11px] text-slate-400">
                {description.length} caracteres
              </span>
            </div>

            {/* Quick action chips to append or enrich description */}
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">
                Frase rápida:
              </span>
              {[
                { label: 'Guía a familias', text: 'Apoyé orientando y guiando a las familias asistentes durante el evento.' },
                { label: 'Traducción bilingüe', text: 'Brindé apoyo de interpretación y traducción español-inglés para facilitar la comunicación.' },
                { label: 'Cuidado de niños', text: 'Supervisé y coordiné actividades recreativas seguras para los niños.' },
                { label: 'Soporte tecnológico', text: 'Brindé asistencia técnica y apoyo en herramientas digitales a los asistentes.' },
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
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0B192E] border border-[#16263D] text-slate-300 hover:text-white hover:border-[#258BFF]/60 hover:bg-[#1677FF]/10 transition-all flex items-center gap-1"
                >
                  <Plus size={11} className="text-[#258BFF]" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe de forma concisa tus labores y aportes comunitarios..."
              required
              className="w-full px-4 py-3 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Proof Upload (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Subir Comprobante o Imagen (Opcional)
            </label>
            {proofUrl ? (
              <div className="p-3 bg-[#0B192E] border border-[#1677FF]/40 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                    <img src={proofUrl} alt="Comprobante" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white block truncate max-w-[200px]">
                      {proofFileName || 'Comprobante adjunto'}
                    </span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Listo para revisión
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProofUrl('');
                    setProofFileName('');
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#16263D] hover:border-[#1677FF]/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#0B192E]/40 hover:bg-[#0B192E] transition-all">
                <Upload size={24} className="text-slate-400 mb-2" />
                <span className="text-xs font-medium text-slate-300">
                  Haz clic o arrastra una foto de asistencia o comprobante firmado
                </span>
                <span className="text-[10px] text-slate-500 mt-1">PNG, JPG o PDF hasta 5MB</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <span className="text-xs text-slate-400">
            Al enviar, tu solicitud quedará registrada en estado <strong className="text-amber-400">PENDIENTE</strong>.
          </span>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#1677FF] to-[#258BFF] hover:from-[#1366dc] hover:to-[#1e78e0] text-white rounded-2xl text-sm font-bold shadow-xl shadow-[#1677FF]/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Enviar Horas para Revisión</span>
                <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Infinite Campus Sync Modal */}
      <InfiniteCampusSyncModal
        isOpen={isInfiniteCampusModalOpen}
        onClose={() => setIsInfiniteCampusModalOpen(false)}
        onSuccess={() => {
          refreshUserData();
        }}
      />
    </div>
  );
};
