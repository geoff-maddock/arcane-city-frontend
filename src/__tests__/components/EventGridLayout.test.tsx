import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '../test-render'
import EventGridLayout from '../../components/EventGridLayout'
import { useEvents } from '../../hooks/useEvents'
import { PaginatedResponse, Event } from '../../types/api';
import { UseQueryResult } from '@tanstack/react-query';

// Mock the custom hooks
vi.mock('../../hooks/useEvents')

vi.mock('../../hooks/useLocalStorage', () => ({
    useLocalStorage: () => [50, vi.fn()]
}))

// Mock EventCardGridCompact component
vi.mock('../../components/EventCardGridCompact', () => ({
    default: ({ event, showDateBar, dateLabel, isWeekend }: { event: Event; showDateBar: boolean; dateLabel: string; isWeekend: boolean }) => (
        <div data-testid="event-card-grid-compact">
            {showDateBar && (
                <div data-testid="date-bar" className={isWeekend ? 'weekend' : 'weekday'}>
                    {dateLabel}
                </div>
            )}
            <div>{event.name}</div>
            <button>Details</button>
        </div>
    )
}))

vi.mock('../../components/EventFilters', () => ({
    default: vi.fn(() => <div data-testid="event-filters">Filters</div>)
}))

vi.mock('../../components/Pagination', () => ({
    Pagination: () => <div data-testid="pagination">Pagination</div>
}))

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

describe('EventGridLayout Component', () => {

    const mockEvents = {
        data: [
            {
                id: 1,
                slug: 'event-1',
                name: 'Test Event 1',
                primary_photo: 'photo1.jpg',
                primary_photo_thumbnail: 'thumb1.jpg',
                start_at: '2023-01-01T10:00:00Z',
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
                start_at: '2023-01-01T14:00:00Z',
                attending: 0,
                like: 0,
                created_at: '2022-12-02T00:00:00Z',
                updated_at: '2022-12-16T00:00:00Z'
            },
            {
                id: 3,
                slug: 'event-3',
                name: 'Test Event 3',
                primary_photo: 'photo3.jpg',
                primary_photo_thumbnail: 'thumb3.jpg',
                start_at: '2023-01-02T10:00:00Z',
                attending: 0,
                like: 0,
                created_at: '2022-12-03T00:00:00Z',
                updated_at: '2022-12-17T00:00:00Z'
            }
        ],
        last_page: 1,
        total: 3,
        current_page: 1,
        per_page: 50
    }

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

    it('renders event grid with events', async () => {
        vi.mocked(useEvents).mockReturnValue(buildResult({
            data: mockEvents,
            isLoading: false,
            status: 'success',
            isSuccess: true,
        }));
        
        render(<EventGridLayout />)

        expect(screen.getByText('Event Grid')).toBeInTheDocument()
        expect(screen.getByText('Browse upcoming events in a compact grid layout')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getAllByTestId('event-card-grid-compact')).toHaveLength(3)
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

        render(<EventGridLayout />);
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

        render(<EventGridLayout />)
        expect(screen.getByText(/there was an error loading events/i)).toBeInTheDocument()
    })

    it('shows empty state when no events are found', () => {
        vi.mocked(useEvents).mockReturnValue(buildResult({
            data: { ...mockEvents, data: [], total: 0 },
            status: 'success',
            isSuccess: true,
        }));

        render(<EventGridLayout />)
        expect(screen.getByText(/no events found/i)).toBeInTheDocument()
    })

    it('displays date bars for events on different dates', async () => {
        vi.mocked(useEvents).mockReturnValue(buildResult({
            data: mockEvents,
            status: 'success',
            isSuccess: true,
        }));

        render(<EventGridLayout />)

        await waitFor(() => {
            const dateBars = screen.getAllByTestId('date-bar')
            // Should have 2 date bars: one for Jan 1 and one for Jan 2
            expect(dateBars).toHaveLength(2)
        })
    })

    it('toggles filters visibility', () => {
        vi.mocked(useEvents).mockReturnValue(buildResult({
            data: mockEvents,
            status: 'success',
            isSuccess: true,
        }));

        render(<EventGridLayout />)

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
})
