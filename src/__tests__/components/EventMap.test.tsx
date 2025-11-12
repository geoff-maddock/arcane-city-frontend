import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EventMap from '../../components/EventMap';
import { Event } from '../../types/api';

// Mock the geocoding module
vi.mock('../../lib/geocoding', () => ({
    geocodeAddress: vi.fn(async (location) => {
        // Simulate successful geocoding for addresses
        if (location.address_one && location.city) {
            return {
                lat: 40.4406,
                lng: -79.9959,
                address: `${location.address_one}, ${location.city}`
            };
        }
        return null;
    }),
    buildAddressQuery: vi.fn((location) => {
        if (location.address_one || location.city) {
            const parts = [];
            if (location.address_one) parts.push(location.address_one);
            if (location.city) parts.push(location.city);
            return parts.join(', ');
        }
        return null;
    })
}));

// Mock the Link component from react-router
vi.mock('@tanstack/react-router', () => ({
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
        <a href={to}>{children}</a>
    )
}));

// Mock leaflet to avoid DOM issues in tests
vi.mock('leaflet', () => ({
    default: {
        icon: vi.fn(() => ({})),
        Marker: {
            prototype: {
                options: {
                    icon: {}
                }
            }
        },
        latLngBounds: vi.fn(() => ({
            isValid: () => true
        }))
    }
}));

vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children }: { children: React.ReactNode }) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>
}));

describe('EventMap', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockVenue = {
        id: 1,
        name: 'Test Venue',
        slug: 'test-venue',
        primary_location: {
            id: 1,
            name: 'Test Location',
            slug: 'test-location',
            latitude: 40.4406,
            longitude: -79.9959,
            address_one: '123 Test St',
            city: 'Pittsburgh'
        }
    };

    const mockEvent: Event = {
        id: 1,
        name: 'Test Event',
        slug: 'test-event',
        start_at: '2024-01-15T20:00:00Z',
        venue: mockVenue,
        attending: 0,
        like: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    };

    it('renders map when events have location data', async () => {
        render(<EventMap events={[mockEvent]} />);
        
        // Wait for geocoding to complete
        await waitFor(() => {
            expect(screen.getByTestId('map-container')).toBeInTheDocument();
        });
    });

    it('displays message when no events have location data', async () => {
        const eventWithoutLocation: Event = {
            ...mockEvent,
            venue: undefined
        };
        render(<EventMap events={[eventWithoutLocation]} />);
        
        await waitFor(() => {
            expect(screen.getByText(/No events with location data found/i)).toBeInTheDocument();
        });
    });

    it('groups multiple events at same location', async () => {
        const event2: Event = {
            ...mockEvent,
            id: 2,
            name: 'Test Event 2',
            slug: 'test-event-2'
        };
        
        render(<EventMap events={[mockEvent, event2]} />);
        
        // Wait for geocoding and rendering
        await waitFor(() => {
            const markers = screen.getAllByTestId('marker');
            // Should only have 1 marker for 2 events at same location
            expect(markers).toHaveLength(1);
        });
    });

    it('creates separate markers for different locations', async () => {
        const differentVenue = {
            ...mockVenue,
            id: 2,
            name: 'Different Venue',
            slug: 'different-venue',
            primary_location: {
                ...mockVenue.primary_location,
                id: 2,
                latitude: 40.5,
                longitude: -80.0
            }
        };

        const event2: Event = {
            ...mockEvent,
            id: 2,
            name: 'Test Event 2',
            slug: 'test-event-2',
            venue: differentVenue
        };
        
        render(<EventMap events={[mockEvent, event2]} />);
        
        // Wait for geocoding and rendering
        await waitFor(() => {
            const markers = screen.getAllByTestId('marker');
            // Should have 2 markers for events at different locations
            expect(markers).toHaveLength(2);
        });
    });
});
