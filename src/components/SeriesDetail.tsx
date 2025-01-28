import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Series } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, MapPin, Users } from 'lucide-react';

export default function SeriesDetail({ seriesSlug }: { seriesSlug: string }) {

    const { data: series, isLoading, error } = useQuery<Series>({
        queryKey: ['series', seriesSlug],
        queryFn: async () => {
            const { data } = await api.get<Series>(`/series/${seriesSlug}`);
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !series) {
        return (
            <div className="text-center text-red-500">
                Error loading series. Please try again later.
            </div>
        );
    }

    const formattedDescription = series.description ? series.description.replace(/\n/g, '<br />') : '';
    const placeHolderImage = `${window.location.origin}/src/assets/series-placeholder.png`;

    return (
        <div className="min-h-screen">
            <div className="mx-auto px-6 py-8 max-w-[2400px]">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            asChild
                        >
                            <Link to="/series">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Series
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">{series.name}</h1>
                                {series.short && (
                                    <p className="text-xl text-gray-600">{series.short}</p>
                                )}
                            </div>

                            <div className="aspect-video relative overflow-hidden rounded-lg">
                                <img
                                    src={series.primary_photo || placeHolderImage}
                                    alt={series.name}
                                    className="object-cover w-full h-full"
                                />
                            </div>

                            {series.description && (
                                <Card>
                                    <CardContent className="prose max-w-none p-6">
                                        <div dangerouslySetInnerHTML={{ __html: formattedDescription }} />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="h-5 w-5" />
                                            <span>{series.series_type.name}</span>
                                            {series.primary_location && (
                                                <div>
                                                    {series.primary_location.address_line_one}
                                                    {series.primary_location.city}, {series.primary_location.state}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Users className="h-5 w-5" />
                                            <span>{series.series_status.name}</span>
                                        </div>
                                        {series.roles.length > 0 && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="h-5 w-5" />
                                                <span>{series.roles.map((role) => role.name).join(', ')}</span>
                                            </div>
                                        )}

                                        {series.links.length > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="font-semibold">Links</h3>
                                                <ul className="list-disc list-inside">
                                                    {series.links.map((link) => (
                                                        <li key={link.id}>
                                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                                                                {link.url}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {series.tags.length > 0 && (
                                            <div className="space-y-2">
                                                <h3 className="font-semibold">Tags</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {series.tags.map((tag) => (
                                                        <span key={tag.id} className="px-2 py-1 bg-gray-200 rounded">
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
