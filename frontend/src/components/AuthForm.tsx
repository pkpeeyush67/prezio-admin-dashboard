import { FormEvent, useState } from 'react'

type Values = { name: string; email: string; password: string }

type Props = {
  mode: 'login' | 'register'
  onSubmit: (values: Values) => Promise<void>
  onSwitch: () => void
}

export function AuthForm({ mode, onSubmit, onSwitch }: Props) {
  const [values, setValues] = useState<Values>({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isRegister = mode === 'register'

  function update(field: keyof Values, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (isRegister && values.name.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (values.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    try {
      setLoading(true)
      await onSubmit(values)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to continue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-message">
        <a className="logo logo-light" href="#" aria-label="Prezio home">
          <span>P</span> Prezio
        </a>
        <div>
          <p className="overline">USER OPERATIONS</p>
          <h1>Simple, confident user management.</h1>
          <p>Manage accounts and monitor user activity from one focused workspace.</p>
          <div className="trust-line">
            <span>✓</span> Secure access &nbsp;·&nbsp; Live metrics &nbsp;·&nbsp; Fast search
          </div>
        </div>
        <small>© 2026 Prezio. Admin workspace.</small>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="overline">ADMIN PORTAL</p>
          <h2>{isRegister ? 'Create an admin account' : 'Welcome back'}</h2>
          <p className="subtext">
            {isRegister ? 'Set up your secure dashboard access.' : 'Enter your details to access the dashboard.'}
          </p>

          <form onSubmit={submit} noValidate>
            {isRegister && (
              <label>
                Full name
                <input
                  value={values.name}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="Peeyush Kumar"
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                value={values.email}
                onChange={(event) => update('email', event.target.value)}
                placeholder="admin@company.com"
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={values.password}
                onChange={(event) => update('password', event.target.value)}
                placeholder="Minimum 8 characters"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </label>

            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in securely'}
            </button>
          </form>

          <button className="text-button" type="button" onClick={onSwitch}>
            {isRegister ? 'Already registered? Sign in' : 'New administrator? Create an account'}
          </button>
        </div>
      </section>
    </main>
  )
}
