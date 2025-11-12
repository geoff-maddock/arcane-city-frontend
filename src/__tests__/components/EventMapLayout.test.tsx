import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import EventMapLayout from '../../components/EventMapLayout';
import { render } from '../test-render';
import * as useEventsModule from '../../hooks/useEvents';
import { UseQueryResult } from '@tanstack/react-query';
import { PaginatedResponse, Event } from '../../types/api';

// Mock the EventMap component
vi.mock('../../components/EventMap', () => ({
    default: () => <div data-testid="event-map">Event Map</div>
}));

// Mock the useEvents hook
vi.mock('../../hooks/useEvents');

describe('EventMapLayout', () => {
    beforeEach(() => {
        vi.mocked(useEventsModule.useEvents).mockReturnValue({
            data: {
                data: [
                    {
                        id: 1,
                        name: 'Test Event',
                        slug: 'test-event',
                        start_at: '2024-01-15T20:00:00Z',
                        venue: {
                            id: 1,
                            name: 'Test Venue',
                            slug: 'test-venue',
                            primary_location: {
                                id: 1,
                                name: 'Test Location',
                                slug: 'test-location',
                                latitude: 40.4406,
                                longitude: -79.9959
                            }
                        },
                        attending: 0,
                        like: 0,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z'
                    }
                ],
                last_page: 1,
                total: 1
            },
            isLoading: false,
            error: null
        } as UseQueryResult<PaginatedResponse<Event>>);
    });

    it('renders the component with title and map', () => {
        render(<EventMapLayout />);
        
        expect(screen.getByRole('heading', { name: 'Event Map' })).toBeInTheDocument();
        expect(screen.getByText('Explore upcoming events on an interactive map')).toBeInTheDocument();
        expect(screen.getByTestId('event-map')).toBeInTheDocument();
    });

    it('displays loading state', () => {
        vi.mocked(useEventsModule.useEvents).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null
        } as UseQueryResult<PaginatedResponse<Event>>);

        render(<EventMapLayout />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('displays error state', () => {
        vi.mocked(useEventsModule.useEvents).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('Test error')
        } as UseQueryResult<PaginatedResponse<Event>>);

        render(<EventMapLayout />);
        expect(screen.getByText(/There was an error loading events/i)).toBeInTheDocument();
    });
});
