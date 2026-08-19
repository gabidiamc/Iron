import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Award,
  Phone,
  GraduationCap,
  Building,
  Globe,
  FileText,
  Camera,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface ProfileSetupViewProps {
  onNavigate: (view: string) => void;
}

export const ProfileSetupView: React.FC<ProfileSetupViewProps> = ({ onNavigate }) => {
  const { profile, updateLocalProfile } = useAuth();

  const [phone, setPhone] = useState(profile?.phone || '');
  const [school, setSchool] = useState(profile?.school || '');
  const [grade, setGrade] = useState(profile?.grade || '');
  const [organization, setOrganization] = useState(profile?.organization || '');
  const [languages, setLanguages] = useState<string[]>(
    profile?.languages && profile.languages.length > 0 ? profile.languages : ['Español']
  );
  const [newLang, setNewLang] = useState('');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const handleAvatarPreset = (color: string) => {
    setAvatarUrl(color);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school.trim() || !phone.trim()) {
      setError('Por favor ingresa tu número de teléfono y tu escuela.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.updateProfile({
        phone: phone.trim(),
        school: school.trim(),
        grade: grade.trim(),
        organization: organization.trim(),
        languages,
        bio: bio.trim(),
        avatar_url: avatarUrl,
      });

      updateLocalProfile(res.profile);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al guardar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-[#050A14]">
      <div className="w-full max-w-2xl bg-[#07111F] border border-[#16263D] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-[#16263D] pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-[#258BFF] tracking-wider">
                Paso 2 de 2
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">
                Completa tu Perfil de Voluntario
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Esta información permitirá a los coordinadores validar tus horas comunitarias.
              </p>
            </div>

            {/* Generated Unique Volunteer ID */}
            <div className="bg-[#0B192E] border border-[#1677FF]/40 rounded-2xl p-3 sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                ID Único de Voluntario
              </span>
              <div className="flex items-center gap-1.5 text-base font-mono font-bold text-[#258BFF] mt-0.5">
                <Award size={18} />
                <span>{profile?.volunteer_id || 'VOL-00001'}</span>
              </div>
              <span className="text-[9px] text-slate-500 block mt-0.5">
                Generado automáticamente (Inmutable)
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info Display (Readonly) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0B192E]/60 p-4 rounded-2xl border border-[#16263D]">
            <div>
              <span className="text-[11px] text-slate-400 font-medium">Nombre Completo:</span>
              <p className="text-sm font-semibold text-white mt-0.5">
                {profile?.first_name} {profile?.last_name}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium">Correo Electrónico:</span>
              <p className="text-sm font-semibold text-white mt-0.5 truncate">{profile?.email}</p>
            </div>
          </div>

          {/* Phone & School */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Número de Teléfono *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Escuela o Colegio *
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Ej. Lincoln High School"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grade & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Grado Escolar (Opcional)
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Ej. 10° Grado / Preparatoria"
                className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Organización / Club (Opcional)
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Ej. Club de Servicio Comunitario"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Idiomas que dominas
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1677FF]/15 border border-[#1677FF]/30 text-[#258BFF] rounded-full text-xs font-medium"
                >
                  <Globe size={13} />
                  <span>{lang}</span>
                  {languages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="text-slate-400 hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLang}
                onChange={(e) => setNewLang(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLanguage();
                  }
                }}
                placeholder="Agregar otro idioma (ej. Francés, Lengua de señas)"
                className="flex-1 px-4 py-2 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={handleAddLanguage}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Biografía Breve (Opcional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 text-slate-500" size={17} />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Cuéntanos sobre tus intereses comunitarios, experiencia previa o motivaciones..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#16263D] flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Podrás editar estos datos en cualquier momento desde Mi Perfil.
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#1677FF] to-[#258BFF] hover:from-[#1366dc] hover:to-[#1e78e0] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#1677FF]/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Guardar y Entrar al Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
