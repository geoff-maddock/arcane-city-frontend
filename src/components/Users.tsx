import { useState, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers';
import UserFilters from './UserFilters';
import UserCard from './UserCard';
import { Pagination } from './Pagination';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useFilterToggle } from '../hooks/useFilterToggle';
import { FilterContainer } from './FilterContainer';

const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Recently Added' }
];

export default function Users() {
    const { filtersVisible, toggleFilters } = useFilterToggle();

    const [filters, setFilters] = useState({
        name: '',
    });

    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('usersPerPage', 25);
    const [sort, setSort] = useState('name');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const { data, isLoading, error } = useUsers({
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

    return (
        <div className="bg-background text-foreground min-h-screen p-4">
            <div className="mx-auto px-6 py-8 max-w-[2400px]">
                <div className="space-y-8">
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Users</h1>
                        <p className="text-lg text-gray-500">Browse all users</p>
                    </div>

                    <FilterContainer
                        filtersVisible={filtersVisible}
                        onToggleFilters={toggleFilters}
                        hasActiveFilters={hasActiveFilters}
                        onClearAllFilters={handleClearAllFilters}
                    >
                        <UserFilters filters={filters} onFilterChange={setFilters} />
                    </FilterContainer>

                    {error ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                There was an error loading users. Please try again later.
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
                                {data.data.map((user) => (
                                    <UserCard key={user.id} user={user} />
                                ))}
                            </div>

                            {renderPagination()}
                        </>
                    ) : (
                        <Card className="border-gray-100">
                            <CardContent className="flex h-96 items-center justify-center text-gray-500">
                                No users found. Try adjusting your filters.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
