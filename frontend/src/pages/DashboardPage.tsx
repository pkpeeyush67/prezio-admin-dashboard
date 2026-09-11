import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'

import { UserDetailsModal } from '../components/CustomerDetailsModal'
import { UserFormModal } from '../components/CustomerFormModal'
import { UserTable } from '../components/CustomerTable'
import { KpiCard } from '../components/KpiCard'
import { api } from '../services/api'
import type { Admin, DashboardStats, ManagedUser, UserInput } from '../types'

type Props = { admin: Admin; token: string; onLogout: () => void }

export function DashboardPage({ admin, token, onLogout }: Props) {
  const [stats, setStats] = useState<DashboardStats>()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [formUser, setFormUser] = useState<ManagedUser | null | undefined>()
  const [detailsUser, setDetailsUser] = useState<ManagedUser | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')
      const [statsResult, usersResult] = await Promise.all([api.stats(token), api.users(token)])
      setStats(statsResult)
      setUsers(usersResult.items)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Could not load dashboard.'
      if (message.toLowerCase().includes('session')) onLogout()
      else setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDashboard() }, [token])

  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return users.filter((user) => {
      const matchesSearch = !term || [user.name, user.email, user.company].some((value) => value.toLowerCase().includes(term))
      return matchesSearch && (!status || user.status === status)
    })
  }, [users, search, status])

  async function saveUser(values: UserInput) {
    if (formUser) await api.updateUser(token, formUser.id, values)
    else await api.createUser(token, values)
    setFormUser(undefined)
    setNotice(formUser ? 'User updated successfully.' : 'User created successfully.')
    await loadDashboard()
  }

  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(`Delete ${user.name}? This action cannot be undone.`)) return
    try {
      await api.deleteUser(token, user.id)
      setNotice('User deleted successfully.')
      await loadDashboard()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete user.')
    }
  }

  async function uploadCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const result = await api.importUsers(token, file)
      setNotice(`${result.imported} users imported. ${result.skipped} rows skipped.`)
      await loadDashboard()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not import CSV.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="logo logo-light" href="#"><span>P</span> Prezio</a>
        <nav><a className="nav-item active"><span>⌂</span> Overview</a><a className="nav-item"><span>♙</span> User management</a></nav>
        <div className="side-help"><strong>Backend API</strong><small>Review and run each endpoint in Swagger.</small><a href="/docs" target="_blank" rel="noreferrer">Open API docs ↗</a></div>
        <div className="profile-mini"><span>{admin.name.charAt(0).toUpperCase()}</span><div><strong>{admin.name}</strong><small>Administrator</small></div></div>
      </aside>

      <section className="dashboard-content">
        <header className="topbar"><div><p className="overline">ADMINISTRATION</p><h1>User management</h1><p>Welcome back, {admin.name.split(' ')[0]}. Manage application users from one place.</p></div><button className="logout-button" onClick={onLogout}>Log out</button></header>
        {error && <div className="page-error" role="alert"><span>!</span>{error}</div>}
        {notice && <div className="success-notice">✓ {notice}</div>}

        <section className="kpi-grid" aria-label="User statistics">
          <KpiCard label="Total users" value={stats?.total_users} helper="Across all accounts" tone="blue" loading={!stats} />
          <KpiCard label="Active users" value={stats?.active_users} helper="Currently active" tone="green" loading={!stats} />
          <KpiCard label="Inactive users" value={stats?.inactive_users} helper="Access disabled" tone="amber" loading={!stats} />
          <KpiCard label="Added last 30 days" value={stats?.added_last_30_days} helper="Recent registrations" tone="violet" loading={!stats} />
        </section>

        <section className="customer-card">
          <div className="customer-card-head"><div><h2>Users</h2><p>{users.length} records in the database</p></div><div className="filters"><label className="search-box"><span>⌕</span><input aria-label="Search users" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users…" /></label><select aria-label="Filter user status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select><input ref={fileInput} hidden type="file" accept=".csv,text/csv" onChange={uploadCsv} /><button className="import-button" onClick={() => fileInput.current?.click()}>Upload CSV</button><button className="add-button" onClick={() => setFormUser(null)}>+ Add user</button></div></div>
          <UserTable users={visibleUsers} loading={loading} onView={setDetailsUser} onEdit={setFormUser} onDelete={deleteUser} />
        </section>
      </section>

      {formUser !== undefined && <UserFormModal user={formUser ?? undefined} onSave={saveUser} onClose={() => setFormUser(undefined)} />}
      {detailsUser && <UserDetailsModal user={detailsUser} onClose={() => setDetailsUser(null)} />}
    </main>
  )
}
