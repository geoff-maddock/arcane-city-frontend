import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import EventGridLayout from '../components/EventGridLayout';
import { SITE_NAME, DEFAULT_IMAGE } from '../lib/seo';

export const EventGridRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/event-grid',
    component: EventGridLayout,
    head: () => {
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/event-grid';
        return {
            meta: [
                { title: `Event Grid • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Event Grid • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `A compact grid view of events in Pittsburgh.` },
                { name: 'description', content: `A compact grid view of events in Pittsburgh.` },
            ],
        };
    },
});
