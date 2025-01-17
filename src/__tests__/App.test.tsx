import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

// Mock the components that might cause issues
vi.mock('@vercel/analytics/react', () => ({
    Analytics: () => null
}))

vi.mock('@tanstack/react-query-devtools', () => ({
    ReactQueryDevtools: () => null
}))

// Mock any route components that might make API calls
vi.mock('../components/Events', () => ({
    default: () => <div data-testid="events-component">Events Page</div>
}))

describe('App', () => {
    it('renders without crashing', async () => {
        render(<App />)

        await waitFor(() => {
            expect(screen.getByTestId('events-component')).toBeInTheDocument()
        })
    })

    it('provides necessary context providers', async () => {
        render(<App />)

        await waitFor(() => {
            // Check that QueryClientProvider is rendering children
            expect(screen.getByTestId('events-component')).toBeInTheDocument()
        })
    })
})