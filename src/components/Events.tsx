import { useState, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventCard from './EventCard';
import EventFilter from './EventFilters';
import { Pagination } from './Pagination';
import SortControls from './SortControls';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { EventFilterContext } from '../context/EventFilterContext';
import { EventFilters } from '../types/filters';
import { ActiveEventFilters as ActiveFilters } from './ActiveEventFilters';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const sortOptions = [
    { value: 'start_at', label: 'Date' },
    { value: 'name', label: 'Name' },
    { value: 'venue_id', label: 'Venue' },
    { value: 'promoter_id', label: 'Promoter' },
    { value: 'event_type_id', label: 'Type' },
    { value: 'created_at', label: 'Recently Added' }
];

export default function Events() {

    const [filtersVisible, setFiltersVisible] = useState<boolean>(() => {
        const savedState = localStorage.getItem('filtersVisible');
        return savedState ? JSON.parse(savedState) : true;
    });

    useEffect(() => {
        localStorage.setItem('filtersVisible', JSON.stringify(filtersVisible));
    }, [filtersVisible]);

    const toggleFilters = () => {
        setFiltersVisible(!filtersVisible);
    };


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
        }
    });
    const [page, setPage] = useState(1);
    // Replace useState with useLocalStorage
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('eventsPerPage', 25);
    const [sort, setSort] = useState('start_at');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const { data, isLoading, error } = useEvents({
        filters,
        page,
        itemsPerPage,
        sort,
        direction
    });

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
            <div className="bg-background text-foreground min-h-screen p-4">
                <div className="mx-auto px-6 py-8 max-w-[2400px]">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                Event Listings
                            </h1>
                            <p className="text-lg text-gray-500">
                                Discover and explore upcoming events in your area
                            </p>
                        </div>

                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleFilters}
                                        className="mb-4 flex items-center border rounded-t-md px-4 py-2 shadow-sm"
                                    >
                                        {filtersVisible ? (
                                            <>
                                                <FontAwesomeIcon icon={faChevronUp} className="mr-2" />
                                                Hide Filters
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faChevronDown} className="mr-2" />
                                                Show Filters
                                            </>
                                        )}
                                    </button>

                                    {!filtersVisible && (
                                        <ActiveFilters
                                            filters={filters}
                                            onRemoveFilter={handleRemoveFilter}
                                        />
                                    )}

                                    {hasActiveFilters && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleClearAllFilters}
                                            className="mb-4 text-gray-500 hover:text-gray-900"
                                        >
                                            Clear All
                                            <X className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <SortControls
                                    sort={sort}
                                    setSort={setSort}
                                    direction={direction}
                                    setDirection={setDirection}
                                    sortOptions={sortOptions}
                                />
                            </div>

                            {filtersVisible && (
                                <Card className="shadow-sm">
                                    <CardContent className="p-6 space-y-4">
                                        <EventFilter filters={filters} onFilterChange={setFilters} />

                                    </CardContent>
                                </Card>
                            )}
                        </div>

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