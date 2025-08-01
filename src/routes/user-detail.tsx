import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import UserDetail from '../components/UserDetail';

export const UserDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users/$id',
    component: function UserDetailWrapper() {
        const params = UserDetailRoute.useParams();
        return <UserDetail id={params.id} />;
    },
});
