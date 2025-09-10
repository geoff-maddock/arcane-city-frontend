import { Event } from '../types/api';

interface EventStructuredDataProps {
    event: Event;
}

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

/**
 * Generates Google Event structured data (JSON-LD) for SEO and Google Events integration
 * Based on schema.org Event specification
 */
export default function EventStructuredData({ event }: EventStructuredDataProps) {
    // Helper function to format date to ISO8601
    const formatToISO8601 = (dateString: string): string => {
        return new Date(dateString).toISOString();
    };

    // Build the structured data object
    const structuredData: StructuredDataBase = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.name,
        "startDate": formatToISO8601(event.start_at),
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "offers": {
            "@type": "Offer",
            "url": event.ticket_link || `${window.location.origin}/events/${event.slug}`,
            "price": event.door_price?.toString() || "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        }
    };

    // Add optional fields
    if (event.end_at) {
        structuredData.endDate = formatToISO8601(event.end_at);
    }

    if (event.primary_photo) {
        structuredData.image = [event.primary_photo];
    }

    if (event.venue) {
        structuredData.location = {
            "@type": "Place",
            "name": event.venue.name
            // Note: EntityResponse doesn't include location details
            // Full venue address would need to be fetched separately
        };
    }

    if (event.description) {
        structuredData.description = event.description;
    }

    // Add performers - use entities if available, otherwise fallback to event name
    if (event.entities && event.entities.length > 0) {
        structuredData.performer = event.entities.slice(0, 10).map(entity => ({
            "@type": "PerformingGroup",
            "name": entity.name
        }));
    } else {
        structuredData.performer = [{
            "@type": "PerformingGroup",
            "name": event.name
        }];
    }

    // Add organizer - prefer promoter, fallback to venue
    if (event.promoter) {
        structuredData.organizer = {
            "@type": "Organization",
            "name": event.promoter.name
        };
    } else if (event.venue) {
        structuredData.organizer = {
            "@type": "Organization",
            "name": event.venue.name
        };
    }

    return (
        <script 
            type="application/ld+json"
            dangerouslySetInnerHTML={{ 
                __html: JSON.stringify(structuredData, null, 2) 
            }}
        />
    );
}