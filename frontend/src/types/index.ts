export type Admin = {
  id: number
  name: string
  email: string
}

export type LoginResult = {
  access_token: string
  token_type: string
  expires_in: number
  admin: Admin
}

export type DashboardStats = {
  total_users: number
  active_users: number
  inactive_users: number
  added_last_30_days: number
}

export type ManagedUser = {
  id: number
  name: string
  email: string
  company: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export type UserInput = Pick<ManagedUser, 'name' | 'email' | 'company' | 'status'>

export type UserList = {
  items: ManagedUser[]
  total: number
}

export type ImportResult = { imported: number; skipped: number }
