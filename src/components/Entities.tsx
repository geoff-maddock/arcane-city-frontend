import { useState } from 'react';
import { useEntities } from '../hooks/useEntities';
import { Pagination } from './Pagination';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface DateRange {
    start?: string;
    end?: string;
}

interface EntityFilters {
    name: string;
    type: string;
    status: string;
    start_at?: DateRange;
}

const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'type', label: 'Type' },
    { value: 'status', label: 'Status' },
    { value: 'created_at', label: 'Recently Added' }
];

export default function Entities() {
    const [filters, setFilters] = useState<EntityFilters>({
        name: '',
        type: '',
        status: '',
        start_at: {
            start: undefined,
            end: undefined
        }
    });
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('entitiesPerPage', 25);
    const [sort, setSort] = useState('name');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const { data, isLoading, error } = useEntities({
        filters,
        page,
        itemsPerPage,
        sort,
        direction
    });

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
            />
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="mx-auto px-6 py-8 max-w-[1600px]">
                <div className="space-y-8">
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Entity Listings
                        </h1>
                        <p className="text-lg text-gray-500">
                            Discover and explore entities
                        </p>
                    </div>

                    <Card className="border-gray-100 shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            {/* Add EntityFilters component here when created */}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Sort by:</span>
                                    <Select
                                        value={sort}
                                        onValueChange={(value) => setSort(value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}
                                        className="text-gray-500"
                                    >
                                        {direction === 'asc' ? '↑' : '↓'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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
                        <>
                            {renderPagination()}

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 3xl:grid-cols-4">
                                {data.data.map((entity) => (
                                    <div key={entity.id} className="border p-4 rounded shadow-sm">
                                        <h2 className="text-xl font-bold">{entity.name}</h2>
                                        <p className="text-gray-500">{entity.entity_type.name}</p>
                                        <p className="text-gray-500">{entity.entity_status.name}</p>
                                        <p className="text-gray-500">{entity.description}</p>
                                    </div>
                                ))}
                            </div>

                            {renderPagination()}
                        </>
                    ) : (
                        <Card className="border-gray-100">
                            <CardContent className="flex h-96 items-center justify-center text-gray-500">
                                No entities found. Try adjusting your filters.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}