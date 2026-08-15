import { useQuery, useMutation } from '@tanstack/react-query'
import { modulesApi } from './api'

export function usePublishedModules() {
  return useQuery({
    queryKey: ['modules', 'published'],
    queryFn: modulesApi.getPublishedModules,
  })
}

export function useModuleDetail(id: number) {
  return useQuery({
    queryKey: ['modules', id],
    queryFn: () => modulesApi.getModuleDetail(id),
    enabled: !!id,
  })
}

export function useVerifyToken() {
  return useMutation({
    mutationFn: ({ moduleId, token }: { moduleId: number; token: string }) =>
      modulesApi.verifyToken(moduleId, token),
  })
}
