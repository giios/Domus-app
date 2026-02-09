import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Trophy, Calendar, Medal, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface MonthlyScoresProps {
  onBack: () => void;
}

export const MonthlyScores: React.FC<MonthlyScoresProps> = ({ onBack }) => {
  const { users, tasks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigation Month
  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);

  // Helper to Calculate Points
  const calculateTaskPoints = (task: Task) => {
    // 0 Points if not done
    if (task.status !== TaskStatus.DONE && task.status !== TaskStatus.WAITING_APPROVAL) return 0;
    if (!task.completedAt) return 2; // Default if missing timestamp but marked done (legacy)

    // Base score 2
    let points = 2;

    // Check Time Rule
    if (task.time) {
      // Create Dates for comparison
      // Due DateTime
      const dueDateTime = new Date(`${task.dueDate}T${task.time}`);
      const completedDateTime = new Date(task.completedAt);

      // If completed before or equal to due time
      if (completedDateTime <= dueDateTime) {
        points = 3;
      }
    } else {
        // If no time is set, standard points (2)
        points = 2;
    }

    return points;
  };

  // Filter Tasks for selected month
  const monthlyTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate.getMonth() === currentDate.getMonth() && 
           taskDate.getFullYear() === currentDate.getFullYear() &&
           (task.status === TaskStatus.DONE || task.status === TaskStatus.WAITING_APPROVAL);
  });

  // Calculate Scores per User
  const userScores = users.map(user => {
    const userTasks = monthlyTasks.filter(t => t.assigneeId === user.id);
    const totalPoints = userTasks.reduce((acc, task) => acc + calculateTaskPoints(task), 0);
    return {
      ...user,
      totalPoints,
      tasksCompleted: userTasks.length
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-amber-400';
    if (index === 1) return 'text-slate-400';
    if (index === 2) return 'text-amber-700';
    return 'text-slate-200';
  };

  return (
    <div className="pb-24 pt-6 px-4 min-h-screen bg-slate-50">
      
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-800" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 ml-2">Pontuações Mensais</h1>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex justify-between items-center border border-slate-100">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-500">
          <ChevronLeft className="w-5 h-5"/>
        </button>
        <div className="flex items-center gap-2 font-bold text-slate-800 capitalize">
          <Calendar className="w-4 h-4 text-indigo-600" />
          {monthLabel}
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-500">
          <ChevronRight className="w-5 h-5"/>
        </button>
      </div>

      {/* Podium / Leaderboard */}
      <div className="space-y-4 mb-8">
        {userScores.map((user, index) => (
          <div key={user.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between relative overflow-hidden">
            {/* Rank Indicator */}
            <div className={`absolute top-0 left-0 bottom-0 w-1 ${index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-300' : index === 2 ? 'bg-amber-700' : 'bg-transparent'}`}></div>

            <div className="flex items-center pl-2">
               <div className="relative mr-4">
                  <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-slate-100" />
                  {index < 3 && (
                    <div className="absolute -top-2 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <Medal className={`w-5 h-5 ${getMedalColor(index)} drop-shadow-sm`} fill="currentColor" />
                    </div>
                  )}
               </div>
               <div>
                 <h3 className="font-bold text-slate-800">{user.name}</h3>
                 <p className="text-xs text-slate-500">{user.tasksCompleted} tarefas concluídas</p>
               </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600">{user.totalPoints}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pontos</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed History */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
          Histórico Detalhado
        </h2>
        
        {monthlyTasks.length === 0 ? (
          <div className="text-center py-8 opacity-50">
            <p className="text-sm text-slate-500">Nenhuma tarefa concluída neste mês.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthlyTasks.sort((a,b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()).map(task => {
              const points = calculateTaskPoints(task);
              const assignee = users.find(u => u.id === task.assigneeId);
              const completedTime = task.completedAt ? new Date(task.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';
              const wasOnTime = points === 3;

              return (
                <div key={task.id} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div className="flex items-center min-w-0 flex-1 mr-2">
                    <img src={assignee?.avatar} className="w-6 h-6 rounded-full mr-2 opacity-80" alt="" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                      <div className="flex items-center text-[10px] text-slate-400 gap-2">
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        {task.time && (
                          <span className={`flex items-center ${wasOnTime ? 'text-green-600' : 'text-orange-500'}`}>
                            <Clock className="w-3 h-3 mr-0.5" />
                            Meta: {task.time} • Feito: {completedTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-lg font-bold text-xs whitespace-nowrap
                    ${wasOnTime ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700'}
                  `}>
                    +{points} pts
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};