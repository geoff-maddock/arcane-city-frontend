import { createRouter, createRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from './routes/root';
import Events from './components/Events';
import Entities from './components/Entities';
import Series from './components/Series';
import Tags from './components/Tags';
import { EventDetailRoute } from './routes/event-detail.tsx';
import { EntityDetailRoute } from './routes/entity-detail.tsx';
import { SeriesDetailRoute } from './routes/series-detail.tsx';
import { TagDetailRoute } from './routes/tag-detail.tsx';
import { UsersRoute } from './routes/users.tsx';
import { UserDetailRoute } from './routes/user-detail.tsx';
import { EventCreateRoute } from './routes/event-create.tsx';
import { EventEditRoute } from './routes/event-edit.tsx';
import { SeriesCreateRoute } from './routes/series-create.tsx';
import { SeriesEditRoute } from './routes/series-edit.tsx';
import { EntityCreateRoute } from './routes/entity-create.tsx';
import { EntityEditRoute } from './routes/entity-edit.tsx';
import Account from './routes/account';
import { AccountEditRoute } from './routes/account-edit.tsx';
import { LoginRoute } from './routes/login';
import { RegisterRoute } from './routes/register';
import { RegisterSuccessRoute } from './routes/register-success';
import { PasswordRecoveryRoute } from './routes/password-recovery';
import Calendar from './components/Calendar';
import { AboutRoute } from './routes/about';
import { PrivacyRoute } from './routes/privacy';
import { HelpRoute } from './routes/help';
import { RadarRoute } from './routes/radar';
import { authService } from './services/auth.service';
import { SearchRoute } from './routes/search';

// Create routes
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
        if (authService.isAuthenticated()) {
            throw redirect({
                to: '/radar',
            });
        }
    },
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
    UsersRoute,
    EventCreateRoute,
    EventEditRoute,
    SeriesCreateRoute,
    SeriesEditRoute,
    EntityCreateRoute,
    EntityEditRoute,
    EventDetailRoute,
    EntityDetailRoute,
    SeriesDetailRoute,
    TagDetailRoute,
    UserDetailRoute,
    accountRoute,
    AccountEditRoute,
    calendarRoute,
    RadarRoute,
    AboutRoute,
    HelpRoute,
    SearchRoute,
    LoginRoute,
    PasswordRecoveryRoute,
    PrivacyRoute,
    RegisterRoute,
    RegisterSuccessRoute,
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
