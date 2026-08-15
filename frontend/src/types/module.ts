export type ModuleStatus = 'draft' | 'published' | 'archived'
export type ContentType = 'video' | 'document' | 'quiz' | 'text'
export type SessionStatus = 'not_started' | 'in_progress' | 'completed'

export interface Module {
  id: number
  title: string
  description: string
  thumbnail_url?: string
  status: ModuleStatus
  order: number
  created_at: string
  sessions_count?: number
  enrolled_count?: number
}

export interface Session {
  id: number
  module_id: number
  title: string
  description: string
  order: number
  contents: SessionContent[]
}

export interface SessionContent {
  id: number
  session_id: number
  title: string
  content_type: ContentType
  media_id?: number
  text_content?: string
  order: number
  required_watch_percent?: number
  media?: {
    id: number
    url: string
    duration_seconds?: number
  }
}

export interface SessionProgress {
  id: number
  user_id: number
  session_id: number
  status: SessionStatus
  completed_at?: string
}

export interface ContentProgress {
  id: number
  session_progress_id: number
  content_id: number
  watched_percent: number
  is_completed: boolean
}
