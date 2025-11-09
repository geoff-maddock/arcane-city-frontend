import { useState, useEffect } from 'react';
import { useTags } from '../hooks/useTags';
import TagFilters from './TagFilters';
import { Pagination } from './Pagination';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useFilterToggle } from '../hooks/useFilterToggle';
import { TagFilterContext } from '../context/TagFilterContext';
import { TagFilters as TagFiltersType } from '../types/filters';
import TagCard from './TagCard';
import { FilterContainer } from './FilterContainer';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { authService } from '@/services/auth.service';
import { useQuery } from '@tanstack/react-query';
import PopularTags from './PopularTags';

const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Created' },
];

export default function Tags() {
    const { filtersVisible, toggleFilters } = useFilterToggle();

    const [filters, setFilters] = useState<TagFiltersType>({
        name: '',
    });

    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('tagsPerPage', 25);
    const [sort, setSort] = useState('name');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const { data, isLoading, error } = useTags({
        filters,
        page,
        itemsPerPage,
        sort,
        direction,
    });

    // Reset pagination when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

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

    const hasActiveFilters = filters.name.trim() !== '';

    const handleClearAllFilters = () => {
        setFilters({ name: '' });
    };

    const handleResetFilters = () => {
        setFilters({ name: '' });
        setSort('name');
        setDirection('asc');
    };

    return (
        <TagFilterContext.Provider value={{ filters, setFilters }}>
            <div className="bg-background text-foreground min-h-screen md:p-4 p-2">
                <div className="mx-auto md:px-6 md:py-8 px-3 py-4 max-w-[2400px]">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Tags</h1>
                            <p className="text-lg text-gray-500">Browse all tags</p>
                            {user && (
                                <Button asChild className="self-start">
                                    <Link to="/tag/create">Create Tag</Link>
                                </Button>
                            )}

                            <PopularTags days={60} limit={5} style="future" />
                        </div>

                        <FilterContainer
                            filtersVisible={filtersVisible}
                            onToggleFilters={toggleFilters}
                            hasActiveFilters={hasActiveFilters}
                            onClearAllFilters={handleClearAllFilters}
                            onResetFilters={handleResetFilters}
                        >
                            <TagFilters filters={filters} onFilterChange={setFilters} />
                        </FilterContainer>

                        {error ? (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    There was an error loading tags. Please try again later.
                                </AlertDescription>
                            </Alert>
                        ) : isLoading ? (
                            <div className="flex h-96 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                            </div>
                        ) : data?.data && data.data.length > 0 ? (
                            <>
                                {renderPagination()}

                                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                    {data.data.map((tag) => (
                                        <TagCard key={tag.id} tag={tag} />
                                    ))}
                                </div>

                                {renderPagination()}
                            </>
                        ) : (
                            <Card className="border-gray-100">
                                <CardContent className="flex h-96 items-center justify-center text-gray-500">
                                    No tags found. Try adjusting your filters.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </TagFilterContext.Provider>
    );
}
