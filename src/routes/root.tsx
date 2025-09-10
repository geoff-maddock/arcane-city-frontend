import { createRootRoute, Outlet, HeadContent } from '@tanstack/react-router';
import MenuBar from '../components/MenuBar';
import { SITE_NAME, SITE_DESCRIPTION, DEFAULT_IMAGE } from '../lib/seo';

export const Root = () => (
    <div className="min-h-screen">
        {/* HeadContent outputs the accumulated <head> tags from routes */}
        <HeadContent />
        <MenuBar />
        <div className="xl:ml-64 pt-16 xl:pt-0">
            <Outlet />
        </div>
    </div>
);

// eslint-disable-next-line react-refresh/only-export-components
export const rootRoute = createRootRoute({
    component: Root,
    head: () => ({
        title: SITE_NAME,
        meta: [
            { charSet: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { name: 'description', content: SITE_DESCRIPTION },
            { property: 'og:site_name', content: SITE_NAME },
            { property: 'og:type', content: 'website' },
            { property: 'og:title', content: SITE_NAME },
            { property: 'og:description', content: SITE_DESCRIPTION },
            { property: 'og:image', content: DEFAULT_IMAGE },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: SITE_NAME },
            { name: 'twitter:description', content: SITE_DESCRIPTION },
            { name: 'twitter:image', content: DEFAULT_IMAGE },
        ],
    }),
});