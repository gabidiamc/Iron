import React from 'react';
import { HourStatus } from '../types';
import { Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: HourStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'APPROVED':
        return {
          label: 'Aprobada',
          bg: 'bg-green-500/10 text-green-400 border border-green-500/20',
          icon: CheckCircle2,
        };
      case 'PENDING':
        return {
          label: 'Pendiente',
          bg: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
          icon: Clock,
        };
      case 'NEEDS_CORRECTION':
        return {
          label: 'En Corrección',
          bg: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
          icon: AlertCircle,
        };
      case 'CORRECTED':
        return {
          label: 'Corregida',
          bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
          icon: RefreshCw,
        };
      case 'REJECTED':
        return {
          label: 'Rechazada',
          bg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          icon: XCircle,
        };
      case 'CANCELLED':
        return {
          label: 'Cancelada',
          bg: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
          icon: Ban,
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-500/10 text-slate-300 border border-slate-500/20',
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 gap-1',
    md: 'text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 gap-1.5',
    lg: 'text-xs uppercase font-bold tracking-wider px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full whitespace-nowrap ${config.bg} ${sizeClasses[size]}`}
    >
      {showIcon && <IconComponent size={iconSizes[size]} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
