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

const getScoreColor = (score: number): string => {
    if (score >= 21) return 'text-red-600';
    if (score >= 10) return 'text-orange-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-primary';
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
                        const colorClass = getScoreColor(score);
                        return (
                            <Link
                                key={tag.id}
                                to="/tags/$slug"
                                params={{ slug: tag.slug }}
                                className={`${colorClass} hover:underline font-medium`}
                            >
                                {tag.name} [{score}]
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
