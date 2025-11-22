import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test-render';
import SeriesEvents from '../../components/SeriesEvents';
import { useEvents } from '../../hooks/useEvents';
import { PaginatedResponse, Event } from '../../types/api';
import { UseQueryResult } from '@tanstack/react-query';

// Mock the useEvents hook
vi.mock('../../hooks/useEvents');

// Mock child components
vi.mock('../../components/EventCard', () => ({
    default: ({ event }: { event: { name: string } }) => (
        <div data-testid="event-card">{event.name}</div>
    ),
}));

vi.mock('../../components/Pagination', () => ({
    Pagination: ({
        onPageChange,
        currentPage,
    }: {
        onPageChange: (page: number) => void;
        currentPage: number;
    }) => (
        <div data-testid="pagination">
            <span>Current Page: {currentPage}</span>
            <button
                data-testid="next-page-button"
                onClick={() => onPageChange(currentPage + 1)}
            >
                Next Page
            </button>
        </div>
    ),
}));

describe('SeriesEvents Component', () => {
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
                updated_at: '2022-12-15T00:00:00Z',
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
                updated_at: '2022-12-16T00:00:00Z',
            },
        ],
        last_page: 3,
        total: 30,
        current_page: 1,
        per_page: 10,
    };

    const buildResult = (
        overrides: Partial<UseQueryResult<PaginatedResponse<Event>, Error>>
    ): UseQueryResult<PaginatedResponse<Event>, Error> =>
        ({
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
        // Mock window.scrollTo to track if it's called
        window.scrollTo = vi.fn();
    });

    it('renders series events when data is loaded', async () => {
        vi.mocked(useEvents).mockReturnValue(
            buildResult({
                data: mockEvents,
                isLoading: false,
                status: 'success',
                isSuccess: true,
            })
        );

        render(<SeriesEvents seriesName="Test Series" />);

        // Check that the title is rendered
        expect(screen.getByText('Events')).toBeInTheDocument();

        // Check that events are rendered
        await waitFor(() => {
            expect(screen.getAllByTestId('event-card')).toHaveLength(2);
        });
    });

    it('shows loading state', () => {
        vi.mocked(useEvents).mockReturnValue(
            buildResult({
                data: undefined,
                isLoading: true,
                isPending: true,
                fetchStatus: 'fetching',
                status: 'pending',
                isSuccess: false,
            })
        );

        render(<SeriesEvents seriesName="Test Series" />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows error message when loading fails', () => {
        vi.mocked(useEvents).mockReturnValue(
            buildResult({
                data: undefined,
                error: new Error('Failed to load'),
                isError: true,
                isLoading: false,
                status: 'error',
                isSuccess: false,
            })
        );

        render(<SeriesEvents seriesName="Test Series" />);
        expect(
            screen.getByText(/there was an error loading events/i)
        ).toBeInTheDocument();
    });

    it('shows empty state when no events are found', () => {
        vi.mocked(useEvents).mockReturnValue(
            buildResult({
                data: { ...mockEvents, data: [], total: 0 },
                status: 'success',
                isSuccess: true,
            })
        );

        render(<SeriesEvents seriesName="Test Series" />);
        expect(screen.getByText(/no events found for this series/i)).toBeInTheDocument();
    });

    it('does NOT scroll to top when changing pagination page', async () => {
        vi.mocked(useEvents).mockReturnValue(
            buildResult({
                data: mockEvents,
                isLoading: false,
                status: 'success',
                isSuccess: true,
            })
        );

        render(<SeriesEvents seriesName="Test Series" />);

        // Wait for the component to render
        await waitFor(() => {
            expect(screen.getAllByTestId('event-card')).toHaveLength(2);
        });

        // Click the next page button
        const nextPageButton = screen.getAllByTestId('next-page-button')[0];
        fireEvent.click(nextPageButton);

        // Verify window.scrollTo was NOT called
        expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('updates page state when changing pages', async () => {
        const mockUseEvents = vi.mocked(useEvents);
        let capturedPage = 1;

        mockUseEvents.mockImplementation((params) => {
            if (params?.page) {
                capturedPage = params.page;
            }
            return buildResult({
                data: { ...mockEvents, current_page: capturedPage },
                isLoading: false,
                status: 'success',
                isSuccess: true,
            });
        });

        const { rerender } = render(<SeriesEvents seriesName="Test Series" />);

        await waitFor(() => {
            expect(screen.getAllByText(/Current Page: 1/)[0]).toBeInTheDocument();
        });

        // Click the next page button (there are two pagination components)
        const nextPageButton = screen.getAllByTestId('next-page-button')[0];
        fireEvent.click(nextPageButton);

        // Re-render to reflect the state change
        rerender(<SeriesEvents seriesName="Test Series" />);

        await waitFor(() => {
            expect(capturedPage).toBe(2);
        });
    });
});
