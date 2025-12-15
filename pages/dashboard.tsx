import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import TaskCard from '@/components/TaskCard'
import { tasksApi } from '@/lib/tasks'
import { Task, TaskStatus, Priority } from '@/lib/types'
import useSWR from 'swr'
import { getSocket } from '@/lib/socket'
import { mutate } from 'swr'

export default function Dashboard() {
  const [selectedView, setSelectedView] = useState<'assigned' | 'created' | 'overdue'>('assigned')
  
  const { data: assignedData, mutate: mutateAssigned } = useSWR(
    selectedView === 'assigned' ? '/tasks/assigned/me' : null,
    () => tasksApi.getAssigned()
  )
  
  const { data: createdData, mutate: mutateCreated } = useSWR(
    selectedView === 'created' ? '/tasks/created/me' : null,
    () => tasksApi.getCreated()
  )
  
  const { data: overdueData, mutate: mutateOverdue } = useSWR(
    selectedView === 'overdue' ? '/tasks/overdue/me' : null,
    () => tasksApi.getOverdue()
  )

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleTaskUpdate = (data: { task: Task }) => {
      mutateAssigned()
      mutateCreated()
      mutateOverdue()
      mutate('/tasks')
    }

    const handleTaskAssign = (data: { task: Task }) => {
      mutateAssigned()
      mutateCreated()
      mutateOverdue()
      mutate('/tasks')
    }

    socket.on('task:updated', handleTaskUpdate)
    socket.on('task:assigned', handleTaskAssign)

    return () => {
      socket.off('task:updated', handleTaskUpdate)
      socket.off('task:assigned', handleTaskAssign)
    }
  }, [mutateAssigned, mutateCreated, mutateOverdue])

  const getTasks = () => {
    switch (selectedView) {
      case 'assigned':
        return assignedData?.tasks || []
      case 'created':
        return createdData?.tasks || []
      case 'overdue':
        return overdueData?.tasks || []
      default:
        return []
    }
  }

  const tasks = getTasks()
  const isLoading = (selectedView === 'assigned' && !assignedData) ||
                    (selectedView === 'created' && !createdData) ||
                    (selectedView === 'overdue' && !overdueData)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
              Overview
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              Personal dashboard
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              See tasks assigned to you, the ones you created, and items that need attention.
            </p>
          </div>
        </div>

        <div className="inline-flex gap-2 rounded-full bg-slate-900/70 p-1 text-xs shadow-sm shadow-slate-950/60">
          <button
            onClick={() => setSelectedView('assigned')}
            className={`btn rounded-full px-4 py-1.5 text-xs ${selectedView === 'assigned' ? 'btn-primary' : 'btn-secondary bg-transparent border-0'}`}
          >
            Assigned to Me ({assignedData?.tasks?.length || 0})
          </button>
          <button
            onClick={() => setSelectedView('created')}
            className={`btn rounded-full px-4 py-1.5 text-xs ${selectedView === 'created' ? 'btn-primary' : 'btn-secondary bg-transparent border-0'}`}
          >
            Created by Me ({createdData?.tasks?.length || 0})
          </button>
          <button
            onClick={() => setSelectedView('overdue')}
            className={`btn rounded-full px-4 py-1.5 text-xs ${selectedView === 'overdue' ? 'btn-primary' : 'btn-secondary bg-transparent border-0'}`}
          >
            Overdue ({overdueData?.tasks?.length || 0})
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="mb-3 h-4 w-3/4 rounded bg-slate-800"></div>
                <div className="h-3 w-1/2 rounded bg-slate-900"></div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="card text-center text-xs text-slate-400">
            No tasks in this view yet. As tasks are assigned or created, they will show up here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => {}}
                onDelete={async () => {
                  await tasksApi.delete(task.id)
                  mutateAssigned()
                  mutateCreated()
                  mutateOverdue()
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}



