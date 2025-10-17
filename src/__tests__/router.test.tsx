import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '../router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MediaPlayerProvider } from '../context/MediaPlayerContext'

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

vi.mock('../components/YourCalendar', () => ({
    default: () => <div data-testid="your-calendar-component">Your Calendar Page</div>
}))

const client = new QueryClient()

describe('Router Configuration', () => {
    beforeEach(() => {
        // Mock window.scrollTo
        vi.stubGlobal('scrollTo', vi.fn())
    })

    it('renders Events component at root path', async () => {
        render(
            <QueryClientProvider client={client}>
                <MediaPlayerProvider>
                    <RouterProvider router={router} />
                </MediaPlayerProvider>
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
                <MediaPlayerProvider>
                    <RouterProvider router={router} />
                </MediaPlayerProvider>
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
                <MediaPlayerProvider>
                    <RouterProvider router={router} />
                </MediaPlayerProvider>
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
                <MediaPlayerProvider>
                    <RouterProvider router={router} />
                </MediaPlayerProvider>
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
                <MediaPlayerProvider>
                    <RouterProvider router={router} />
                </MediaPlayerProvider>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('calendar-component')).toBeInTheDocument()
        })
    })

    it('scrolls to top when navigating between routes', async () => {
        const scrollToMock = vi.fn()
        vi.stubGlobal('scrollTo', scrollToMock)

        // Start at events page
        await router.navigate({ to: '/events' })

        render(
            <QueryClientProvider client={client}>
                <MediaPlayerProvider>
                    <RouterProvider router={router} />
                </MediaPlayerProvider>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByTestId('events-component')).toBeInTheDocument()
        })

        // Navigate to entities page
        await router.navigate({ to: '/entities' })

        await waitFor(() => {
            expect(screen.getByTestId('entities-component')).toBeInTheDocument()
        })

        // Verify scrollTo was called with (0, 0)
        await waitFor(() => {
            expect(scrollToMock).toHaveBeenCalledWith(0, 0)
        })
    })
})
