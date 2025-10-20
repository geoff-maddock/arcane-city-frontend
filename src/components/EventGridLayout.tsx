import { useState, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventCardGridCompact from './EventCardGridCompact';
import EventFilter from './EventFilters';
import { Pagination } from './Pagination';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useFilterToggle } from '../hooks/useFilterToggle';
import { EventFilterContext } from '../context/EventFilterContext';
import { EventFilters } from '../types/filters';
import { ActiveEventFilters as ActiveFilters } from './ActiveEventFilters';
import { FilterContainer } from './FilterContainer';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { authService } from '@/services/auth.service';
import { useQuery } from '@tanstack/react-query';
import { Event } from '../types/api';

const sortOptions = [
    { value: 'start_at', label: 'Date' },
    { value: 'name', label: 'Name' },
    { value: 'venue_id', label: 'Venue' },
    { value: 'promoter_id', label: 'Promoter' },
    { value: 'event_type_id', label: 'Type' },
    { value: 'created_at', label: 'Created' }
];

/**
 * Formats a date to a readable string for the date bar
 */
const formatDateBar = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Gets the date portion of a datetime string for grouping
 */
const getDateKey = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
};

/**
 * Checks if a date is a weekend (Saturday or Sunday)
 */
const isWeekendDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 5 || day === 6; // 0 = Sunday, 6 = Saturday
};

/**
 * Groups events by date and marks which ones should show the date bar
 */
const prepareEventsWithDateBars = (events: Event[]): Array<Event & { showDateBar: boolean; dateLabel: string; isWeekend: boolean }> => {
    let lastDate = '';

    return events.map(event => {
        const currentDate = getDateKey(event.start_at);
        const showDateBar = currentDate !== lastDate;

        if (showDateBar) {
            lastDate = currentDate;
        }

        return {
            ...event,
            showDateBar,
            dateLabel: formatDateBar(event.start_at),
            isWeekend: isWeekendDate(event.start_at)
        };
    });
};

export default function EventGridLayout() {
    const { filtersVisible, toggleFilters } = useFilterToggle();

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    // Helper to get start of today
    const getTodayStart = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString();
    };

    const [filters, setFilters] = useState<EventFilters>({
        name: '',
        venue: '',
        promoter: '',
        event_type: '',
        entity: '',
        tag: '',
        start_at: {
            start: getTodayStart(),
            end: undefined
        },
        presale_price_min: '',
        presale_price_max: '',
        door_price_min: '',
        door_price_max: '',
        min_age: '',
        is_benefit: undefined
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tag = params.get('tag');
        const entity = params.get('entity');
        if (tag) {
            setFilters(prev => ({ ...prev, tag }));
        }
        if (entity) {
            setFilters(prev => ({ ...prev, entity }));
        }
    }, []);

    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('eventGridPerPage', 50);
    const [sort, setSort] = useState('start_at');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const { data, isLoading, error } = useEvents({
        filters,
        page,
        itemsPerPage,
        sort,
        direction
    });

    // Reset pagination when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

    const handleRemoveFilter = (key: keyof EventFilters) => {
        setFilters(prev => {
            if (key === 'start_at') {
                return {
                    ...prev,
                    [key]: { start: undefined, end: undefined }
                };
            }
            return {
                ...prev,
                [key]: ''
            };
        });
    };

    const handleClearAllFilters = () => {
        setFilters({
            name: '',
            venue: '',
            promoter: '',
            event_type: '',
            entity: '',
            tag: '',
            start_at: {
                start: undefined,
                end: undefined
            }
        });
    };

    // Create array of all event images
    const allEventImages = (data?.data ?? [])
        .filter(event => event.primary_photo && event.primary_photo_thumbnail)
        .map(event => ({
            src: event.primary_photo!,
            alt: event.name,
            thumbnail: event.primary_photo_thumbnail
        }));

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (count: number) => {
        setItemsPerPage(count);
        setPage(1);
    };

    const renderPagination = () => {
        if (!data) return null;

        return (
            <Pagination
                currentPage={page}
                totalPages={data.last_page}
                onPageChange={handlePageChange}
                itemCount={data.data.length}
                totalItems={data.total}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                sort={sort}
                setSort={setSort}
                direction={direction}
                setDirection={setDirection}
                sortOptions={sortOptions}
            />
        );
    };

    // Check if any filters are active
    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'created_at') {
            return value?.start || value?.end;
        }
        return value !== '';
    });

    // Prepare events with date bar information
    const eventsWithDateBars = data?.data ? prepareEventsWithDateBars(data.data) : [];

    return (
        <EventFilterContext.Provider value={{ filters, setFilters }}>
            <div className="bg-background text-foreground min-h-screen m:p-4 p-2">
                <div className="mx-auto md:px-6 md:py-8 px-3 py-4 max-w-[2400px]">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                Event Grid
                            </h1>
                            <p className="text-lg text-gray-500">
                                Browse upcoming events in a compact grid layout
                            </p>
                            {user && (
                                <Button asChild className="self-start">
                                    <Link to="/event/create" search={{ duplicate: undefined }}>Create Event</Link>
                                </Button>
                            )}
                        </div>

                        <FilterContainer
                            filtersVisible={filtersVisible}
                            onToggleFilters={toggleFilters}
                            hasActiveFilters={hasActiveFilters}
                            onClearAllFilters={handleClearAllFilters}
                            activeFiltersComponent={
                                <ActiveFilters
                                    filters={filters}
                                    onRemoveFilter={handleRemoveFilter}
                                />
                            }
                        >
                            <EventFilter filters={filters} onFilterChange={setFilters} />
                        </FilterContainer>

                        {error ? (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    There was an error loading events. Please try again later.
                                </AlertDescription>
                            </Alert>
                        ) : isLoading ? (
                            <div className="flex h-96 items-center justify-center" role="status">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : eventsWithDateBars.length > 0 ? (
                            <>
                                {renderPagination()}

                                {/* Responsive grid layout - min 120px per item, scales with container */}
                                <div
                                    className="grid gap-4 w-full"
                                    style={{
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(max(120px, calc((100% - 15 * 1rem) / 16)), 1fr))'
                                    }}
                                >
                                    {eventsWithDateBars.map((event) => (
                                        <EventCardGridCompact
                                            key={event.slug}
                                            event={event}
                                            allImages={allEventImages}
                                            imageIndex={allEventImages.findIndex(
                                                img => img.src === event.primary_photo
                                            )}
                                            showDateBar={event.showDateBar}
                                            dateLabel={event.dateLabel}
                                            isWeekend={event.isWeekend}
                                        />
                                    ))}
                                </div>

                                {renderPagination()}
                            </>
                        ) : (
                            <Card className="border-gray-100">
                                <CardContent className="flex h-96 items-center justify-center text-gray-500">
                                    No events found. Try adjusting your filters.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </EventFilterContext.Provider>
    );
}
