// ActiveEntityFilters.tsx
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EntityFilters } from '../types/filters';

interface ActiveEntityFiltersProps {
    filters: EntityFilters;
    onRemoveFilter: (key: keyof EntityFilters) => void;
}

export function ActiveEntityFilters({ filters, onRemoveFilter }: ActiveEntityFiltersProps) {
    const getActiveFilters = () => {
        const activeFilters = [];

        if (filters.name) {
            activeFilters.push({ key: 'name', label: `Name: ${filters.name}` });
        }
        if (filters.entity_type) {
            activeFilters.push({ key: 'entity_type', label: `Type: ${filters.entity_type}` });
        }
        if (filters.role) {
            activeFilters.push({ key: 'role', label: `Role: ${filters.role}` });
        }
        if (filters.entity_status) {
            activeFilters.push({ key: 'entity_status', label: `Status: ${filters.entity_status}` });
        }
        if (filters.tag) {
            activeFilters.push({ key: 'tag', label: `Tag: ${filters.tag}` });
        }
        if (filters.started_at) {
            if (filters.started_at.start || filters.started_at.end) {
                const dateRange = [];
                if (filters.started_at.start) {
                    const startDate = new Date(filters.started_at.start).toLocaleDateString();
                    dateRange.push(`from ${startDate}`);
                }
                if (filters.started_at.end) {
                    const endDate = new Date(filters.started_at.end).toLocaleDateString();
                    dateRange.push(`to ${endDate}`);
                }
                activeFilters.push({ key: 'started_at', label: `Date: ${dateRange.join(' ')}` });
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
                    className="mb-4 text-gray-500 hover:text-gray-900 flex items-center"
                    onClick={() => onRemoveFilter(key as keyof EntityFilters)}
                    aria-label={`Remove filter ${label}`}
                >
                    <span className="mr-1">{label}</span>
                    <X className="h-3 w-3" aria-hidden="true" />
                </Button>
            ))}
        </div>
    );
}