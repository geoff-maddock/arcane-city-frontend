import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '../router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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

vi.mock('../components/Calendar', () => ({
    default: () => <div data-testid="calendar-component">Calendar Page</div>
}))

const client = new QueryClient()

describe('Router Configuration', () => {
    it('renders Events component at root path', async () => {
        render(
            <QueryClientProvider client={client}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('events-component')).toBeInTheDocument()
        })
    })

    it('renders Events component at /events path', async () => {
        await router.navigate({ to: '/events' })

        render(
            <QueryClientProvider client={client}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('events-component')).toBeInTheDocument()
        })
    })

    it('renders Entities component at /entities path', async () => {
        await router.navigate({ to: '/entities' })

        render(
            <QueryClientProvider client={client}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('entities-component')).toBeInTheDocument()
        })
    })

    it('renders Account component at /account path', async () => {
        await router.navigate({ to: '/account' })

        render(
            <QueryClientProvider client={client}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('account-component')).toBeInTheDocument()
        })
    })

    it('renders Calendar component at /calendar path', async () => {
        await router.navigate({ to: '/calendar' })

        render(
            <QueryClientProvider client={client}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('calendar-component')).toBeInTheDocument()
        })
    })
})
