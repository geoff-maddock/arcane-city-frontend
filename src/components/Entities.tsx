import { useState, useEffect } from 'react';
import { useEntities } from '../hooks/useEntities';
import EntityCard from './EntityCard';
import EntityFilter from './EntityFilters';
import { Pagination } from './Pagination';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useFilterToggle } from '../hooks/useFilterToggle';
import { EntityFilterContext } from '../context/EntityFilterContext';
import { EntityFilters } from '../types/filters';
import { ActiveEntityFilters as ActiveFilters } from './ActiveEntityFilters';
import { FilterContainer } from './FilterContainer';
import { useSearch, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { useQuery } from '@tanstack/react-query';
import { ShareButton } from './ShareButton';


const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'entity_type_id', label: 'Type' },
    { value: 'entity_status_id', label: 'Status' },
    { value: 'created_at', label: 'Created' }
];

export default function Entities() {
    const searchParams = useSearch({ from: '/entities' });
    const navigate = useNavigate();
    const { filtersVisible, toggleFilters } = useFilterToggle();

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const [filters, setFilters] = useState<EntityFilters>({
        name: '',
        entity_type: '',
        role: '',
        entity_status: '',
        tag: '',
        created_at: {
            start: undefined,
            end: undefined
        },
        started_at: {
            start: undefined,
            end: undefined
        }
    });

    // Initialize filters from URL parameters
    useEffect(() => {
        if (Object.keys(searchParams).length > 0) {
            setFilters({
                name: searchParams.name || '',
                entity_type: searchParams.entity_type || '',
                role: searchParams.role || '',
                entity_status: searchParams.entity_status || '',
                tag: searchParams.tag || '',
                created_at: {
                    start: searchParams.created_at_start || undefined,
                    end: searchParams.created_at_end || undefined
                },
                started_at: {
                    start: searchParams.started_at_start || undefined,
                    end: searchParams.started_at_end || undefined
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    const [page, setPage] = useState(parseInt(searchParams.page || '1', 10));
    // Replace useState with useLocalStorage
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('entitiesPerPage', 
        searchParams.itemsPerPage ? parseInt(searchParams.itemsPerPage, 10) : 25
    );
    const [sort, setSort] = useState(searchParams.sort || 'created_at');
    const [direction, setDirection] = useState<'asc' | 'desc'>(
        (searchParams.direction as 'asc' | 'desc') || 'desc'
    );

    const { data, isLoading, error } = useEntities({
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
        if (filters.entity_type) searchObj.entity_type = filters.entity_type;
        if (filters.role) searchObj.role = filters.role;
        if (filters.entity_status) searchObj.entity_status = filters.entity_status;
        if (filters.tag) searchObj.tag = filters.tag;
        if (filters.created_at?.start) searchObj.created_at_start = filters.created_at.start;
        if (filters.created_at?.end) searchObj.created_at_end = filters.created_at.end;
        if (filters.started_at?.start) searchObj.started_at_start = filters.started_at.start;
        if (filters.started_at?.end) searchObj.started_at_end = filters.started_at.end;
        
        // Add pagination and sorting parameters
        if (page > 1) searchObj.page = page.toString();
        if (itemsPerPage !== 25) searchObj.itemsPerPage = itemsPerPage.toString();
        if (sort !== 'created_at') searchObj.sort = sort;
        if (direction !== 'desc') searchObj.direction = direction;

        navigate({
            to: '/entities',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            search: searchObj as any,
            replace: true,
        });
    }, [filters, page, itemsPerPage, sort, direction, navigate]);

    // Reset pagination when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

    const handleRemoveFilter = (key: keyof EntityFilters) => {
        setFilters(prev => {
            if (key === 'created_at') {
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
            entity_type: '',
            role: '',
            entity_status: '',
            tag: '',
            started_at: {
                start: undefined,
                end: undefined
            }
        });
    };

    const handleResetFilters = () => {
        setFilters({
            name: '',
            entity_type: '',
            role: '',
            entity_status: '',
            tag: '',
            created_at: {
                start: undefined,
                end: undefined
            },
            started_at: {
                start: undefined,
                end: undefined
            }
        });
        setSort('created_at');
        setDirection('desc');
    };

    // Create array of all entity images
    const allEntityImages = data?.data
        .filter(entity => entity.primary_photo && entity.primary_photo_thumbnail)
        .map(entity => ({
            src: entity.primary_photo!,
            alt: entity.name,
            thumbnail: entity.primary_photo_thumbnail
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
        <EntityFilterContext.Provider value={{ filters, setFilters }}>
            <div className="bg-background text-foreground min-h-screen m:p-4 p-2">
                <div className="mx-auto md:px-6 md:py-8 px-3 py-4 max-w-[2400px]">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col space-y-2">
                                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                        Entity Listings
                                    </h1>
                                    <p className="text-lg text-gray-500">
                                        Discover and explore entities in our database.
                                    </p>
                                </div>
                                <ShareButton />
                            </div>
                            {user && (
                                <Button asChild className="self-start">
                                    <Link to="/entity/create">Create Entity</Link>
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
                            <EntityFilter filters={filters} onFilterChange={setFilters} />
                        </FilterContainer>

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

                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                                    {data.data.map((entity) => (
                                        <EntityCard
                                            key={entity.id}
                                            entity={entity}
                                            allImages={allEntityImages}
                                            imageIndex={allEntityImages.findIndex(
                                                img => img.src === entity.primary_photo
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
        </EntityFilterContext.Provider>
    );

}