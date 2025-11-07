import { usePopularTags } from '../hooks/usePopularTags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EnhancedTagCard from './EnhancedTagCard';

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
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Popular Tags</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {data.data.map((tag) => (
                    <EnhancedTagCard key={tag.id} tag={tag} />
                ))}
            </div>
        </div>
    );
}
