import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Event } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CalendarDays, MapPin, Users, DollarSign, Ticket, Music } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useState, useEffect } from 'react';
import { Embed } from '../types/embeds';

export default function EventDetail({ slug }: { slug: string }) {
    const placeHolderImage = `${window.location.origin}/event-placeholder.png`;
    const [embeds, setEmbeds] = useState<Embed[]>([]);
    const [embedsLoading, setEmbedsLoading] = useState(false);
    const [embedsError, setEmbedsError] = useState<Error | null>(null);

    // Fetch the event data
    const { data: event, isLoading, error } = useQuery<Event>({
        queryKey: ['event', slug],
        queryFn: async () => {
            const { data } = await api.get<Event>(`/events/${slug}`);
            return data;
        },
    });

    // Fetch event embeds after the event detail is loaded
    useEffect(() => {
        if (event?.id) {
            const fetchEmbeds = async () => {
                setEmbedsLoading(true);
                try {
                    const { data } = await api.get<string[]>(`/events/${event.id}/embeds`);
                    console.log('Fetched embeds:', data);
                    setEmbeds(data);
                } catch (err) {
                    console.error('Error fetching embeds:', err);
                    setEmbedsError(err instanceof Error ? err : new Error('Failed to load embeds'));
                } finally {
                    setEmbedsLoading(false);
                }
            };
            fetchEmbeds();
        }
    }, [event?.id]);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="text-center text-red-500">
                Error loading event. Please try again later.
            </div>
        );
    }

    // Replace newlines with <br /> tags in the description
    const formattedDescription = event.description ? event.description.replace(/\n/g, '<br />') : '';

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
                            <Link to="/events">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Events
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                        {/* Main Content */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.name}</h1>
                                {event.short && (
                                    <p className="text-xl text-gray-600">{event.short}</p>
                                )}
                            </div>


                            <div className="aspect-video relative overflow-hidden rounded-lg">
                                <img
                                    src={event.primary_photo || placeHolderImage}
                                    alt={event.name}
                                    className="object-cover w-full h-full"
                                />
                            </div>


                            {event.description && (
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
                                            <span>{formatDate(event.start_at)}</span>
                                        </div>

                                        {event.event_type && (
                                            <h2>
                                                <span>{event.event_type.name}</span>
                                            </h2>
                                        )}

                                        {event.venue && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-5 w-5" />
                                                <span>{event.venue.name}</span>
                                            </div>
                                        )}

                                        {event.min_age !== null && event.min_age !== undefined && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Users className="h-5 w-5" />
                                                <span>
                                                    {event.min_age === 0 ? 'All Ages' :
                                                        event.min_age === 18 ? '18+' :
                                                            event.min_age === 21 ? '21+' :
                                                                `${event.min_age}+`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {(event.presale_price || event.door_price) && (
                                        <div className="space-y-2">
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <DollarSign className="h-5 w-5" />
                                                Pricing
                                            </h3>
                                            {event.presale_price && (
                                                <div className="text-green-600">
                                                    Presale: ${event.presale_price}
                                                </div>
                                            )}
                                            {event.door_price && (
                                                <div className="text-gray-600">
                                                    Door: ${event.door_price}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {event.ticket_link && (
                                        <Button className="w-full" asChild>
                                            <a
                                                href={event.ticket_link}
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
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="font-semibold mb-2">Location</h3>
                                </CardContent>
                            </Card>

                            {event.promoter && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold mb-2">Presented by</h3>
                                        <div className="text-gray-600">{event.promoter.name}</div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Audio Embeds Section */}
                            {embeds.length > 0 && (
                                <Card>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Music className="h-5 w-5" />
                                            <h2 className="text-xl font-semibold">Audio</h2>
                                        </div>
                                        <div className="space-y-4">
                                            {embeds.map((embed, index) => (
                                                <div key={index} className="rounded-md overflow-hidden">
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: embed }}
                                                        className="w-full"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Loading state for embeds */}
                            {embedsLoading && (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    <span className="ml-2 text-gray-600">Loading audio...</span>
                                </div>
                            )}

                            {/* Error state for embeds */}
                            {embedsError && !embedsLoading && (
                                <div className="text-red-500 text-sm">
                                    Error loading audio content. Please try again later.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}