import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket
  }

  const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'
  
  socket = io(baseURL, {
    auth: token !== 'cookie-auth' ? { token } : undefined,
    withCredentials: true,
    transports: ['websocket', 'polling']
  })

  return socket
}

export const getSocket = (): Socket | null => {
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}


