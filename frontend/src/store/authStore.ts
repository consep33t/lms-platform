import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  email: string
  full_name: string
  role: 'user' | 'admin' | 'superadmin'
  avatar_url?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      setAuth: (user, token) => {
        localStorage.setItem('access_token', token)
        set({ user, accessToken: token })
      },
      clearAuth: () => {
        localStorage.removeItem('access_token')
        set({ user: null, accessToken: null })
      },
      isAdmin: () => {
        const role = get().user?.role
        return role === 'admin' || role === 'superadmin'
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user }) }
  )
)
