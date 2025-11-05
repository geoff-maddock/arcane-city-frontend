// ActiveEntityFilters.tsx
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EventFilters } from '../types/filters';

interface ActiveEventFiltersProps {
    filters: EventFilters;
    onRemoveFilter: (key: keyof EventFilters) => void;
}

export function ActiveEventFilters({ filters, onRemoveFilter }: ActiveEventFiltersProps) {
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

        if (filters.start_at) {
            if (filters.start_at.start || filters.start_at.end) {
                const dateRange = [];
                if (filters.start_at.start) {
                    const startDate = new Date(filters.start_at.start).toLocaleDateString();
                    dateRange.push(`from ${startDate}`);
                }
                if (filters.start_at.end) {
                    const endDate = new Date(filters.start_at.end).toLocaleDateString();
                    dateRange.push(`to ${endDate}`);
                }
                activeFilters.push({ key: 'start_at', label: `Date: ${dateRange.join(' ')}` });
            }
        }

        if (filters.series) {
            activeFilters.push({ key: 'series', label: `Series: ${filters.series}` });
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
                    className="mb-4 text-gray-500 hover:text-gray-900 flex items-center"
                    onClick={() => onRemoveFilter(key as keyof EventFilters)}
                    aria-label={`Remove filter ${label}`}
                >
                    <span className="mr-1">{label}</span>
                    <X className="h-3 w-3" aria-hidden="true" />
                </Button>
            ))}
        </div>
    );
}