import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, X, AlertCircle, CheckCircle2, Info, XCircle, Calendar, HeartHandshake } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubmission?: (submissionId: string) => void;
  onNavigate?: (view: string, params?: any) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSelectSubmission,
  onNavigate,
}) => {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAuth();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />;
      case 'warning':
        return <AlertCircle className="text-orange-400 shrink-0" size={18} />;
      case 'error':
        return <XCircle className="text-rose-400 shrink-0" size={18} />;
      default:
        return <Info className="text-blue-400 shrink-0" size={18} />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#07111F] border border-[#16263D] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#16263D] flex items-center justify-between bg-[#0B192E]/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#1677FF]/20 text-[#258BFF]">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Notificaciones</h3>
              <p className="text-xs text-slate-400">
                {unreadCount > 0
                  ? `${unreadCount} ${unreadCount === 1 ? 'notificación sin leer' : 'notificaciones sin leer'}`
                  : 'Todas las notificaciones leídas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsRead()}
                className="text-xs text-[#258BFF] hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#1677FF]/20 transition-colors"
                title="Marcar todas como leídas"
              >
                <CheckCheck size={14} />
                <span className="hidden sm:inline">Marcar todas leídas</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-2 overflow-y-auto flex-1 divide-y divide-[#16263D]/50">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 px-4">
              <Bell size={36} className="mx-auto mb-3 text-slate-600 opacity-40" />
              <p className="font-medium text-slate-300">No tienes notificaciones</p>
              <p className="text-xs text-slate-500 mt-1">
                Aquí recibirás avisos de aceptación de eventos, listas de espera y aprobación de horas.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) markNotificationRead(n.id);
                  if (n.related_submission_id && onSelectSubmission) {
                    onSelectSubmission(n.related_submission_id);
                    onClose();
                  } else if (n.related_event_id && onNavigate) {
                    onNavigate('my-events');
                    onClose();
                  } else if (n.related_application_id && onNavigate) {
                    onNavigate('my-applications');
                    onClose();
                  }
                }}
                className={`p-3 rounded-xl transition-all cursor-pointer flex gap-3 items-start my-1 ${
                  !n.read
                    ? 'bg-[#1677FF]/10 border border-[#1677FF]/30 hover:bg-[#1677FF]/20'
                    : 'hover:bg-slate-800/40 opacity-80'
                }`}
              >
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-medium ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 shrink-0">
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  {n.related_submission_id && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#258BFF] mt-1.5 font-medium hover:underline">
                      Ver solicitud de horas →
                    </span>
                  )}
                  {n.related_event_id && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 mt-1.5 font-medium hover:underline">
                      Ver evento confirmado →
                    </span>
                  )}
                  {n.related_application_id && !n.related_event_id && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 mt-1.5 font-medium hover:underline">
                      Ver mis solicitudes →
                    </span>
                  )}
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-[#258BFF] shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#16263D] bg-[#0B192E]/40 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
