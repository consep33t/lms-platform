export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: number
    email: string
    full_name: string
    role: 'user' | 'admin' | 'superadmin'
    avatar_url?: string
  }
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  token: string
}

export interface ChangePasswordPayload {
  old_password: string
  new_password: string
}
