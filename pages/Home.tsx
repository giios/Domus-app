import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskCard } from '../components/TaskCard';
import { TaskStatus, UserRole } from '../types';
import { Bell, Plus, Camera } from 'lucide-react';
import { NewTaskModal } from '../components/NewTaskModal';

interface HomeProps {
  onNavigateToInbox: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateToInbox }) => {
  const { currentUser, tasks, users, markTaskAsDone, approveTask, getPendingApprovalsCount, updateUserAvatar, addTask } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // My Tasks: Assigned to me, visible to me (handled by filter logic usually, but simplified here)
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id && t.status !== TaskStatus.DONE);
  
  // Family Radar: Tasks assigned to others, PUBLIC visibility OR I am manager watching personal tasks
  // But strictly for "Radar", let's show Public tasks of others OR Personal tasks if I am Manager
  const familyTasks = tasks.filter(t => {
    if (t.assigneeId === currentUser.id) return false; // Exclude mine
    if (t.status === TaskStatus.DONE) return false; // Hide done in radar to reduce clutter, or keep recent? Let's hide.
    
    // If I am a manager, I see everything.
    if (currentUser.role === UserRole.MANAGER) return true;
    
    // If I am a member, I only see Public tasks of others
    return t.visibility === 'PUBLIC';
  });

  const pendingCount = getPendingApprovalsCount();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateUserAvatar(currentUser.id, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white p-6 rounded-b-3xl shadow-sm mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Olá, {currentUser.name.split(' ')[0]}!</h1>
            <p className="text-slate-500">Você tem <span className="font-bold text-indigo-600">{myTasks.length}</span> tarefas hoje.</p>
          </div>
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
             <img src={currentUser.avatar} alt="Profile" className="w-12 h-12 rounded-full border-2 border-indigo-100 object-cover" />
             
             {/* Edit Overlay */}
             <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
             </div>

             <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
               ★ {currentUser.stars}
             </div>
             
             {/* Hidden Input */}
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*"
               onChange={handleFileChange}
             />
          </div>
        </div>

        {/* Manager Inbox Button */}
        {currentUser.role === UserRole.MANAGER && (
          <button 
            onClick={onNavigateToInbox}
            className="w-full bg-slate-900 text-white p-3 rounded-xl flex items-center justify-between shadow-lg shadow-slate-200 active:scale-95 transition-transform"
          >
            <div className="flex items-center">
              <div className="relative">
                <Bell className="w-5 h-5 mr-3" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                )}
              </div>
              <span className="font-medium">Central de Aprovações</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Main Section: My Tasks */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <span className="bg-indigo-100 w-2 h-6 rounded-full mr-2"></span>
          Suas Tarefas
        </h2>
        
        {myTasks.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400">Tudo feito por aqui! 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                currentUser={currentUser}
                assignee={currentUser}
                onComplete={markTaskAsDone}
                onApprove={approveTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* Secondary Section: Family Radar */}
      <div className="px-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
           <span className="bg-amber-100 w-2 h-6 rounded-full mr-2"></span>
           Radar da Família
        </h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {familyTasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-2">A casa está tranquila.</p>
          ) : (
            familyTasks.slice(0, 5).map(task => {
              const assignee = users.find(u => u.id === task.assigneeId);
              return (
                <TaskCard 
                  key={task.id}
                  task={task}
                  currentUser={currentUser}
                  assignee={assignee}
                  onComplete={() => {}} // Disabled in compact view usually
                  onApprove={approveTask}
                  isCompact={true}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button for New Task */}
      {currentUser.role === UserRole.MANAGER && (
        <button 
          onClick={() => setIsTaskModalOpen(true)}
          className="fixed bottom-24 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-300 hover:bg-indigo-700 active:scale-95 transition-all z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modal */}
      <NewTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        users={users}
        currentUser={currentUser}
        onSave={addTask}
      />

    </div>
  );
};
