export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  created_at: string;
  column_id: number;
}

export interface Column {
  id: number;
  name: string;
  position: number;
  tasks: Task[];
}

export interface Board {
  id: number;
  name: string;
  created_at: string;
  columns: Column[];
}

export interface TaskInput {
  title: string;
  description?: string | null;
  priority?: Priority;
}
