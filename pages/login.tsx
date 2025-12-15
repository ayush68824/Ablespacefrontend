import { useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required')
})

type LoginForm = z.infer<typeof loginSchema>

export default function Login() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true)
      setError('')
      await login(data.email, data.password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-inner">
        <div className="card space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
              Welcome back
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
              Sign in to your workspace
            </h2>
            <p className="text-xs text-slate-400">
              Stay on top of your tasks and collaborate in real time.
            </p>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-300">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="input mt-1"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className="input mt-1"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="pt-1 text-center text-xs text-slate-400">
              <span>Don&apos;t have an account? </span>
              <Link href="/register" className="font-medium text-primary-400 hover:text-primary-300">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
