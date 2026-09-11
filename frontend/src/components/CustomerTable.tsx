import type { Customer, SortField, SortOrder } from '../types'

type Props = {
  customers: Customer[]
  loading: boolean
  sortBy: SortField
  sortOrder: SortOrder
  onSort: (field: SortField) => void
}

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
})

export function CustomerTable({ customers, loading, sortBy, sortOrder, onSort }: Props) {
  function heading(label: string, field: SortField) {
    const direction = sortBy === field ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''
    return <button className="sort-button" onClick={() => onSort(field)}>{label}{direction}</button>
  }

  if (loading) {
    return <div className="table-state"><span className="spinner" /> Loading customers…</div>
  }
  if (customers.length === 0) {
    return <div className="table-state"><strong>No customers found</strong><span>Try changing your search or status filter.</span></div>
  }

  return (
    <div className="table-scroll">
      <table>
        <thead><tr>
          <th>{heading('Customer ID', 'id')}</th>
          <th>{heading('Customer', 'name')}</th>
          <th>{heading('Company', 'company')}</th>
          <th>{heading('Status', 'status')}</th>
          <th>{heading('Created', 'created_at')}</th>
          <th>{heading('Updated', 'updated_at')}</th>
        </tr></thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="customer-id">#{String(customer.id).padStart(4, '0')}</td>
              <td><div className="customer-cell"><span>{customer.name.charAt(0)}</span><div><strong>{customer.name}</strong><small>{customer.email}</small></div></div></td>
              <td>{customer.company}</td>
              <td><span className={`status ${customer.status}`}>{customer.status}</span></td>
              <td>{dateFormat.format(new Date(customer.created_at))}</td>
              <td>{dateFormat.format(new Date(customer.updated_at))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
