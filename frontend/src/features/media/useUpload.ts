import { useState } from 'react'
import { mediaApi } from './api'

export function useUpload() {
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const upload = async (file: File) => {
    setIsUploading(true)
    setProgress(0)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await mediaApi.uploadFile(formData, setProgress)
      return data
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, progress, isUploading }
}
