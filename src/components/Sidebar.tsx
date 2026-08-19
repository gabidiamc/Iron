import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  HeartHandshake,
  Inbox,
  Users,
  BarChart3,
  ShieldCheck,
  User,
  UserPlus,
  LogOut,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  pendingCount = 0,
}) => {
  const { user, profile, logout } = useAuth();

  const menuItems = [
    { id: 'staff-dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'staff-events', label: 'Gestión de Eventos', icon: Calendar },
    { id: 'staff-applications', label: 'Solicitudes de Eventos', icon: HeartHandshake },
    {
      id: 'staff-submissions',
      label: 'Aprobación de Horas',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { id: 'staff-volunteers', label: 'Directorio Voluntarios', icon: Users },
    { id: 'staff-stats', label: 'Estadísticas & Reportes', icon: BarChart3 },
    { id: 'staff-audit', label: 'Registro de Auditoría', icon: ShieldCheck },
    { id: 'staff-management', label: 'Personal & Roles', icon: UserPlus },
    { id: 'staff-profile', label: 'Mi Cuenta', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#07111F] border-r border-white/10 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Staff Header info */}
      <div className="p-5 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shadow-[0_0_12px_rgba(37,139,255,0.2)]">
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">
              {profile ? `${profile.first_name} ${profile.last_name}` : 'Staff'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                {user?.role === 'ADMIN' ? 'ADMINISTRADOR' : 'STAFF'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 py-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
          Coordinación DMPS
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 border-t border-white/5 mt-2">
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-sky-400 hover:bg-sky-950/40 border border-sky-500/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-sky-400" />
              <span>Ver Hub Público</span>
            </div>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-white/10 bg-[#050A14]/50">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {profile?.first_name ? profile.first_name[0] : 'S'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">
              {profile ? `${profile.first_name} ${profile.last_name}` : 'Staff'}
            </p>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest">
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors font-medium"
        >
          <LogOut size={15} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
