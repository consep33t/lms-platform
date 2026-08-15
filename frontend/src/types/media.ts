export type MediaType = 'video' | 'image' | 'document' | 'audio'
export type MediaStatus = 'pending' | 'processing' | 'ready' | 'failed'

export interface Media {
  id: number
  filename: string
  original_name: string
  media_type: MediaType
  status: MediaStatus
  url: string
  file_size: number
  duration_seconds?: number
  created_at: string
}

export interface UploadResponse {
  id: number
  url: string
  status: MediaStatus
  media_type: MediaType
}
