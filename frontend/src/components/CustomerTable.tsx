import type { ManagedUser } from '../types'

type Props = {
  users: ManagedUser[]
  loading: boolean
  onView: (user: ManagedUser) => void
  onEdit: (user: ManagedUser) => void
  onDelete: (user: ManagedUser) => void
}

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
})

export function UserTable({ users, loading, onView, onEdit, onDelete }: Props) {
  if (loading) {
    return <div className="table-state"><span className="spinner" /> Loading users…</div>
  }
  if (users.length === 0) {
    return <div className="table-state"><strong>No users found</strong><span>Add a user or upload a CSV dataset.</span></div>
  }

  return (
    <div className="table-scroll">
      <table>
        <thead><tr>
          <th>User ID</th>
          <th>User</th>
          <th>Company</th>
          <th>Status</th>
          <th>Created</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr></thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="customer-id">#{String(user.id).padStart(4, '0')}</td>
              <td><div className="customer-cell"><span>{user.name.charAt(0)}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div></td>
              <td>{user.company}</td>
              <td><span className={`status ${user.status}`}>{user.status}</span></td>
              <td>{dateFormat.format(new Date(user.created_at))}</td>
              <td>{dateFormat.format(new Date(user.updated_at))}</td>
              <td><div className="row-actions"><button onClick={() => onView(user)}>View</button><button onClick={() => onEdit(user)}>Edit</button><button className="delete-link" onClick={() => onDelete(user)}>Delete</button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
