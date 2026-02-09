import React, { useState } from 'react';
import { useApp, AddTaskParams } from '../context/AppContext';
import { Task, TaskStatus } from '../types';
import { Edit2, ArrowLeft, Calendar, Repeat } from 'lucide-react';
import { NewTaskModal } from '../components/NewTaskModal';

interface TaskManagementProps {
  onBack: () => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({ onBack }) => {
  const { tasks, users, currentUser, updateTaskGroup } = useApp();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Group tasks by Title to simulate "Task Definitions"
  // We only care about unique titles for active tasks to edit "The Rule"
  const uniqueTasksMap = new Map<string, Task>();
  
  tasks.forEach(task => {
      // Preference: Keep tasks that have recurrence data populated
      if (!uniqueTasksMap.has(task.title)) {
          uniqueTasksMap.set(task.title, task);
      } else {
          const existing = uniqueTasksMap.get(task.title);
          if (!existing?.recurrence && task.recurrence) {
              uniqueTasksMap.set(task.title, task);
          }
      }
  });

  const uniqueTasks = Array.from(uniqueTasksMap.values());

  const handleSaveEdit = (data: AddTaskParams) => {
    if (editingTask) {
        updateTaskGroup(editingTask.title, data);
        setEditingTask(null);
    }
  };

  const getRecurrenceLabel = (task: Task) => {
    if (!task.recurrence || task.recurrence.length === 0) return 'Data Única';
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return task.recurrence.map(d => days[d]).join(', ');
  };

  return (
    <div className="pb-24 pt-6 px-4 min-h-screen bg-slate-50">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-800" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 ml-2">Gerenciar Tarefas</h1>
      </div>

      <p className="text-sm text-slate-500 mb-6 bg-white p-4 rounded-xl border border-slate-100">
        Aqui você pode editar as regras das tarefas. Ao editar, todas as tarefas futuras pendentes com o mesmo nome serão atualizadas.
      </p>

      <div className="space-y-3">
        {uniqueTasks.map(task => {
            const assignee = users.find(u => u.id === task.assigneeId);
            return (
                <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-slate-800">{task.title}</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Responsável: <span className="font-medium text-slate-700">{assignee?.name.split(' ')[0]}</span>
                            </p>
                        </div>
                        <button 
                            onClick={() => setEditingTask(task)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg self-start">
                        {task.recurrence ? <Repeat className="w-3 h-3 text-slate-400"/> : <Calendar className="w-3 h-3 text-slate-400"/>}
                        <span className="text-slate-600 font-medium">
                            {getRecurrenceLabel(task)}
                        </span>
                    </div>
                </div>
            );
        })}
      </div>

      <NewTaskModal 
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        users={users}
        currentUser={currentUser}
        onSave={handleSaveEdit}
        initialData={editingTask || undefined}
      />
    </div>
  );
};