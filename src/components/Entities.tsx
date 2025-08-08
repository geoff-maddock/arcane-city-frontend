import { useState, useEffect } from 'react';
import { useEntities } from '../hooks/useEntities';
import EntityCard from './EntityCard';
import EntityFilter from './EntityFilters';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { EntityFilterContext } from '../context/EntityFilterContext';
import { EntityFilters } from '../types/filters';
import { ActiveEntityFilters as ActiveFilters } from './ActiveEntityFilters';
import { useSearch } from '@tanstack/react-router';
import { authService } from '@/services/auth.service';
import { useQuery } from '@tanstack/react-query';
import { ListLayout } from './ListLayout';


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

    // Check if any filters are active
    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'created_at') {
            const range = value as EntityFilters['created_at'];
            return !!(range?.start || range?.end);
        }
        return value !== '';
    });

    return (
        <EntityFilterContext.Provider value={{ filters, setFilters }}>
            <ListLayout
                title="Entity Listings"
                subtitle="Discover and explore entities in our database."
                createRoute={user ? { to: '/entity/create', label: 'Create Entity' } : undefined}
                filtersVisible={filtersVisible}
                onToggleFilters={toggleFilters}
                renderFilters={() => (
                    <EntityFilter filters={filters} onFilterChange={setFilters} />
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
                            There was an error loading entities. Please try again later.
                        </AlertDescription>
                    </Alert>
                ) : isLoading ? (
                    <div className="flex h-96 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : data?.data && data.data.length > 0 ? (
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
                ) : (
                    <Card className="border-gray-100">
                        <CardContent className="flex h-96 items-center justify-center text-gray-500">
                            No entities found. Try adjusting your filters.
                        </CardContent>
                    </Card>
                )}
            </ListLayout>
        </EntityFilterContext.Provider>
    );

}