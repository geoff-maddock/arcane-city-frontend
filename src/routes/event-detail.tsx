// src/routes/event-detail.tsx
import { createRoute, Link } from '@tanstack/react-router';
import { rootRoute } from './root';
import EventDetail from '../components/EventDetail';
import { api } from '../lib/api';
import type { Event } from '../types/api';
import { buildEventTitle, truncate, buildOgImage, SITE_NAME, DEFAULT_IMAGE } from '../lib/seo';
import { buildEventStructuredData } from '../lib/structuredData';

// Loader fetches event so head() can build meta tags.
async function loadEvent(slug: string): Promise<Event> {
    const { data } = await api.get<Event>(`/events/${slug}`);
    return data;
}

// Error component for when event is not found
const EventNotFound = () => (
    <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen w-full bg-white dark:bg-black transition-colors">
        <div className="max-w-3xl mx-auto p-6 xl:p-8 space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">404 - Event Not Found</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Sorry, the event you're looking for doesn't exist.
            </p>
            <div className="space-y-4">
                <p>
                    The event you requested could not be found. This might be because:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>The event slug was typed incorrectly</li>
                    <li>The event has been moved or deleted</li>
                    <li>The link you followed is outdated</li>
                </ul>
            </div>
            <div className="pt-4 flex gap-4">
                <Link 
                    to="/events" 
                    className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Browse Events
                </Link>
                <Link 
                    to="/" 
                    className="inline-block px-6 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
                >
                    Go to Homepage
                </Link>
            </div>
        </div>
    </div>
);

export const EventDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/events/$slug',
    loader: async ({ params }) => loadEvent(params.slug),
    errorComponent: EventNotFound,
    head: ({ loaderData }) => {
        if (!loaderData) return { meta: [] };
        
        const event = loaderData as Event;
        const title = buildEventTitle(event);
        const description = truncate(event.short || event.description) || SITE_NAME;
        const ogImage = buildOgImage(event) || DEFAULT_IMAGE;
        const structuredData = buildEventStructuredData(event);
        return {
            meta: [
                { title: `${title} • ${SITE_NAME}` },
                { name: 'description', content: description },
                { property: 'og:title', content: title },
                { property: 'og:description', content: description },
                { property: 'og:image', content: ogImage },
                { name: 'twitter:title', content: title },
                { name: 'twitter:description', content: description },
                { name: 'twitter:image', content: ogImage },
            ],
            scripts: [
                {
                    type: 'application/ld+json',
                    children: JSON.stringify(structuredData),
                },
            ],
        };
    },
    component: function EventDetailWrapper() {
        const params = EventDetailRoute.useParams();
        const event = EventDetailRoute.useLoaderData() as Event;
        return <EventDetail slug={params.slug} initialEvent={event} />;
    },
});