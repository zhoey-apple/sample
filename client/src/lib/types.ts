export type User = {
  id: string;
  email: string;
  name: string;
};

export type PlanType = 'year' | 'month' | 'week' | 'day';

export type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export type Plan = {
  id: string;
  userId: string;
  type: PlanType;
  date: string; // ISO date string YYYY-MM-DD
  
  // Sections
  direction?: string; // HTML/Markdown
  reflection?: string; // HTML/Markdown
  notes?: string; // HTML/Markdown
  
  tasks: Task[];
  unfinishedTasks: Task[]; // Inherited from previous
  
  habits?: Record<string, boolean>; // Simple key-value for habit completion
  
  createdAt: string;
  updatedAt: string;
};

export type Principles = {
  id: string;
  userId: string;
  content: string; // Markdown
  updatedAt: string;
};
