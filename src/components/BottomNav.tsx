import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, History, Award, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationModal } from './NotificationModal';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSubmission?: (id: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenSubmission,
}) => {
  const { unreadCount } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'my-hours', label: 'Mis Horas', icon: History },
    { id: 'submit-hours', label: 'Registrar', icon: PlusCircle, isPrimary: true },
    { id: 'certificates', label: 'Certificados', icon: Award },
    { id: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07111F]/90 backdrop-blur-md border-t border-white/10 px-2 py-1.5">
        <div className="grid grid-cols-5 items-center justify-items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'certificates' && currentView === 'my-certificates');

            if (item.isPrimary) {
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="flex flex-col items-center justify-center -mt-5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 active:scale-95 transition-all">
                    <PlusCircle size={24} />
                  </div>
                  <span className="text-[10px] mt-1 font-semibold text-blue-400">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={19} className={isActive ? (item.id === 'certificates' ? 'text-amber-400' : 'text-blue-400') : ''} />
                <span className={`text-[10px] mt-1 font-semibold ${isActive && item.id === 'certificates' ? 'text-amber-400' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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

