import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, familyName } = useApp();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
        const success = login(email);
        if (!success) {
            setError('E-mail não encontrado nesta família.');
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 mb-4">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">{familyName}</h1>
                <p className="text-slate-500 mt-2">Gestão doméstica simples e eficiente.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Entrar</h2>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Seu E-mail</label>
                        <input 
                            autoFocus
                            type="email" 
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            placeholder="exemplo@familia.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        />
                        {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-95 transition-all"
                        >
                            Acessar App <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
                
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400">
                        Dica: Use <span className="font-mono bg-slate-100 px-1 rounded">carlos@familia.com</span> para testar.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};