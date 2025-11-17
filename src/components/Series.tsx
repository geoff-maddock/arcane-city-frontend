import { useState, useEffect } from 'react';
import { useSeries } from '../hooks/useSeries';
import SeriesCard from './SeriesCard';
import SeriesFilter from './SeriesFilters';
import { Pagination } from './Pagination';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useFilterToggle } from '../hooks/useFilterToggle';
import { SeriesFilterContext } from '../context/SeriesFilterContext';
import { SeriesFilters } from '../types/filters';
import { ActiveSeriesFilters as ActiveFilters } from './ActiveSeriesFilters';
import { FilterContainer } from './FilterContainer';
import { Button } from '@/components/ui/button';
import { Link, useSearch, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { ShareButton } from './ShareButton';

const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'event_type_id', label: 'Type' },
    { value: 'founded_at', label: 'Founded' },
    { value: 'created_at', label: 'Created' }
];


export default function Series() {
    const searchParams = useSearch({ from: '/series' });
    const navigate = useNavigate();
    const { filtersVisible, toggleFilters } = useFilterToggle();

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
        },
        occurrence_type: '',
        occurrence_week: '',
        occurrence_day: ''
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
                founded_at: {
                    start: searchParams.founded_at_start || undefined,
                    end: searchParams.founded_at_end || undefined
                },
                occurrence_type: searchParams.occurrence_type || '',
                occurrence_week: searchParams.occurrence_week || '',
                occurrence_day: searchParams.occurrence_day || ''
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    const [page, setPage] = useState(parseInt(searchParams.page || '1', 10));
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('seriesPerPage', 
        searchParams.itemsPerPage ? parseInt(searchParams.itemsPerPage, 10) : 25
    );
    const [sort, setSort] = useState(searchParams.sort || 'created_at');
    const [direction, setDirection] = useState<'asc' | 'desc'>(
        (searchParams.direction as 'asc' | 'desc') || 'asc'
    );

    const { data, isLoading, error } = useSeries({
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
        if (filters.founded_at?.start) searchObj.founded_at_start = filters.founded_at.start;
        if (filters.founded_at?.end) searchObj.founded_at_end = filters.founded_at.end;
        if (filters.occurrence_type) searchObj.occurrence_type = filters.occurrence_type;
        if (filters.occurrence_week) searchObj.occurrence_week = filters.occurrence_week;
        if (filters.occurrence_day) searchObj.occurrence_day = filters.occurrence_day;
        
        // Add pagination and sorting parameters
        if (page > 1) searchObj.page = page.toString();
        if (itemsPerPage !== 25) searchObj.itemsPerPage = itemsPerPage.toString();
        if (sort !== 'created_at') searchObj.sort = sort;
        if (direction !== 'asc') searchObj.direction = direction;

        navigate({
            to: '/series',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            search: searchObj as any,
            replace: true,
        });
    }, [filters, page, itemsPerPage, sort, direction, navigate]);

    // Reset pagination when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

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
            },
            occurrence_type: '',
            occurrence_week: '',
            occurrence_day: '',
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
            founded_at: {
                start: undefined,
                end: undefined
            },
            occurrence_type: '',
            occurrence_week: '',
            occurrence_day: ''
        });
        setSort('created_at');
        setDirection('asc');
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
        if (key === 'founded_at') {
            return value?.start || value?.end;
        }
        return value !== '';
    });

    return (
        <SeriesFilterContext.Provider value={{ filters, setFilters }}>
            <div className="bg-background text-foreground min-h-screen m:p-4 p-2">
                <div className="mx-auto md:px-6 md:py-8 px-3 py-4 max-w-[2400px]">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col space-y-2">
                                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                        Series Listings
                                    </h1>
                                    <p className="text-lg text-gray-500">
                                        Discover and explore series in our database.
                                    </p>
                                </div>
                                <ShareButton />
                            </div>
                            {user && (
                                <Button asChild className="self-start">
                                    <Link to="/series/create" search={{ fromEvent: undefined }}>Create Series</Link>
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
                            <SeriesFilter filters={filters} onFilterChange={setFilters} />
                        </FilterContainer>

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
