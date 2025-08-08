import { useState, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers';
import UserFilters from './UserFilters';
import UserCard from './UserCard';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ListLayout } from './ListLayout';

const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Recently Added' }
];

export default function Users() {
    const [filtersVisible, setFiltersVisible] = useState<boolean>(() => {
        const savedState = localStorage.getItem('filtersVisible');
        return savedState ? JSON.parse(savedState) : true;
    });

    useEffect(() => {
        localStorage.setItem('filtersVisible', JSON.stringify(filtersVisible));
    }, [filtersVisible]);

    const toggleFilters = () => setFiltersVisible(v => !v);

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

    const hasActiveFilters = filters.name.trim() !== '';
    const handleClearAllFilters = () => setFilters({ name: '' });

    return (
        <ListLayout
            title="Users"
            subtitle="Browse all users"
            filtersVisible={filtersVisible}
            onToggleFilters={toggleFilters}
            renderFilters={() => (
                <UserFilters filters={filters} onFilterChange={setFilters} />
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
                        There was an error loading users. Please try again later.
                    </AlertDescription>
                </Alert>
            ) : isLoading ? (
                <div className="flex h-96 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : data?.data && data.data.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {data.data.map((user) => (
                        <UserCard key={user.id} user={user} />
                    ))}
                </div>
            ) : (
                <Card className="border-gray-100">
                    <CardContent className="flex h-96 items-center justify-center text-gray-500">
                        No users found. Try adjusting your filters.
                    </CardContent>
                </Card>
            )}
        </ListLayout>
    );
}
