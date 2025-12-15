import api from './api'
import { Task, CreateTaskInput, UpdateTaskInput, Priority, TaskStatus } from './types'

export const tasksApi = {
  getAll: async (filters?: {
    status?: TaskStatus
    priority?: Priority
    sortBy?: 'dueDate' | 'createdAt' | 'priority'
    sortOrder?: 'asc' | 'desc'
  }): Promise<{ tasks: Task[] }> => {
    const res = await api.get('/tasks', { params: filters })
    return res.data
  },

  getById: async (id: string): Promise<{ task: Task }> => {
    const res = await api.get(`/tasks/${id}`)
    return res.data
  },

  create: async (data: CreateTaskInput): Promise<{ task: Task }> => {
    const res = await api.post('/tasks', data)
    return res.data
  },

  update: async (id: string, data: UpdateTaskInput): Promise<{ task: Task }> => {
    const res = await api.put(`/tasks/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },

  getAssigned: async (): Promise<{ tasks: Task[] }> => {
    const res = await api.get('/tasks/assigned/me')
    return res.data
  },

  getCreated: async (): Promise<{ tasks: Task[] }> => {
    const res = await api.get('/tasks/created/me')
    return res.data
  },

  getOverdue: async (): Promise<{ tasks: Task[] }> => {
    const res = await api.get('/tasks/overdue/me')
    return res.data
  }
}



