export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type Status = 'todo' | 'progress' | 'completed';

export interface Task {
  id: string;
  name: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  priority: Priority;
  status: Status;
  images: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  name: string;
  assignedTo: string;
  startDate: string;
  endDate: string;
  priority: Priority;
  description?: string;
}