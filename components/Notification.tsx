import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket'
import { Task } from '@/lib/types'

interface Notification {
  id: string
  message: string
  task: Task
  assignedBy: { name: string }
}

export default function NotificationComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleTaskAssigned = (data: { task: Task; assignedBy: { name: string } }) => {
      const notificationId = Date.now().toString()
      setNotifications((prev) => [
        ...prev,
        {
          id: notificationId,
          message: `${data.assignedBy.name} assigned a task to you: ${data.task.title}`,
          task: data.task,
          assignedBy: data.assignedBy
        }
      ])

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      }, 5000)
    }

    socket.on('task:assigned', handleTaskAssigned)

    return () => {
      socket.off('task:assigned', handleTaskAssigned)
    }
  }, [])

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
        >
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-900">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

