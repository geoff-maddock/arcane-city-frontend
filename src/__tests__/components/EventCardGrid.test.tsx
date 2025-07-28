import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils'; // Use our custom render with QueryClient
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EventCardGrid from '../../components/EventCardGrid';
import { EventFilterContext } from '../../context/EventFilterContext';
import { EventFilters } from '../../types/filters';
import { Event } from '../../types/api';

// Mock the router
vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => vi.fn(),
}));

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
    authService: {
        getCurrentUser: vi.fn(),
        isAuthenticated: () => false,
    },
}));

// Mock the API
vi.mock('../../lib/api', () => ({
    api: {
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

const mockEvent: Event = {
    id: 1,
    name: 'Test Event',
    slug: 'test-event',
    short: 'A test event description',
    start_at: '2024-12-25T19:00:00Z',
    primary_photo: 'https://example.com/photo.jpg',
    primary_photo_thumbnail: 'https://example.com/photo-thumb.jpg',
    venue: {
        id: 1,
        name: 'Test Venue',
        slug: 'test-venue',
    },
    event_type: {
        id: 1,
        name: 'Concert',
        slug: 'concert',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
    promoter: {
        id: 1,
        name: 'Test Promoter',
        slug: 'test-promoter',
    },
    presale_price: 25,
    door_price: 30,
    min_age: 18,
    tags: [
        { id: 1, name: 'rock', slug: 'rock' },
        { id: 2, name: 'live-music', slug: 'live-music' },
        { id: 3, name: 'weekend', slug: 'weekend' },
    ],
    entities: [],
    attendees: [],
    attending: 0,
    like: 0,
};

const mockAllImages = [
    { src: 'https://example.com/photo.jpg', alt: 'Test Event' },
];

const mockFilters: EventFilters = {
    name: '',
    venue: '',
    promoter: '',
    entity: '',
    event_type: '',
    tag: '',
    start_at: {
        start: '',
        end: undefined
    }
};

const mockContextValue = {
    filters: mockFilters,
    setFilters: vi.fn(),
};

const renderComponent = () => {
    render(
        <EventFilterContext.Provider value={mockContextValue}>
            <EventCardGrid
                event={mockEvent}
                allImages={mockAllImages}
                imageIndex={0}
            />
        </EventFilterContext.Provider>
    );
};

describe('EventCardGrid', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders event information correctly', () => {
        renderComponent();

        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('Test Venue')).toBeInTheDocument();
        expect(screen.getByText('Concert')).toBeInTheDocument();
        expect(screen.getByText('$25')).toBeInTheDocument();
    });

    it('displays limited tags with count indicator', () => {
        renderComponent();

        expect(screen.getByText('rock')).toBeInTheDocument();
        expect(screen.getByText('live-music')).toBeInTheDocument();
        expect(screen.getByText('+1')).toBeInTheDocument(); // Third tag is shown as +1
    });

    it('handles tag click to filter events', () => {
        renderComponent();

        const tagButton = screen.getByText('rock');
        fireEvent.click(tagButton);

        expect(mockContextValue.setFilters).toHaveBeenCalledWith(expect.any(Function));
    });

    it('renders without image when none provided', () => {
        const eventWithoutImage = { ...mockEvent, primary_photo: undefined, primary_photo_thumbnail: undefined };

        render(
            <EventFilterContext.Provider value={mockContextValue}>
                <EventCardGrid
                    event={eventWithoutImage}
                    allImages={[]}
                    imageIndex={0}
                />
            </EventFilterContext.Provider>
        );

        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('shows door price when no presale price', () => {
        const eventWithDoorPrice = { ...mockEvent, presale_price: 0 };

        render(
            <EventFilterContext.Provider value={mockContextValue}>
                <EventCardGrid
                    event={eventWithDoorPrice}
                    allImages={mockAllImages}
                    imageIndex={0}
                />
            </EventFilterContext.Provider>
        );

        expect(screen.getByText('$30')).toBeInTheDocument();
    });
});
