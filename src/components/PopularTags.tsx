import { usePopularTags } from '../hooks/usePopularTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@tanstack/react-router';
import { Loader2, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PopularTagsProps {
    days?: number;
    limit?: number;
    style?: 'future' | 'past';
}

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
                <ul className="space-y-2">
                    {data.data.map((tag) => (
                        <li key={tag.id} className="flex items-center justify-between">
                            <Link
                                to="/tags/$slug"
                                params={{ slug: tag.slug }}
                                className="text-primary hover:underline font-medium flex-1"
                            >
                                {tag.name}
                            </Link>
                            {tag.popularity_score && (
                                <span className="text-sm text-gray-500 ml-2">
                                    {tag.popularity_score}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
