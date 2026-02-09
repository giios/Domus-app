import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Task, ShoppingItem, Notification, UserRole, TaskStatus, ShoppingItemStatus, TaskVisibility, AppSettings } from '../types';
import { MOCK_USERS, MOCK_TASKS, MOCK_SHOPPING_ITEMS, MOCK_NOTIFICATIONS } from '../data/mockData';

export interface AddTaskParams {
  title: string;
  description: string;
  assigneeId: string;
  visibility: TaskVisibility;
  dueDate?: string; // For specific date
  time?: string; // HH:mm
  recurrenceDays?: number[]; // [0, 1, 3] for Sun, Mon, Wed
}

interface AppContextType {
  currentUser: User | null; // Nullable for auth
  users: User[];
  tasks: Task[];
  shoppingItems: ShoppingItem[];
  notifications: Notification[];
  familyName: string;
  settings: AppSettings;
  
  // Auth
  login: (email: string) => boolean;
  logout: () => void;
  
  // Navigation & User
  switchUser: (userId: string) => void;
  updateUserAvatar: (userId: string, newAvatarUrl: string) => void;
  
  // Family Management
  setFamilyName: (name: string) => void;
  addUser: (name: string, email: string, role: UserRole) => void;
  updateUser: (id: string, name: string, role: UserRole) => void;
  removeUser: (id: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Tasks
  addTask: (params: AddTaskParams) => void;
  updateTaskGroup: (originalTitle: string, params: AddTaskParams) => void;
  deleteTask: (taskId: string) => void;
  markTaskAsDone: (taskId: string) => void;
  approveTask: (taskId: string) => void;
  rejectTask: (taskId: string) => void;

  // Shopping
  addShoppingItem: (name: string) => void;
  approveShoppingItem: (itemId: string) => void;
  rejectShoppingItem: (itemId: string) => void;
  markItemPurchased: (itemId: string) => void;

  // Helpers
  getPendingApprovalsCount: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Start logged out
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(MOCK_SHOPPING_ITEMS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  
  const [familyName, setFamilyName] = useState("Família Silva");
  const [settings, setSettings] = useState<AppSettings>({
    requireApproval: true,
    enableGamification: true,
    enableNotifications: true
  });

  // --- Auth Logic ---

  const login = (email: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        setCurrentUser(user);
        return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const updateUserAvatar = (userId: string, newAvatarUrl: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, avatar: newAvatarUrl } : user
    );
    setUsers(updatedUsers);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? ({ ...prev, avatar: newAvatarUrl }) : null);
    }
  };

  // --- Family Management Logic ---

  const addUser = (name: string, email: string, role: UserRole) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      stars: 0
    };
    setUsers([...users, newUser]);
    
    // Simulate sending email
    console.log(`[SIMULAÇÃO] Enviando convite para ${email}...`);
    alert(`Convite enviado para ${email}!`);
  };

  const updateUser = (id: string, name: string, role: UserRole) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, name, role } : u));
    if (currentUser && currentUser.id === id) {
        setCurrentUser(prev => prev ? ({ ...prev, name, role }) : null);
    }
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    // Also remove tasks assigned to this user to avoid broken UI
    setTasks(prev => prev.filter(t => t.assigneeId !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // --- Task Logic ---

  const addTask = ({ title, description, assigneeId, visibility, dueDate, time, recurrenceDays }: AddTaskParams) => {
    if (!currentUser) return;

    const newTasks: Task[] = [];
    
    if (dueDate) {
      newTasks.push({
        id: Math.random().toString(36).substr(2, 9),
        title,
        description,
        assigneeId,
        creatorId: currentUser.id,
        visibility,
        status: TaskStatus.TODO,
        dueDate,
        time,
        recurrence: undefined
      });
    } else if (recurrenceDays && recurrenceDays.length > 0) {
      const today = new Date();
      for (let i = 0; i < 14; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        
        if (recurrenceDays.includes(futureDate.getDay())) {
          newTasks.push({
            id: Math.random().toString(36).substr(2, 9) + `-${i}`,
            title,
            description,
            assigneeId,
            creatorId: currentUser.id,
            visibility,
            status: TaskStatus.TODO,
            dueDate: futureDate.toISOString().split('T')[0],
            time,
            recurrence: recurrenceDays
          });
        }
      }
    }

    setTasks(prev => [...prev, ...newTasks]);
  };

  const updateTaskGroup = (originalTitle: string, params: AddTaskParams) => {
    if (!currentUser) return;

    const preservedTasks = tasks.filter(t => {
      return t.title !== originalTitle || t.status !== TaskStatus.TODO;
    });

    setTasks(preservedTasks);
    
    const newTasksGenerated: Task[] = [];
    if (params.dueDate) {
        newTasksGenerated.push({
            id: Math.random().toString(36).substr(2, 9),
            title: params.title,
            description: params.description,
            assigneeId: params.assigneeId,
            creatorId: currentUser.id,
            visibility: params.visibility,
            status: TaskStatus.TODO,
            dueDate: params.dueDate,
            time: params.time,
            recurrence: undefined
        });
    } else if (params.recurrenceDays && params.recurrenceDays.length > 0) {
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + i);
            if (params.recurrenceDays.includes(futureDate.getDay())) {
                newTasksGenerated.push({
                    id: Math.random().toString(36).substr(2, 9) + `-${i}-edited`,
                    title: params.title,
                    description: params.description,
                    assigneeId: params.assigneeId,
                    creatorId: currentUser.id,
                    visibility: params.visibility,
                    status: TaskStatus.TODO,
                    dueDate: futureDate.toISOString().split('T')[0],
                    time: params.time,
                    recurrence: params.recurrenceDays
                });
            }
        }
    }
    
    setTasks([...preservedTasks, ...newTasksGenerated]);
  };

  const deleteTask = (taskId: string) => {
     setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const markTaskAsDone = (taskId: string) => {
    if (!currentUser) return;
    const completionTime = new Date().toISOString();
    
    if (settings.requireApproval) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.WAITING_APPROVAL, completedAt: completionTime } : t));
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          const newNotif: Notification = {
            id: Math.random().toString(),
            message: `${currentUser.name} completou: ${task.title}`,
            type: 'TASK_APPROVAL',
            relatedId: taskId,
            read: false,
            createdAt: completionTime
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
    } else {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.DONE, completedAt: completionTime } : t));
    }
  };

  const approveTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.DONE } : t));
    setNotifications(prev => prev.filter(n => n.relatedId !== taskId));
    
    if (settings.enableGamification) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setUsers(prev => prev.map(u => u.id === task.assigneeId ? { ...u, stars: u.stars + 1 } : u));
            if (currentUser && currentUser.id === task.assigneeId) {
                setCurrentUser(prev => prev ? ({...prev, stars: prev.stars + 1}) : null);
            }
        }
    }
  };

  const rejectTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.TODO, completedAt: undefined } : t));
    setNotifications(prev => prev.filter(n => n.relatedId !== taskId));
  };

  // --- Shopping Logic ---

  const addShoppingItem = (name: string) => {
    if (!currentUser) return;
    const newItem: ShoppingItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      suggestedByUserId: currentUser.id,
      status: currentUser.role === UserRole.MANAGER ? ShoppingItemStatus.APPROVED : ShoppingItemStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    setShoppingItems([...shoppingItems, newItem]);

    if (currentUser.role === UserRole.MEMBER) {
       const newNotif: Notification = {
        id: Math.random().toString(),
        message: `${currentUser.name} sugeriu comprar: ${name}`,
        type: 'SHOPPING_SUGGESTION',
        relatedId: newItem.id,
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const approveShoppingItem = (itemId: string) => {
    setShoppingItems(prev => prev.map(i => i.id === itemId ? { ...i, status: ShoppingItemStatus.APPROVED } : i));
    setNotifications(prev => prev.filter(n => n.relatedId !== itemId));
  };

  const rejectShoppingItem = (itemId: string) => {
    setShoppingItems(prev => prev.map(i => i.id === itemId ? { ...i, status: ShoppingItemStatus.REJECTED } : i));
    setNotifications(prev => prev.filter(n => n.relatedId !== itemId));
  };

  const markItemPurchased = (itemId: string) => {
    const now = new Date().toISOString();
    setShoppingItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, status: ShoppingItemStatus.PURCHASED, purchasedAt: now } : i
    ));
  };

  const getPendingApprovalsCount = () => {
    if (!currentUser || currentUser.role !== UserRole.MANAGER) return 0;
    return notifications.filter(n => !n.read && (n.type === 'TASK_APPROVAL' || n.type === 'SHOPPING_SUGGESTION')).length;
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      tasks,
      shoppingItems,
      notifications,
      familyName,
      settings,
      login,
      logout,
      switchUser,
      updateUserAvatar,
      setFamilyName,
      addUser,
      updateUser,
      removeUser,
      updateSettings,
      addTask,
      updateTaskGroup,
      deleteTask,
      markTaskAsDone,
      approveTask,
      rejectTask,
      addShoppingItem,
      approveShoppingItem,
      rejectShoppingItem,
      markItemPurchased,
      getPendingApprovalsCount
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};