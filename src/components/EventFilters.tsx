import { endOfWeek, startOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, addDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarIcon, Search, MapPin, Users, X, DollarSign } from 'lucide-react';
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

interface EventFiltersProps {
    filters: {
        name: string;
        venue: string;
        promoter: string;
        event_type: string;
        entity: string;
        tag: string;
        start_at?: DateRange;
        presale_price_min?: string;
        presale_price_max?: string;
        door_price_min?: string;
        door_price_max?: string;
        min_age?: string;
        is_benefit?: string;
    };
    onFilterChange: (filters: EventFiltersProps['filters']) => void;
}

// Add predefined date range options
const getDateRanges = () => {
    const now = new Date();

    // Get this weekend (next Saturday and Sunday if today is not weekend)
    const getWeekend = () => {
        const today = now.getDay(); // 0 is Sunday, 6 is Saturday
        const daysUntilFriday = today === 5 ? 0 : ((5 - today + 7) % 7);
        const weekendStart = addDays(startOfDay(now), daysUntilFriday);
        const weekendEnd = endOfDay(addDays(weekendStart, 2)); // End of Sunday
        return { start: weekendStart, end: weekendEnd };
    };

    return {
        today: {
            start: startOfDay(now),
            end: endOfDay(now)
        },
        week: {
            start: startOfWeek(now, { weekStartsOn: 1 }), // Start on Monday
            end: endOfWeek(now, { weekStartsOn: 1 })
        },
        month: {
            start: startOfMonth(now),
            end: endOfMonth(now)
        },
        weekend: getWeekend()
    };
};

export default function EventFilters({ filters, onFilterChange }: EventFiltersProps) {
    const handleDateChange = (field: 'start' | 'end', value: Date | null) => {
        onFilterChange({
            ...filters,
            start_at: {
                ...filters.start_at,
                [field]: value ? value.toISOString() : undefined
            }
        });
    };

    const handleClearDates = () => {
        onFilterChange({
            ...filters,
            start_at: undefined
        });
    };

    const handleQuickFilter = (range: 'today' | 'week' | 'month' | 'weekend') => {
        const ranges = getDateRanges();
        onFilterChange({
            ...filters,
            start_at: {
                start: ranges[range].start.toISOString(),
                end: ranges[range].end.toISOString()
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
                    <Label htmlFor="type">Type</Label>
                    <div className="relative">
                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="type"
                            placeholder="Filter by type..."
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

                {/* Price Range Filters */}
                <div className="space-y-2">
                    <Label htmlFor="presale_price_min">Presale Price</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="presale_price_min"
                                placeholder="Min"
                                type="number"
                                step="0.01"
                                className="pl-9"
                                value={filters.presale_price_min || ''}
                                onChange={(e) => onFilterChange({ ...filters, presale_price_min: e.target.value })}
                            />
                        </div>
                        <div className="relative flex-1">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="presale_price_max"
                                placeholder="Max"
                                type="number"
                                step="0.01"
                                className="pl-9"
                                value={filters.presale_price_max || ''}
                                onChange={(e) => onFilterChange({ ...filters, presale_price_max: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="door_price_min">Door Price</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="door_price_min"
                                placeholder="Min"
                                type="number"
                                step="0.01"
                                className="pl-9"
                                value={filters.door_price_min || ''}
                                onChange={(e) => onFilterChange({ ...filters, door_price_min: e.target.value })}
                            />
                        </div>
                        <div className="relative flex-1">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="door_price_max"
                                placeholder="Max"
                                type="number"
                                step="0.01"
                                className="pl-9"
                                value={filters.door_price_max || ''}
                                onChange={(e) => onFilterChange({ ...filters, door_price_max: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Age Restriction Filter */}
                <div className="space-y-2">
                    <Label htmlFor="min_age">Age Restriction</Label>
                    <Select
                        value={filters.min_age || 'all'}
                        onValueChange={(value) => onFilterChange({ ...filters, min_age: value === 'all' ? '' : value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Any age" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any age</SelectItem>
                            <SelectItem value="0">All Ages</SelectItem>
                            <SelectItem value="13">13+</SelectItem>
                            <SelectItem value="16">16+</SelectItem>
                            <SelectItem value="18">18+</SelectItem>
                            <SelectItem value="21">21+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Benefit Event Filter */}
                <div className="space-y-2">
                    <Label htmlFor="is_benefit">Benefit</Label>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_benefit"
                            checked={filters.is_benefit === "1"}
                            onCheckedChange={(checked) => onFilterChange({
                                ...filters,
                                is_benefit: checked ? "1" : undefined
                            })}
                        />
                        <Label htmlFor="is_benefit" className="text-sm text-gray-600">
                            Show only benefit events
                        </Label>
                    </div>
                </div>


                <div className="space-y-2">
                    <div className="h-6 flex items-center justify-between">
                        <Label>Date Range</Label>
                        {(filters.start_at?.start || filters.start_at?.end) && (
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
                                            !filters.start_at?.start && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {filters.start_at?.start
                                                ? format(new Date(filters.start_at.start), "PPP")
                                                : "From date"}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={filters.start_at?.start ? new Date(filters.start_at.start) : undefined}
                                        onSelect={(date) => handleDateChange('start', date ?? null)}
                                        initialFocus
                                    />
                                    {filters.start_at?.start && (
                                        <div className="border-t p-3">
                                            <Input
                                                type="time"
                                                value={format(new Date(filters.start_at.start), "HH:mm")}
                                                onChange={(e) => {
                                                    const date = filters.start_at?.start ? new Date(filters.start_at.start) : new Date();
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
                                            !filters.start_at?.end && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">
                                            {filters.start_at?.end
                                                ? format(new Date(filters.start_at.end), "PPP")
                                                : "To date"}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={filters.start_at?.end ? new Date(filters.start_at.end) : undefined}
                                        onSelect={(date) => handleDateChange('end', date ?? null)}
                                        initialFocus
                                    />
                                    {filters.start_at?.end && (
                                        <div className="border-t p-3">
                                            <Input
                                                type="time"
                                                value={format(new Date(filters.start_at.end), "HH:mm")}
                                                onChange={(e) => {
                                                    const date = filters.start_at?.end ? new Date(filters.start_at.end) : new Date();
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



            <div className="space-y-2">

                {/* Quick filter buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickFilter('today')}
                        className="w-full"
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickFilter('week')}
                        className="w-full"
                    >
                        This Week
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickFilter('month')}
                        className="w-full"
                    >
                        This Month
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickFilter('weekend')}
                        className="w-full"
                    >
                        Weekend
                    </Button>
                </div>

            </div>

        </div>
    );
}
