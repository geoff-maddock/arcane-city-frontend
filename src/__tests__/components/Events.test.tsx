import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '../test-render' // Use our custom render with QueryClient
import Events from '../../components/Events'
import { useEvents } from '../../hooks/useEvents'
import EventFilters from '../../components/EventFilters'
import { PaginatedResponse, Event, UseEventsParams } from '../../types/api'; // Adjust the import paths as necessary
import { UseQueryResult } from '@tanstack/react-query'; // Import UseQueryResult
// import { EventFilters as EventFilterParams, EventFiltersProps } from '../../types/filters';

// Mock the custom hooks and components
vi.mock('../../hooks/useEvents')

vi.mock('../../hooks/useLocalStorage', () => ({
    useLocalStorage: () => [25, vi.fn()]
}))

// Mock child components
vi.mock('../../components/EventCard', () => ({
    default: ({ event }: { event: { name: string } }) => (
        <div data-testid="event-card">
            {event.name}
        </div>
    )
}))

// Update the EventFilters mock
vi.mock('../../components/EventFilters', () => ({
    default: vi.fn((props: { onFilterChange: (filters: { name: string; venue: string; promoter: string; event_type: string; entity: string; tag: string; start_at?: { start?: string; end?: string } }) => void }) => (
        <div data-testid="event-filters">
            <button
                onClick={() => props.onFilterChange({
                    name: 'Test Event',
                    venue: 'Test Venue',
                    event_type: 'concert',
                    promoter: '',
                    entity: '',
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

describe('Events Component', () => {

    const mockEvents = {
        data: [
            {
                id: 1,
                slug: 'event-1',
                name: 'Test Event 1',
                primary_photo: 'photo1.jpg',
                primary_photo_thumbnail: 'thumb1.jpg',
                start_at: '2023-01-01T00:00:00Z',
                attending: 0,
                like: 0
            },
            {
                id: 2,
                slug: 'event-2',
                name: 'Test Event 2',
                primary_photo: 'photo2.jpg',
                primary_photo_thumbnail: 'thumb2.jpg',
                start_at: '2023-01-02T00:00:00Z',
                attending: 0,
                like: 0
            }
        ],
        last_page: 2,
        total: 4,
        current_page: 1,
        per_page: 2
    }

    beforeEach(() => {
        vi.resetAllMocks()
        localStorage.clear()
    })

    it('renders events when data is loaded', async () => {
        // Mock the useEvents hook to return success state
        vi.mocked(useEvents).mockReturnValue({
            data: mockEvents,
            isLoading: false,
            error: null,
            isError: false,
            isPending: false,
            isLoadingError: false,
            isRefetchError: false,
            isEnabled: true,
            // Add any other required properties
        } as UseQueryResult<PaginatedResponse<Event>, Error>);
        render(<Events />)

        // Check for main components
        expect(screen.getByText('Event Listings')).toBeInTheDocument()
        expect(screen.getByTestId('event-filters')).toBeInTheDocument()

        // Check that events are rendered
        await waitFor(() => {
            expect(screen.getAllByTestId('event-card')).toHaveLength(2)
        })
    })

    it('shows loading state', () => {
        // Mock the useEvents hook to return loading state
        vi.mocked(useEvents).mockReturnValue({
            data: undefined,
            dataUpdatedAt: 0,
            error: null,
            errorUpdatedAt: 0,
            errorUpdateCount: 0,
            failureCount: 0,
            failureReason: null,
            fetchStatus: 'fetching',
            isError: false,
            isFetched: false,
            isFetchedAfterMount: false,
            isFetching: true,
            isInitialLoading: false,
            isLoading: true,
            isLoadingError: false,
            isPaused: false,
            isPending: true,
            isPlaceholderData: false,
            isRefetching: false,
            isRefetchError: false,
            isStale: true,
            isSuccess: false,
            promise: expect.any(Promise),
            refetch: expect.any(Function),
            status: 'pending',
            isEnabled: true,
        });

        render(<Events />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows error message when loading fails', () => {
        // Mock the useEvents hook to return error state
        vi.mocked(useEvents).mockReturnValue({
            data: undefined,
            dataUpdatedAt: 0,
            error: new Error('Failed to load'),
            errorUpdatedAt: 0,
            errorUpdateCount: 0,
            failureCount: 0,
            failureReason: null,
            fetchStatus: 'fetching',
            isError: true,
            isFetched: false,
            isFetchedAfterMount: false,
            isFetching: true,
            isInitialLoading: false,
            isLoading: false,
            isLoadingError: true,
            isPaused: false,
            isPending: false,
            isPlaceholderData: false,
            isRefetching: false,
            isRefetchError: false,
            isStale: true,
            isSuccess: false,
            promise: expect.any(Promise),
            refetch: expect.any(Function),
            status: 'error',
            isEnabled: true,
        })

        render(<Events />)
        expect(screen.getByText(/there was an error loading events/i)).toBeInTheDocument()
    })

    it('shows empty state when no events are found', () => {
        // Mock the useEvents hook to return empty data
        vi.mocked(useEvents).mockReturnValue({
            data: { ...mockEvents, data: [], total: 0 },
            dataUpdatedAt: 0,
            error: null,
            errorUpdatedAt: 0,
            errorUpdateCount: 0,
            failureCount: 0,
            failureReason: null,
            fetchStatus: 'fetching',
            isError: false,
            isPending: false,
            isLoadingError: false,
            isFetched: false,
            isFetchedAfterMount: false,
            isFetching: true,
            isInitialLoading: false,
            isLoading: false,
            isPaused: false,
            isPlaceholderData: false,
            isRefetching: false,
            isRefetchError: false,
            isStale: true,
            isSuccess: true,
            promise: expect.any(Promise),
            refetch: expect.any(Function),
            status: 'success',
            isEnabled: true,
        } as UseQueryResult<PaginatedResponse<Event>, Error>);

        render(<Events />)
        expect(screen.getByText(/no events found/i)).toBeInTheDocument()
    })

    it('toggles filters visibility', () => {
        vi.mocked(useEvents).mockReturnValue({
            data: mockEvents,
            dataUpdatedAt: 0,
            error: null,
            errorUpdatedAt: 0,
            errorUpdateCount: 0,
            failureCount: 0,
            failureReason: null,
            fetchStatus: 'fetching',
            isError: false,
            isPending: false,
            isLoadingError: false,
            isFetched: false,
            isFetchedAfterMount: false,
            isFetching: true,
            isInitialLoading: false,
            isLoading: false,
            isPaused: false,
            isPlaceholderData: false,
            isRefetching: false,
            isRefetchError: false,
            isStale: true,
            isSuccess: true,
            promise: expect.any(Promise),
            refetch: expect.any(Function),
            status: 'success',
            isEnabled: true,
        })

        render(<Events />)

        // Filters should be visible by default
        expect(screen.getByTestId('event-filters')).toBeInTheDocument()

        // Click the toggle button
        fireEvent.click(screen.getByText(/hide filters/i))

        // Filters should be hidden
        expect(screen.queryByTestId('event-filters')).not.toBeInTheDocument()
    })

    describe('Filter Interactions', () => {
        it('updates filters when changed', async () => {
            const mockUseEvents = vi.mocked(useEvents)
            const capturedParams: UseEventsParams = {};

            mockUseEvents.mockImplementation((params: UseEventsParams = {}) => {
                Object.assign(capturedParams, params);
                return {
                    data: mockEvents,
                    isLoading: false,
                    error: null,
                    isError: false,
                    isPending: false,
                    isLoadingError: false,
                    isRefetchError: false,
                    isSuccess: true,
                    refetch: vi.fn(),
                    fetchStatus: 'idle',
                    isFetching: false,
                    isFetched: true,
                    isStale: false,
                    isPlaceholderData: false,
                    isInitialLoading: false,
                    dataUpdatedAt: 0,
                    errorUpdatedAt: 0,
                    errorUpdateCount: 0,
                    failureCount: 0,
                    failureReason: null,
                    status: 'success',
                    promise: Promise.resolve(mockEvents),
                    isFetchedAfterMount: false,
                    isPaused: false,
                    isRefetching: false,
                    isEnabled: true,
                } as UseQueryResult<PaginatedResponse<Event>, Error>;
            });

            // Update the EventFilters mock to expose the onFilterChange prop
            vi.mocked(EventFilters).mockImplementation((props: { onFilterChange: (filters: { name: string; venue: string; promoter: string; event_type: string; entity: string; tag: string; start_at?: { start?: string; end?: string } }) => void }) => {
                const { onFilterChange } = props;
                // Expose a button that will trigger the filter change
                return (
                    <div data-testid="event-filters">
                        <button
                            onClick={() => onFilterChange({
                                name: 'test_name',
                                venue: 'test_venue',
                                promoter: 'test_promoter',
                                entity: 'test_entity',
                                event_type: 'test_type',
                                tag: 'test_tag',
                            })}
                            data-testid="update-filters-button"
                        >
                            Update Filters
                        </button>
                    </div>
                )
            })

            render(<Events />)

            // Click the button to trigger the filter change
            fireEvent.click(screen.getByTestId('update-filters-button'))

            await waitFor(() => {
                expect(capturedParams.filters).toMatchObject({
                    name: 'test_name',
                    venue: 'test_venue',
                    promoter: 'test_promoter',
                    entity: 'test_entity',
                    event_type: 'test_type',
                    tag: 'test_tag',
                })
            })
        })

    })


})