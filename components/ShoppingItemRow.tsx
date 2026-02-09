import React from 'react';
import { ShoppingItem, ShoppingItemStatus, UserRole, User } from '../types';
import { Check, X, ShoppingCart, Loader2 } from 'lucide-react';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  suggestedBy?: User;
  currentUser: User;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPurchase: (id: string) => void;
}

export const ShoppingItemRow: React.FC<ShoppingItemRowProps> = ({ item, suggestedBy, currentUser, onApprove, onReject, onPurchase }) => {
  const isManager = currentUser.role === UserRole.MANAGER;

  let bgColor = 'bg-white';
  let opacity = 'opacity-100';

  if (item.status === ShoppingItemStatus.PENDING) {
    bgColor = 'bg-slate-50';
    opacity = 'opacity-60';
  } else if (item.status === ShoppingItemStatus.PURCHASED) {
    bgColor = 'bg-green-50';
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border border-slate-100 shadow-sm mb-2 ${bgColor} ${opacity}`}>
      <div className="flex flex-col">
        <span className={`font-medium ${item.status === ShoppingItemStatus.PURCHASED ? 'line-through text-slate-500' : 'text-slate-800'}`}>
          {item.name}
        </span>
        <span className="text-xs text-slate-500">
          Sugerido por {suggestedBy?.name.split(' ')[0]}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Actions for Pending Items (Only Managers) */}
        {item.status === ShoppingItemStatus.PENDING && isManager && (
          <>
            <button onClick={() => onReject(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
              <X className="w-4 h-4" />
            </button>
            <button onClick={() => onApprove(item.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-full">
              <Check className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Status Display for Pending Items (Non-Managers) */}
        {item.status === ShoppingItemStatus.PENDING && !isManager && (
          <div className="flex items-center text-amber-500 text-xs font-medium bg-amber-50 px-2 py-1 rounded">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Aprovando
          </div>
        )}

        {/* Action for Approved Items (To Buy) */}
        {item.status === ShoppingItemStatus.APPROVED && isManager && (
          <button 
            onClick={() => onPurchase(item.id)}
            className="flex items-center px-3 py-1 bg-slate-800 text-white text-xs font-medium rounded-full active:scale-95 transition-transform"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Comprar
          </button>
        )}
        
        {item.status === ShoppingItemStatus.APPROVED && !isManager && (
           <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Na Lista</span>
        )}

        {/* Display for Purchased */}
        {item.status === ShoppingItemStatus.PURCHASED && (
          <span className="text-xs font-bold text-green-700 flex items-center">
            <Check className="w-3 h-3 mr-1" /> Comprado
          </span>
        )}
      </div>
    </div>
  );
};
