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
  total_customers: number
  active_customers: number
  inactive_customers: number
  added_last_30_days: number
}

export type Customer = {
  id: number
  name: string
  email: string
  company: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export type CustomerPage = {
  items: Customer[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type SortField = 'id' | 'name' | 'company' | 'status' | 'created_at' | 'updated_at'
export type SortOrder = 'asc' | 'desc'
