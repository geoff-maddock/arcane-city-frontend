import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from '@tanstack/react-router';

type NavigationContextValue = {
    previousPath: string | null;
};

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

/**
 * Determines if a path should be excluded from navigation history.
 * Edit and create pages should not be tracked as previous pages.
 */
function isExcludedFromHistory(path: string): boolean {
    // Remove query params and hash for pattern matching
    const pathname = path.split('?')[0].split('#')[0];
    
    // Exclude edit pages (ends with /edit)
    if (pathname.endsWith('/edit')) {
        return true;
    }
    
    // Exclude create pages (ends with /create)
    if (pathname.endsWith('/create')) {
        return true;
    }
    
    // Exclude password recovery and reset pages
    if (pathname.includes('/password-recovery') || pathname.includes('/password/reset/')) {
        return true;
    }
    
    return false;
}

function getInitialPreviousPath(): string | null {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        return null;
    }

    try {
        if (!document.referrer) {
            return null;
        }

        const referrerUrl = new URL(document.referrer);

        if (referrerUrl.origin !== window.location.origin) {
            return null;
        }

        const referrerPath = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;
        
        // Don't set initial previous path if it's an edit/create page
        if (isExcludedFromHistory(referrerPath)) {
            return null;
        }

        return referrerPath;
    } catch {
        return null;
    }
}

export function NavigationProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [previousPath, setPreviousPath] = useState<string | null>(() => getInitialPreviousPath());

    useEffect(() => {
        const unsubscribe = router.subscribe('onResolved', ({ fromLocation, toLocation }) => {
            if (!fromLocation) {
                return;
            }

            const fromHref = fromLocation.maskedLocation?.href ?? fromLocation.href;
            const toHref = toLocation.maskedLocation?.href ?? toLocation.href;

            if (fromHref === toHref) {
                return;
            }

            // Only track pages that are not edit/create pages
            if (!isExcludedFromHistory(fromHref)) {
                setPreviousPath(fromHref);
            }
        });

        return () => unsubscribe();
    }, [router]);

    const value = useMemo<NavigationContextValue>(() => ({ previousPath }), [previousPath]);

    return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBackNavigation(fallbackPath: string) {
    const context = useContext(NavigationContext);
    const router = useRouter();

    if (!context) {
        throw new Error('useBackNavigation must be used within a NavigationProvider');
    }

    const { previousPath } = context;
    
    // Get current location href (memoized to avoid recalculation on every render)
    const currentHref = useMemo(() => {
        const currentLocation = router.state.location;
        return currentLocation.maskedLocation?.href ?? currentLocation.href;
    }, [router.state.location]);
    
    // If previousPath is the same as current location, use fallback instead
    const backPointsToCurrentPage = !previousPath || previousPath === currentHref;
    const backHref = backPointsToCurrentPage ? fallbackPath : previousPath;
    const isFallback = backPointsToCurrentPage;

    return { backHref, isFallback };
}
