import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskCard } from '../components/TaskCard';
import { ChevronLeft, ChevronRight, Calendar, Columns, Square } from 'lucide-react';
import { UserRole } from '../types';

type ViewMode = 'MONTH' | 'WEEK' | 'DAY';

export const CalendarView: React.FC = () => {
  const { tasks, currentUser, users, markTaskAsDone, approveTask } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('MONTH');

  // --- Helpers ---
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const hasTaskOnDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.some(t => {
       // Check Visibility Logic inside here or assume global visible tasks passed to this func?
       // Doing a quick check on the date string match for ANY task first for performance, 
       // visual filtering happens in list render.
       return t.dueDate === dateString;
    });
  };

  // --- Navigation Logic ---
  const handleNavigation = (offset: number) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'MONTH') {
      newDate.setMonth(newDate.getMonth() + offset);
    } else if (viewMode === 'WEEK') {
      newDate.setDate(newDate.getDate() + (offset * 7));
    } else {
      newDate.setDate(newDate.getDate() + offset);
    }
    setSelectedDate(newDate);
  };

  // --- View Renderers ---

  const renderMonthView = () => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
    const totalSlots = daysInMonth + firstDayOfMonth;
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateToCheck = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d);
        const hasTasks = hasTaskOnDate(dateToCheck);
        const isSelected = isSameDay(dateToCheck, selectedDate);
        const isToday = isSameDay(dateToCheck, new Date());

        days.push(
            <button 
                key={d} 
                onClick={() => setSelectedDate(dateToCheck)}
                className={`h-10 w-10 mx-auto rounded-full flex flex-col items-center justify-center relative text-sm font-medium transition-all
                    ${isSelected 
                        ? 'bg-indigo-600 text-white shadow-md scale-105' 
                        : isToday 
                            ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                            : 'text-slate-700 hover:bg-slate-100'}
                `}
            >
                {d}
                {hasTasks && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-indigo-400 rounded-full"></span>
                )}
            </button>
        );
    }
    return (
        <>
            <div className="grid grid-cols-7 text-center mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <span key={i} className="text-[10px] font-bold text-slate-400 uppercase">{d}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
                {days}
            </div>
        </>
    );
  };

  const renderWeekView = () => {
    // Determine start of week (Sunday) based on selectedDate
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        
        const isSelected = isSameDay(day, selectedDate);
        const hasTasks = hasTaskOnDate(day);
        const dayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(day).slice(0, 3);
        const isToday = isSameDay(day, new Date());

        weekDays.push(
            <button 
                key={i}
                onClick={() => setSelectedDate(day)}
                className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all
                    ${isSelected 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : isToday
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'bg-white border border-slate-100'}
                `}
            >
                <span className={`text-[10px] uppercase font-bold mb-1 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {dayName}
                </span>
                <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {day.getDate()}
                </span>
                {hasTasks && (
                     <span className={`mt-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></span>
                )}
            </button>
        );
    }

    return (
        <div className="flex gap-2 mb-2">
            {weekDays}
        </div>
    );
  };

  const renderDayView = () => {
      // Just a focused header for the day
      return (
          <div className="flex flex-col items-center justify-center py-6 bg-indigo-50 rounded-2xl border border-indigo-100 mb-2">
              <span className="text-sm font-bold text-indigo-500 uppercase tracking-widest">
                {new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(selectedDate)}
              </span>
              <span className="text-4xl font-black text-slate-800 mt-1">
                {selectedDate.getDate()}
              </span>
              <span className="text-sm font-medium text-slate-500 mt-1 capitalize">
                  {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(selectedDate)}
              </span>
          </div>
      );
  };

  // --- Filter Tasks ---
  const filteredTasks = tasks.filter(task => {
    // Visibility Check
    let isVisible = false;
    if (task.assigneeId === currentUser.id) isVisible = true;
    else if (currentUser.role === UserRole.MANAGER) isVisible = true;
    else if (task.visibility === 'PUBLIC') isVisible = true;
    
    if (!isVisible) return false;

    return task.dueDate === selectedDate.toISOString().split('T')[0];
  });

  return (
    <div className="pb-24 pt-6 px-4">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 px-2">Calendário</h1>
          
          {/* View Toggle */}
          <div className="flex bg-slate-200 p-1 rounded-lg">
             <button 
                onClick={() => setViewMode('MONTH')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'MONTH' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="Mês"
             >
                <Calendar className="w-4 h-4" />
             </button>
             <button 
                onClick={() => setViewMode('WEEK')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'WEEK' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="Semana"
             >
                <Columns className="w-4 h-4 rotate-90" />
             </button>
             <button 
                onClick={() => setViewMode('DAY')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'DAY' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="Dia"
             >
                <Square className="w-4 h-4" />
             </button>
          </div>
      </div>

      {/* Calendar Area */}
      <div className={`${viewMode !== 'WEEK' ? 'bg-white rounded-2xl shadow-sm p-4 border border-slate-100' : ''} mb-6`}>
        
        {/* Nav Header */}
        <div className="flex items-center justify-between mb-4 px-1">
            <button onClick={() => handleNavigation(-1)} className="p-2 hover:bg-slate-50 rounded-full">
                <ChevronLeft className="w-5 h-5 text-slate-600"/>
            </button>
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
                {viewMode === 'MONTH' 
                   ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(selectedDate)
                   : viewMode === 'WEEK'
                     ? 'Semana'
                     : 'Dia'
                }
            </h2>
            <button onClick={() => handleNavigation(1)} className="p-2 hover:bg-slate-50 rounded-full">
                <ChevronRight className="w-5 h-5 text-slate-600"/>
            </button>
        </div>
        
        {/* Render Content */}
        {viewMode === 'MONTH' && renderMonthView()}
        {viewMode === 'WEEK' && renderWeekView()}
        {viewMode === 'DAY' && renderDayView()}

      </div>

      {/* Task List for Selected Day */}
      <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2 flex items-center justify-between">
            <span>
                {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)}
            </span>
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">
                {filteredTasks.length}
            </span>
        </h3>
        
        <div className="space-y-3">
            {filteredTasks.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">Nenhuma tarefa para este dia.</p>
                    <button 
                        onClick={() => {/* Logic to open add modal ideally */}}
                        className="text-indigo-600 text-xs font-bold mt-2 hover:underline"
                    >
                        Relaxar ou adicionar tarefa?
                    </button>
                </div>
            ) : (
                filteredTasks.map(task => {
                    const assignee = users.find(u => u.id === task.assigneeId);
                    return (
                        <TaskCard 
                            key={task.id}
                            task={task}
                            currentUser={currentUser}
                            assignee={assignee}
                            onComplete={markTaskAsDone}
                            onApprove={approveTask}
                        />
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
};