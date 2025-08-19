import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
}

/**
 * A standardized container component that wraps filter controls with consistent layout and behavior.
 * Handles the toggle button, clear all functionality, and responsive filter display.
 */
export function FilterContainer({
    filtersVisible,
    onToggleFilters,
    hasActiveFilters,
    onClearAllFilters,
    children,
    activeFiltersComponent,
    className,
    clearAllText = "Clear All"
}: FilterContainerProps) {
    return (
        <div className={cn("relative", className)}>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <FilterToggleButton
                        filtersVisible={filtersVisible}
                        onToggle={onToggleFilters}
                        className="mb-4"
                    />

                    {/* Show active filters when collapsed */}
                    {!filtersVisible && activeFiltersComponent}

                    {/* Clear all button */}
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearAllFilters}
                            className="mb-4 text-gray-500 hover:text-gray-900"
                        >
                            {clearAllText}
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
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
