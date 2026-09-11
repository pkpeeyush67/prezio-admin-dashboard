import type {
  Admin,
  Customer,
  CustomerActivity,
  CustomerInput,
  CustomerPage,
  DashboardStats,
  LoginResult,
  SortField,
  SortOrder,
} from '../types'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const detail = typeof body.detail === 'string' ? body.detail : 'Request failed. Please try again.'
    throw new Error(detail)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<Admin>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<LoginResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) => request<Admin>('/auth/me', {}, token),

  stats: (token: string) => request<DashboardStats>('/dashboard/stats', {}, token),

  customers: (
    token: string,
    params: {
      page: number
      search: string
      status: string
      sortBy: SortField
      sortOrder: SortOrder
    },
  ) => {
    const query = new URLSearchParams({
      page: String(params.page),
      page_size: '10',
      search: params.search,
      sort_by: params.sortBy,
      sort_order: params.sortOrder,
    })
    if (params.status) query.set('status', params.status)
    return request<CustomerPage>(`/customers?${query}`, {}, token)
  },

  customer: (token: string, id: number) => request<Customer>(`/customers/${id}`, {}, token),

  activity: (token: string, id: number) =>
    request<CustomerActivity[]>(`/customers/${id}/activity`, {}, token),

  createCustomer: (token: string, customer: CustomerInput) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(customer) }, token),

  updateCustomer: (token: string, id: number, customer: CustomerInput) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customer) }, token),

  deleteCustomer: (token: string, id: number) =>
    request<void>(`/customers/${id}`, { method: 'DELETE' }, token),
}
