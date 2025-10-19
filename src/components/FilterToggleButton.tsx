import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterToggleButtonProps {
    /**
     * Whether the filters are currently visible
     */
    filtersVisible: boolean;
    /**
     * Function to toggle filter visibility
     */
    onToggle: () => void;
    /**
     * Additional CSS classes to apply to the button
     */
    className?: string;
    /**
     * Custom text to show when filters are visible. Defaults to "Hide Filters"
     */
    hideText?: string;
    /**
     * Custom text to show when filters are hidden. Defaults to "Show Filters"
     */
    showText?: string;
    /**
     * Size variant for the button. Defaults to "default"
     */
    size?: "default" | "sm" | "lg" | "icon";
    /**
     * Style variant for the button. Defaults to "outline"
     */
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    /**
     * ID of the element that contains the filters, for ARIA association
     */
    controlsId?: string;
}

/**
 * A standardized button component for toggling filter visibility.
 * Provides consistent styling and behavior across all filter-enabled components.
 */
export function FilterToggleButton({
    filtersVisible,
    onToggle,
    className,
    hideText = "Hide Filters",
    showText = "Show Filters",
    size = "default",
    variant = "outline",
    controlsId
}: FilterToggleButtonProps) {
    return (
        <Button
            onClick={onToggle}
            variant={variant}
            size={size}
            className={cn(
                "flex items-center gap-2",
                className
            )}
            aria-expanded={filtersVisible}
            aria-controls={controlsId}
            aria-label={filtersVisible ? hideText : showText}
        >
            <FontAwesomeIcon
                icon={filtersVisible ? faChevronUp : faChevronDown}
                className="h-4 w-4"
                aria-hidden="true"
            />
            {filtersVisible ? hideText : showText}
        </Button>
    );
}
