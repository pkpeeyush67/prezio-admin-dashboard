import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AuthForm } from '../components/AuthForm'

describe('AuthForm', () => {
  it('prevents login with an invalid email', async () => {
    const submit = vi.fn()
    render(<AuthForm mode="login" onSubmit={submit} onSwitch={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Email address'), 'invalid-email')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in securely' }))

    expect(screen.getByRole('alert')).toHaveTextContent('valid email')
    expect(submit).not.toHaveBeenCalled()
  })
})
