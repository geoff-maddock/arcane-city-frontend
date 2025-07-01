import { useState, useEffect } from 'react';
import { useTags } from '../hooks/useTags';
import TagFilters from './TagFilters';
import { Pagination } from './Pagination';
import SortControls from './SortControls';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { TagFilterContext } from '../context/TagFilterContext';
import { TagFilters as TagFiltersType } from '../types/filters';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'created_at', label: 'Recently Added' },
];

export default function Tags() {
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

    const [filters, setFilters] = useState<TagFiltersType>({
        name: '',
    });

    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('tagsPerPage', 25);
    const [sort, setSort] = useState('name');
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

    const { data, isLoading, error } = useTags({
        filters,
        page,
        itemsPerPage,
        sort,
        direction,
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
        <TagFilterContext.Provider value={{ filters, setFilters }}>
            <div className="bg-background text-foreground min-h-screen p-4">
                <div className="mx-auto px-6 py-8 max-w-[2400px]">
                    <div className="space-y-8">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">Tags</h1>
                            <p className="text-lg text-gray-500">Browse all tags</p>
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
                                <SortControls
                                    sort={sort}
                                    setSort={setSort}
                                    direction={direction}
                                    setDirection={setDirection}
                                    sortOptions={sortOptions}
                                />
                            </div>
                            {filtersVisible && (
                                <Card className="border-gray-100 shadow-sm">
                                    <CardContent className="p-6 space-y-4">
                                        <TagFilters filters={filters} onFilterChange={setFilters} />
                                    </CardContent>
                                </Card>
                            )}
                        </div>

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

                                <div className="flex flex-wrap gap-2">
                                    {data.data.map((tag) => (
                                        <Link key={tag.id} to="/tags/$slug" params={{ slug: tag.slug }}>
                                            <Badge
                                                variant="secondary"
                                                className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                                            >
                                                {tag.name}
                                            </Badge>
                                        </Link>
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
