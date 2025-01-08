import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventCard from './EventCard';
import EventFilters from './EventFilters';
import { Pagination } from './Pagination';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../hooks/useLocalStorage';


interface DateRange {
    start?: string;
    end?: string;
}

interface EventFilters {
    name: string;
    venue: string;
    promoter: string;
    event_type: string;
    start_at?: DateRange;
}

const sortOptions = [
    { value: 'start_at', label: 'Date' },
    { value: 'name', label: 'Name' },
    { value: 'venue', label: 'Venue' },
    { value: 'promoter', label: 'Promoter' },
    { value: 'event-type', label: 'Type' },
    { value: 'created_at', label: 'Recently Added' }
];

export default function Events() {

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
            />
        );
    };

    return (
        <div className="bg-background text-foreground min-h-screen p-4">
            <div className="mx-auto px-6 py-8 max-w-[1600px]">
                <div className="space-y-8">
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Event Listings
                        </h1>
                        <p className="text-lg text-gray-500">
                            Discover and explore upcoming events in your area
                        </p>
                    </div>

                    <Card className="border-gray-100 shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <EventFilters filters={filters} onFilterChange={setFilters} />

                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Sort by:</span>
                                    <Select
                                        value={sort}
                                        onValueChange={(value) => setSort(value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}
                                        className="text-gray-500"
                                    >
                                        {direction === 'asc' ? '↑' : '↓'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {error ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                There was an error loading events. Please try again later.
                            </AlertDescription>
                        </Alert>
                    ) : isLoading ? (
                        <div className="flex h-96 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : data?.data && data.data.length > 0 ? (
                        <>
                            {renderPagination()}

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 3xl:grid-cols-4">
                                {data.data.map((event) => (
                                    <EventCard
                                        key={event.id}
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
    );
}