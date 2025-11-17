import { createRouter, createRoute, redirect, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from './routes/root';
import { EventDetailRoute } from './routes/event-detail.tsx';
import { EntityDetailRoute } from './routes/entity-detail.tsx';
import { SeriesDetailRoute } from './routes/series-detail.tsx';
import { TagDetailRoute } from './routes/tag-detail.tsx';
import { TagCreateRoute } from './routes/tag-create.tsx';
import { TagEditRoute } from './routes/tag-edit.tsx';
import { UsersRoute } from './routes/users.tsx';
import { UserDetailRoute } from './routes/user-detail.tsx';
import { BlogsRoute } from './routes/blogs.tsx';
import { EventCreateRoute } from './routes/event-create.tsx';
import { EventEditRoute } from './routes/event-edit.tsx';
import { SeriesCreateRoute } from './routes/series-create.tsx';
import { SeriesEditRoute } from './routes/series-edit.tsx';
import { EntityCreateRoute } from './routes/entity-create.tsx';
import { EntityEditRoute } from './routes/entity-edit.tsx';
import { AccountEditRoute } from './routes/account-edit.tsx';
import { LoginRoute } from './routes/login';
import { RegisterRoute } from './routes/register';
import { RegisterSuccessRoute } from './routes/register-success';
import { PasswordRecoveryRoute } from './routes/password-recovery';
import { PasswordResetRoute } from './routes/password-reset';
import { EmailVerifyRoute } from './routes/email-verify';
import { AboutRoute } from './routes/about';
import { PrivacyRoute } from './routes/privacy';
import { HelpRoute } from './routes/help';
import { RadarRoute } from './routes/radar';
import { authService } from './services/auth.service';
import { SearchRoute } from './routes/search';
import { SITE_NAME, DEFAULT_IMAGE } from './lib/seo';
import { EventGridRoute } from './routes/event-grid';
import { ActivityRoute } from './routes/activity';
import { NotFoundRoute } from './routes/not-found';

// Lazy load main list components for better code splitting
const Events = lazyRouteComponent(() => import('./components/Events'));
const Entities = lazyRouteComponent(() => import('./components/Entities'));
const Series = lazyRouteComponent(() => import('./components/Series'));
const Tags = lazyRouteComponent(() => import('./components/Tags'));
const Calendar = lazyRouteComponent(() => import('./components/Calendar'));
const YourCalendar = lazyRouteComponent(() => import('./components/YourCalendar'));
const YourEntities = lazyRouteComponent(() => import('./components/YourEntities'));
const Account = lazyRouteComponent(() => import('./routes/account'));

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
    validateSearch: (search: Record<string, unknown>): Partial<{
        name: string;
        venue: string;
        promoter: string;
        entity: string;
        event_type: string;
        tag: string;
        start_at_start: string;
        start_at_end: string;
        presale_price_min: string;
        presale_price_max: string;
        door_price_min: string;
        door_price_max: string;
        min_age: string;
        is_benefit: string;
        series: string;
        page: string;
        itemsPerPage: string;
        sort: string;
        direction: string;
    }> => {
        return {
            name: (search.name as string) ?? undefined,
            venue: (search.venue as string) ?? undefined,
            promoter: (search.promoter as string) ?? undefined,
            entity: (search.entity as string) ?? undefined,
            event_type: (search.event_type as string) ?? undefined,
            tag: (search.tag as string) ?? undefined,
            start_at_start: (search.start_at_start as string) ?? undefined,
            start_at_end: (search.start_at_end as string) ?? undefined,
            presale_price_min: (search.presale_price_min as string) ?? undefined,
            presale_price_max: (search.presale_price_max as string) ?? undefined,
            door_price_min: (search.door_price_min as string) ?? undefined,
            door_price_max: (search.door_price_max as string) ?? undefined,
            min_age: (search.min_age as string) ?? undefined,
            is_benefit: (search.is_benefit as string) ?? undefined,
            series: (search.series as string) ?? undefined,
            page: (search.page as string) ?? undefined,
            itemsPerPage: (search.itemsPerPage as string) ?? undefined,
            sort: (search.sort as string) ?? undefined,
            direction: (search.direction as string) ?? undefined,
        };
    },
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/events';
        return {
            meta: [
                { title: `Events • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Events • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `A list of events in Pittsburgh.` },
                { name: 'description', content: `A list of events in Pittsburgh.` },
            ],
        };
    },
});

const entityRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/entities',
    component: Entities,
    validateSearch: (search: Record<string, unknown>): Partial<{
        name: string;
        entity_type: string;
        role: string;
        entity_status: string;
        tag: string;
        created_at_start: string;
        created_at_end: string;
        started_at_start: string;
        started_at_end: string;
        page: string;
        itemsPerPage: string;
        sort: string;
        direction: string;
    }> => {
        return {
            name: (search.name as string) ?? undefined,
            entity_type: (search.entity_type as string) ?? undefined,
            role: (search.role as string) ?? undefined,
            entity_status: (search.entity_status as string) ?? undefined,
            tag: (search.tag as string) ?? undefined,
            created_at_start: (search.created_at_start as string) ?? undefined,
            created_at_end: (search.created_at_end as string) ?? undefined,
            started_at_start: (search.started_at_start as string) ?? undefined,
            started_at_end: (search.started_at_end as string) ?? undefined,
            page: (search.page as string) ?? undefined,
            itemsPerPage: (search.itemsPerPage as string) ?? undefined,
            sort: (search.sort as string) ?? undefined,
            direction: (search.direction as string) ?? undefined,
        };
    },
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/entities';
        return {
            meta: [
                { title: `Entities • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Entities • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `A list of entities such as bands, venues, promoters, artists, djs in Pittsburgh.` },
                { name: 'description', content: `A list of entities such as bands, venues, promoters, artists, djs in Pittsburgh.` },
            ],
        };
    },
});

const seriesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/series',
    component: Series,
    validateSearch: (search: Record<string, unknown>): Partial<{
        name: string;
        venue: string;
        promoter: string;
        entity: string;
        event_type: string;
        tag: string;
        founded_at_start: string;
        founded_at_end: string;
        occurrence_type: string;
        occurrence_week: string;
        occurrence_day: string;
        page: string;
        itemsPerPage: string;
        sort: string;
        direction: string;
    }> => {
        return {
            name: (search.name as string) ?? undefined,
            venue: (search.venue as string) ?? undefined,
            promoter: (search.promoter as string) ?? undefined,
            entity: (search.entity as string) ?? undefined,
            event_type: (search.event_type as string) ?? undefined,
            tag: (search.tag as string) ?? undefined,
            founded_at_start: (search.founded_at_start as string) ?? undefined,
            founded_at_end: (search.founded_at_end as string) ?? undefined,
            occurrence_type: (search.occurrence_type as string) ?? undefined,
            occurrence_week: (search.occurrence_week as string) ?? undefined,
            occurrence_day: (search.occurrence_day as string) ?? undefined,
            page: (search.page as string) ?? undefined,
            itemsPerPage: (search.itemsPerPage as string) ?? undefined,
            sort: (search.sort as string) ?? undefined,
            direction: (search.direction as string) ?? undefined,
        };
    },
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/series';
        return {
            meta: [
                { title: `Series • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Series • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `A list of regularly occurring event series in Pittsburgh.` },
                { name: 'description', content: `A list of regularly occurring event series in Pittsburgh.` },
            ],
        };
    },
});

const tagRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tags',
    component: Tags,
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/tags';
        return {
            meta: [
                { title: `Tags • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Tags • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `A list of keyword tags used to categorize events and entities in Pittsburgh.` },
                { name: 'description', content: `A list of keyword tags used to categorize events and entities in Pittsburgh.` },
            ],
        };
    },
});

const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/account',
    component: Account,
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/account';
        return {
            meta: [
                { title: `Account • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Account • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `Manage your account settings and preferences.` },
                { name: 'description', content: `Manage your account settings and preferences.` },
            ],
        };
    },
});

const calendarRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/calendar',
    component: Calendar,
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/calendar';
        return {
            meta: [
                { title: `Calendar • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Calendar • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `A calendar of events happening in Pittsburgh.` },
                { name: 'description', content: `A calendar of events happening in Pittsburgh.` },
            ],
        };
    },
});

const userCalendarRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/calendar/your',
    beforeLoad: () => {
        if (!authService.isAuthenticated()) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: '/calendar/your',
                },
            });
        }
    },
    component: YourCalendar,
    head: () => {
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/calendar/your';
        return {
            meta: [
                { title: `Your Calendar • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Your Calendar • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `A personalized calendar of events you're attending.` },
                { name: 'description', content: `A personalized calendar of events you're attending.` },
            ],
        };
    },
});

const userEntitiesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/entities/your',
    beforeLoad: () => {
        if (!authService.isAuthenticated()) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: '/entities/your',
                },
            });
        }
    },
    component: YourEntities,
    head: () => {
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/entities/your';
        return {
            meta: [
                { title: `Your Entities • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Your Entities • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `Entities you follow and are interested in.` },
                { name: 'description', content: `Entities you follow and are interested in.` },
            ],
        };
    },
});

// Tag filter routes - redirect to index pages with tag query parameter
const eventTagRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/events/tag/$slug',
    beforeLoad: ({ params }) => {
        throw redirect({
            to: '/events',
            search: { tag: params.slug },
        });
    },
});

const entityTagRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/entities/tag/$slug',
    beforeLoad: ({ params }) => {
        throw redirect({
            to: '/entities',
            search: { tag: params.slug },
        });
    },
});

const seriesTagRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/series/tag/$slug',
    beforeLoad: ({ params }) => {
        throw redirect({
            to: '/series',
            search: { tag: params.slug },
        });
    },
});

// Build route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    eventRoute,
    entityRoute,
    seriesRoute,
    tagRoute,
    eventTagRoute,
    entityTagRoute,
    seriesTagRoute,
    BlogsRoute,
    UsersRoute,
    TagCreateRoute,
    TagEditRoute,
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
    userCalendarRoute,
    userEntitiesRoute,
    EventGridRoute,
    RadarRoute,
    ActivityRoute,
    AboutRoute,
    HelpRoute,
    SearchRoute,
    LoginRoute,
    PasswordRecoveryRoute,
    PasswordResetRoute,
    EmailVerifyRoute,
    PrivacyRoute,
    RegisterRoute,
    RegisterSuccessRoute,
    NotFoundRoute,
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
