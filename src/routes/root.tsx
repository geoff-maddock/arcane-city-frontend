/* eslint-disable react-refresh/only-export-components */
import { createRootRoute, Outlet, HeadContent, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import MenuBar from '../components/MenuBar';
import { SITE_NAME, SITE_DESCRIPTION, DEFAULT_IMAGE } from '../lib/seo';
import { NavigationProvider } from '../context/NavigationContext';

function RootLayout() {
    const router = useRouter();

    // Scroll to top on route changes
    useEffect(() => {
        const unsubscribe = router.subscribe('onResolved', () => {
            window.scrollTo(0, 0);
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <>
            <HeadContent />
            <NavigationProvider>
                <div className="min-h-screen">
                    <MenuBar />
                    <div className="xl:ml-64 pt-16 xl:pt-0">
                        <Outlet />
                    </div>
                </div>
            </NavigationProvider>
        </>
    )
}

export const rootRoute = createRootRoute({
    component: RootLayout,
    head: () => ({
        meta: [
            { title: `Pittsburgh Events Guide • ${SITE_NAME}` },
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