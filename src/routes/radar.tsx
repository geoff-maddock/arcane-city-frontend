import { createRoute, redirect } from '@tanstack/react-router';
import { rootRoute } from './root';
import { authService } from '../services/auth.service';
import Radar from '../components/Radar';

export const RadarRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/radar',
    beforeLoad: () => {
        if (!authService.isAuthenticated()) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: '/radar',
                },
            });
        }
    },
    component: Radar,
});
