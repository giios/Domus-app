import React from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus, ShoppingItemStatus } from '../types';
import { Check, X, ArrowLeft } from 'lucide-react';

interface InboxProps {
  onBack: () => void;
}

export const Inbox: React.FC<InboxProps> = ({ onBack }) => {
  const { notifications, tasks, shoppingItems, users, approveTask, rejectTask, approveShoppingItem, rejectShoppingItem } = useApp();

  // Filter only pending actionable items for simplicity in this demo view
  // In a real app, notifications would link to these items.
  // Here we reconstruct the "Pending List" derived from state to ensure consistency.
  
  const pendingTasks = tasks.filter(t => t.status === TaskStatus.WAITING_APPROVAL);
  const pendingShopping = shoppingItems.filter(i => i.status === ShoppingItemStatus.PENDING);

  return (
    <div className="pb-24 pt-6 px-4 bg-slate-50 min-h-screen">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-800" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 ml-2">Central de Aprovações</h1>
      </div>

      <div className="space-y-6">
        {/* Task Approvals */}
        <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Tarefas para Validar</h2>
          {pendingTasks.length === 0 ? (
            <p className="text-sm text-slate-400 bg-white p-4 rounded-xl border border-slate-100">Nenhuma tarefa pendente.</p>
          ) : (
            pendingTasks.map(task => {
              const user = users.find(u => u.id === task.assigneeId);
              return (
                <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-3">
                  <div className="flex items-center mb-2">
                    <img src={user?.avatar} className="w-6 h-6 rounded-full mr-2" alt=""/>
                    <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
                    <span className="text-sm text-slate-500 ml-1">concluiu:</span>
                  </div>
                  <p className="text-lg font-medium text-slate-800 mb-4">{task.title}</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => rejectTask(task.id)}
                      className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50"
                    >
                      Refazer
                    </button>
                    <button 
                      onClick={() => approveTask(task.id)}
                      className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200"
                    >
                      Aprovar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Shopping Approvals */}
        <section>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Sugestões de Compra</h2>
          {pendingShopping.length === 0 ? (
            <p className="text-sm text-slate-400 bg-white p-4 rounded-xl border border-slate-100">Nenhum item pendente.</p>
          ) : (
            pendingShopping.map(item => {
              const user = users.find(u => u.id === item.suggestedByUserId);
              return (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <img src={user?.avatar} className="w-5 h-5 rounded-full mr-2" alt=""/>
                      <span className="text-xs text-slate-500">sugeriu</span>
                    </div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => rejectShoppingItem(item.id)}
                      className="p-2 rounded-full bg-red-50 text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => approveShoppingItem(item.id)}
                      className="p-2 rounded-full bg-green-50 text-green-600"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
};
