import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import {
  ShieldCheck,
  Search,
  Clock,
  User,
  Activity,
  FileCheck,
  XCircle,
  AlertCircle,
  Key,
} from 'lucide-react';

export const StaffAuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAuditLogs().then((res) => {
      setLogs(res.logs);
      setLoading(false);
    }).catch((err) => {
      console.error('Error fetching audit logs:', err);
      setLoading(false);
    });
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'APPROVE_HOURS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
            <FileCheck size={12} /> Aprobación
          </span>
        );
      case 'REJECT_HOURS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">
            <XCircle size={12} /> Rechazo
          </span>
        );
      case 'REQUEST_CORRECTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-[10px] border border-orange-500/30">
            <AlertCircle size={12} /> Corrección Pedida
          </span>
        );
      case 'CORRECT_SUBMISSION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[10px] border border-sky-500/30">
            <Activity size={12} /> Corrección Enviada
          </span>
        );
      case 'CREATE_STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold text-[10px] border border-purple-500/30">
            <Key size={12} /> Alta de Staff
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Registro de Auditoría de Seguridad
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            {logs.length} eventos
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Bitácora inmutable de todas las aprobaciones, revisiones y cambios administrativos en el sistema
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-5 sm:p-6 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <ShieldCheck size={40} className="mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No hay registros de auditoría aún.</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-x-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-[#0B192E]/60 border border-[#16263D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300 shrink-0">
                    <User size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {getActionBadge(log.action)}
                      <span className="font-bold text-white">{log.actor_name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">({log.actor_role})</span>
                    </div>
                    <p className="text-slate-300">
                      {log.details ? JSON.stringify(log.details) : 'Acción completada'}
                    </p>
                  </div>
                </div>

                <div className="text-slate-500 text-[11px] font-mono shrink-0 text-left sm:text-right">
                  <span className="flex items-center gap-1 sm:justify-end">
                    <Clock size={12} />
                    {new Date(log.created_at).toLocaleString('es-ES')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
