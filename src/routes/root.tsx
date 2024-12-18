// src/routes/root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
    component: () => <Outlet />
});