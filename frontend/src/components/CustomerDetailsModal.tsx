import type { ManagedUser } from '../types'

type Props = { user: ManagedUser; onClose: () => void }

export function UserDetailsModal({ user, onClose }: Props) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal details-modal" role="dialog" aria-modal="true" aria-labelledby="user-details-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head"><div><p className="overline">USER DETAILS</p><h2 id="user-details-title">{user.name}</h2></div><button className="close-button" onClick={onClose} aria-label="Close">×</button></div>
        <dl className="details-grid"><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Company</dt><dd>{user.company}</dd></div><div><dt>Status</dt><dd><span className={`status ${user.status}`}>{user.status}</span></dd></div><div><dt>User ID</dt><dd>#{String(user.id).padStart(4, '0')}</dd></div><div><dt>Created</dt><dd>{new Date(user.created_at).toLocaleString()}</dd></div><div><dt>Last updated</dt><dd>{new Date(user.updated_at).toLocaleString()}</dd></div></dl>
      </section>
    </div>
  )
}
