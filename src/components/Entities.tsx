import { useState, useEffect } from 'react';
import { useEntities } from '../hooks/useEntities';
import EntityCard from './EntityCard';
import EntityFilter from './EntityFilters';
import { Pagination } from './Pagination';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { EntityFilterContext } from '../context/EntityFilterContext';
import { EntityFilters } from '../types/filters';
import { ActiveEntityFilters as ActiveFilters } from './ActiveEntityFilters';
import { useSearch, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useQuery } from '@tanstack/react-query';


const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'entity_type_id', label: 'Type' },
    { value: 'entity_status_id', label: 'Status' },
    { value: 'created_at', label: 'Recently Added' }
];

export default function Entities() {
    const search = useSearch({ from: '/entities' }) as EntityFilters;

    const [filtersVisible, setFiltersVisible] = useState<boolean>(() => {
        const savedState = localStorage.getItem('filtersVisible');
        return savedState ? JSON.parse(savedState) : true;
    });

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });


    useEffect(() => {
        localStorage.setItem('filtersVisible', JSON.stringify(filtersVisible));
    }, [filtersVisible]);

    useEffect(() => {
        if (search.tag) {
            setFilters(prev => ({ ...prev, tag: search.tag }));
        }
    }, [search.tag]);

    const toggleFilters = () => {
        setFiltersVisible(!filtersVisible);
    };

    const [filters, setFilters] = useState<EntityFilters>({
        name: '',
        entity_type: '',
        role: '',
        status: '',
        tag: '',
        created_at: {
            start: undefined,
            end: undefined
        }
    });

    // Initialize filters from query parameters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tag = params.get('tag');
        if (tag) {
            setFilters(prev => ({ ...prev, tag }));
        }
    }, []);

    const [page, setPage] = useState(1);
    // Replace useState with useLocalStorage
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('entitiesPerPage', 25);
    const [sort, setSort] = useState('created_at');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const { data, isLoading, error } = useEntities({
        filters,
        page,
        itemsPerPage,
        sort,
        direction
    });

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
            status: '',
            tag: '',
            created_at: {
                start: undefined,
                end: undefined
            }
        });
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
            <div className="bg-background text-foreground min-h-screen p-4">
                <div className="mx-auto px-6 py-8 max-w-[2400px]">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                Entity Listings
                            </h1>
                            <p className="text-lg text-gray-500">
                                Discover and explore entities in our database.
                            </p>
                            {user && (
                                <Button asChild className="self-start">
                                    <Link to="/entity/create">Create Entity</Link>
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
                                        <EntityFilter filters={filters} onFilterChange={setFilters} />
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