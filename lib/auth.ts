import api from './api'
import { User } from './types'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
}

export const authApi = {
  register: async (data: RegisterInput) => {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  login: async (data: LoginInput) => {
    const res = await api.post('/auth/login', data)
    return res.data
  },

  logout: async () => {
    await api.post('/auth/logout')
  },

  me: async (): Promise<{ user: User }> => {
    const res = await api.get('/auth/me')
    return res.data
  },

  updateProfile: async (data: { name: string }) => {
    const res = await api.put('/auth/profile', data)
    return res.data
  }
}



