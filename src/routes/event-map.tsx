import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import EventMapLayout from '../components/EventMapLayout';
import { SITE_NAME, DEFAULT_IMAGE } from '../lib/seo';

export const EventMapRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/event-map',
    component: EventMapLayout,
    head: () => {
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/event-map';
        return {
            meta: [
                { title: `Event Map • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Event Map • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `Explore upcoming events in Pittsburgh on an interactive map.` },
                { name: 'description', content: `Explore upcoming events in Pittsburgh on an interactive map.` },
            ],
        };
    },
});
