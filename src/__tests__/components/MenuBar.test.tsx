import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MenuBar from '../../components/MenuBar'
import { authService } from '../../services/auth.service'

// Mock Link component from react-router to avoid needing RouterProvider
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>
}))

// Mock route components to avoid API calls if rendered
vi.mock('../../components/Events', () => ({
  default: () => <div data-testid="events-component">Events Page</div>
}))
vi.mock('../../components/Entities', () => ({
  default: () => <div data-testid="entities-component">Entities Page</div>
}))
vi.mock('../../routes/account', () => ({
  default: () => <div data-testid="account-component">Account Page</div>
}))
vi.mock('../../components/Calendar', () => ({
  default: () => <div data-testid="calendar-component">Calendar Page</div>
}))

vi.mock('../../services/auth.service')

const client = new QueryClient()

const renderMenuBar = async () => {
  render(
    <QueryClientProvider client={client}>
      <MenuBar />
    </QueryClientProvider>
  )
  await waitFor(() => {})
}

describe('MenuBar login indicator', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
  })

  it('shows login button when not authenticated', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false)

    await renderMenuBar()

    expect(screen.getByText('Not logged in')).toBeInTheDocument()
    expect(screen.getByText('Login / Register')).toBeInTheDocument()
  })

  it('shows username and account button when authenticated', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true)
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com'
    })

    await renderMenuBar()

    await waitFor(() => {
      expect(screen.getByText('Logged in as testuser')).toBeInTheDocument()
    })
    expect(screen.getByText('My Account')).toBeInTheDocument()
  })
})
