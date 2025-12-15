import { useState } from 'react'
import Layout from '@/components/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters')
})

type ProfileForm = z.infer<typeof profileSchema>

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' }
  })

  const onSubmit = async (data: ProfileForm) => {
    try {
      setError('')
      await updateProfile(data.name)
      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Update failed')
    }
  }

  if (!user) return null

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-50">Profile</h1>
        
        <div className="card">
          {message && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-900/30 px-4 py-3 text-xs text-emerald-200">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="input cursor-not-allowed bg-slate-900/40 text-slate-400"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-300">
                Name
              </label>
              <input
                {...register('name')}
                type="text"
                className="input"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-300">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}



