// src/routes/event-detail.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import SeriesDetail from '../components/SeriesDetail';

export const SeriesDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/series/$slug',
    component: function SeriesDetailWrapper() {
        const params = SeriesDetailRoute.useParams();
        return <SeriesDetail slug={params.slug} />;
    },
});