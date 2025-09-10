// src/routes/event-detail.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import SeriesDetail from '../components/SeriesDetail';
import type { Series } from '../types/api';
import { api } from '@/lib/api';
import { buildSeriesTitle, truncate, SITE_NAME, DEFAULT_IMAGE } from '../lib/seo';

// Loader fetches series so head() can build meta tags.
async function loadSeries(slug: string): Promise<Series> {
    const { data } = await api.get<Series>(`/series/${slug}`);
    return data;
}


export const SeriesDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/series/$slug',
    loader: async ({ params }) => loadSeries(params.slug),
    component: function SeriesDetailWrapper() {
        const params = SeriesDetailRoute.useParams();
        const series = SeriesDetailRoute.useLoaderData() as Series;
        return <SeriesDetail slug={params.slug} initialSeries={series} />;
    },
    head: ({ loaderData }) => {
        const series = loaderData as Series;
        const title = buildSeriesTitle(series);
        const description = truncate(series.short || series.description) || SITE_NAME;
        const ogImage = series.primary_photo || DEFAULT_IMAGE;
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
});