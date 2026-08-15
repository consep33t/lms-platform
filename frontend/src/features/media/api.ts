import api from '@/lib/api'

export const mediaApi = {
  uploadFile: async (formData: FormData, onProgress?: (progress: number) => void) => {
    const res = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      }
    })
    return res.data
  },
  getSignedUrl: async (id: number) => {
    const res = await api.get(`/media/${id}/signed-url`)
    return res.data
  }
}
