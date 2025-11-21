import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../test-render';
import { RouterProvider, createRouter, createRoute } from '@tanstack/react-router';
import { rootRoute } from '../../routes/root';

describe('Root route scroll behavior', () => {
    let scrollToSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        // Mock window.scrollTo
        scrollToSpy = vi.fn();
        window.scrollTo = scrollToSpy;
    });

    it('does not scroll to top on preload (hover intent)', async () => {
        // Create a simple test route
        const testRoute = createRoute({
            getParentRoute: () => rootRoute,
            path: '/test',
            component: () => <div>Test Page</div>,
        });

        const routeTree = rootRoute.addChildren([testRoute]);
        const router = createRouter({
            routeTree,
            defaultPreload: 'intent',
        });

        render(<RouterProvider router={router} />);

        // Clear any initial scroll calls
        scrollToSpy.mockClear();

        // Preload the route (simulates hovering over a link)
        await router.preloadRoute({ to: '/test' });

        // Wait a bit to ensure no scroll happens
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify scrollTo was NOT called during preload
        expect(scrollToSpy).not.toHaveBeenCalled();
    });
});
