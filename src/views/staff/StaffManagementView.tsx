import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus,
  ShieldCheck,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Key,
  Building,
} from 'lucide-react';

export const StaffManagementView: React.FC = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('STAFF_INVITE_2026_SECRET');
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setErrorMsg('Todos los campos son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      await api.createStaff({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        role,
        secret_key: secretKey,
      });

      setSuccessMsg(`Cuenta de Staff creada exitosamente para ${firstName} ${lastName}.`);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la cuenta de staff.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Administración de Personal & Coordinadores
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Habilita nuevos usuarios autorizados para validar horas y gestionar el portal
        </p>
      </div>

      {/* Security Rule Callout */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3 text-xs text-purple-200">
        <ShieldCheck size={20} className="text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-semibold text-sm">
            Control Estricto de Roles (RBAC)
          </strong>
          <p className="mt-0.5 text-purple-300">
            El registro público en la app crea únicamente cuentas de <strong>VOLUNTARIO</strong>. Las cuentas de <strong>STAFF</strong> y <strong>ADMINISTRADOR</strong> deben ser provisionadas internamente desde este panel seguro.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 border-b border-[#16263D] pb-4 mb-6">
          <UserPlus size={20} className="text-purple-400" />
          <h2 className="text-base font-bold text-white">Crear Nueva Cuenta de Staff</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Nombre *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Andrés"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-purple-500 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Apellido *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Navarro"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-purple-500 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Correo Electrónico Institucional *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@volunteerportal.org"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-purple-500 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Contraseña Temporal *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-purple-500 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Rol a Asignar *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-purple-500 rounded-xl text-sm text-white outline-none"
              >
                <option value="STAFF">Coordinador de Staff (Revisar y Aprobar)</option>
                <option value="ADMIN">Administrador General del Sistema</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Clave Secreta de Autorización *
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-purple-500 rounded-xl text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#16263D]">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Crear Cuenta de Personal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
