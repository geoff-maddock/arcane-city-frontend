// src/routes/event-detail.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';
import EventDetail from '../components/EventDetail';

export const EventDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/events/$eventId',
    component: function EventDetailWrapper() {
        const params = EventDetailRoute.useParams();
        return <EventDetail eventId={params.eventId} />;
    },
});