import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import Blogs from '../components/Blogs';
import { SITE_NAME, DEFAULT_IMAGE } from './../lib/seo';

export const BlogsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/blogs',
    component: Blogs,
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/blogs';

        return {
            meta: [
                { title: `Blogs • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Blogs • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `Read the latest blog posts in the Pittsburgh Events Guide.` },
                { name: 'description', content: `Read the latest blog posts in the Pittsburgh Events Guide.` },
            ],
        };
    },
});
