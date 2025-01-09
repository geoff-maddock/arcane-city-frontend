import { endOfWeek, startOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, addDays } from 'date-fns';
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

interface EventFiltersProps {
    filters: {
        name: string;
        venue: string;
        promoter: string;
        event_type: string;
        start_at?: DateRange;
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
            <div className="grid gap-6 md:grid-cols-4 2xl:grid-cols-5">
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
                    <div className="grid grid-cols-2 gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !filters.start_at?.start && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.start_at?.start ? (
                                        format(new Date(filters.start_at.start), "PPP")
                                    ) : (
                                        <span>From date</span>
                                    )}
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

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !filters.start_at?.end && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.start_at?.end ? (
                                        format(new Date(filters.start_at.end), "PPP")
                                    ) : (
                                        <span>To date</span>
                                    )}
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

                {/* Quick filter buttons */}
                <div className="flex gap-2 mb-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickFilter('today')}
                        className="flex-1"
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickFilter('week')}
                        className="flex-1"
                    >
                        This Week
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickFilter('month')}
                        className="flex-1"
                    >
                        This Month
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickFilter('weekend')}
                        className="flex-1"
                    >
                        Weekend
                    </Button>
                </div>

            </div>

        </div>
    );
}
