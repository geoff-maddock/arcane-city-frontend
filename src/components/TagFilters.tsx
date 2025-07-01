import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TagFiltersProps {
    filters: {
        name: string;
    };
    onFilterChange: (filters: TagFiltersProps['filters']) => void;
}

export default function TagFilters({ filters, onFilterChange }: TagFiltersProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Tag Name</Label>
                    <div className="relative">
                        <Input
                            id="name"
                            placeholder="Search tags..."
                            className="pl-3"
                            value={filters.name}
                            onChange={(e) => onFilterChange({ ...filters, name: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
