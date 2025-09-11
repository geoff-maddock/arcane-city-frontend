// src/routes/event-detail.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import EventDetail from '../components/EventDetail';
import { api } from '../lib/api';
import type { Event } from '../types/api';
import { buildEventTitle, truncate, buildOgImage, SITE_NAME, DEFAULT_IMAGE } from '../lib/seo';

// Loader fetches event so head() can build meta tags.
async function loadEvent(slug: string): Promise<Event> {
    const { data } = await api.get<Event>(`/events/${slug}`);
    return data;
}

export const EventDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/events/$slug',
    loader: async ({ params }) => loadEvent(params.slug),
    head: ({ loaderData }) => {
        const event = loaderData as Event;
        const title = buildEventTitle(event);
        const description = truncate(event.short || event.description) || SITE_NAME;
        const ogImage = buildOgImage(event) || DEFAULT_IMAGE;
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
        };
    },
    component: function EventDetailWrapper() {
        const params = EventDetailRoute.useParams();
        // EventDetail still handles its own fetching; could be optimized later to use loaderData.
        return <EventDetail slug={params.slug} />;
    },
});