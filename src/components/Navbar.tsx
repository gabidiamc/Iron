import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Bell,
  User as UserIcon,
  LogOut,
  Shield,
  Award,
  ChevronDown,
  Sparkles,
  Calendar,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
} from 'lucide-react';
import { NotificationModal } from './NotificationModal';
import { Logo } from './Logo';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSubmission?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSubmission,
}) => {
  const { user, profile, unreadCount, logout } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  if (!user) return null;

  const isStaff = user.role === 'STAFF' || user.role === 'ADMIN';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#07111F]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Portal Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onNavigate(isStaff ? 'staff-dashboard' : 'dashboard')}
          >
            <Logo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base sm:text-lg tracking-tight">
                  {isStaff ? 'Portal Staff DMPS' : 'Portal Voluntario'}
                </span>
                {isStaff && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-400 border border-blue-500/30">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Navigation for Desktop Volunteers */}
          {!isStaff && (
            <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/5">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600/20 text-sky-300 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => onNavigate('my-events')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentView === 'my-events'
                    ? 'bg-blue-600/20 text-sky-300 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Mis Eventos
              </button>
              <button
                onClick={() => onNavigate('my-applications')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentView === 'my-applications'
                    ? 'bg-blue-600/20 text-sky-300 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Mis Solicitudes
              </button>
              <button
                onClick={() => onNavigate('submit-hours')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentView === 'submit-hours'
                    ? 'bg-blue-600/20 text-sky-300 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Registrar Horas
              </button>
              <button
                onClick={() => onNavigate('my-hours')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentView === 'my-hours'
                    ? 'bg-blue-600/20 text-sky-300 border border-blue-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Historial de Horas
              </button>
              <button
                onClick={() => onNavigate('certificates')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'certificates' || currentView === 'my-certificates'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Award size={13} className="text-amber-400" />
                <span>Certificados</span>
              </button>
            </nav>
          )}

          {/* Right Actions: Notifications & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Link to Public Hub */}
            <button
              onClick={() => onNavigate('home')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-semibold transition-all"
            >
              <Sparkles size={13} />
              <span>Hub Público</span>
            </button>

            {/* Volunteer ID Badge (if volunteer) */}
            {!isStaff && profile?.volunteer_id && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold tracking-wider">
                <Award size={13} />
                <span>{profile.volunteer_id}</span>
              </div>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/40 transition-all active:scale-95"
              aria-label="Notificaciones"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-200 transition-all active:scale-95"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {profile?.first_name ? profile.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <span className="text-xs font-medium hidden sm:inline max-w-[120px] truncate">
                  {profile?.first_name ? `${profile.first_name}` : user.email.split('@')[0]}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Menu dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#07111F] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn backdrop-blur-xl"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {profile ? `${profile.first_name} ${profile.last_name}` : 'Usuario'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-400 font-bold font-mono uppercase tracking-wider">
                      {profile?.volunteer_id || user.role}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('home')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-950/40 transition-colors text-left"
                  >
                    <Sparkles size={14} />
                    <span>Hub Público DMPS Connect</span>
                  </button>

                  {!isStaff && (
                    <button
                      onClick={() => onNavigate('certificates')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors text-left"
                    >
                      <Award size={14} className="text-amber-400" />
                      <span>Mis Certificados</span>
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate(isStaff ? 'staff-profile' : 'profile')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <UserIcon size={14} />
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left mt-1"
                  >
                    <LogOut size={14} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onSelectSubmission={(subId) => {
          if (onOpenSubmission) onOpenSubmission(subId);
        }}
      />
    </>
  );
};
