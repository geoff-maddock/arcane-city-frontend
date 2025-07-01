import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import TagDetail from '../components/TagDetail';

export const TagDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tags/$slug',
    component: function TagDetailWrapper() {
        const params = TagDetailRoute.useParams();
        return <TagDetail slug={params.slug} />;
    },
});
