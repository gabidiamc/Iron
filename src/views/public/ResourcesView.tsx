import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, Download, Search, FileText, Globe2, ShieldCheck, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';
import { ResourceItem } from '../../types';

interface ResourcesViewProps {
  onNavigate: (view: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({ onNavigate }) => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadResources();
  }, [category]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await api.getPublicResources(category);
      setResources(res.resources || []);
    } catch (err) {
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'ALL', label: 'Todos los Recursos' },
    { id: 'voluntariado', label: 'Voluntariado' },
    { id: 'informacion', label: 'Información y Enlaces' },
    { id: 'capacitaciones', label: 'Capacitaciones' },
  ];

  const filtered = resources.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-sky-500/30 text-sky-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Biblioteca & Documentos</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Recursos Comunitarios
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Guías, materiales formativos, enlaces a programas familiares y reglamentos de servicio para estudiantes y voluntarios.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar recurso o guía..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#07111F] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === c.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resources List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-[#07111F]/60 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#07111F]/60 border border-slate-800 rounded-2xl p-8 space-y-2">
          <p className="text-slate-300 font-semibold text-sm">No se encontraron recursos</p>
          <p className="text-slate-500 text-xs">Intenta con otro término de búsqueda o categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="bg-[#07111F]/90 border border-slate-800/90 hover:border-sky-500/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-lg group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-sky-300 px-2 py-0.5 rounded border border-slate-700">
                      {res.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
                    {res.description}
                  </p>
                </div>
              </div>

              {res.url ? (
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shrink-0 shadow-md transition-all"
                >
                  <span>Abrir Enlace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={() => onNavigate('faq')}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 shrink-0 transition-all"
                >
                  <span>Ver en FAQ</span>
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* DMPS Info Direct Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-[#07111F] to-sky-950/30 border border-sky-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold text-white">¿Buscas recursos escolares o del distrito?</h3>
          <p className="text-xs text-slate-300">
            Visita DMPS Info para conocer programas de nutrición, transporte, inscripciones y calendarios escolares.
          </p>
        </div>
        <a
          href="https://info.familiasdmps.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-2 shrink-0 shadow-md font-sans"
        >
          <span>Ir a DMPS Info</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
