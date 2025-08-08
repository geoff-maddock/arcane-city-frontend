import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventCard from './EventCard';
import { PaginationBar } from './PaginationBar';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SeriesEventsProps {
    seriesSlug: string;
}

export default function SeriesEvents({ seriesSlug }: SeriesEventsProps) {
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const { data, isLoading, error } = useEvents({
        filters: { series: seriesSlug },
        page,
        itemsPerPage,
    });

    const allEventImages =
        data?.data
            .filter((event) => event.primary_photo && event.primary_photo_thumbnail)
            .map((event) => ({
                src: event.primary_photo!,
                alt: event.name,
                thumbnail: event.primary_photo_thumbnail,
            })) ?? [];

    const renderPagination = () => {
        if (!data) return null;
        return (
            <PaginationBar
                currentPage={page}
                totalPages={data.last_page}
                onPageChange={setPage}
                itemsPerPage={itemsPerPage}
                totalItems={data.total}
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
