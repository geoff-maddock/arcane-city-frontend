import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RotateCcw } from 'lucide-react';
import { FilterToggleButton } from './FilterToggleButton';
import { cn } from '@/lib/utils';

interface FilterContainerProps {
    /**
     * Whether the filters are currently visible
     */
    filtersVisible: boolean;
    /**
     * Function to toggle filter visibility
     */
    onToggleFilters: () => void;
    /**
     * Whether there are any active filters
     */
    hasActiveFilters: boolean;
    /**
     * Function to clear all active filters
     */
    onClearAllFilters: () => void;
    /**
     * Optional function to reset filters to their default values
     */
    onResetFilters?: () => void;
    /**
     * The filter form content to display when filters are visible
     */
    children: ReactNode;
    /**
     * Optional active filters component to show when filters are collapsed
     */
    activeFiltersComponent?: ReactNode;
    /**
     * Additional CSS classes for the container
     */
    className?: string;
    /**
     * Text for the clear all button. Defaults to "Clear All"
     */
    clearAllText?: string;
    /**
     * Text for the reset button. Defaults to "Reset"
     */
    resetText?: string;
}

/**
 * A standardized container component that wraps filter controls with consistent layout and behavior.
 * Handles the toggle button, clear all functionality, reset functionality, and responsive filter display.
 */
export function FilterContainer({
    filtersVisible,
    onToggleFilters,
    hasActiveFilters,
    onClearAllFilters,
    onResetFilters,
    children,
    activeFiltersComponent,
    className,
    clearAllText = "Clear All",
    resetText = "Reset"
}: FilterContainerProps) {
    return (
        <div className={cn("relative", className)}>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 sm:justify-between">
                    <FilterToggleButton
                        filtersVisible={filtersVisible}
                        onToggle={onToggleFilters}
                        className="shrink-0"
                        size="sm"
                    />

                    <div className="flex items-center gap-2">
                        {/* Clear all button */}
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearAllFilters}
                                className="shrink-0 text-gray-500 hover:text-gray-900"
                            >
                                {clearAllText}
                                <X className="ml-2 h-4 w-4" />
                            </Button>
                        )}

                        {/* Reset button */}
                        {onResetFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onResetFilters}
                                className="shrink-0 text-gray-600 hover:text-gray-900"
                            >
                                {resetText}
                                <RotateCcw className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Show active filters when collapsed - full width on its own row */}
                {!filtersVisible && activeFiltersComponent && (
                    <div className="w-full min-w-0">
                        {activeFiltersComponent}
                    </div>
                )}
            </div>

            {/* Filter form content */}
            {filtersVisible && (
                <Card className="shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        {children}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

