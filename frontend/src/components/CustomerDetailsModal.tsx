import { useEffect, useState } from 'react'

import { api } from '../services/api'
import type { Customer, CustomerActivity } from '../types'

type Props = { customer: Customer; token: string; onClose: () => void }

export function CustomerDetailsModal({ customer, token, onClose }: Props) {
  const [activity, setActivity] = useState<CustomerActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.activity(token, customer.id).then(setActivity).finally(() => setLoading(false))
  }, [customer.id, token])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal details-modal" role="dialog" aria-modal="true" aria-labelledby="customer-details-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head"><div><p className="overline">CUSTOMER DETAILS</p><h2 id="customer-details-title">{customer.name}</h2></div><button className="close-button" onClick={onClose} aria-label="Close">×</button></div>
        <dl className="details-grid"><div><dt>Email</dt><dd>{customer.email}</dd></div><div><dt>Company</dt><dd>{customer.company}</dd></div><div><dt>Status</dt><dd><span className={`status ${customer.status}`}>{customer.status}</span></dd></div><div><dt>Customer ID</dt><dd>#{String(customer.id).padStart(4, '0')}</dd></div><div><dt>Created</dt><dd>{new Date(customer.created_at).toLocaleString()}</dd></div><div><dt>Last updated</dt><dd>{new Date(customer.updated_at).toLocaleString()}</dd></div></dl>
        <div className="activity"><h3>Activity</h3>{loading ? <p>Loading activity…</p> : activity.length ? activity.map((item) => <article key={item.id}><span /><div><strong>Customer {item.action}</strong><small>{new Date(item.created_at).toLocaleString()}</small></div></article>) : <p>No activity recorded yet.</p>}</div>
      </section>
    </div>
  )
}
