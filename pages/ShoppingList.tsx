import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingItemRow } from '../components/ShoppingItemRow';
import { ShoppingItemStatus } from '../types';
import { Plus, ShoppingBag, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export const ShoppingList: React.FC = () => {
  const { shoppingItems, users, currentUser, addShoppingItem, approveShoppingItem, rejectShoppingItem, markItemPurchased } = useApp();
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Month Navigation State
  const [viewDate, setViewDate] = useState(new Date());

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName.trim()) {
      addShoppingItem(newItemName);
      setNewItemName('');
      setIsAdding(false);
      // If user adds item while viewing past/future, reset to current month to see it
      setViewDate(new Date());
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setViewDate(newDate);
  };

  // --- Filtering Logic ---
  
  const currentRealDate = new Date();
  const isCurrentMonthView = 
    viewDate.getMonth() === currentRealDate.getMonth() && 
    viewDate.getFullYear() === currentRealDate.getFullYear();

  // Helper: Check if a date string is in the viewDate month/year
  const isInViewMonth = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getMonth() === viewDate.getMonth() && d.getFullYear() === viewDate.getFullYear();
  };

  // 1. Pending/Approved Items (The "Active" List)
  // Logic: Active items ALWAYS float to the current month. They are never shown in past months.
  // If we are viewing a past month, this list should be empty (or strictly items created then? No, requirements say they move to next).
  // Implementation: We only show active items if we are on the Current Month View.
  const activePendingItems = isCurrentMonthView 
    ? shoppingItems.filter(i => i.status === ShoppingItemStatus.PENDING)
    : [];

  const activeApprovedItems = isCurrentMonthView
    ? shoppingItems.filter(i => i.status === ShoppingItemStatus.APPROVED)
    : [];

  // 2. Purchased Items (The "History" List)
  // Logic: Show items that were PURCHASED in the selected month.
  const purchasedItems = shoppingItems.filter(i => 
    i.status === ShoppingItemStatus.PURCHASED && 
    isInViewMonth(i.purchasedAt)
  );

  return (
    <div className="pb-24 pt-6 px-4">
      
      {/* Header & Month Nav */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Lista de Compras</h1>
        
        <div className="flex items-center bg-white rounded-full shadow-sm border border-slate-100 p-1">
             <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-50 rounded-full text-slate-500">
                <ChevronLeft className="w-4 h-4"/>
             </button>
             <div className="px-3 text-xs font-bold text-slate-700 capitalize w-24 text-center">
                {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: '2-digit' }).format(viewDate)}
             </div>
             <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-50 rounded-full text-slate-500">
                <ChevronRight className="w-4 h-4"/>
             </button>
        </div>
      </div>

      {/* Add Item Input (Only visible on Current Month) */}
      {isCurrentMonthView && (
        <>
            {isAdding ? (
                <form onSubmit={handleAddItem} className="mb-6 bg-white p-4 rounded-xl shadow-lg border border-indigo-100">
                <input 
                    autoFocus
                    type="text" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="O que precisamos comprar?"
                    className="w-full border-b-2 border-slate-200 pb-2 mb-3 text-lg focus:outline-none focus:border-indigo-500 bg-transparent"
                />
                <div className="flex justify-end gap-2">
                    <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-2 text-sm text-slate-500 font-medium"
                    >
                    Cancelar
                    </button>
                    <button 
                    type="submit" 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm"
                    >
                    Adicionar
                    </button>
                </div>
                </form>
            ) : (
                <button 
                onClick={() => setIsAdding(true)}
                className="w-full mb-6 py-3 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-500 font-medium hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                >
                <Plus className="w-5 h-5 mr-2" /> Adicionar Item
                </button>
            )}
        </>
      )}

      {/* Logic Message for Past Months */}
      {!isCurrentMonthView && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs mb-6 text-center border border-blue-100">
             Visualizando histórico. Itens não comprados foram movidos para o mês atual.
          </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        
        {/* Pending (Current Month Only) */}
        {activePendingItems.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-2 px-2 flex items-center">
                Aguardando Aprovação ({activePendingItems.length})
            </h2>
            {activePendingItems.map(item => (
              <ShoppingItemRow 
                key={item.id}
                item={item}
                currentUser={currentUser}
                suggestedBy={users.find(u => u.id === item.suggestedByUserId)}
                onApprove={approveShoppingItem}
                onReject={rejectShoppingItem}
                onPurchase={markItemPurchased}
              />
            ))}
          </div>
        )}

        {/* Active List (Current Month Only) */}
        {isCurrentMonthView && (
            <div>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-2 px-2 flex items-center">
                    A Comprar ({activeApprovedItems.length})
                </h2>
                {activeApprovedItems.length === 0 && activePendingItems.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-xl opacity-50 border border-slate-100">
                        <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2"/>
                        <p className="text-sm text-slate-400">Lista vazia.</p>
                    </div>
                ) : (
                    activeApprovedItems.map(item => (
                    <ShoppingItemRow 
                        key={item.id}
                        item={item}
                        currentUser={currentUser}
                        suggestedBy={users.find(u => u.id === item.suggestedByUserId)}
                        onApprove={approveShoppingItem}
                        onReject={rejectShoppingItem}
                        onPurchase={markItemPurchased}
                    />
                    ))
                )}
            </div>
        )}

        {/* Purchased (Filtered by Month) */}
        <div>
             <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center mt-8">
                  Comprados em {new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(viewDate)}
              </h2>
              {purchasedItems.length === 0 ? (
                  <p className="text-xs text-slate-300 italic px-2">Nada comprado neste período.</p>
              ) : (
                purchasedItems.map(item => (
                    <ShoppingItemRow 
                    key={item.id}
                    item={item}
                    currentUser={currentUser}
                    suggestedBy={users.find(u => u.id === item.suggestedByUserId)}
                    onApprove={approveShoppingItem}
                    onReject={rejectShoppingItem}
                    onPurchase={markItemPurchased}
                    />
                ))
              )}
        </div>
      </div>
    </div>
  );
};