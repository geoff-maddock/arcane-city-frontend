import { createRouter, createRoute } from '@tanstack/react-router';
import { rootRoute } from './routes/root';
import Events from './components/Events';
import Entities from './components/Entities';
import Series from './components/Series';
import { EventDetailRoute } from './routes/event-detail.tsx';
import { EntityDetailRoute } from './routes/entity-detail.tsx';
import { SeriesDetailRoute } from './routes/series-detail.tsx';
import Account from './routes/account';

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

const entityRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/entities',
    component: Entities,
});

const seriesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/series',
    component: Series,
});

const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/account',
    component: Account,
});

// Build route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    eventRoute,
    entityRoute,
    seriesRoute,
    EventDetailRoute,
    EntityDetailRoute,
    SeriesDetailRoute,
    accountRoute,
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
