import { Event } from '../types/api';
import { buildEventStructuredData } from '../lib/structuredData';

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
    const structuredData: StructuredDataBase = buildEventStructuredData(event);

    return (
        <script 
            type="application/ld+json"
            dangerouslySetInnerHTML={{ 
                __html: JSON.stringify(structuredData, null, 2) 
            }}
        />
    );
}