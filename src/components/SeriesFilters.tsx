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
        series_type: string;
        tag: string;
        created_at?: DateRange;
    };
    onFilterChange: (filters: SeriesFiltersProps['filters']) => void;
}

export default function SeriesFilters({ filters, onFilterChange }: SeriesFiltersProps) {
    const handleDateChange = (field: 'start' | 'end', value: Date | null) => {
        onFilterChange({
            ...filters,
            created_at: {
                ...filters.created_at,
                [field]: value ? value.toISOString() : undefined
            }
        });
    };

    const handleClearDates = () => {
        onFilterChange({
            ...filters,
            created_at: undefined
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-6 md:grid-cols-4 2xl:grid-cols-5">
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
                    <Label htmlFor="series_type">Type</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            id="series_type"
                            placeholder="Filter by series type..."
                            className="pl-9"
                            value={filters.series_type}
                            onChange={(e) => onFilterChange({ ...filters, series_type: e.target.value })}
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
                    <div className="h-6 flex items-center justify-between">
                        <Label>Date Range</Label>
                        {(filters.created_at?.start || filters.created_at?.end) && (
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
                                        !filters.created_at?.start && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.created_at?.start ? (
                                        format(new Date(filters.created_at.start), "PPP")
                                    ) : (
                                        <span>From date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={filters.created_at?.start ? new Date(filters.created_at.start) : undefined}
                                    onSelect={(date) => handleDateChange('start', date ?? null)}
                                    initialFocus
                                />
                                {filters.created_at?.start && (
                                    <div className="border-t p-3">
                                        <Input
                                            type="time"
                                            value={format(new Date(filters.created_at.start), "HH:mm")}
                                            onChange={(e) => {
                                                const date = filters.created_at?.start ? new Date(filters.created_at.start) : new Date();
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
                                        !filters.created_at?.end && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.created_at?.end ? (
                                        format(new Date(filters.created_at.end), "PPP")
                                    ) : (
                                        <span>To date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={filters.created_at?.end ? new Date(filters.created_at.end) : undefined}
                                    onSelect={(date) => handleDateChange('end', date ?? null)}
                                    initialFocus
                                />
                                {filters.created_at?.end && (
                                    <div className="border-t p-3">
                                        <Input
                                            type="time"
                                            value={format(new Date(filters.created_at.end), "HH:mm")}
                                            onChange={(e) => {
                                                const date = filters.created_at?.end ? new Date(filters.created_at.end) : new Date();
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
    );
}
