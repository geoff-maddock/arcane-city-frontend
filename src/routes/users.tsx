import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import Users from '../components/Users';

export const UsersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users',
    component: Users,
});
