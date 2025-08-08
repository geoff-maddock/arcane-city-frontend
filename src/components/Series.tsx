import { useState, useEffect } from 'react';
import { useSeries } from '../hooks/useSeries';
import SeriesCard from './SeriesCard';
import SeriesFilter from './SeriesFilters';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SeriesFilterContext } from '../context/SeriesFilterContext';
import { SeriesFilters } from '../types/filters';
import { ActiveSeriesFilters as ActiveFilters } from './ActiveSeriesFilters';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { ListLayout } from './ListLayout';

const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'event_type_id', label: 'Type' },
    { value: 'founded_at', label: 'Founded Date' },
    { value: 'created_at', label: 'Recently Added' }
];

export default function Series() {
    const [filtersVisible, setFiltersVisible] = useState<boolean>(() => {
        const savedState = localStorage.getItem('filtersVisible');
        return savedState ? JSON.parse(savedState) : true;
    });

    useEffect(() => {
        localStorage.setItem('filtersVisible', JSON.stringify(filtersVisible));
    }, [filtersVisible]);

    const toggleFilters = () => setFiltersVisible(v => !v);

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const [filters, setFilters] = useState<SeriesFilters>({
        name: '',
        venue: '',
        promoter: '',
        event_type: '',
        entity: '',
        tag: '',
        founded_at: {
            start: undefined,
            end: undefined
        }
    });

    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('seriesPerPage', 25);
    const [sort, setSort] = useState('created_at');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const { data, isLoading, error } = useSeries({
        filters,
        page,
        itemsPerPage,
        sort,
        direction
    });

    const handleRemoveFilter = (key: keyof SeriesFilters) => {
        setFilters(prev => {
            if (key === 'founded_at') {
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
            founded_at: {
                start: undefined,
                end: undefined
            }
        });
    };

    const allSeriesImages = data?.data
        .filter(series => series.primary_photo && series.primary_photo_thumbnail)
        .map(series => ({
            src: series.primary_photo!,
            alt: series.name,
            thumbnail: series.primary_photo_thumbnail
        })) ?? [];

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'founded_at') {
            const range = value as SeriesFilters['founded_at'];
            return !!(range?.start || range?.end);
        }
        return value !== '';
    });

    return (
        <SeriesFilterContext.Provider value={{ filters, setFilters }}>
            <ListLayout
                title="Series Listings"
                subtitle="Discover and explore series in our database."
                createRoute={user ? { to: '/series/create', label: 'Create Series' } : undefined}
                filtersVisible={filtersVisible}
                onToggleFilters={toggleFilters}
                renderFilters={() => (
                    <SeriesFilter filters={filters} onFilterChange={setFilters} />
                )}
                renderActiveFilters={() => (
                    <ActiveFilters
                        filters={filters}
                        onRemoveFilter={handleRemoveFilter}
                    />
                )}
                hasActiveFilters={hasActiveFilters}
                onClearAllFilters={handleClearAllFilters}
                sorting={{
                    sort,
                    direction,
                    setSort,
                    setDirection,
                    options: sortOptions
                }}
                pagination={data ? {
                    page,
                    totalPages: data.last_page,
                    onPageChange: setPage,
                    itemsPerPage,
                    totalItems: data.total,
                    onItemsPerPageChange: (n) => { setItemsPerPage(n); setPage(1); }
                } : undefined}
            >
                {error ? (
                    <Alert variant="destructive">
                        <AlertDescription>
                            There was an error loading series. Please try again later.
                        </AlertDescription>
                    </Alert>
                ) : isLoading ? (
                    <div className="flex h-96 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : data?.data && data.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                        {data.data.map((series) => (
                            <SeriesCard
                                key={series.id}
                                series={series}
                                allImages={allSeriesImages}
                                imageIndex={allSeriesImages.findIndex(
                                    img => img.src === series.primary_photo
                                )}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="border-gray-100">
                        <CardContent className="flex h-96 items-center justify-center text-gray-500">
                            No series found. Try adjusting your filters.
                        </CardContent>
                    </Card>
                )}
            </ListLayout>
        </SeriesFilterContext.Provider>
    );
}
