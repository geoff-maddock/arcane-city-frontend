import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import Blogs from '../components/Blogs';

export const BlogsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/blogs',
    component: Blogs,
});
