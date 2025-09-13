import type { Event } from '../types/api';

interface StructuredDataBase {
    "@context": string;
    "@type": string;
    name: string;
    startDate: string;
    endDate?: string;
    eventAttendanceMode: string;
    eventStatus: string;
    image?: string[];
    location?: {
        "@type": string;
        name: string;
    };
    description?: string;
    offers: {
        "@type": string;
        url: string;
        price: string;
        priceCurrency: string;
        availability: string;
    };
    performer?: Array<{
        "@type": string;
        name: string;
    }>;
    organizer?: {
        "@type": string;
        name: string;
    };
}

// Helper to build Google Event structured data (JSON-LD)
export function buildEventStructuredData(event: Event, origin?: string): StructuredDataBase {
    // Format date to ISO8601
    const toISO = (dateString: string): string => new Date(dateString).toISOString();

    // Safe origin detection when not provided
    const safeOrigin = origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://arcane.city');

    const structuredData: StructuredDataBase = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.name,
        startDate: toISO(event.start_at),
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        offers: {
            "@type": "Offer",
            url: event.ticket_link || `${safeOrigin}/events/${event.slug}`,
            price: event.door_price?.toString() || "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
        },
    };

    if (event.end_at) structuredData.endDate = toISO(event.end_at);
    if (event.primary_photo) structuredData.image = [event.primary_photo];

    if (event.venue) {
        structuredData.location = {
            "@type": "Place",
            name: event.venue.name,
        };
    }

    if (event.description) structuredData.description = event.description;

    if (event.entities && event.entities.length > 0) {
        structuredData.performer = event.entities.slice(0, 10).map((entity) => ({
            "@type": "PerformingGroup",
            name: entity.name,
        }));
    } else {
        structuredData.performer = [
            {
                "@type": "PerformingGroup",
                name: event.name,
            },
        ];
    }

    if (event.promoter) {
        structuredData.organizer = {
            "@type": "Organization",
            name: event.promoter.name,
        };
    } else if (event.venue) {
        structuredData.organizer = {
            "@type": "Organization",
            name: event.venue.name,
        };
    }

    return structuredData;
}
