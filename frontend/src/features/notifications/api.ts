import api from '@/lib/api'

export const notificationsApi = {
  getNotifications: async () => {
    const res = await api.get('/notifications')
    return res.data
  },
  markAsRead: async (id: number) => {
    const res = await api.put(`/notifications/${id}/read`)
    return res.data
  }
}
