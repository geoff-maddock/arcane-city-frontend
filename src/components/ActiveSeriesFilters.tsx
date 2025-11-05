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

        if (filters.venue) {
            activeFilters.push({ key: 'venue', label: `Venue: ${filters.venue}` });
        }

        if (filters.promoter) {
            activeFilters.push({ key: 'promoter', label: `Promoter: ${filters.promoter}` });
        }

        if (filters.entity) {
            activeFilters.push({ key: 'entity', label: `Entity: ${filters.entity}` });
        }

        if (filters.event_type) {
            activeFilters.push({ key: 'event_type', label: `Type: ${filters.event_type}` });
        }

        if (filters.tag) {
            activeFilters.push({ key: 'tag', label: `Tag: ${filters.tag}` });
        }

        if (filters.occurrence_type) {
            activeFilters.push({ key: 'occurrence_type', label: `Occurrence Type: ${filters.occurrence_type}` });
        }

        if (filters.occurrence_week) {
            activeFilters.push({ key: 'occurrence_week', label: `Occurrence Week: ${filters.occurrence_week}` });
        }

        if (filters.occurrence_day) {
            activeFilters.push({ key: 'occurrence_day', label: `Occurrence Day: ${filters.occurrence_day}` });
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
                activeFilters.push({ key: 'founded_at', label: `Date: ${dateRange.join(' ')}` });
            }
        }

        return activeFilters;
    };

    const activeFilters = getActiveFilters();

    if (activeFilters.length === 0) return null;

    return (
        <div
            className="flex w-full items-center gap-2 overflow-x-auto pb-1 sm:pb-0"
            aria-label="Active filters"
        >
            {activeFilters.map(({ key, label }) => (
                <Button
                    key={key}
                    variant="secondary"
                    size="sm"
                    className="shrink-0 text-gray-500 hover:text-gray-900"
                    onClick={() => onRemoveFilter(key as keyof SeriesFilters)}
                    aria-label={`Remove filter ${label}`}
                >
                    <span className="mr-1 whitespace-nowrap">{label}</span>
                    <X className="h-3 w-3" aria-hidden="true" />
                </Button>
            ))}
        </div>
    );
}

