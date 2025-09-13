import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import Users from '../components/Users';
import { SITE_NAME, DEFAULT_IMAGE } from './../lib/seo';

export const UsersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users',
    component: Users,
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/users';
        return {
            meta: [
                { title: `Users • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Users • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `A list of users on ${SITE_NAME}` },
                { name: 'description', content: `A list of users on ${SITE_NAME}` },
            ],
        };
    },
});
