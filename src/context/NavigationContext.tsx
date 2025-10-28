import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from '@tanstack/react-router';

type NavigationContextValue = {
    previousPath: string | null;
};

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

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

        return `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;
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

            setPreviousPath(fromHref);
        });

        return () => unsubscribe();
    }, [router]);

    const value = useMemo<NavigationContextValue>(() => ({ previousPath }), [previousPath]);

    return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBackNavigation(fallbackPath: string) {
    const context = useContext(NavigationContext);

    if (!context) {
        throw new Error('useBackNavigation must be used within a NavigationProvider');
    }

    const { previousPath } = context;
    const backHref = previousPath ?? fallbackPath;
    const isFallback = !previousPath;

    return { backHref, isFallback };
}
