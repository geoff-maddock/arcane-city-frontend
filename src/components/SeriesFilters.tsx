import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Search, MapPin, Users, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
        occurrence_repeat: string;
    };
    onFilterChange: (filters: SeriesFiltersProps['filters']) => void;
}

export default function SeriesFilters({ filters, onFilterChange }: SeriesFiltersProps) {
    const handleDateChange = (field: 'start' | 'end', value: Date | null) => {
        onFilterChange({
            ...filters,
            founded_at: {
                ...filters.founded_at,
                [field]: value ? value.toISOString() : undefined
            }
        });
    };

    const handleClearDates = () => {
        onFilterChange({
            ...filters,
            founded_at: undefined
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-6 2xl:grid-cols-9">
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
                    <Label htmlFor="event_type">Type</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="event_type"
                            placeholder="Filter by series type..."
                            className="pl-9"
                            value={filters.event_type}
                            onChange={(e) => onFilterChange({ ...filters, event_type: e.target.value })}
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

                <div className="space-y-2">
                    <Label htmlFor="occurrence_type">Occurrence Type</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="occurrence_type"
                            placeholder="Filter by occurrence type..."
                            className="pl-9"
                            value={filters.occurrence_type}
                            onChange={(e) => onFilterChange({ ...filters, occurrence_type: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="occurrence_week">Occurrence Week</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="occurrence_week"
                            placeholder="Filter by occurrence week..."
                            className="pl-9"
                            value={filters.occurrence_week}
                            onChange={(e) => onFilterChange({ ...filters, occurrence_week: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="occurrence_day">Occurrence Day</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="occurrence_day"
                            placeholder="Filter by occurrence day..."
                            className="pl-9"
                            value={filters.occurrence_day}
                            onChange={(e) => onFilterChange({ ...filters, occurrence_day: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="occurrence_repeat">Occurrence Repeat</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="occurrence_repeat"
                            placeholder="Filter by occurrence repeat..."
                            className="pl-9"
                            value={filters.occurrence_repeat}
                            onChange={(e) => onFilterChange({ ...filters, occurrence_repeat: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <div className="h-6 flex items-center justify-between">
                        <Label>Date Range</Label>
                        {(filters.founded_at?.start || filters.founded_at?.end) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearDates}
                                className="h-6 px-2 text-gray-500 hover:text-gray-900"
                            >
                                Clear dates
                                <X className="ml-1 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="min-w-0">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !filters.founded_at?.start && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {filters.founded_at?.start
                                                ? format(new Date(filters.founded_at.start), "PPP")
                                                : "From date"}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={filters.founded_at?.start ? new Date(filters.founded_at.start) : undefined}
                                        onSelect={(date) => handleDateChange('start', date ?? null)}
                                        initialFocus
                                    />
                                    {filters.founded_at?.start && (
                                        <div className="border-t p-3">
                                            <Input
                                                type="time"
                                                value={format(new Date(filters.founded_at.start), "HH:mm")}
                                                onChange={(e) => {
                                                    const date = filters.founded_at?.start ? new Date(filters.founded_at.start) : new Date();
                                                    const [hours, minutes] = e.target.value.split(':');
                                                    date.setHours(parseInt(hours), parseInt(minutes));
                                                    handleDateChange('start', date);
                                                }}
                                            />
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="min-w-0">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !filters.founded_at?.end && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {filters.founded_at?.end
                                                ? format(new Date(filters.founded_at.end), "PPP")
                                                : "To date"}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={filters.founded_at?.end ? new Date(filters.founded_at.end) : undefined}
                                        onSelect={(date) => handleDateChange('end', date ?? null)}
                                        initialFocus
                                    />
                                    {filters.founded_at?.end && (
                                        <div className="border-t p-3">
                                            <Input
                                                type="time"
                                                value={format(new Date(filters.founded_at.end), "HH:mm")}
                                                onChange={(e) => {
                                                    const date = filters.founded_at?.end ? new Date(filters.founded_at.end) : new Date();
                                                    const [hours, minutes] = e.target.value.split(':');
                                                    date.setHours(parseInt(hours), parseInt(minutes));
                                                    handleDateChange('end', date);
                                                }}
                                            />
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
