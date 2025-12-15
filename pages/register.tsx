import { useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true)
      setError('')
      await registerUser(data.email, data.password, data.name)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
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
              Get started
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
              Create your workspace account
            </h2>
            <p className="text-xs text-slate-400">
              Organise tasks, assign work, and see updates in real time.
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
                <label htmlFor="name" className="block text-xs font-medium text-slate-300">
                  Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="input mt-1"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-300">{errors.name.message}</p>
                )}
              </div>

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
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </div>

            <div className="pt-1 text-center text-xs text-slate-400">
              <span>Already have an account? </span>
              <Link href="/login" className="font-medium text-primary-400 hover:text-primary-300">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
