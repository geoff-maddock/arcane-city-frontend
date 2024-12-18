// src/router.ts
import { createRouter, createRoute } from '@tanstack/react-router';
import { rootRoute } from './routes/root';
import Events from './components/Events';
import { EventDetailRoute } from './routes/event-detail';

// Create routes
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Events,
});

const eventRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/events',
    component: Events,
});

// Build route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    eventRoute,
    EventDetailRoute
]);

// Create and export router
export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}