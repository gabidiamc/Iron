import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  Globe2,
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { EventItem } from '../../types';

interface StaffEventModalProps {
  eventToEdit?: EventItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffEventModal: React.FC<StaffEventModalProps> = ({
  eventToEdit,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [shortDescription, setShortDescription] = useState(eventToEdit?.short_description || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [date, setDate] = useState(eventToEdit?.date || '');
  const [startTime, setStartTime] = useState(eventToEdit?.start_time || '09:00');
  const [endTime, setEndTime] = useState(eventToEdit?.end_time || '12:00');
  const [location, setLocation] = useState(eventToEdit?.location || '');
  const [totalSpots, setTotalSpots] = useState<number>(eventToEdit?.total_spots || 10);
  const [estimatedHours, setEstimatedHours] = useState<number>(
    eventToEdit ? Math.round(eventToEdit.estimated_minutes / 60) : 3
  );
  const [organizer, setOrganizer] = useState(eventToEdit?.organizer || 'DMPS Connect');
  const [minAge, setMinAge] = useState<number>(eventToEdit?.min_age || 14);
  const [importantInfo, setImportantInfo] = useState(eventToEdit?.important_info || '');
  const [status, setStatus] = useState<string>(eventToEdit?.status || 'OPEN');

  // Languages multi-select
  const [languages, setLanguages] = useState<string[]>(
    eventToEdit?.languages || ['English', 'Español']
  );
  const availableLanguages = ['English', 'Español', 'Swahili', 'Arabic', 'Somali', 'Burmese', 'French', 'Karen'];

  // Requirements list
  const [requirements, setRequirements] = useState<string[]>(
    eventToEdit?.requirements || ['Puntualidad y compromiso']
  );
  const [newReq, setNewReq] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      setLanguages(languages.filter(l => l !== lang));
    } else {
      setLanguages([...languages, lang]);
    }
  };

  const handleAddRequirement = () => {
    if (newReq.trim()) {
      setRequirements([...requirements, newReq.trim()]);
      setNewReq('');
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !date || !startTime || !endTime || !location.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (totalSpots <= 0) {
      setError('Los cupos totales deben ser mayores a 0.');
      return;
    }

    if (languages.length === 0) {
      setError('Selecciona al menos un idioma requerido.');
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      short_description: shortDescription.trim() || title.trim(),
      description: description.trim() || shortDescription.trim() || title.trim(),
      date,
      start_time: startTime,
      end_time: endTime,
      location: location.trim(),
      total_spots: Number(totalSpots),
      estimated_minutes: Math.round(Number(estimatedHours) * 60),
      organizer: organizer.trim(),
      languages,
      requirements,
      min_age: Number(minAge),
      important_info: importantInfo.trim(),
      status,
    };

    try {
      if (eventToEdit) {
        await api.updateEvent(eventToEdit.id, payload);
      } else {
        await api.createEvent(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el evento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-[#07111F] border border-sky-500/30 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white">
              {eventToEdit ? 'Editar Evento Comunitario' : 'Crear Nuevo Evento'}
            </h3>
            <p className="text-xs text-slate-400">
              {eventToEdit ? `Código de evento: ${eventToEdit.code}` : 'Publicación de oportunidad de voluntariado en DMPS Connect'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-sm"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title & Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300 block">Título del Evento *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Distribución Comunitaria de Alimentos"
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Organizador *</label>
              <input
                type="text"
                required
                value={organizer}
                onChange={e => setOrganizer(e.target.value)}
                placeholder="DMPS Connect"
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Short description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">Descripción Corta *</label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              placeholder="Resumen de 1-2 líneas visible en las tarjetas públicas"
              className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Detailed description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">Descripción Completa *</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalla las actividades, responsabilidades y dinámicas del voluntariado..."
              className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none h-20"
            />
          </div>

          {/* Date, Time & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Fecha (YYYY-MM-DD) *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Hora Inicio *</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Hora Fin *</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Horas Estimadas *</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={estimatedHours}
                onChange={e => setEstimatedHours(parseFloat(e.target.value) || 1)}
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Location, Spots & Min Age */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-300 block">Ubicación / Sede *</label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ej. North High School Cafeteria, Des Moines, IA"
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Cupos Totales *</label>
              <input
                type="number"
                min="1"
                required
                value={totalSpots}
                onChange={e => setTotalSpots(parseInt(e.target.value, 10) || 1)}
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 block">Edad Mínima</label>
              <input
                type="number"
                min="10"
                max="99"
                value={minAge}
                onChange={e => setMinAge(parseInt(e.target.value, 10) || 14)}
                className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Languages selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 block">Idiomas Requeridos / Admitidos *</label>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map(lang => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all border ${
                    languages.includes(lang)
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-[#050A14] text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Requirements builder */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 block">Requisitos de Participación</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newReq}
                onChange={e => setNewReq(e.target.value)}
                placeholder="Ej. Ropa cómoda, calzado cerrado, permiso parental si menor de 16..."
                className="flex-1 p-2 rounded-xl bg-[#050A14] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
              >
                Agregar
              </button>
            </div>

            {requirements.length > 0 && (
              <ul className="space-y-1 pt-1">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#050A14] border border-slate-800">
                    <span className="text-slate-300">• {req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Important info */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">Información Importante / Logística</label>
            <input
              type="text"
              value={importantInfo}
              onChange={e => setImportantInfo(e.target.value)}
              placeholder="Ej. Estacionamiento gratuito en el lote B. Registro en recepción."
              className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Status selector */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300 block">Estado Inicial</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#050A14] border border-slate-800 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="OPEN">Publicado e Inscripciones Abiertas</option>
              <option value="DRAFT">Borrador no visible al público</option>
              <option value="CLOSED">Convocatoria Cerrada</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{eventToEdit ? 'Guardar Cambios' : 'Publicar Evento'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
