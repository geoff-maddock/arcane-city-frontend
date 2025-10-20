import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '../test-render' // Use our custom render with QueryClient
import YourEntities from '../../components/YourEntities'
import { useEntities } from '../../hooks/useEntities'
import EntityFilters from '../../components/EntityFilters'
import { PaginatedResponse, Entity } from '../../types/api';
import { UseQueryResult } from '@tanstack/react-query';

// Mock the custom hooks and components
vi.mock('../../hooks/useEntities')

vi.mock('../../hooks/useLocalStorage', () => ({
    useLocalStorage: () => [25, vi.fn()]
}))

// Mock child components
vi.mock('../../components/EntityCard', () => ({
    default: ({ entity }: { entity: { name: string } }) => (
        <div data-testid="entity-card">
            {entity.name}
        </div>
    )
}))

// Update the EntityFilters mock
vi.mock('../../components/EntityFilters', () => ({
    default: vi.fn((props: { onFilterChange: (filters: { name: string; entity_type: string; role: string; entity_status: string; tag: string }) => void }) => (
        <div data-testid="entity-filters">
            <button
                onClick={() => props.onFilterChange({
                    name: 'Test Entity',
                    entity_type: 'venue',
                    role: '',
                    entity_status: '',
                    tag: ''
                })}
                data-testid="update-filters-button"
            >
                Update Filters
            </button>
        </div>
    ))
}))

vi.mock('../../components/Pagination', () => ({
    Pagination: () => <div data-testid="pagination">Pagination</div>
}))

vi.mock('../../components/SortControls', () => ({
    default: () => <div data-testid="sort-controls">Sort Controls</div>
}))

// Mock authService with authenticated user
vi.mock('../../services/auth.service', () => ({
    authService: {
        isAuthenticated: () => true,
        getCurrentUser: vi.fn(() => Promise.resolve({
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            followed_entities: [
                { id: 1, name: 'Entity 1', slug: 'entity-1' },
                { id: 2, name: 'Entity 2', slug: 'entity-2' }
            ],
            followed_tags: [],
            followed_series: [],
            followed_threads: []
        }))
    }
}))

// Add a mock for localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value
        },
        clear: () => {
            store = {}
        }
    }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('YourEntities Component', () => {

    const mockEntities = {
        data: [
            {
                id: 1,
                slug: 'entity-1',
                name: 'Test Entity 1',
                primary_photo: 'photo1.jpg',
                primary_photo_thumbnail: 'thumb1.jpg',
                created_at: '2022-12-01T00:00:00Z',
                updated_at: '2022-12-15T00:00:00Z'
            },
            {
                id: 2,
                slug: 'entity-2',
                name: 'Test Entity 2',
                primary_photo: 'photo2.jpg',
                primary_photo_thumbnail: 'thumb2.jpg',
                created_at: '2022-12-02T00:00:00Z',
                updated_at: '2022-12-16T00:00:00Z'
            }
        ],
        last_page: 2,
        total: 4,
        current_page: 1,
        per_page: 2
    }

    // Helper to build a react-query result object with sensible defaults
    const buildResult = (overrides: Partial<UseQueryResult<PaginatedResponse<Entity>, Error>>): UseQueryResult<PaginatedResponse<Entity>, Error> => ({
        data: undefined,
        error: null,
        status: 'success',
        fetchStatus: 'idle',
        isError: false,
        isLoading: false,
        isPending: false,
        isSuccess: true,
        isFetched: true,
        isFetchedAfterMount: true,
        isFetching: false,
        isRefetching: false,
        isStale: false,
        refetch: vi.fn(),
        failureCount: 0,
        failureReason: null,
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        errorUpdateCount: 0,
        isPaused: false,
        isPlaceholderData: false,
        promise: Promise.resolve(undefined),
        ...overrides,
    }) as unknown as UseQueryResult<PaginatedResponse<Entity>, Error>;

    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.clear();
    });

    it('renders your entities when data is loaded', async () => {
        vi.mocked(useEntities).mockReturnValue(buildResult({
            data: mockEntities,
            isLoading: false,
            status: 'success',
            isSuccess: true,
        }));
        render(<YourEntities />)

        // Check for main components
        expect(screen.getByText('Your Entities')).toBeInTheDocument()
        expect(screen.getByText(/entities you follow/i)).toBeInTheDocument()
        // Filters should be hidden by default
        expect(screen.queryByTestId('entity-filters')).not.toBeInTheDocument()

        // Check that entities are rendered
        await waitFor(() => {
            expect(screen.getAllByTestId('entity-card')).toHaveLength(2)
        })
    })

    it('shows loading state', () => {
        vi.mocked(useEntities).mockReturnValue(buildResult({
            data: undefined,
            isLoading: true,
            isPending: true,
            fetchStatus: 'fetching',
            status: 'pending',
            isSuccess: false,
        }));

        render(<YourEntities />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows error message when loading fails', () => {
        vi.mocked(useEntities).mockReturnValue(buildResult({
            data: undefined,
            error: new Error('Failed to load'),
            isError: true,
            isLoading: false,
            status: 'error',
            isSuccess: false,
        }));

        render(<YourEntities />)
        expect(screen.getByText(/there was an error loading entities/i)).toBeInTheDocument()
    })

    it('shows empty state when no followed entities are found', () => {
        vi.mocked(useEntities).mockReturnValue(buildResult({
            data: { ...mockEntities, data: [], total: 0 },
            status: 'success',
            isSuccess: true,
        }));

        render(<YourEntities />)
        expect(screen.getByText(/no followed entities found/i)).toBeInTheDocument()
    })

    it('toggles filters visibility', () => {
        vi.mocked(useEntities).mockReturnValue(buildResult({
            data: mockEntities,
            status: 'success',
            isSuccess: true,
        }));

        render(<YourEntities />)

        // Filters should be hidden by default
        expect(screen.queryByTestId('entity-filters')).not.toBeInTheDocument()

        // Click the toggle button to show filters
        fireEvent.click(screen.getByText(/show filters/i))

        // Filters should now be visible
        expect(screen.getByTestId('entity-filters')).toBeInTheDocument()

        // Click the toggle button again to hide filters
        fireEvent.click(screen.getByText(/hide filters/i))

        // Filters should be hidden
        expect(screen.queryByTestId('entity-filters')).not.toBeInTheDocument()
    })

    it('calls useEntities with followedOnly parameter', () => {
        const mockUseEntities = vi.mocked(useEntities)
        mockUseEntities.mockReturnValue(buildResult({
            data: mockEntities,
            status: 'success',
            isSuccess: true,
        }));

        render(<YourEntities />)

        // Check that useEntities was called with followedOnly: true
        expect(mockUseEntities).toHaveBeenCalledWith(
            expect.objectContaining({
                followedOnly: true
            })
        )
    })
})
