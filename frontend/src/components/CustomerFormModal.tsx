import { FormEvent, useState } from 'react'

import type { Customer, CustomerInput } from '../types'

type Props = {
  customer?: Customer
  onSave: (customer: CustomerInput) => Promise<void>
  onClose: () => void
}

export function CustomerFormModal({ customer, onSave, onClose }: Props) {
  const [values, setValues] = useState<CustomerInput>({
    name: customer?.name ?? '',
    email: customer?.email ?? '',
    company: customer?.company ?? '',
    status: customer?.status ?? 'active',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function update(field: keyof CustomerInput, value: string) {
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
      setError(saveError instanceof Error ? saveError.message : 'Could not save customer.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="customer-form-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head"><div><p className="overline">CUSTOMER</p><h2 id="customer-form-title">{customer ? 'Edit customer' : 'Add customer'}</h2></div><button className="close-button" onClick={onClose} aria-label="Close">×</button></div>
        <form onSubmit={submit} noValidate>
          <label>Full name<input value={values.name} onChange={(event) => update('name', event.target.value)} placeholder="Customer name" /></label>
          <label>Email address<input type="email" value={values.email} onChange={(event) => update('email', event.target.value)} placeholder="customer@company.com" /></label>
          <label>Company<input value={values.company} onChange={(event) => update('company', event.target.value)} placeholder="Company name" /></label>
          <label>Status<select value={values.status} onChange={(event) => update('status', event.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save customer'}</button></div>
        </form>
      </section>
    </div>
  )
}
