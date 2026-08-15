import api from '@/lib/api'

export const cohortsApi = {
  getCohorts: async () => {
    const res = await api.get('/admin/cohorts')
    return res.data
  },
  createCohort: async (data: { name: string; description?: string }) => {
    const res = await api.post('/admin/cohorts', data)
    return res.data
  }
}
