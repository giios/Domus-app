import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { X, User as UserIcon, Shield, Mail } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, email: string, role: UserRole) => void;
  initialData?: User;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
    } else {
      setName('');
      setEmail('');
      setRole(UserRole.MEMBER);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onSave(name, email, role);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'Editar Membro' : 'Novo Membro'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome</label>
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pedro" 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">E-mail</label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pedro@familia.com" 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 pl-10 outline-none focus:border-indigo-500 transition-colors"
                />
            </div>
            {!initialData && (
                <p className="text-[10px] text-slate-400 mt-1">
                    Enviaremos um link de convite para este e-mail.
                </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Permissão</label>
             <div className="flex gap-3">
               <button
                 type="button"
                 onClick={() => setRole(UserRole.MEMBER)}
                 className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                    ${role === UserRole.MEMBER ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200'}
                 `}
               >
                 <UserIcon className="w-6 h-6 mb-1" />
                 <span className="text-sm font-medium">Membro</span>
                 <span className="text-[10px] opacity-70">Filho(a)</span>
               </button>

               <button
                 type="button"
                 onClick={() => setRole(UserRole.MANAGER)}
                 className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                    ${role === UserRole.MANAGER ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200'}
                 `}
               >
                 <Shield className="w-6 h-6 mb-1" />
                 <span className="text-sm font-medium">Gestor</span>
                 <span className="text-[10px] opacity-70">Pai/Mãe</span>
               </button>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={!name.trim() || !email.trim()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 disabled:opacity-50 mt-4"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
};