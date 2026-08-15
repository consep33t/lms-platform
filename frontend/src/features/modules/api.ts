import api from '@/lib/api'

export const modulesApi = {
  getPublishedModules: async () => {
    const res = await api.get('/modules')
    return res.data
  },
  getModuleDetail: async (id: number) => {
    const res = await api.get(`/modules/${id}`)
    return res.data
  },
  verifyToken: async (moduleId: number, token: string) => {
    const res = await api.post(`/modules/${moduleId}/verify-token`, { token })
    return res.data
  }
}
