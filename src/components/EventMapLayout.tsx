import { useState, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import EventMap from './EventMap';
import EventFilter from './EventFilters';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFilterToggle } from '../hooks/useFilterToggle';
import { EventFilterContext } from '../context/EventFilterContext';
import { EventFilters } from '../types/filters';
import { ActiveEventFilters as ActiveFilters } from './ActiveEventFilters';
import { FilterContainer } from './FilterContainer';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { authService } from '@/services/auth.service';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { buildAddressQuery } from '../lib/geocoding';

export default function EventMapLayout() {
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

    // Fetch all events that match filters (no pagination for map view)
    const { data, isLoading, error } = useEvents({
        filters,
        page: 1,
        itemsPerPage: 1000, // Get more events for map view
        sort: 'start_at',
        direction: 'asc'
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
    };

    // Check if any filters are active
    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'created_at' || key === 'start_at') {
            return value?.start || value?.end;
        }
        return value !== '' && value !== undefined;
    });

    // Filter events to only include those with location data (lat/lng or address)
    const eventsWithLocation = data?.data.filter(event => {
        if (!event.venue?.primary_location) return false;
        
        const location = event.venue.primary_location;
        
        // Has coordinates
        if (location.latitude && location.longitude) return true;
        
        // Has geocodable address
        const addressQuery = buildAddressQuery(location);
        return addressQuery !== null;
    }) ?? [];

    return (
        <EventFilterContext.Provider value={{ filters, setFilters }}>
            <div className="bg-background text-foreground min-h-screen m:p-4 p-2">
                <div className="mx-auto md:px-6 md:py-8 px-3 py-4 max-w-[2400px]">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                Event Map
                            </h1>
                            <p className="text-lg text-gray-500">
                                Explore upcoming events on an interactive map
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
                                {eventsWithLocation.length < data.data.length && (
                                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700">
                                        <CardContent className="p-4">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                Showing {eventsWithLocation.length} of {data.data.length} events. 
                                                Some events lack sufficient address information for geocoding.
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            📍 Events are geocoded from their venue addresses using OpenStreetMap. 
                                            This may take a moment for the initial load.
                                        </p>
                                    </CardContent>
                                </Card>
                                <EventMap events={eventsWithLocation} />
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
