import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  Languages,
  HeartHandshake,
  ShoppingBag,
  GraduationCap,
  ClipboardList,
  Trees,
  Laptop,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  PlusCircle,
  Wand2,
} from 'lucide-react';

export interface ActivityPreset {
  id: string;
  title: string;
  categoryName: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  borderColor: string;
  bgColor: string;
  defaultActivityName: string;
  defaultOrg: string;
  tasks: string[];
  baseTemplate: (selectedTasks: string[], customNotes: string) => string;
}

export const PRESET_OPTIONS: ActivityPreset[] = [
  {
    id: 'families_guide',
    title: 'Guía y Orientación a Familias',
    categoryName: 'Atención Comunitaria',
    icon: Users,
    color: 'text-sky-400',
    borderColor: 'border-sky-500/40 hover:border-sky-400',
    bgColor: 'bg-sky-500/10',
    defaultActivityName: 'Orientación y Guía a Familias',
    defaultOrg: 'Centro Comunitario Escolar DMPS',
    tasks: [
      'Recepción y bienvenida a las familias',
      'Orientación sobre ubicación de módulos y servicios',
      'Entrega de programas y folletos informativos',
      'Acompañamiento y resolución de dudas en accesos',
    ],
    baseTemplate: (tasks, notes) => {
      const taskList = tasks.length > 0 ? ` en ${tasks.slice(0, 2).join(' y ').toLowerCase()}` : '';
      const extra = notes.trim() ? ` (${notes.trim()})` : '';
      return `Apoyé en la bienvenida y orientación de familias durante el evento${taskList}, facilitando su acceso y resolviendo dudas de manera ordenada.${extra}`;
    },
  },
  {
    id: 'translation',
    title: 'Traducción e Interpretación Bilingüe',
    categoryName: 'Idiomas e Inclusión',
    icon: Languages,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    bgColor: 'bg-emerald-500/10',
    defaultActivityName: 'Apoyo en Traducción e Interpretación Bilingüe',
    defaultOrg: 'Distrito Escolar DMPS',
    tasks: [
      'Interpretación español-inglés para familias',
      'Asistencia en llenado de registros y formularios',
      'Explicación de requisitos escolares a padres',
      'Traducción de materiales y avisos del evento',
    ],
    baseTemplate: (tasks, notes) => {
      const taskList = tasks.length > 0 ? ` (${tasks.slice(0, 2).join(', ').toLowerCase()})` : '';
      const extra = notes.trim() ? ` ${notes.trim()}` : '';
      return `Brindé apoyo de interpretación y traducción español-inglés a familias${taskList} para facilitar su comunicación y trámites escolares.${extra}`;
    },
  },
  {
    id: 'childcare',
    title: 'Cuidado y Recreación de Niños',
    categoryName: 'Niñez y Recreación',
    icon: HeartHandshake,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    bgColor: 'bg-amber-500/10',
    defaultActivityName: 'Cuidado Infantil y Actividades Lúdicas',
    defaultOrg: 'Programa Comunitario DMPS',
    tasks: [
      'Supervisión y seguridad de los niños',
      'Coordinación de dinámicas grupales y juegos',
      'Talleres de dibujo y lectura de cuentos',
      'Apoyo en la entrega de refrigerios',
    ],
    baseTemplate: (tasks, notes) => {
      const taskList = tasks.length > 0 ? ` en ${tasks.slice(0, 2).join(' y ').toLowerCase()}` : '';
      const extra = notes.trim() ? ` (${notes.trim()})` : '';
      return `Cuidé y coordiné actividades recreativas seguras para los niños${taskList} mientras sus familias participaban en la jornada escolar.${extra}`;
    },
  },
  {
    id: 'tech_support',
    title: 'Soporte Tecnológico y Logística Digital',
    categoryName: 'Tecnología y Soporte',
    icon: Laptop,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    bgColor: 'bg-rose-500/10',
    defaultActivityName: 'Soporte Tecnológico y Asistencia Digital',
    defaultOrg: 'Centro Digital y Soporte DMPS',
    tasks: [
      'Asistencia en uso de computadoras y dispositivos',
      'Apoyo en acceso a portales y cuentas escolares',
      'Configuración de proyectores y equipos audiovisuales',
      'Resolución de dudas técnicas paso a paso',
    ],
    baseTemplate: (tasks, notes) => {
      const taskList = tasks.length > 0 ? ` en ${tasks.slice(0, 2).join(' y ').toLowerCase()}` : '';
      const extra = notes.trim() ? ` (${notes.trim()})` : '';
      return `Brindé asistencia técnica y soporte en herramientas digitales${taskList} a los asistentes y coordinadores del evento.${extra}`;
    },
  },
];

interface ActivityPresetsAssistantProps {
  onApplyPreset: (data: {
    activityName: string;
    organizationName?: string;
    description: string;
  }) => void;
  currentActivityName?: string;
  currentOrganizationName?: string;
  currentDescription?: string;
}

