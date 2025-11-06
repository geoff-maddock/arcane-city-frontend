import { usePopularTags } from '../hooks/usePopularTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { Loader2, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PopularTagsProps {
    days?: number;
    limit?: number;
    style?: 'future' | 'past';
}

const getScoreBackgroundColor = (score: number): string => {
    if (score >= 21) return 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700';
    if (score >= 10) return 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700';
    if (score >= 5) return 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700';
    return 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700';
};

export default function PopularTags({ days = 60, limit = 5, style = 'future' }: PopularTagsProps) {
    const { data, isLoading, error } = usePopularTags({ days, limit, style });

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Failed to load popular tags. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Popular Tags
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </CardContent>
            </Card>
        );
    }

    if (!data?.data || data.data.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Popular Tags
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {data.data.map((tag) => {
                        const score = tag.popularity_score || 0;
                        const bgColorClass = getScoreBackgroundColor(score);
                        return (
                            <Link
                                key={tag.id}
                                to="/tags/$slug"
                                params={{ slug: tag.slug }}
                            >
                                <Badge
                                    className={`${bgColorClass} text-white border-transparent cursor-pointer transition-colors`}
                                >
                                    {tag.name} [{score}]
                                </Badge>
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
