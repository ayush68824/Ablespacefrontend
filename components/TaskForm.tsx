import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Task, Priority, TaskStatus, CreateTaskInput } from '@/lib/types'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be max 100 characters'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedToId: z.string().optional()
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  task?: Task
  users: Array<{ id: string; name: string; email: string }>
  onSubmit: (data: CreateTaskInput) => Promise<void>
  onCancel: () => void
}

export default function TaskForm({ task, users, onSubmit, onCancel }: TaskFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description || '',
      dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
      priority: task.priority,
      status: task.status,
      assignedToId: task.assignedToId || ''
    } : undefined
  })

  const handleFormSubmit = async (data: TaskFormData) => {
    await onSubmit({
      title: data.title,
      description: data.description || undefined,
      dueDate: new Date(data.dueDate).toISOString(),
      priority: data.priority,
      status: data.status,
      assignedToId: data.assignedToId || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          {...register('title')}
          type="text"
          className="input"
          maxLength={100}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date *
        </label>
        <input
          {...register('dueDate')}
          type="datetime-local"
          className="input"
        />
        {errors.dueDate && (
          <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority *
        </label>
        <select {...register('priority')} className="input">
          {Object.values(Priority).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select {...register('status')} className="input">
          {Object.values(TaskStatus).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assign To
        </label>
        <select {...register('assignedToId')} className="input">
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {task ? 'Update' : 'Create'} Task
        </button>
      </div>
    </form>
  )
}



