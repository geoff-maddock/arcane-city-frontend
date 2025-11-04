import { useState } from 'react';
import { useActivities } from '../hooks/useActivities';
import { Pagination } from './Pagination';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatDateTime } from '../lib/utils';
import { Link } from '@tanstack/react-router';
import type { Activity } from '../types/api';

const sortOptions = [
    { value: 'created_at', label: 'Created' },
    { value: 'id', label: 'ID' },
];

export default function ActivityList() {
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useLocalStorage('activitiesPerPage', 25);
    const [sort, setSort] = useState('created_at');
    const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

    const { data, isLoading, error } = useActivities({
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

    const getActivityLink = (activity: Activity) => {
        const type = activity.object_type.toLowerCase();
        if (type === 'event') {
            return `/events/${activity.object_id}`;
        } else if (type === 'entity') {
            return `/entities/${activity.object_id}`;
        } else if (type === 'series') {
            return `/series/${activity.object_id}`;
        }
        return '#';
    };

    return (
        <div className="bg-background text-foreground min-h-screen m:p-4 p-2">
            <div className="mx-auto md:px-6 md:py-8 px-3 py-4 max-w-[2400px]">
                <div className="space-y-8">
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Activity Index
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Recent activity across events, entities, and series.
                        </p>
                    </div>

                    {error ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                There was an error loading activities. Please try again later.
                            </AlertDescription>
                        </Alert>
                    ) : isLoading ? (
                        <div className="flex h-96 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : data?.data && data.data.length > 0 ? (
                        <>
                            {renderPagination()}

                            <Card className="border-gray-200 dark:border-gray-800">
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {data.data.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400 min-w-[60px]">
                                                        {activity.id}
                                                    </span>
                                                    <div className="flex-1 text-sm space-y-1">
                                                        <div className="text-gray-900 dark:text-gray-100">
                                                            <span className="font-medium">[{activity.action} {activity.object_type}</span>{' '}
                                                            <Link
                                                                to={getActivityLink(activity)}
                                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                                            >
                                                                {activity.object_name}
                                                            </Link>
                                                            <span className="font-medium">]</span>
                                                        </div>
                                                        <div className="text-gray-600 dark:text-gray-400">
                                                            by <span className="font-medium">{activity.user_name}</span>
                                                            {' '}on {formatDateTime(activity.created_at)}
                                                            {activity.ip_address && (
                                                                <span className="text-gray-500 dark:text-gray-500">
                                                                    {' '}[{activity.ip_address}]
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {renderPagination()}
                        </>
                    ) : (
                        <Card className="border-gray-100 dark:border-gray-800">
                            <CardContent className="flex h-96 items-center justify-center text-gray-500 dark:text-gray-400">
                                No activities found.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
