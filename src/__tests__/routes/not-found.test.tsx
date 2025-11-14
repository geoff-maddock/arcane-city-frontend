import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '../../router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MediaPlayerProvider } from '../../context/MediaPlayerContext'

const client = new QueryClient()

describe('404 Not Found Page', () => {
    beforeEach(() => {
        // Mock window.scrollTo
        vi.stubGlobal('scrollTo', vi.fn())
    })

    it('renders 404 page for non-existent route', async () => {
        // Navigate to a non-existent route
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await router.navigate({ to: '/this-route-does-not-exist' as any })

        render(
            <QueryClientProvider client={client}>
                <MediaPlayerProvider>
                    <RouterProvider router={router} />
                </MediaPlayerProvider>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
        })
        expect(screen.getByText(/Sorry, the page you're looking for doesn't exist/i)).toBeInTheDocument()
    })

    it('displays helpful information on 404 page', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await router.navigate({ to: '/non-existent-page' as any })

        render(
            <QueryClientProvider client={client}>
                <MediaPlayerProvider>
                    <RouterProvider router={router} />
                </MediaPlayerProvider>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
        })
        
        // Check for helpful information
        expect(screen.getByText(/The URL was typed incorrectly/i)).toBeInTheDocument()
        expect(screen.getByText(/The page has been moved or deleted/i)).toBeInTheDocument()
        expect(screen.getByText(/The link you followed is outdated/i)).toBeInTheDocument()
    })

    it('displays link to homepage on 404 page', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await router.navigate({ to: '/missing-page' as any })

        render(
            <QueryClientProvider client={client}>
                <MediaPlayerProvider>
                    <RouterProvider router={router} />
                </MediaPlayerProvider>
            </QueryClientProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument()
        })
        
        const homeLink = screen.getByText('Go to Homepage')
        expect(homeLink).toBeInTheDocument()
        expect(homeLink.tagName).toBe('A')
    })
})
