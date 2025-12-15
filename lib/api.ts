import axios from 'axios'

// Normalise base URL and always append /api/v1 on the client side
const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const normalisedBase = rawBase.replace(/\/+$/, '')

const api = axios.create({
  baseURL: `${normalisedBase}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api


