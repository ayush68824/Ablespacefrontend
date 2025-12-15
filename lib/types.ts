export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent'
}

export enum TaskStatus {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Review = 'Review',
  Completed = 'Completed'
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate: string
  priority: Priority
  status: TaskStatus
  creatorId: string
  assignedToId?: string
  createdAt: string
  updatedAt: string
  creator: User
  assignedTo?: User
}

export interface CreateTaskInput {
  title: string
  description?: string
  dueDate: string
  priority: Priority
  status?: TaskStatus
  assignedToId?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  dueDate?: string
  priority?: Priority
  status?: TaskStatus
  assignedToId?: string
}



