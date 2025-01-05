// src/routes/event-detail.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import EntityDetail from '../components/EntityDetail';

export const EntityDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/entities/$entitySlug',
    component: function EntityDetailWrapper() {
        const params = EntityDetailRoute.useParams();
        return <EntityDetail entitySlug={params.entitySlug} />;
    },
});