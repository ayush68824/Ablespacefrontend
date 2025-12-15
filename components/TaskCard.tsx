import { Task, Priority, TaskStatus } from '@/lib/types'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

const priorityColors = {
  [Priority.Low]: 'bg-blue-100 text-blue-800',
  [Priority.Medium]: 'bg-yellow-100 text-yellow-800',
  [Priority.High]: 'bg-orange-100 text-orange-800',
  [Priority.Urgent]: 'bg-red-100 text-red-800'
}

const statusColors = {
  [TaskStatus.ToDo]: 'bg-gray-100 text-gray-800',
  [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800',
  [TaskStatus.Review]: 'bg-purple-100 text-purple-800',
  [TaskStatus.Completed]: 'bg-green-100 text-green-800'
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Completed

  return (
    <div className={`card ${isOverdue ? 'border-l-4 border-red-500' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      {task.description && (
        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>
      <div className="text-sm text-gray-500 space-y-1">
        <p>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</p>
        <p>Created by: {task.creator.name}</p>
        {task.assignedTo && <p>Assigned to: {task.assignedTo.name}</p>}
      </div>
    </div>
  )
}



