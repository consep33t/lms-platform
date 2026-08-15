import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login, logout, getProfile } from './api'
import { useAuthStore } from '@/store/authStore'
import type { LoginCredentials } from '@/types'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token)
      const role = data.user.role
      if (role === 'admin' || role === 'superadmin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth()
      navigate('/login')
    },
  })
}

export function useCurrentUser() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getProfile,
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  })
}
