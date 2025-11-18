import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../test-render' // Use our custom render with QueryClient
import MenuBar from '../../components/MenuBar'
import { authService } from '../../services/auth.service'

// Mock Link component from react-router to avoid needing RouterProvider
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useNavigate: () => vi.fn(),
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

const renderMenuBar = async () => {
  render(<MenuBar />)
  await waitFor(() => { })
}

describe('MenuBar login indicator', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
  })

  it('shows login button when not authenticated', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(false)

    await renderMenuBar()

    expect(screen.getByText('Login / Register')).toBeInTheDocument()
  })

  it('shows username and account button when authenticated', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true)
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      id: 1,
      name: 'testuser',
      email: 'test@example.com',
      status: { id: 1, name: 'active' },
      email_verified_at: null,
      last_active: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      followed_tags: [],
      followed_entities: [],
      followed_series: [],
      followed_threads: [],
      photos: []
    })

    await renderMenuBar()

    await waitFor(() => {
      expect(screen.getByText('My Account')).toBeInTheDocument()
      expect(screen.getByText('Your Calendar')).toBeInTheDocument()
      expect(screen.getByText('Your Entities')).toBeInTheDocument()
    })
  })
})

describe('MenuBar More submenu', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    localStorage.clear()
    vi.mocked(authService.isAuthenticated).mockReturnValue(false)
  })

  it('shows direct links when viewport has enough vertical space', async () => {
    // Mock viewport height to be large enough
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })

    await renderMenuBar()

    // Links should be visible directly, not behind More button
    await waitFor(() => {
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Blogs')).toBeInTheDocument()
      expect(screen.getByText('Help')).toBeInTheDocument()
      expect(screen.getByText('Privacy')).toBeInTheDocument()
    })

    // More button should not exist
    expect(screen.queryByRole('button', { name: /toggle more menu options/i })).not.toBeInTheDocument()
  })

  it('initially hides About, Blogs, Help, and Privacy links when viewport has limited space', async () => {
    // Mock viewport height to be small
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    })

    await renderMenuBar()

    expect(screen.queryByText('About')).not.toBeInTheDocument()
    expect(screen.queryByText('Blogs')).not.toBeInTheDocument()
    expect(screen.queryByText('Help')).not.toBeInTheDocument()
    expect(screen.queryByText('Privacy')).not.toBeInTheDocument()
  })

  it('shows More button when viewport has limited space', async () => {
    // Mock viewport height to be small
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    })

    await renderMenuBar()

    const moreButton = screen.getByRole('button', { name: /toggle more menu options/i })
    expect(moreButton).toBeInTheDocument()
    expect(moreButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands and shows menu items when More button is clicked', async () => {
    // Mock viewport height to be small
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    })

    const user = userEvent.setup()
    await renderMenuBar()

    const moreButton = screen.getByRole('button', { name: /toggle more menu options/i })
    await user.click(moreButton)

    await waitFor(() => {
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Blogs')).toBeInTheDocument()
      expect(screen.getByText('Help')).toBeInTheDocument()
      expect(screen.getByText('Privacy')).toBeInTheDocument()
    })

    expect(moreButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('collapses menu items when More button is clicked again', async () => {
    // Mock viewport height to be small
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 600,
    })

    const user = userEvent.setup()
    await renderMenuBar()

    const moreButton = screen.getByRole('button', { name: /toggle more menu options/i })
    
    // Expand
    await user.click(moreButton)
    await waitFor(() => {
      expect(screen.getByText('About')).toBeInTheDocument()
    })

    // Collapse
    await user.click(moreButton)
    await waitFor(() => {
      expect(screen.queryByText('About')).not.toBeInTheDocument()
      expect(screen.queryByText('Blogs')).not.toBeInTheDocument()
      expect(screen.queryByText('Help')).not.toBeInTheDocument()
      expect(screen.queryByText('Privacy')).not.toBeInTheDocument()
    })

    expect(moreButton).toHaveAttribute('aria-expanded', 'false')
  })
})
