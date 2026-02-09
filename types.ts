export enum UserRole {
  MANAGER = 'MANAGER', // Pais
  MEMBER = 'MEMBER',   // Filhos
}

export interface User {
  id: string;
  name: string;
  email: string; // Novo campo
  role: UserRole;
  avatar: string;
  stars: number; // Gamification
}

export interface AppSettings {
  requireApproval: boolean; // Se true, tarefas precisam de aprovação. Se false, auto-aprovam.
  enableGamification: boolean; // Mostrar estrelas/pontos
  enableNotifications: boolean;
}

export enum TaskStatus {
  TODO = 'TODO',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  DONE = 'DONE',
}

export enum TaskVisibility {
  PUBLIC = 'PUBLIC',
  PERSONAL = 'PERSONAL',
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  creatorId: string;
  visibility: TaskVisibility;
  status: TaskStatus;
  dueDate: string; // ISO Date string
  time?: string; // HH:mm format
  completedAt?: string; // ISO Datetime string
  description?: string;
  recurrence?: number[]; // [0, 1] (Dom, Seg) - Para saber qual foi a regra original
}

export enum ShoppingItemStatus {
  PENDING = 'PENDING', // Opaco, aguardando aprovação
  APPROVED = 'APPROVED', // Ativo, aguardando compra
  PURCHASED = 'PURCHASED', // Comprado
  REJECTED = 'REJECTED'
}

export interface ShoppingItem {
  id: string;
  name: string;
  suggestedByUserId: string;
  status: ShoppingItemStatus;
  createdAt: string;
  purchasedAt?: string; // Data em que foi marcado como comprado
}

export interface Notification {
  id: string;
  message: string;
  type: 'TASK_APPROVAL' | 'SHOPPING_SUGGESTION' | 'INFO';
  relatedId?: string; // ID da tarefa ou item
  read: boolean;
  createdAt: string;
}