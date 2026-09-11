import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CustomerFormModal } from '../components/CustomerFormModal'

describe('CustomerFormModal', () => {
  it('validates customer data before calling the API', async () => {
    const save = vi.fn()
    render(<CustomerFormModal onSave={save} onClose={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Save customer' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Name and company')
    expect(save).not.toHaveBeenCalled()
  })
})
