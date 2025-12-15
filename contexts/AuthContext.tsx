import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@/lib/types'
import { authApi } from '@/lib/auth'
import useSWR from 'swr'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>('checking')
  const [loading, setLoading] = useState(true)

  const { data, error, mutate } = useSWR(
    '/auth/me',
    authApi.me,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: () => {
        setToken('authenticated')
        setLoading(false)
      },
      onError: (err: any) => {
        if (err?.response?.status === 401) {
          setToken(null)
          setLoading(false)
        } else {
          setLoading(false)
        }
      }
    }
  )

  useEffect(() => {
    if (data) {
      setToken('authenticated')
      setLoading(false)
    } else if (error) {
      setLoading(false)
    }
  }, [data, error])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    setToken('authenticated')
    await mutate()
  }

  const register = async (email: string, password: string, name: string) => {
    const response = await authApi.register({ email, password, name })
    setToken('authenticated')
    await mutate()
  }

  const logout = async () => {
    await authApi.logout()
    setToken(null)
    await mutate(null, false)
  }

  const updateProfile = async (name: string) => {
    await authApi.updateProfile({ name })
    await mutate()
  }

  return (
    <AuthContext.Provider
      value={{
        user: data?.user || null,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

