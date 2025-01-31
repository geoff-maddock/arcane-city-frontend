import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SeriesFilters } from '../types/filters';

interface ActiveSeriesFiltersProps {
    filters: SeriesFilters;
    onRemoveFilter: (key: keyof SeriesFilters) => void;
}

export function ActiveSeriesFilters({ filters, onRemoveFilter }: ActiveSeriesFiltersProps) {
    const getActiveFilters = () => {
        const activeFilters = [];

        if (filters.name) {
            activeFilters.push({ key: 'name', label: `Name: ${filters.name}` });
        }

        if (filters.event_type) {
            activeFilters.push({ key: 'event_type', label: `Type: ${filters.event_type}` });
        }

        if (filters.tag) {
            activeFilters.push({ key: 'tag', label: `Tag: ${filters.tag}` });
        }

        if (filters.founded_at) {
            if (filters.founded_at.start || filters.founded_at.end) {
                const dateRange = [];
                if (filters.founded_at.start) {
                    const startDate = new Date(filters.founded_at.start).toLocaleDateString();
                    dateRange.push(`from ${startDate}`);
                }
                if (filters.founded_at.end) {
                    const endDate = new Date(filters.founded_at.end).toLocaleDateString();
                    dateRange.push(`to ${endDate}`);
                }
                activeFilters.push({ key: 'created_at', label: `Date: ${dateRange.join(' ')}` });
            }
        }

        return activeFilters;
    };

    const activeFilters = getActiveFilters();

    if (activeFilters.length === 0) return null;

    return (
        <div className="hidden lg:block">
            {activeFilters.map(({ key, label }) => (
                <Button
                    key={key}
                    variant="secondary"
                    className="mb-4 text-gray-500 hover:text-gray-900"
                >
                    {label}
                    <button
                        onClick={() => onRemoveFilter(key as keyof SeriesFilters)}
                        className="ml-1 hover:text-destructive"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Button>
            ))}
        </div>
    );
}
