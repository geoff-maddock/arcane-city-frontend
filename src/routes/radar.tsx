import { createRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from './root';
import { authService } from '../services/auth.service';
import Radar from '../components/Radar';
import { SITE_NAME, SITE_DESCRIPTION, DEFAULT_IMAGE } from '../lib/seo';

export const RadarRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/radar',
    beforeLoad: () => {
        if (!authService.isAuthenticated()) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: '/radar',
                },
            });
        }
    },
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/radar';
        return {
            title: `Radar • ${SITE_NAME}`,
            meta: [
                { property: 'og:url', content: url },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Radar | ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: SITE_DESCRIPTION },
                { name: 'description', content: SITE_DESCRIPTION },
            ],
        };
    },
    component: Radar,
});
