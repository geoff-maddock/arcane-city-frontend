import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { rootRoute } from '../routes/root'
import { router } from '../router'

// Mock the components
vi.mock('../components/Events', () => ({
    default: () => <div data-testid="events-component">Events Page</div>
}))

vi.mock('../components/Entities', () => ({
    default: () => <div data-testid="entities-component">Entities Page</div>
}))

vi.mock('../routes/account', () => ({
    default: () => <div data-testid="account-component">Account Page</div>
}))

describe('Router Configuration', () => {
    it('renders Events component at root path', async () => {
        const result = render(
            <RouterProvider router={router} />
        )

        await waitFor(() => {
            expect(screen.getByTestId('events-component')).toBeInTheDocument()
        })
    })

    it('renders Events component at /events path', async () => {
        await router.navigate({ to: '/events' })

        render(<RouterProvider router={router} />)

        await waitFor(() => {
            expect(screen.getByTestId('events-component')).toBeInTheDocument()
        })
    })

    it('renders Entities component at /entities path', async () => {
        await router.navigate({ to: '/entities' })

        render(<RouterProvider router={router} />)

        await waitFor(() => {
            expect(screen.getByTestId('entities-component')).toBeInTheDocument()
        })
    })

    it('renders Account component at /account path', async () => {
        await router.navigate({ to: '/account' })

        render(<RouterProvider router={router} />)

        await waitFor(() => {
            expect(screen.getByTestId('account-component')).toBeInTheDocument()
        })
    })
})