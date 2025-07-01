import { createRouter, createRoute } from '@tanstack/react-router';
import { rootRoute } from './routes/root';
import Events from './components/Events';
import Entities from './components/Entities';
import Series from './components/Series';
import Tags from './components/Tags';
import { EventDetailRoute } from './routes/event-detail.tsx';
import { EntityDetailRoute } from './routes/entity-detail.tsx';
import { SeriesDetailRoute } from './routes/series-detail.tsx';
import { TagDetailRoute } from './routes/tag-detail.tsx';
import Account from './routes/account';
import Calendar from './components/Calendar';

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

const tagRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tags',
    component: Tags,
});

const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/account',
    component: Account,
});

const calendarRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/calendar',
    component: Calendar,
});

// Build route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    eventRoute,
    entityRoute,
    seriesRoute,
    tagRoute,
    EventDetailRoute,
    EntityDetailRoute,
    SeriesDetailRoute,
    TagDetailRoute,
    accountRoute,
    calendarRoute,
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
