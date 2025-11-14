import { useState, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventCard from './EventCard';
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
import { Link, useSearch, useNavigate } from '@tanstack/react-router';
import { authService } from '@/services/auth.service';
import { useQuery } from '@tanstack/react-query';
import { ShareButton } from './ShareButton';

const sortOptions = [
    { value: 'start_at', label: 'Date' },
    { value: 'name', label: 'Name' },
    { value: 'venue_id', label: 'Venue' },
    { value: 'promoter_id', label: 'Promoter' },
    { value: 'event_type_id', label: 'Type' },
    { value: 'created_at', label: 'Created' }
];

export default function Events() {
    const { filtersVisible, toggleFilters } = useFilterToggle();
    const navigate = useNavigate();
    const searchParams = useSearch({ from: '/events' });

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

    const [filters, setFilters] = useState<EventFilters>({  // Add the type annotation here
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

    // Initialize filters from URL parameters
    useEffect(() => {
        if (Object.keys(searchParams).length > 0) {
            setFilters({
                name: searchParams.name || '',
                venue: searchParams.venue || '',
                promoter: searchParams.promoter || '',
                event_type: searchParams.event_type || '',
                entity: searchParams.entity || '',
                tag: searchParams.tag || '',
                start_at: {
                    start: searchParams.start_at_start || getTodayStart(),
                    end: searchParams.start_at_end || undefined
                },
                presale_price_min: searchParams.presale_price_min || '',
                presale_price_max: searchParams.presale_price_max || '',
                door_price_min: searchParams.door_price_min || '',
                door_price_max: searchParams.door_price_max || '',
                min_age: searchParams.min_age || '',
                is_benefit: searchParams.is_benefit || undefined,
                series: searchParams.series || ''
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    const [page, setPage] = useState(parseInt(searchParams.page || '1', 10));
    // Replace useState with useLocalStorage
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('eventsPerPage', 
        searchParams.itemsPerPage ? parseInt(searchParams.itemsPerPage, 10) : 25
    );
    const [sort, setSort] = useState(searchParams.sort || 'start_at');
    const [direction, setDirection] = useState<'asc' | 'desc'>(
        (searchParams.direction as 'asc' | 'desc') || 'asc'
    );

    const { data, isLoading, error } = useEvents({
        filters,
        page,
        itemsPerPage,
        sort,
        direction
    });

    // Update URL when filters, page, sort, or direction change
    useEffect(() => {
        const searchObj: Record<string, string> = {};
        
        // Add filter parameters
        if (filters.name) searchObj.name = filters.name;
        if (filters.venue) searchObj.venue = filters.venue;
        if (filters.promoter) searchObj.promoter = filters.promoter;
        if (filters.event_type) searchObj.event_type = filters.event_type;
        if (filters.entity) searchObj.entity = filters.entity;
        if (filters.tag) searchObj.tag = filters.tag;
        if (filters.start_at?.start) searchObj.start_at_start = filters.start_at.start;
        if (filters.start_at?.end) searchObj.start_at_end = filters.start_at.end;
        if (filters.presale_price_min) searchObj.presale_price_min = filters.presale_price_min;
        if (filters.presale_price_max) searchObj.presale_price_max = filters.presale_price_max;
        if (filters.door_price_min) searchObj.door_price_min = filters.door_price_min;
        if (filters.door_price_max) searchObj.door_price_max = filters.door_price_max;
        if (filters.min_age) searchObj.min_age = filters.min_age;
        if (filters.is_benefit) searchObj.is_benefit = filters.is_benefit;
        if (filters.series) searchObj.series = filters.series;
        
        // Add pagination and sorting parameters
        if (page > 1) searchObj.page = page.toString();
        if (itemsPerPage !== 25) searchObj.itemsPerPage = itemsPerPage.toString();
        if (sort !== 'start_at') searchObj.sort = sort;
        if (direction !== 'asc') searchObj.direction = direction;

        navigate({
            to: '/events',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            search: searchObj as any,
            replace: true,
        });
    }, [filters, page, itemsPerPage, sort, direction, navigate]);

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

    const handleResetFilters = () => {
        setFilters({
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
        setSort('start_at');
        setDirection('asc');
    };

    // Create array of all event images
    const allEventImages = data?.data
        .filter(event => event.primary_photo && event.primary_photo_thumbnail)
        .map(event => ({
            src: event.primary_photo!,
            alt: event.name,
            thumbnail: event.primary_photo_thumbnail
        })) ?? [];

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (count: number) => {
        setItemsPerPage(count);
        setPage(1); // Reset to first page when changing items per page
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


    return (
        <EventFilterContext.Provider value={{ filters, setFilters }}>
            <div className="bg-background text-foreground min-h-screen m:p-4 p-2">
                <div className="mx-auto md:px-6 md:py-8 px-3 py-4 max-w-[2400px]">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col space-y-2">
                                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                        Event Listings
                                    </h1>
                                    <p className="text-lg text-gray-500">
                                        Discover and explore upcoming events in your area
                                    </p>
                                </div>
                                <ShareButton />
                            </div>
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
                            onResetFilters={handleResetFilters}
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
                        ) : data?.data && data.data.length > 0 ? (
                            <>
                                {renderPagination()}

                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                                    {data.data.map((event) => (
                                        <EventCard
                                            key={event.slug}
                                            event={event}
                                            allImages={allEventImages}
                                            imageIndex={allEventImages.findIndex(
                                                img => img.src === event.primary_photo
                                            )}
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
        </EventFilterContext.Provider >
    );
}