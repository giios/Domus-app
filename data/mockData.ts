import { User, UserRole, Task, TaskStatus, TaskVisibility, ShoppingItem, ShoppingItemStatus, Notification } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Carlos (Pai)',
    email: 'carlos@familia.com',
    role: UserRole.MANAGER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    stars: 0
  },
  {
    id: 'u2',
    name: 'Ana (Mãe)',
    email: 'ana@familia.com',
    role: UserRole.MANAGER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    stars: 0
  },
  {
    id: 'u3',
    name: 'Lucas (Filho)',
    email: 'lucas@familia.com',
    role: UserRole.MEMBER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    stars: 12
  },
  {
    id: 'u4',
    name: 'Julia (Filha)',
    email: 'julia@familia.com',
    role: UserRole.MEMBER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia',
    stars: 8
  }
];

const today = new Date().toISOString().split('T')[0];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Lavar a louça do almoço',
    assigneeId: 'u3',
    creatorId: 'u1',
    visibility: TaskVisibility.PUBLIC,
    status: TaskStatus.WAITING_APPROVAL,
    dueDate: today,
  },
  {
    id: 't2',
    title: 'Estudar Matemática (Cap. 4)',
    assigneeId: 'u3',
    creatorId: 'u1',
    visibility: TaskVisibility.PERSONAL,
    status: TaskStatus.TODO,
    dueDate: today,
  },
  {
    id: 't3',
    title: 'Arrumar o quarto',
    assigneeId: 'u4',
    creatorId: 'u2',
    visibility: TaskVisibility.PERSONAL,
    status: TaskStatus.TODO,
    dueDate: today,
  },
  {
    id: 't4',
    title: 'Passear com o cachorro',
    assigneeId: 'u1',
    creatorId: 'u1',
    visibility: TaskVisibility.PUBLIC,
    status: TaskStatus.DONE,
    dueDate: today,
  },
   {
    id: 't5',
    title: 'Limpar o quintal',
    assigneeId: 'u3',
    creatorId: 'u1',
    visibility: TaskVisibility.PUBLIC,
    status: TaskStatus.TODO,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
  }
];

export const MOCK_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 's1',
    name: 'Leite',
    suggestedByUserId: 'u2',
    status: ShoppingItemStatus.APPROVED,
    createdAt: today
  },
  {
    id: 's2',
    name: 'Chocolate',
    suggestedByUserId: 'u4',
    status: ShoppingItemStatus.PENDING,
    createdAt: today
  },
  {
    id: 's3',
    name: 'Detergente',
    suggestedByUserId: 'u1',
    status: ShoppingItemStatus.APPROVED,
    createdAt: today
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    message: 'Lucas marcou "Lavar a louça" como feito.',
    type: 'TASK_APPROVAL',
    relatedId: 't1',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'n2',
    message: 'Julia sugeriu "Chocolate" na lista.',
    type: 'SHOPPING_SUGGESTION',
    relatedId: 's2',
    read: false,
    createdAt: new Date().toISOString()
  }
];