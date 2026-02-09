import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Home } from './pages/Home';
import { CalendarView } from './pages/CalendarView';
import { ShoppingList } from './pages/ShoppingList';
import { Inbox } from './pages/Inbox';
import { TaskManagement } from './pages/TaskManagement';
import { FamilySettings } from './pages/FamilySettings';
import { MonthlyScores } from './pages/MonthlyScores';
import { Login } from './pages/Login';
import { Home as HomeIcon, Calendar as CalendarIcon, ShoppingCart, Settings, ListTodo, Users, Trophy, LogOut } from 'lucide-react';
import { UserRole } from './types';

const MainLayout: React.FC = () => {
  const { currentUser, logout, getPendingApprovalsCount, familyName } = useApp();
  const [currentTab, setCurrentTab] = useState<'HOME' | 'CALENDAR' | 'SHOPPING' | 'INBOX' | 'TASK_MGMT' | 'FAMILY_SETTINGS' | 'SCORES'>('HOME');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Guard Clause for TypeScript mostly, though App wrapper handles it
  if (!currentUser) return <Login />;

  const pendingCount = getPendingApprovalsCount();

  const renderContent = () => {
    switch (currentTab) {
      case 'HOME': return <Home onNavigateToInbox={() => setCurrentTab('INBOX')} />;
      case 'CALENDAR': return <CalendarView />;
      case 'SHOPPING': return <ShoppingList />;
      case 'INBOX': return <Inbox onBack={() => setCurrentTab('HOME')} />;
      case 'TASK_MGMT': return <TaskManagement onBack={() => setCurrentTab('HOME')} />;
      case 'FAMILY_SETTINGS': return <FamilySettings onBack={() => setCurrentTab('HOME')} />;
      case 'SCORES': return <MonthlyScores onBack={() => setCurrentTab('HOME')} />;
      default: return <Home onNavigateToInbox={() => setCurrentTab('INBOX')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* Top Bar (Simplified) */}
      <div className="bg-white pt-4 px-4 flex justify-between items-center relative z-10">
        <div className="text-xs font-bold text-slate-300 tracking-[0.2em] uppercase">{familyName}</div>
        <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="p-2 rounded-full hover:bg-slate-100 relative">
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Profile Menu Overlay */}
      {showProfileMenu && (
        <div className="absolute top-14 right-4 bg-white p-4 rounded-2xl shadow-xl z-50 border border-slate-100 w-64 animate-in fade-in zoom-in duration-200">
          
          <div className="flex items-center mb-4 pb-4 border-b border-slate-100">
             <img src={currentUser.avatar} className="w-10 h-10 rounded-full mr-3" alt=""/>
             <div>
                 <p className="font-bold text-slate-800 text-sm">{currentUser.name}</p>
                 <p className="text-[10px] text-slate-400">{currentUser.email}</p>
             </div>
          </div>

          {/* Global Actions */}
           <div className="mb-4 pb-4 border-b border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Geral</h3>
              <button 
                  onClick={() => { setCurrentTab('SCORES'); setShowProfileMenu(false); }}
                  className="w-full flex items-center p-2 rounded-lg hover:bg-amber-50 text-amber-700 transition-colors"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Pontuações</span>
                </button>
           </div>

          {/* Manager Actions */}
          {currentUser.role === UserRole.MANAGER && (
             <div className="mb-4 pb-4 border-b border-slate-100 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Administração</h3>
                
                <button 
                  onClick={() => { setCurrentTab('TASK_MGMT'); setShowProfileMenu(false); }}
                  className="w-full flex items-center p-2 rounded-lg hover:bg-indigo-50 text-indigo-700 transition-colors"
                >
                  <ListTodo className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Gerenciar Tarefas</span>
                </button>

                <button 
                  onClick={() => { setCurrentTab('FAMILY_SETTINGS'); setShowProfileMenu(false); }}
                  className="w-full flex items-center p-2 rounded-lg hover:bg-indigo-50 text-indigo-700 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Config. Família</span>
                </button>
             </div>
          )}

          <button 
            onClick={logout}
            className="w-full flex items-center p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors mt-2"
          >
             <LogOut className="w-4 h-4 mr-2" />
             <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="h-full overflow-y-auto no-scrollbar" style={{ height: 'calc(100vh - 80px)' }}>
        {renderContent()}
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center z-20">
        <button 
          onClick={() => setCurrentTab('HOME')}
          className={`flex flex-col items-center space-y-1 ${currentTab === 'HOME' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <HomeIcon className={`w-6 h-6 ${currentTab === 'HOME' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        
        <button 
          onClick={() => setCurrentTab('CALENDAR')}
          className={`flex flex-col items-center space-y-1 ${currentTab === 'CALENDAR' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <CalendarIcon className={`w-6 h-6 ${currentTab === 'CALENDAR' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Calendário</span>
        </button>

        <button 
          onClick={() => setCurrentTab('SHOPPING')}
          className={`flex flex-col items-center space-y-1 ${currentTab === 'SHOPPING' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <ShoppingCart className={`w-6 h-6 ${currentTab === 'SHOPPING' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Lista</span>
        </button>
      </div>
    </div>
  );
}

const AppContent: React.FC = () => {
    const { currentUser } = useApp();
    
    if (!currentUser) {
        return <Login />;
    }

    return <MainLayout />;
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;