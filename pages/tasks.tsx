import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import TaskCard from '@/components/TaskCard'
import TaskForm from '@/components/TaskForm'
import { tasksApi } from '@/lib/tasks'
import api from '@/lib/api'
import { Task, TaskStatus, Priority, CreateTaskInput } from '@/lib/types'
import useSWR from 'swr'
import { getSocket } from '@/lib/socket'
import { mutate } from 'swr'

export default function Tasks() {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState<{
    status?: TaskStatus
    priority?: Priority
    sortBy?: 'dueDate' | 'createdAt' | 'priority'
    sortOrder?: 'asc' | 'desc'
  }>({})
  
  const { data, mutate: mutateTasks } = useSWR(
    ['/tasks', filters],
    () => tasksApi.getAll(filters)
  )

  const { data: usersData } = useSWR('/users', async () => {
    const res = await api.get('/users')
    return res.data
  })

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleTaskUpdate = (data: { task: Task }) => {
      mutateTasks()
    }

    const handleTaskAssign = (data: { task: Task }) => {
      mutateTasks()
    }

    socket.on('task:updated', handleTaskUpdate)
    socket.on('task:assigned', handleTaskAssign)

    return () => {
      socket.off('task:updated', handleTaskUpdate)
      socket.off('task:assigned', handleTaskAssign)
    }
  }, [mutateTasks])

  const handleCreate = async (data: CreateTaskInput) => {
    await tasksApi.create(data)
    mutateTasks()
    setShowForm(false)
    
    const socket = getSocket()
    if (socket) {
      socket.emit('task:update', { task: data })
    }
  }

  const handleUpdate = async (data: CreateTaskInput) => {
    if (!editingTask) return
    
    const updated = await tasksApi.update(editingTask.id, data)
    mutateTasks()
    setEditingTask(null)
    
    const socket = getSocket()
    if (socket) {
      if (data.assignedToId && data.assignedToId !== editingTask.assignedToId) {
        socket.emit('task:assign', { task: updated.task, assignedToId: data.assignedToId })
      } else {
        socket.emit('task:update', { task: updated.task })
      }
    }
  }

  const handleDelete = async (id: string) => {
    await tasksApi.delete(id)
    mutateTasks()
  }

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    mutateTasks(
      async (current: any) => {
        const updated = await tasksApi.update(task.id, { status: newStatus })
        const socket = getSocket()
        if (socket) {
          socket.emit('task:update', { task: updated.task })
        }
        return { tasks: current?.tasks?.map((t: Task) => t.id === task.id ? updated.task : t) || [] }
      },
      { optimisticData: { tasks: tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t) }, revalidate: false }
    )
  }

  const tasks = data?.tasks || []
  const users = usersData?.users || []

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
          <button
            onClick={() => {
              setEditingTask(null)
              setShowForm(true)
            }}
            className="btn btn-primary"
          >
            + New Task
          </button>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters & Sort</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskStatus || undefined })}
                className="input"
              >
                <option value="">All</option>
                {Object.values(TaskStatus).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value as Priority || undefined })}
                className="input"
              >
                <option value="">All</option>
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'dueDate'}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="input"
              >
                <option value="dueDate">Due Date</option>
                <option value="createdAt">Created Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                value={filters.sortOrder || 'asc'}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
                className="input"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <TaskForm
              task={editingTask || undefined}
              users={users}
              onSubmit={editingTask ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false)
                setEditingTask(null)
              }}
            />
          </div>
        )}

        {!data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="card text-center text-gray-500">
            No tasks found. Create your first task!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="card">
                <TaskCard
                  task={task}
                  onEdit={(t) => {
                    setEditingTask(t)
                    setShowForm(true)
                  }}
                  onDelete={handleDelete}
                />
                <div className="mt-3 pt-3 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quick Status Update
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                    className="input text-sm"
                  >
                    {Object.values(TaskStatus).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

