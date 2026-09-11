import { useEffect, useState } from 'react'

import { CustomerTable } from '../components/CustomerTable'
import { CustomerDetailsModal } from '../components/CustomerDetailsModal'
import { CustomerFormModal } from '../components/CustomerFormModal'
import { KpiCard } from '../components/KpiCard'
import { api } from '../services/api'
import type { Admin, Customer, CustomerInput, CustomerPage, DashboardStats, SortField, SortOrder } from '../types'

type Props = { admin: Admin; token: string; onLogout: () => void }

export function DashboardPage({ admin, token, onLogout }: Props) {
  const [stats, setStats] = useState<DashboardStats>()
  const [customers, setCustomers] = useState<CustomerPage>()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formCustomer, setFormCustomer] = useState<Customer | null | undefined>()
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleError(requestError: unknown) {
    const message = requestError instanceof Error ? requestError.message : 'Could not load dashboard.'
    if (message.toLowerCase().includes('session')) {
      onLogout()
      return
    }
    setError(message)
  }

  useEffect(() => {
    api.stats(token).then(setStats).catch(handleError)
  }, [token, refreshKey])

  useEffect(() => {
    const delay = window.setTimeout(async () => {
      try {
        setLoading(true)
        setError('')
        const result = await api.customers(token, { page, search, status, sortBy, sortOrder })
        setCustomers(result)
      } catch (requestError) {
        handleError(requestError)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => window.clearTimeout(delay)
  }, [token, page, search, status, sortBy, sortOrder, refreshKey])

  function changeSort(field: SortField) {
    setPage(1)
    if (field === sortBy) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortOrder('asc') }
  }

  async function saveCustomer(values: CustomerInput) {
    if (formCustomer) await api.updateCustomer(token, formCustomer.id, values)
    else await api.createCustomer(token, values)
    setFormCustomer(undefined)
    setRefreshKey((current) => current + 1)
  }

  async function deleteCustomer(customer: Customer) {
    if (!window.confirm(`Delete ${customer.name}? This action cannot be undone.`)) return
    try {
      await api.deleteCustomer(token, customer.id)
      if (customers?.items.length === 1 && page > 1) setPage(page - 1)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      handleError(requestError)
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="logo logo-light" href="#"><span>P</span> Prezio</a>
        <nav>
          <a className="nav-item active"><span>⌂</span> Overview</a>
          <a className="nav-item"><span>♙</span> Customers</a>
        </nav>
        <div className="side-help"><strong>Need help?</strong><small>API documentation is available through Swagger.</small><a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">Open API docs ↗</a></div>
        <div className="profile-mini"><span>{admin.name.charAt(0).toUpperCase()}</span><div><strong>{admin.name}</strong><small>Administrator</small></div></div>
      </aside>

      <section className="dashboard-content">
        <header className="topbar">
          <div><p className="overline">OVERVIEW</p><h1>Customer dashboard</h1><p>Welcome back, {admin.name.split(' ')[0]}. Here is today’s customer snapshot.</p></div>
          <button className="logout-button" onClick={onLogout}>Log out</button>
        </header>

        {error && <div className="page-error" role="alert"><span>!</span>{error}</div>}

        <section className="kpi-grid" aria-label="Customer statistics">
          <KpiCard label="Total customers" value={stats?.total_customers} helper="Across all accounts" tone="blue" loading={!stats} />
          <KpiCard label="Active customers" value={stats?.active_customers} helper="Currently active" tone="green" loading={!stats} />
          <KpiCard label="Inactive customers" value={stats?.inactive_customers} helper="Require attention" tone="amber" loading={!stats} />
          <KpiCard label="Added last 30 days" value={stats?.added_last_30_days} helper="Recent growth" tone="violet" loading={!stats} />
        </section>

        <section className="customer-card">
          <div className="customer-card-head">
            <div><h2>Customers</h2><p>{customers?.total ?? 0} customer records</p></div>
            <div className="filters">
              <label className="search-box"><span>⌕</span><input aria-label="Search customers" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value) }} placeholder="Search customers…" /></label>
              <select aria-label="Filter customer status" value={status} onChange={(event) => { setPage(1); setStatus(event.target.value) }}>
                <option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
              <button className="add-button" onClick={() => setFormCustomer(null)}>+ Add customer</button>
            </div>
          </div>

          <CustomerTable customers={customers?.items ?? []} loading={loading} sortBy={sortBy} sortOrder={sortOrder} onSort={changeSort} onView={setDetailsCustomer} onEdit={setFormCustomer} onDelete={deleteCustomer} />

          <footer className="pagination">
            <span>Page {customers?.page ?? 1} of {customers?.total_pages ?? 1}</span>
            <div>
              <button disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button>
              <button disabled={page >= (customers?.total_pages ?? 1) || loading} onClick={() => setPage((current) => current + 1)}>Next</button>
            </div>
          </footer>
        </section>
      </section>
      {formCustomer !== undefined && <CustomerFormModal customer={formCustomer ?? undefined} onSave={saveCustomer} onClose={() => setFormCustomer(undefined)} />}
      {detailsCustomer && <CustomerDetailsModal customer={detailsCustomer} token={token} onClose={() => setDetailsCustomer(null)} />}
    </main>
  )
}
