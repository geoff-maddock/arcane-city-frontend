import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '../test-render' // Use our custom render with QueryClient
import Events from '../../components/Events'
import { useEvents } from '../../hooks/useEvents'
import EventFilters from '../../components/EventFilters'
import { PaginatedResponse, Event, UseEventsParams } from '../../types/api';
import { UseQueryResult } from '@tanstack/react-query';
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
                like: 0,
                created_at: '2022-12-01T00:00:00Z',
                updated_at: '2022-12-15T00:00:00Z'
            },
            {
                id: 2,
                slug: 'event-2',
                name: 'Test Event 2',
                primary_photo: 'photo2.jpg',
                primary_photo_thumbnail: 'thumb2.jpg',
                start_at: '2023-01-02T00:00:00Z',
                attending: 0,
                like: 0,
                created_at: '2022-12-02T00:00:00Z',
                updated_at: '2022-12-16T00:00:00Z'
            }
        ],
        last_page: 2,
        total: 4,
        current_page: 1,
        per_page: 2
    }

    // Helper to build a react-query result object with sensible defaults; we cast to any to avoid brittle union exactness.
    const buildResult = (overrides: Partial<UseQueryResult<PaginatedResponse<Event>, Error>>): UseQueryResult<PaginatedResponse<Event>, Error> => ({
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
    }) as unknown as UseQueryResult<PaginatedResponse<Event>, Error>;

    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.clear();
    });

    it('renders events when data is loaded', async () => {
        vi.mocked(useEvents).mockReturnValue(buildResult({
            data: mockEvents,
            isLoading: false,
            status: 'success',
            isSuccess: true,
        }));
        render(<Events />)

        // Check for main components
        expect(screen.getByText('Event Listings')).toBeInTheDocument()
        // Filters should be hidden by default
        expect(screen.queryByTestId('event-filters')).not.toBeInTheDocument()

        // Check that events are rendered
        await waitFor(() => {
            expect(screen.getAllByTestId('event-card')).toHaveLength(2)
        })
    })

    it('shows loading state', () => {
        vi.mocked(useEvents).mockReturnValue(buildResult({
            data: undefined,
            isLoading: true,
            isPending: true,
            fetchStatus: 'fetching',
            status: 'pending',
            isSuccess: false,
        }));

        render(<Events />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows error message when loading fails', () => {
        vi.mocked(useEvents).mockReturnValue(buildResult({
            data: undefined,
            error: new Error('Failed to load'),
            isError: true,
            isLoading: false,
            status: 'error',
            isSuccess: false,
        }));

        render(<Events />)
        expect(screen.getByText(/there was an error loading events/i)).toBeInTheDocument()
    })

    it('shows empty state when no events are found', () => {
        vi.mocked(useEvents).mockReturnValue(buildResult({
            data: { ...mockEvents, data: [], total: 0 },
            status: 'success',
            isSuccess: true,
        }));

        render(<Events />)
        expect(screen.getByText(/no events found/i)).toBeInTheDocument()
    })

    it('toggles filters visibility', () => {
        vi.mocked(useEvents).mockReturnValue(buildResult({
            data: mockEvents,
            status: 'success',
            isSuccess: true,
        }));

        render(<Events />)

        // Filters should be hidden by default
        expect(screen.queryByTestId('event-filters')).not.toBeInTheDocument()

        // Click the toggle button to show filters
        fireEvent.click(screen.getByText(/show filters/i))

        // Filters should now be visible
        expect(screen.getByTestId('event-filters')).toBeInTheDocument()

        // Click the toggle button again to hide filters
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
                return buildResult({
                    data: mockEvents,
                    isLoading: false,
                    status: 'success',
                    isSuccess: true,
                    promise: Promise.resolve(mockEvents),
                });
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

            // First show the filters since they're hidden by default
            fireEvent.click(screen.getByText(/show filters/i))

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