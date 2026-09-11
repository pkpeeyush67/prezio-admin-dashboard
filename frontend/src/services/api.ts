import type {
  Admin,
  ImportResult,
  ManagedUser,
  DashboardStats,
  LoginResult,
  UserInput,
  UserList,
} from '../types'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
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

  users: (token: string) => request<UserList>('/users', {}, token),

  createUser: (token: string, user: UserInput) =>
    request<ManagedUser>('/users', { method: 'POST', body: JSON.stringify(user) }, token),

  updateUser: (token: string, id: number, user: UserInput) =>
    request<ManagedUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }, token),

  deleteUser: (token: string, id: number) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }, token),

  importUsers: (token: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<ImportResult>('/users/import', { method: 'POST', body: form }, token)
  },
}
