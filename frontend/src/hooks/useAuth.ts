import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const isAdmin = useAuthStore((s) => s.isAdmin)

  return { user, accessToken, setAuth, clearAuth, isAdmin, isAuthenticated: !!user }
}
