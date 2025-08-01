import { useState, useEffect } from 'react';
import { useSeries } from '../hooks/useSeries';
import SeriesCard from './SeriesCard';
import SeriesFilter from './SeriesFilters';
import { Pagination } from './Pagination';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { SeriesFilterContext } from '../context/SeriesFilterContext';
import { SeriesFilters } from '../types/filters';
import { ActiveSeriesFilters as ActiveFilters } from './ActiveSeriesFilters';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { X } from 'lucide-react';

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

    const toggleFilters = () => {
        setFiltersVisible(!filtersVisible);
    };

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

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'created_at') {
            return value?.start || value?.end;
        }
        return value !== '';
    });

    return (
        <SeriesFilterContext.Provider value={{ filters, setFilters }}>
            <div className="bg-background text-foreground min-h-screen p-4">
                <div className="mx-auto px-6 py-8 max-w-[2400px]">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                Series Listings
                            </h1>
                            <p className="text-lg text-gray-500">
                                Discover and explore series in our database.
                            </p>
                            {user && (
                                <Button asChild className="self-start">
                                    <Link to="/series/create">Create Series</Link>
                                </Button>
                            )}
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
                            </div>

                            {filtersVisible && (
                                <Card className="border-gray-100 shadow-sm">
                                    <CardContent className="p-6 space-y-4">
                                        <SeriesFilter filters={filters} onFilterChange={setFilters} />
                                    </CardContent>
                                </Card>
                            )}
                        </div>

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
                            <>
                                {renderPagination()}

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

                                {renderPagination()}
                            </>
                        ) : (
                            <Card className="border-gray-100">
                                <CardContent className="flex h-96 items-center justify-center text-gray-500">
                                    No series found. Try adjusting your filters.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </SeriesFilterContext.Provider>
    );
}
