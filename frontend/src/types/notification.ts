export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system'

export interface Notification {
  id: number
  user_id: number
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string
  metadata?: Record<string, unknown>
}

export interface NotificationPage {
  items: Notification[]
  total: number
  unread_count: number
  page: number
  page_size: number
}
