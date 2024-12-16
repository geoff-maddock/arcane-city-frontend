// src/components/Events.tsx
import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventCard from './EventCard';
import EventFilters from './EventFilters';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Events() {
    const [filters, setFilters] = useState({
        name: '',
        venue: '',
        promoter: '',
    });

    const { data, isLoading, error } = useEvents({ filters });

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Upcoming Events
                        </h1>
                        <p className="text-lg text-gray-500">
                            Discover and explore upcoming events in your area
                        </p>
                    </div>

                    <Card className="border-gray-100 shadow-sm">
                        <CardContent className="p-6">
                            <EventFilters filters={filters} onFilterChange={setFilters} />
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
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {data.data.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
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