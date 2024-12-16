// src/components/EventFilters.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Users } from 'lucide-react';

interface EventFiltersProps {
    filters: {
        name: string;
        venue: string;
        promoter: string;
    };
    onFilterChange: (filters: EventFiltersProps['filters']) => void;
}

export default function EventFilters({ filters, onFilterChange }: EventFiltersProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="name">Event Name</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="name"
                            placeholder="Search events..."
                            className="pl-9"
                            value={filters.name}
                            onChange={(e) => onFilterChange({ ...filters, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="venue">Venue</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="venue"
                            placeholder="Filter by venue..."
                            className="pl-9"
                            value={filters.venue}
                            onChange={(e) => onFilterChange({ ...filters, venue: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="promoter">Promoter</Label>
                    <div className="relative">
                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="promoter"
                            placeholder="Filter by promoter..."
                            className="pl-9"
                            value={filters.promoter}
                            onChange={(e) => onFilterChange({ ...filters, promoter: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}