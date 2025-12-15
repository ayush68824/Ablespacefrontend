import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import { initSocket, disconnectSocket } from '@/lib/socket'
import Notification from './Notification'
import Link from 'next/link'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, token, logout, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && token && token !== 'checking') {
      initSocket('cookie-auth')
    }

    return () => {
      disconnectSocket()
    }
  }, [user, token])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 ring-1 ring-primary-500/40">
                  <span className="text-lg font-semibold">TM</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight text-slate-50">
                    Task Manager
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Collaborative workspace
                  </span>
                </div>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800/70 hover:text-slate-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tasks"
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800/70 hover:text-slate-50"
                >
                  All Tasks
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800/70 hover:text-slate-50"
                >
                  Profile
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right text-xs sm:block">
                <p className="font-medium text-slate-100">{user.name}</p>
                <p className="text-[11px] text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary h-8 rounded-full px-3 text-xs"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto flex max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <Notification />
    </div>
  )
}

