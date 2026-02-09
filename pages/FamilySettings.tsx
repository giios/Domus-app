import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Edit2, Trash2, Plus, Users, Settings, ShieldCheck, Trophy, Bell } from 'lucide-react';
import { User, UserRole } from '../types';
import { UserModal } from '../components/UserModal';

interface FamilySettingsProps {
  onBack: () => void;
}

export const FamilySettings: React.FC<FamilySettingsProps> = ({ onBack }) => {
  const { 
    familyName, 
    setFamilyName, 
    users, 
    currentUser, 
    addUser, 
    updateUser, 
    removeUser,
    settings,
    updateSettings 
  } = useApp();

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempFamilyName, setTempFamilyName] = useState(familyName);

  const handleSaveUser = (name: string, email: string, role: UserRole) => {
    if (editingUser) {
      updateUser(editingUser.id, name, role); // In a real app we might update email too
    } else {
      addUser(name, email, role);
    }
  };

  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleAddUserClick = () => {
    setEditingUser(undefined);
    setIsUserModalOpen(true);
  };

  const handleSaveFamilyName = () => {
    if (tempFamilyName.trim()) {
      setFamilyName(tempFamilyName);
      setIsEditingName(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="pb-24 pt-6 px-4 min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-800" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 ml-2">Configurações da Família</h1>
      </div>

      <div className="space-y-6">

        {/* Family Name Section */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Identidade
            </h2>
          </div>
          
          {isEditingName ? (
            <div className="flex gap-2">
              <input 
                autoFocus
                type="text" 
                value={tempFamilyName}
                onChange={(e) => setTempFamilyName(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-bold"
              />
              <button onClick={handleSaveFamilyName} className="bg-indigo-600 text-white px-4 rounded-lg font-medium text-sm">OK</button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{familyName}</h3>
              <button onClick={() => setIsEditingName(true)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* Members Section */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Membros ({users.length})
            </h2>
            <button 
              onClick={handleAddUserClick}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" /> Adicionar
            </button>
          </div>

          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                <div className="flex items-center">
                  <img src={user.avatar} className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm" alt={user.name} />
                  <div>
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <div className="flex gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide
                        ${user.role === UserRole.MANAGER ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}
                        `}>
                        {user.role === UserRole.MANAGER ? 'Gestor' : 'Membro'}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center">
                            {user.email}
                        </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => handleEditUserClick(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {/* Prevent deleting yourself */}
                  {user.id !== currentUser.id && (
                    <button onClick={() => removeUser(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
            Preferências
          </h2>

          <div className="space-y-4">
            
            {/* Approval Setting */}
            <div className="flex items-center justify-between">
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                   <ShieldCheck className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="font-bold text-slate-800 text-sm">Aprovação Obrigatória</p>
                   <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                     Gestores devem validar tarefas para serem concluídas.
                   </p>
                 </div>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.requireApproval}
                    onChange={(e) => updateSettings({ requireApproval: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            <div className="w-full h-px bg-slate-50"></div>

            {/* Gamification Setting */}
            <div className="flex items-center justify-between">
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                   <Trophy className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="font-bold text-slate-800 text-sm">Gamificação</p>
                   <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                     Ganhar estrelas ao completar tarefas.
                   </p>
                 </div>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.enableGamification}
                    onChange={(e) => updateSettings({ enableGamification: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            <div className="w-full h-px bg-slate-50"></div>

            {/* Notification Setting */}
             <div className="flex items-center justify-between">
               <div className="flex items-start gap-3">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                   <Bell className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="font-bold text-slate-800 text-sm">Notificações</p>
                   <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                     Alertas sobre novas tarefas e aprovações.
                   </p>
                 </div>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.enableNotifications}
                    onChange={(e) => updateSettings({ enableNotifications: e.target.checked })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

          </div>
        </section>

      </div>

      <UserModal 
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        initialData={editingUser}
      />
    </div>
  );
};