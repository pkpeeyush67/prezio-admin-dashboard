import { useEffect, useState } from 'react'

import { AuthForm } from './components/AuthForm'
import { DashboardPage } from './pages/DashboardPage'
import { api } from './services/api'
import type { Admin } from './types'

const TOKEN_KEY = 'prezio_admin_token'

export default function App() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [checkingSession, setCheckingSession] = useState(true)
  const token = localStorage.getItem(TOKEN_KEY) ?? ''

  useEffect(() => {
    if (!token) {
      setCheckingSession(false)
      return
    }
    api.me(token)
      .then(setAdmin)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setCheckingSession(false))
  }, [token])

  async function authenticate(values: { name: string; email: string; password: string }) {
    if (mode === 'register') {
      await api.register(values.name, values.email, values.password)
      setMode('login')
      return
    }
    const result = await api.login(values.email, values.password)
    localStorage.setItem(TOKEN_KEY, result.access_token)
    setAdmin(result.admin)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setAdmin(null)
    setMode('login')
  }

  if (checkingSession) return <div className="session-loader"><span className="spinner" /> Checking your session…</div>
  if (admin) return <DashboardPage admin={admin} token={token} onLogout={logout} />
  return <AuthForm mode={mode} onSubmit={authenticate} onSwitch={() => setMode(mode === 'login' ? 'register' : 'login')} />
}
