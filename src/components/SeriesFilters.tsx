import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as Search, MapPin, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchOptions } from '@/hooks/useSearchOptions';


interface DateRange {
    start?: string;
    end?: string;
}

interface SeriesFiltersProps {
    filters: {
        name: string;
        venue: string;
        promoter: string;
        entity: string;
        event_type: string;
        tag: string;
        founded_at?: DateRange;
        occurrence_type: string;
        occurrence_week: string;
        occurrence_day: string;
    };
    onFilterChange: (filters: SeriesFiltersProps['filters']) => void;
}

export default function SeriesFilters({ filters, onFilterChange }: SeriesFiltersProps) {
    // Cached, alphabetized event types for the series type filter
    const { data: eventTypeOptions, isLoading: loadingTypes } = useSearchOptions('event-types', '', {}, { limit: '100', sort: 'name', direction: 'asc' });
    // Cached, alphabetized occurrence lookups
    const { data: occurrenceTypeOptions, isLoading: loadingOccTypes } = useSearchOptions('occurrence-types', '', {}, { limit: '100', sort: 'id', direction: 'asc' });
    const { data: occurrenceWeekOptions, isLoading: loadingOccWeeks } = useSearchOptions('occurrence-weeks', '', {}, { limit: '100', sort: 'id', direction: 'asc' });
    const { data: occurrenceDayOptions, isLoading: loadingOccDays } = useSearchOptions('occurrence-days', '', {}, { limit: '100', sort: 'id', direction: 'asc' });

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-6 ">
                <div className="space-y-2">
                    <Label htmlFor="name">Series Name</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="name"
                            placeholder="Search series..."
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

                <div className="space-y-2">
                    <Label htmlFor="event_type">Type</Label>
                    <Select
                        value={filters.event_type || ''}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, event_type: value === '__ALL__' ? '' : value })
                        }
                        disabled={loadingTypes}
                    >
                        <SelectTrigger id="event_type">
                            <SelectValue placeholder={loadingTypes ? 'Loading types...' : 'All types'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__ALL__">All types</SelectItem>
                            {eventTypeOptions?.map((opt) => (
                                <SelectItem key={opt.id} value={opt.name}>
                                    {opt.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="entity">Entity</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="entity"
                            placeholder="Filter by entity..."
                            className="pl-9"
                            value={filters.entity}
                            onChange={(e) => onFilterChange({ ...filters, entity: e.target.value })}
                        />
                    </div>
                </div>


                <div className="space-y-2">
                    <Label htmlFor="tag">Tag</Label>
                    <div className="relative">
                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="tag"
                            placeholder="Filter by tag..."
                            className="pl-9"
                            value={filters.tag}
                            onChange={(e) => onFilterChange({ ...filters, tag: e.target.value })}
                        />
                    </div>
                </div>


            </div>

            <div className="grid gap-4 md:grid-cols-3">

                <div className="space-y-2">
                    <Label htmlFor="occurrence_type">Occurrence Type</Label>
                    <Select
                        value={filters.occurrence_type || ''}
                        onValueChange={(value) => onFilterChange({ ...filters, occurrence_type: value === '__ALL__' ? '' : value })}
                        disabled={loadingOccTypes}
                    >
                        <SelectTrigger id="occurrence_type">
                            <SelectValue placeholder={loadingOccTypes ? 'Loading types...' : 'All types'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__ALL__">All types</SelectItem>
                            {occurrenceTypeOptions?.map((opt) => (
                                <SelectItem key={opt.id} value={opt.name}>
                                    {opt.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="occurrence_week">Occurrence Week</Label>
                    <Select
                        value={filters.occurrence_week || ''}
                        onValueChange={(value) => onFilterChange({ ...filters, occurrence_week: value === '__ALL__' ? '' : value })}
                        disabled={loadingOccWeeks}
                    >
                        <SelectTrigger id="occurrence_week">
                            <SelectValue placeholder={loadingOccWeeks ? 'Loading weeks...' : 'All weeks'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__ALL__">All weeks</SelectItem>
                            {occurrenceWeekOptions?.map((opt) => (
                                <SelectItem key={opt.id} value={opt.name}>
                                    {opt.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="occurrence_day">Occurrence Day</Label>
                    <Select
                        value={filters.occurrence_day || ''}
                        onValueChange={(value) => onFilterChange({ ...filters, occurrence_day: value === '__ALL__' ? '' : value })}
                        disabled={loadingOccDays}
                    >
                        <SelectTrigger id="occurrence_day">
                            <SelectValue placeholder={loadingOccDays ? 'Loading days...' : 'All days'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__ALL__">All days</SelectItem>
                            {occurrenceDayOptions?.map((opt) => (
                                <SelectItem key={opt.id} value={opt.name}>
                                    {opt.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

            </div>
        </div>
    );
}
