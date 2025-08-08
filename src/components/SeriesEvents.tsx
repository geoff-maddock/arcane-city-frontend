import { useState, useEffect, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventCard from './EventCard';
import { PaginationBar } from './PaginationBar';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SeriesEventsProps {
    seriesName: string; // API expects the series name for filters.series
}

export default function SeriesEvents({ seriesName }: SeriesEventsProps) {
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Reset page when series name changes
    useEffect(() => { setPage(1); }, [seriesName]);

    const { data, isLoading, error } = useEvents({
        filters: { series: seriesName },
        page,
        itemsPerPage,
    });

    // Clamp page
    useEffect(() => {
        if (data && page > data.last_page) {
            setPage(data.last_page || 1);
        }
    }, [data, page]);

    const effectivePerPage = data?.per_page ?? itemsPerPage;

    const allEventImages = useMemo(() => (
        data?.data
            .filter((event) => event.primary_photo && event.primary_photo_thumbnail)
            .map((event) => ({
                src: event.primary_photo!,
                alt: event.name,
                thumbnail: event.primary_photo_thumbnail,
            })) ?? []
    ), [data]);

    const renderPagination = () => {
        if (!data) return null;
        return (
            <PaginationBar
                currentPage={page}
                totalPages={data.last_page}
                onPageChange={setPage}
                itemsPerPage={effectivePerPage}
                totalItems={data.total}
                pageSizeOverride={data.data.length}
            />
        );
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    There was an error loading events. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center" role="status">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!data || data.data.length === 0) {
        return (
            <Card className="border-gray-100 mt-4">
                <CardContent className="flex h-96 items-center justify-center text-gray-500 ">
                    No events found for this series.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 mt-8">
            <h2 className="text-2xl font-semibold">Events</h2>
            {renderPagination()}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                {data.data.map((event) => (
                    <EventCard
                        key={event.slug}
                        event={event}
                        allImages={allEventImages}
                        imageIndex={allEventImages.findIndex((img) => img.src === event.primary_photo)}
                    />
                ))}
            </div>
            {renderPagination()}
        </div>
    );
}
