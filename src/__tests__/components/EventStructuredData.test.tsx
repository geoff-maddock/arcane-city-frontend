import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventStructuredData from '../../components/EventStructuredData';
import { Event, EntityResponse } from '../../types/api';

// Mock event data for testing
const mockEvent: Event = {
    id: 1,
    name: 'Test Concert',
    slug: 'test-concert',
    description: 'A great test concert with live music',
    start_at: '2024-03-15T20:00:00Z',
    end_at: '2024-03-15T23:00:00Z',
    attending: 0,
    like: 0,
    door_price: 25,
    presale_price: 20,
    ticket_link: 'https://example.com/tickets',
    primary_photo: 'https://example.com/photo.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

const mockVenue: EntityResponse = {
    id: 1,
    name: 'Test Venue',
    slug: 'test-venue'
};

const mockPromoter: EntityResponse = {
    id: 2,
    name: 'Test Promoter',
    slug: 'test-promoter'
};

const mockEntities: EntityResponse[] = [
    {
        id: 3,
        name: 'Band One',
        slug: 'band-one'
    },
    {
        id: 4,
        name: 'Band Two',
        slug: 'band-two'
    }
];

describe('EventStructuredData', () => {
    it('renders structured data script tag with basic event information', () => {
        const { container } = render(<EventStructuredData event={mockEvent} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        expect(script).toBeInTheDocument();

        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData['@context']).toBe('https://schema.org');
        expect(structuredData['@type']).toBe('Event');
        expect(structuredData.name).toBe('Test Concert');
        expect(structuredData.startDate).toBe('2024-03-15T20:00:00.000Z');
        expect(structuredData.endDate).toBe('2024-03-15T23:00:00.000Z');
        expect(structuredData.eventAttendanceMode).toBe('https://schema.org/OfflineEventAttendanceMode');
        expect(structuredData.eventStatus).toBe('https://schema.org/EventScheduled');
        expect(structuredData.description).toBe('A great test concert with live music');
    });

    it('includes image when primary photo is available', () => {
        const { container } = render(<EventStructuredData event={mockEvent} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.image).toEqual(['https://example.com/photo.jpg']);
    });

    it('includes venue location when venue is provided', () => {
        const eventWithVenue = {
            ...mockEvent,
            venue: mockVenue
        };

        const { container } = render(<EventStructuredData event={eventWithVenue} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.location).toEqual({
            '@type': 'Place',
            name: 'Test Venue'
        });
    });

    it('includes offers with ticket link when available', () => {
        const { container } = render(<EventStructuredData event={mockEvent} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        // Allow extra fields like `validFrom` without failing the test
        expect(structuredData.offers).toMatchObject({
            '@type': 'Offer',
            url: 'https://example.com/tickets',
            price: '25',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
        });
    });

    it('falls back to event page URL when no ticket link', () => {
        const eventWithoutTicketLink = {
            ...mockEvent,
            ticket_link: undefined
        };

        const { container } = render(<EventStructuredData event={eventWithoutTicketLink} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        const expectedUrl = `${window.location.origin}/events/test-concert`;
        expect(structuredData.offers.url).toBe(expectedUrl);
    });

    it('includes performers when entities are available', () => {
        const eventWithEntities = {
            ...mockEvent,
            entities: mockEntities
        };

        const { container } = render(<EventStructuredData event={eventWithEntities} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.performer).toEqual([
            {
                '@type': 'PerformingGroup',
                name: 'Band One'
            },
            {
                '@type': 'PerformingGroup',
                name: 'Band Two'
            }
        ]);
    });

    it('falls back to event name as performer when no entities', () => {
        const { container } = render(<EventStructuredData event={mockEvent} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.performer).toEqual([
            {
                '@type': 'PerformingGroup',
                name: 'Test Concert'
            }
        ]);
    });

    it('includes promoter as organizer when available', () => {
        const eventWithPromoter = {
            ...mockEvent,
            promoter: mockPromoter
        };

        const { container } = render(<EventStructuredData event={eventWithPromoter} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.organizer).toEqual({
            '@type': 'Organization',
            name: 'Test Promoter'
        });
    });

    it('falls back to venue as organizer when no promoter', () => {
        const eventWithVenueOnly = {
            ...mockEvent,
            venue: mockVenue
        };

        const { container } = render(<EventStructuredData event={eventWithVenueOnly} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.organizer).toEqual({
            '@type': 'Organization',
            name: 'Test Venue'
        });
    });

    it('handles event without end date', () => {
        const eventWithoutEndDate = {
            ...mockEvent,
            end_at: undefined
        };

        const { container } = render(<EventStructuredData event={eventWithoutEndDate} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.endDate).toBe('2024-03-16T00:00:00.000Z');
        expect(structuredData.startDate).toBe('2024-03-15T20:00:00.000Z');
    });

    it('handles event without description', () => {
        const eventWithoutDescription = {
            ...mockEvent,
            description: undefined
        };

        const { container } = render(<EventStructuredData event={eventWithoutDescription} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.description).toBeUndefined();
    });

    it('handles event without primary photo', () => {
        const eventWithoutPhoto = {
            ...mockEvent,
            primary_photo: undefined
        };

        const { container } = render(<EventStructuredData event={eventWithoutPhoto} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.image).toBeUndefined();
    });

    it('uses door price as 0 when no price is set', () => {
        const eventWithoutPrice = {
            ...mockEvent,
            door_price: undefined,
            presale_price: undefined
        };

        const { container } = render(<EventStructuredData event={eventWithoutPrice} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.offers.price).toBe('0');
    });

    it('limits performers to 10 entities maximum', () => {
        const manyEntities = Array.from({ length: 15 }, (_, i) => ({
            id: i + 10,
            name: `Band ${i + 1}`,
            slug: `band-${i + 1}`
        }));

        const eventWithManyEntities = {
            ...mockEvent,
            entities: manyEntities
        };

        const { container } = render(<EventStructuredData event={eventWithManyEntities} />);

        const script = container.querySelector('script[type="application/ld+json"]');
        const structuredData = JSON.parse(script?.textContent || '{}');

        expect(structuredData.performer).toHaveLength(10);
        expect(structuredData.performer[0].name).toBe('Band 1');
        expect(structuredData.performer[9].name).toBe('Band 10');
    });
});