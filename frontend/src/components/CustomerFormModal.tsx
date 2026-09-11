import { FormEvent, useState } from 'react'

import type { ManagedUser, UserInput } from '../types'

type Props = {
  user?: ManagedUser
  onSave: (user: UserInput) => Promise<void>
  onClose: () => void
}

export function UserFormModal({ user, onSave, onClose }: Props) {
  const [values, setValues] = useState<UserInput>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    company: user?.company ?? '',
    status: user?.status ?? 'active',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function update(field: keyof UserInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (values.name.trim().length < 2 || values.company.trim().length < 2) {
      setError('Name and company must contain at least 2 characters.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      setError('Please enter a valid email address.')
      return
    }
    try {
      setSaving(true)
      await onSave(values)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="user-form-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head"><div><p className="overline">USER</p><h2 id="user-form-title">{user ? 'Edit user' : 'Add user'}</h2></div><button className="close-button" onClick={onClose} aria-label="Close">×</button></div>
        <form onSubmit={submit} noValidate>
          <label>Full name<input value={values.name} onChange={(event) => update('name', event.target.value)} placeholder="User name" /></label>
          <label>Email address<input type="email" value={values.email} onChange={(event) => update('email', event.target.value)} placeholder="user@company.com" /></label>
          <label>Company<input value={values.company} onChange={(event) => update('company', event.target.value)} placeholder="Company name" /></label>
          <label>Status<select value={values.status} onChange={(event) => update('status', event.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save user'}</button></div>
        </form>
      </section>
    </div>
  )
}
