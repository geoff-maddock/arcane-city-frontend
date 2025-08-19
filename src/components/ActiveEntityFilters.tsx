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
        if (filters.status) {
            activeFilters.push({ key: 'status', label: `Status: ${filters.status}` });
        }
        if (filters.tag) {
            activeFilters.push({ key: 'tag', label: `Tag: ${filters.tag}` });
        }
        if (filters.created_at) {
            if (filters.created_at.start || filters.created_at.end) {
                const dateRange = [];
                if (filters.created_at.start) {
                    const startDate = new Date(filters.created_at.start).toLocaleDateString();
                    dateRange.push(`from ${startDate}`);
                }
                if (filters.created_at.end) {
                    const endDate = new Date(filters.created_at.end).toLocaleDateString();
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