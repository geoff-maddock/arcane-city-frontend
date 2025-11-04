import { createRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from './root';
import { authService } from '../services/auth.service';
import ActivityList from '../components/ActivityList';
import { SITE_NAME, DEFAULT_IMAGE } from '../lib/seo';

export const ActivityRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/activity',
    beforeLoad: () => {
        if (!authService.isAuthenticated()) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: '/activity',
                },
            });
        }
    },
    head: () => {
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/activity';
        return {
            meta: [
                { title: `Activity • ${SITE_NAME}` },
                { property: 'og:url', content: url },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Activity • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: 'Recent activity across events, entities, and series.' },
                { name: 'description', content: 'Recent activity across events, entities, and series.' },
            ],
        };
    },
    component: ActivityList,
});
