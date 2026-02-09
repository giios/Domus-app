import React, { useState, useEffect } from 'react';
import { User, TaskVisibility, Task } from '../types';
import { X, Calendar, Repeat, User as UserIcon, Clock } from 'lucide-react';
import { AddTaskParams } from '../context/AppContext';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSave: (data: AddTaskParams) => void;
  initialData?: Task; // Optional for editing
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, users, currentUser, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [visibility, setVisibility] = useState<TaskVisibility>(TaskVisibility.PUBLIC);
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // Load initial data if editing
  useEffect(() => {
    if (isOpen && initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setAssigneeId(initialData.assigneeId);
        setVisibility(initialData.visibility);
        setSelectedTime(initialData.time || '');
        
        if (initialData.recurrence && initialData.recurrence.length > 0) {
            setIsRecurrent(true);
            setSelectedDays(initialData.recurrence);
        } else {
            setIsRecurrent(false);
            setSelectedDate(initialData.dueDate);
        }
    } else if (isOpen && !initialData) {
        // Reset defaults for new task
        setTitle('');
        setDescription('');
        setAssigneeId(currentUser.id);
        setIsRecurrent(false);
        setSelectedDays([]);
        setSelectedTime('');
        setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, initialData, currentUser.id]);

  if (!isOpen) return null;

  const daysOfWeek = [
    { id: 0, label: 'D', name: 'Domingo' },
    { id: 1, label: 'S', name: 'Segunda' },
    { id: 2, label: 'T', name: 'Terça' },
    { id: 3, label: 'Q', name: 'Quarta' },
    { id: 4, label: 'Q', name: 'Quinta' },
    { id: 5, label: 'S', name: 'Sexta' },
    { id: 6, label: 'S', name: 'Sábado' },
  ];

  const toggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      assigneeId,
      visibility,
      dueDate: isRecurrent ? undefined : selectedDate,
      time: selectedTime || undefined,
      recurrenceDays: isRecurrent ? selectedDays : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-4 overflow-y-auto">
          <form id="newTaskForm" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">O que fazer?</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Tirar o lixo" 
                className="w-full text-lg font-medium border-b-2 border-slate-200 focus:border-indigo-500 outline-none py-2 placeholder:text-slate-300 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Orientações</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes de como realizar a tarefa..." 
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:border-indigo-500 outline-none transition-colors"
              />
            </div>

            {/* Assignee */}
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Responsável</label>
               <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                 {users.map(user => (
                   <button
                    key={user.id}
                    type="button"
                    onClick={() => setAssigneeId(user.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all whitespace-nowrap
                      ${assigneeId === user.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                    `}
                   >
                     <img src={user.avatar} className="w-5 h-5 rounded-full" alt="" />
                     <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                   </button>
                 ))}
               </div>
            </div>

            {/* Recurrence Switch */}
            <div className="bg-slate-50 rounded-xl p-1 flex">
              <button
                type="button"
                onClick={() => setIsRecurrent(false)}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${!isRecurrent ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <Calendar className="w-4 h-4 mr-2" /> Data Específica
              </button>
              <button
                type="button"
                onClick={() => setIsRecurrent(true)}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${isRecurrent ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <Repeat className="w-4 h-4 mr-2" /> Recorrente
              </button>
            </div>

            {/* Conditional Date/Time Inputs */}
            {isRecurrent ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Repetir nos dias</label>
                  <div className="flex justify-between gap-1">
                    {daysOfWeek.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                          ${selectedDays.includes(day.id) 
                            ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
                        `}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {selectedDays.length === 0 && <p className="text-xs text-red-500 mt-2">Selecione pelo menos um dia.</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Horário (Opcional)</label>
                  <div className="relative">
                     <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input 
                        type="time" 
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg p-3 pl-10 focus:border-indigo-500 outline-none"
                      />
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200 flex gap-4">
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data</label>
                    <input 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg p-3 focus:border-indigo-500 outline-none"
                    />
                 </div>
                 <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hora</label>
                    <input 
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-lg p-3 focus:border-indigo-500 outline-none"
                    />
                 </div>
              </div>
            )}
            
            {/* Visibility */}
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Visibilidade</label>
                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input 
                            type="radio" 
                            name="visibility" 
                            checked={visibility === TaskVisibility.PUBLIC}
                            onChange={() => setVisibility(TaskVisibility.PUBLIC)}
                            className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">Pública (Todos veem)</span>
                    </label>
                    <label className="flex items-center">
                        <input 
                            type="radio" 
                            name="visibility" 
                            checked={visibility === TaskVisibility.PERSONAL}
                            onChange={() => setVisibility(TaskVisibility.PERSONAL)}
                            className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">Pessoal</span>
                    </label>
                </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button 
            type="submit" 
            form="newTaskForm"
            disabled={!title || (isRecurrent && selectedDays.length === 0)}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
          >
            {initialData ? 'Salvar Alterações' : 'Criar Tarefa'}
          </button>
        </div>

      </div>
    </div>
  );
};