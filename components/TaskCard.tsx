import React, { useState } from 'react';
import { Task, TaskStatus, User, UserRole, TaskVisibility } from '../types';
import { CheckCircle2, Circle, Clock, Lock, Globe, ChevronDown, ChevronUp } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  currentUser: User;
  assignee?: User;
  onComplete: (id: string) => void;
  onApprove: (id: string) => void;
  isCompact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, currentUser, assignee, onComplete, onApprove, isCompact = false }) => {
  const isAssignee = currentUser.id === task.assigneeId;
  const isManager = currentUser.role === UserRole.MANAGER;
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    if (task.status === TaskStatus.DONE) return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    if (task.status === TaskStatus.WAITING_APPROVAL) return <Clock className="w-6 h-6 text-blue-500" />;
    return <Circle className="w-6 h-6 text-slate-300" />;
  };

  const getBorderColor = () => {
     if (task.status === TaskStatus.DONE) return 'border-green-100 bg-green-50';
     if (task.status === TaskStatus.WAITING_APPROVAL) return 'border-blue-100 bg-blue-50';
     return 'border-slate-100 bg-white';
  };

  const handleMainAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAssignee && task.status === TaskStatus.TODO) {
      onComplete(task.id);
    } else if (isManager && task.status === TaskStatus.WAITING_APPROVAL) {
      onApprove(task.id);
    }
  };

  const assigneeName = assignee?.name.split(' ')[0] || '?';

  if (isCompact) {
    return (
      <div className={`flex items-center p-3 rounded-lg border mb-2 ${getBorderColor()}`}>
        {/* Avatar & Name Column */}
        <div className="flex flex-col items-center mr-3 min-w-[3rem]">
          <img src={assignee?.avatar} alt={assignee?.name} className="w-8 h-8 rounded-full border border-white shadow-sm" />
          <span className="text-[10px] font-bold text-slate-500 mt-1 leading-none text-center truncate w-full">
            {assigneeName}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 border-l border-slate-100 pl-3">
          <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
          <div className="flex items-center text-xs text-slate-500 mt-0.5">
             {task.time && <span className="font-semibold text-slate-600 mr-2">{task.time}</span>}
             <span>{task.status === TaskStatus.WAITING_APPROVAL ? 'Aguardando' : task.status === TaskStatus.DONE ? 'Concluído' : 'Em andamento'}</span>
          </div>
        </div>
        
        {/* Action Icon */}
        <div className="ml-2">
            {getStatusIcon()}
        </div>
      </div>
    );
  }

  // Standard Card
  return (
    <div 
      className={`relative p-4 rounded-xl border-2 mb-3 shadow-sm transition-all ${getBorderColor()} ${task.status === TaskStatus.TODO ? 'hover:border-indigo-100' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start cursor-pointer">
        
        {/* Left Column: Avatar & Name */}
        <div className="flex flex-col items-center mr-4 min-w-[3.5rem] pt-1">
          <img 
            src={assignee?.avatar} 
            alt={assignee?.name} 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" 
          />
          <span className="text-[10px] font-bold text-slate-600 mt-1.5 text-center leading-tight w-full truncate">
            {assigneeName}
          </span>
        </div>

        {/* Center Column: Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {task.visibility === TaskVisibility.PERSONAL ? (
              <Lock className="w-3 h-3 text-slate-400" />
            ) : (
              <Globe className="w-3 h-3 text-slate-400" />
            )}
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              {task.visibility === TaskVisibility.PERSONAL ? 'Pessoal' : 'Público'}
            </span>
            
            {task.time && (
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded ml-1">
                {task.time}
              </span>
            )}
          </div>
          
          <h3 className={`font-semibold text-lg leading-tight ${task.status === TaskStatus.DONE ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
            {task.title}
          </h3>
        </div>

        {/* Right Column: Action Button */}
        <button 
          onClick={handleMainAction}
          disabled={!((isAssignee && task.status === TaskStatus.TODO) || (isManager && task.status === TaskStatus.WAITING_APPROVAL))}
          className="ml-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-transform"
        >
          {getStatusIcon()}
        </button>
      </div>

      {/* Description & Expanded Details */}
      {isExpanded && task.description && (
        <div className="mt-3 ml-[4.5rem] pt-3 border-t border-black/5 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-slate-600 bg-white/50 p-2 rounded-lg italic">
                "{task.description}"
            </p>
        </div>
      )}
      
      {task.status === TaskStatus.WAITING_APPROVAL && isAssignee && (
        <div className="mt-2 ml-[4.5rem] text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded inline-block">
          Aguardando pais validarem
        </div>
      )}

      {task.status === TaskStatus.WAITING_APPROVAL && isManager && (
        <div className="mt-2 ml-[4.5rem] text-xs text-blue-700 font-medium">
          Clique no relógio para aprovar
        </div>
      )}
    </div>
  );
};