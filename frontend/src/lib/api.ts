import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // for httpOnly refresh token cookie
})

api.interceptors.request.use((config) => {
  // Always read the latest token from Zustand (single source of truth)
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Track in-flight refresh to prevent multiple concurrent refresh calls
let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Deduplicate concurrent refresh calls
      if (!refreshPromise) {
        refreshPromise = axios
          .post('/api/v1/auth/refresh', {}, { withCredentials: true })
          .then((resp) => resp.data.access_token as string)
          .finally(() => { refreshPromise = null })
      }

      try {
        const newToken = await refreshPromise
        // FIX: Sync new token to BOTH localStorage AND Zustand store
        const { user } = useAuthStore.getState()
        if (user) {
          useAuthStore.getState().setAuth(user, newToken)
        } else {
          localStorage.setItem('access_token', newToken)
        }
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch {
        // Refresh failed — full logout and redirect
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
