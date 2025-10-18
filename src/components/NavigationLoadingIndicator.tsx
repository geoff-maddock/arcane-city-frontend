import { useRouterState } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

/**
 * NavigationLoadingIndicator
 * 
 * Displays a loading bar at the top of the page during route transitions.
 * This provides immediate feedback when users click on detail page links.
 * 
 * The indicator appears as a fixed bar at the top with a subtle progress animation
 * and a spinning loader icon, consistent with the existing design system.
 */
export function NavigationLoadingIndicator() {
    const isLoading = useRouterState({ select: (s) => s.status === 'pending' });

    if (!isLoading) {
        return null;
    }

    return (
        <div 
            className="fixed top-0 left-0 right-0 z-50 pointer-events-none" 
            role="status" 
            aria-live="polite"
            aria-label="Loading page"
        >
            {/* Animated progress bar */}
            <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary animate-pulse" />
            
            {/* Loading message with backdrop */}
            <div className="flex items-center justify-center py-3 px-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading page...</span>
            </div>
        </div>
    );
}
