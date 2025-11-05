import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useUsers } from '../hooks/useUsers';

interface ActivityFilters {
    action: string;
    message: string;
    object_table: string;
    user_id: string;
}

interface ActiveActivityFiltersProps {
    filters: ActivityFilters;
    onRemoveFilter: (key: keyof ActivityFilters) => void;
}

export function ActiveActivityFilters({ filters, onRemoveFilter }: ActiveActivityFiltersProps) {
    // Fetch users data to display user name instead of ID
    const { data: usersData } = useUsers({
        itemsPerPage: 1000,
        sort: 'name',
        direction: 'asc',
    });

    const getUserName = (userId: string) => {
        if (!userId || !usersData?.data) return null;
        const user = usersData.data.find(u => u.id.toString() === userId);
        return user?.name;
    };

    const getActiveFilters = () => {
        const activeFilters = [];

        if (filters.action) {
            activeFilters.push({ key: 'action', label: `Action: ${filters.action}` });
        }

        if (filters.message) {
            activeFilters.push({ key: 'message', label: `Message: ${filters.message}` });
        }

        if (filters.object_table) {
            activeFilters.push({ key: 'object_table', label: `Type: ${filters.object_table}` });
        }

        if (filters.user_id) {
            const userName = getUserName(filters.user_id);
            activeFilters.push({
                key: 'user_id',
                label: `User: ${userName || filters.user_id}`
            });
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
                    onClick={() => onRemoveFilter(key as keyof ActivityFilters)}
                    aria-label={`Remove filter ${label}`}
                >
                    <span className="mr-1 whitespace-nowrap">{label}</span>
                    <X className="h-3 w-3" aria-hidden="true" />
                </Button>
            ))}
        </div>
    );
}

