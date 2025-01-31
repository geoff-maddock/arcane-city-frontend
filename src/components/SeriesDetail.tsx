import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Series } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CalendarDays, MapPin, Users, DollarSign, Ticket } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function SeriesDetail({ slug }: { slug: string }) {
    const placeHolderImage = `${window.location.origin}/event-placeholder.png`;

    // Fetch the series data
    const { data: series, isLoading, error } = useQuery<Series>({
        queryKey: ['series', slug],
        queryFn: async () => {
            const { data } = await api.get<Series>(`/series/${slug}`);
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

    // Replace newlines with <br /> tags in the description
    const formattedDescription = series.description ? series.description.replace(/\n/g, '<br />') : '';

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
                            <Link to="/seriess">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Seriess
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                        {/* Main Content */}
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

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <CalendarDays className="h-5 w-5" />
                                            <span>{formatDate(series.start_at)}</span>
                                        </div>

                                        {series.event_type && (
                                            <h2>
                                                <span>{series.event_type.name}</span>
                                            </h2>
                                        )}

                                        {series.venue && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-5 w-5" />
                                                <span>{series.venue.name}</span>
                                            </div>
                                        )}

                                        {series.min_age !== null && series.min_age !== undefined && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="h-5 w-5" />
                                                <span>
                                                    {series.min_age === 0 ? 'All Ages' :
                                                        series.min_age === 18 ? '18+' :
                                                            series.min_age === 21 ? '21+' :
                                                                `${series.min_age}+`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {(series.presale_price || series.door_price) && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <DollarSign className="h-5 w-5" />
                                                Pricing
                                            </h3>
                                            {series.presale_price && (
                                                <div className="text-green-600">
                                                    Presale: ${series.presale_price}
                                                </div>
                                            )}
                                            {series.door_price && (
                                                <div className="text-gray-600">
                                                    Door: ${series.door_price}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {series.ticket_link && (
                                        <Button className="w-full" asChild>
                                            <a
                                                href={series.ticket_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2"
                                            >
                                                <Ticket className="h-5 w-5" />
                                                Buy Tickets
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {series.promoter && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-2">Presented by</h3>
                                        <div className="text-gray-600">{series.promoter.name}</div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}