export const ActivityPresetsAssistant: React.FC<ActivityPresetsAssistantProps> = ({
  onApplyPreset,
  currentActivityName,
  currentOrganizationName,
  currentDescription,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [customDetailNotes, setCustomDetailNotes] = useState<string>('');
  const [generatedText, setGeneratedText] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  const selectedPreset = PRESET_OPTIONS.find((p) => p.id === selectedPresetId);

  const handleSelectPreset = (preset: ActivityPreset) => {
    setSelectedPresetId(preset.id);
    // Select first 3 tasks by default
    const initialTasks = preset.tasks.slice(0, 3);
    setSelectedTasks(initialTasks);
    const text = preset.baseTemplate(initialTasks, customDetailNotes);
    setGeneratedText(text);
  };

  const handleToggleTask = (task: string) => {
    let updatedTasks: string[];
    if (selectedTasks.includes(task)) {
      updatedTasks = selectedTasks.filter((t) => t !== task);
    } else {
      updatedTasks = [...selectedTasks, task];
    }
    setSelectedTasks(updatedTasks);
    if (selectedPreset) {
      setGeneratedText(selectedPreset.baseTemplate(updatedTasks, customDetailNotes));
    }
  };

  const handleCustomNotesChange = (text: string) => {
    setCustomDetailNotes(text);
    if (selectedPreset) {
      setGeneratedText(selectedPreset.baseTemplate(selectedTasks, text));
    }
  };

  const handleApplyToForm = () => {
    if (!selectedPreset) return;

    onApplyPreset({
      activityName: currentActivityName && currentActivityName.trim().length > 2
        ? currentActivityName
        : selectedPreset.defaultActivityName,
      organizationName: currentOrganizationName && currentOrganizationName.trim().length > 2
        ? currentOrganizationName
        : selectedPreset.defaultOrg,
      description: generatedText.trim() || selectedPreset.baseTemplate(selectedTasks, customDetailNotes),
    });

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="bg-[#07111F] border border-blue-500/30 rounded-3xl p-5 sm:p-6 shadow-xl mb-6 backdrop-blur-sm transition-all animate-fadeIn">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Wand2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Opciones Predeterminadas y Generador de Descripción
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1677FF]/20 text-[#258BFF] border border-[#1677FF]/30">
                <Sparkles size={11} /> Redacción Rápida
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Elige en qué colaboraste para redactar automáticamente el texto de tu solicitud sin escribir todo desde cero.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-[#0B192E] border border-[#16263D] text-slate-400 hover:text-white transition-colors"
          title={isOpen ? 'Ocultar opciones' : 'Mostrar opciones'}
        >
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 pt-4 border-t border-[#16263D]/70 space-y-5">
          {/* Step 1: Preset Categories Grid */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Paso 1: Selecciona el tipo de actividad realizada
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_OPTIONS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                      isSelected
                        ? `${preset.bgColor} ${preset.borderColor} ring-2 ring-[#258BFF]/60 shadow-lg`
                        : 'bg-[#0B192E]/70 border-[#16263D] hover:border-slate-600 hover:bg-[#0B192E]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-slate-800/80'} ${preset.color}`}>
                        <Icon size={18} />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#258BFF] text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block line-clamp-1">
                        {preset.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {preset.categoryName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Customizer when a preset is selected */}
          {selectedPreset && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0B192E] border border-[#16263D] space-y-4 animate-fadeIn">
              {/* Task Checklist */}
              <div>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Paso 2: Marca las tareas concretas que realizaste (puedes elegir varias)
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedPreset.tasks.map((task, idx) => {
                    const isChecked = selectedTasks.includes(task);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all text-left ${
                          isChecked
                            ? 'bg-[#1677FF]/20 border-[#258BFF] text-white font-medium shadow-sm'
                            : 'bg-[#07111F] border-[#16263D] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-[#258BFF] border-[#258BFF]' : 'border-slate-600'}`}>
                          {isChecked && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span>{task}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extra detail quick chips / notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Paso 3: Añade algún detalle específico adicional (Opcional)
                </label>
                <input
                  type="text"
                  value={customDetailNotes}
                  onChange={(e) => handleCustomNotesChange(e.target.value)}
                  placeholder="Ej. Atendí a más de 40 familias / apoyé durante toda la jornada de la mañana..."
                  className="w-full px-3.5 py-2 bg-[#07111F] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none"
                />
              </div>

              {/* Live Preview of Generated Description */}
              <div className="p-3.5 rounded-xl bg-[#07111F] border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#258BFF] flex items-center gap-1.5 uppercase">
                    <Sparkles size={13} />
                    Texto Generado Listo para tu Formulario:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPreset) {
                        setGeneratedText(selectedPreset.baseTemplate(selectedTasks, customDetailNotes));
                      }
                    }}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw size={11} /> Regenerar
                  </button>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed italic bg-[#0B192E]/60 p-3 rounded-lg border border-[#16263D]">
                  "{generatedText}"
                </p>

                {/* Apply Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-400">
                    Se completará automáticamente el <strong className="text-slate-200">nombre sugerido</strong> y la <strong className="text-slate-200">descripción</strong> en el formulario abajo.
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyToForm}
                    className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-[#1677FF] to-[#258BFF] hover:from-[#1366dc] hover:to-[#1e78e0] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {copiedNotification ? (
                      <>
                        <Check size={14} className="text-emerald-300" />
                        <span className="text-emerald-200">¡Aplicado al Formulario!</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle size={14} />
                        <span>Usar este Texto en el Formulario</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
