import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test-render';
import Radar from '../../components/Radar';
import { useQuery } from '@tanstack/react-query';
import { useUserAttendingEvents, useUserRecommendedEvents, useRecentEvents } from '../../hooks/useRadar';
import { UseQueryResult } from '@tanstack/react-query';
import { PaginatedResponse, Event } from '../../types/api';
import { User } from '../../types/auth';

// Mock the hooks
vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual('@tanstack/react-query');
    return {
        ...actual,
        useQuery: vi.fn(),
    };
});

vi.mock('../../hooks/useRadar');

// Mock the Link component
vi.mock('@tanstack/react-router', () => ({
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    ),
}));

vi.mock('../../components/EventCardCondensed', () => ({
    default: ({ event }: { event: { name: string } }) => (
        <div data-testid="event-card-condensed">
            {event.name}
        </div>
    )
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe('Radar Component', () => {
    const mockUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        status: { id: 1, name: 'active' },
        email_verified_at: '2023-01-01',
        last_active: null,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        followed_entities: [{ id: 1, name: 'Test Entity', slug: 'test-entity' }],
        followed_tags: [{ id: 1, name: 'Test Tag', slug: 'test-tag' }],
        followed_series: [],
        followed_threads: [],
        groups: [],
        permissions: [],
        photos: [],
    };

    const mockAttendingEvents: PaginatedResponse<Event> = {
        data: [
            {
                id: 1,
                slug: 'event-1',
                name: 'Test Event 1',
                primary_photo: 'photo1.jpg',
                primary_photo_thumbnail: 'thumb1.jpg',
                start_at: '2023-01-01T00:00:00Z',
                attending: 1,
                like: 0,
                created_at: '2022-12-01T00:00:00Z',
                updated_at: '2022-12-15T00:00:00Z',
            },
        ],
        last_page: 1,
        total: 1,
        current_page: 1,
        per_page: 10,
    };

    const mockRecommendedEvents: Event[] = [
        {
            id: 2,
            slug: 'event-2',
            name: 'Recommended Event',
            primary_photo: 'photo2.jpg',
            primary_photo_thumbnail: 'thumb2.jpg',
            start_at: '2023-01-02T00:00:00Z',
            attending: 0,
            like: 0,
            created_at: '2022-12-02T00:00:00Z',
            updated_at: '2022-12-16T00:00:00Z',
        },
    ];

    const mockRecentEvents: PaginatedResponse<Event> = {
        data: [
            {
                id: 3,
                slug: 'event-3',
                name: 'Recent Event',
                primary_photo: 'photo3.jpg',
                primary_photo_thumbnail: 'thumb3.jpg',
                start_at: '2023-01-03T00:00:00Z',
                attending: 0,
                like: 0,
                created_at: '2022-12-03T00:00:00Z',
                updated_at: '2022-12-17T00:00:00Z',
            },
        ],
        last_page: 1,
        total: 1,
        current_page: 1,
        per_page: 10,
    };

    const buildQueryResult = <T,>(overrides: Partial<UseQueryResult<T, Error>>): UseQueryResult<T, Error> => ({
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
    }) as unknown as UseQueryResult<T, Error>;

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(useQuery).mockReturnValue(buildQueryResult<User>({
            data: mockUser,
            isSuccess: true,
        }));
        vi.mocked(useUserAttendingEvents).mockReturnValue(buildQueryResult<PaginatedResponse<Event>>({
            data: mockAttendingEvents,
            isLoading: false,
            isSuccess: true,
        }));
        vi.mocked(useUserRecommendedEvents).mockReturnValue(buildQueryResult<Event[]>({
            data: mockRecommendedEvents,
            isLoading: false,
            isSuccess: true,
        }));
        vi.mocked(useRecentEvents).mockReturnValue(buildQueryResult<PaginatedResponse<Event>>({
            data: mockRecentEvents,
            isLoading: false,
            isSuccess: true,
        }));
    });

    describe('Quick Links Navigation', () => {
        it('renders quick links when user has attending events', async () => {
            render(<Radar />);

            await waitFor(() => {
                expect(screen.getByText('Your Events')).toBeInTheDocument();
            });

            expect(screen.getByText('Recommended')).toBeInTheDocument();
            expect(screen.getByText('Recent Events')).toBeInTheDocument();
            expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
        });

        it('scrolls to attending events section when Your Events link is clicked', async () => {
            render(<Radar />);

            await waitFor(() => {
                expect(screen.getByText('Your Events')).toBeInTheDocument();
            });

            const yourEventsButton = screen.getByText('Your Events').closest('button');
            expect(yourEventsButton).toBeInTheDocument();

            // Mock getElementById
            const mockElement = document.createElement('section');
            mockElement.id = 'attending-events';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

            fireEvent.click(yourEventsButton!);

            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
            });
        });

        it('scrolls to recommended events section when Recommended link is clicked', async () => {
            render(<Radar />);

            await waitFor(() => {
                expect(screen.getByText('Recommended')).toBeInTheDocument();
            });

            const recommendedButton = screen.getByText('Recommended').closest('button');
            expect(recommendedButton).toBeInTheDocument();

            const mockElement = document.createElement('section');
            mockElement.id = 'recommended-events';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

            fireEvent.click(recommendedButton!);

            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
            });
        });

        it('scrolls to recent events section when Recent Events link is clicked', async () => {
            render(<Radar />);

            await waitFor(() => {
                expect(screen.getByText('Recent Events')).toBeInTheDocument();
            });

            const recentButton = screen.getByText('Recent Events').closest('button');
            expect(recentButton).toBeInTheDocument();

            const mockElement = document.createElement('section');
            mockElement.id = 'recent-events';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

            fireEvent.click(recentButton!);

            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
            });
        });

        it('shows Get Started link when user has no attending events or followed content', async () => {
            vi.mocked(useQuery).mockReturnValue(buildQueryResult<User>({
                data: { ...mockUser, followed_entities: [], followed_tags: [] },
                isSuccess: true,
            }));
            vi.mocked(useUserAttendingEvents).mockReturnValue(buildQueryResult<PaginatedResponse<Event>>({
                data: { ...mockAttendingEvents, data: [] },
                isLoading: false,
                isSuccess: true,
            }));

            render(<Radar />);

            await waitFor(() => {
                expect(screen.getByText('Get Started')).toBeInTheDocument();
            });

            expect(screen.queryByText('Your Events')).not.toBeInTheDocument();
            expect(screen.queryByText('Recommended')).not.toBeInTheDocument();
            expect(screen.getByText('Recent Events')).toBeInTheDocument();
        });

        it('scrolls to get started section when Get Started link is clicked', async () => {
            vi.mocked(useQuery).mockReturnValue(buildQueryResult<User>({
                data: { ...mockUser, followed_entities: [], followed_tags: [] },
                isSuccess: true,
            }));
            vi.mocked(useUserAttendingEvents).mockReturnValue(buildQueryResult<PaginatedResponse<Event>>({
                data: { ...mockAttendingEvents, data: [] },
                isLoading: false,
                isSuccess: true,
            }));

            render(<Radar />);

            await waitFor(() => {
                expect(screen.getByText('Get Started')).toBeInTheDocument();
            });

            const getStartedButton = screen.getByText('Get Started').closest('button');
            expect(getStartedButton).toBeInTheDocument();

            const mockElement = document.createElement('section');
            mockElement.id = 'get-started';
            vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

            fireEvent.click(getStartedButton!);

            expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'start',
            });
        });
    });

    describe('Section IDs', () => {
        it('renders sections with correct IDs for scrolling', async () => {
            render(<Radar />);

            await waitFor(() => {
                const attendingSection = document.getElementById('attending-events');
                expect(attendingSection).toBeInTheDocument();
            });

            const recommendedSection = document.getElementById('recommended-events');
            expect(recommendedSection).toBeInTheDocument();

            const recentSection = document.getElementById('recent-events');
            expect(recentSection).toBeInTheDocument();
        });

        it('renders get-started section with correct ID when applicable', async () => {
            vi.mocked(useQuery).mockReturnValue(buildQueryResult<User>({
                data: { ...mockUser, followed_entities: [], followed_tags: [] },
                isSuccess: true,
            }));
            vi.mocked(useUserAttendingEvents).mockReturnValue(buildQueryResult<PaginatedResponse<Event>>({
                data: { ...mockAttendingEvents, data: [] },
                isLoading: false,
                isSuccess: true,
            }));

            render(<Radar />);

            await waitFor(() => {
                const getStartedSection = document.getElementById('get-started');
                expect(getStartedSection).toBeInTheDocument();
            });
        });
    });
});
