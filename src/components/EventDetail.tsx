import { Link } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Event } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CalendarDays, MapPin, DollarSign, Ticket, Music, Star } from 'lucide-react';
import { authService } from '../services/auth.service';
import { AgeRestriction } from './AgeRestriction';
import { formatDate } from '../lib/utils';
import { useState, useEffect } from 'react';
import PhotoGallery from './PhotoGallery';
import PhotoDropzone from './PhotoDropzone';
import { EntityBadges } from './EntityBadges';
import { TagBadges } from './TagBadges';


export default function EventDetail({ slug }: { slug: string }) {
    const placeHolderImage = `${window.location.origin}/event-placeholder.png`;
    const [embeds, setEmbeds] = useState<string[]>([]);
    const [embedsLoading, setEmbedsLoading] = useState(false);
    const [embedsError, setEmbedsError] = useState<Error | null>(null);

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });
    const [attending, setAttending] = useState(false);

    const attendMutation = useMutation({
        mutationFn: async () => {
            if (!event) return;
            await api.post(`/events/${event.slug}/attend`);
        },
        onSuccess: () => {
            setAttending(true);
        },
    });

    const unattendMutation = useMutation({
        mutationFn: async () => {
            if (!event) return;
            await api.delete(`/events/${event.slug}/attend`);
        },
        onSuccess: () => {
            setAttending(false);
        },
    });

    const handleAttendToggle = () => {
        if (attending) {
            unattendMutation.mutate();
        } else {
            attendMutation.mutate();
        }
    };


    // Fetch the event data
    const { data: event, isLoading, error } = useQuery<Event>({
        queryKey: ['event', slug],
        queryFn: async () => {
            const { data } = await api.get<Event>(`/events/${slug}`);
            return data;
        },
    });

    useEffect(() => {
        if (user && event?.attendees) {
            setAttending(event.attendees.some((u) => u.id === user.id));
        }
    }, [user, event?.attendees]);

    // Fetch event embeds after the event detail is loaded
    useEffect(() => {
        if (event?.slug) {
            const fetchEmbeds = async () => {
                setEmbedsLoading(true);
                try {
                    const response = await api.get<{ data: string[] }>(`/events/${event.slug}/embeds`);
                    console.log('Fetched embeds:', response.data.data, 'Length:', response.data.data.length);
                    setEmbeds(response.data.data);
                } catch (err) {
                    console.error('Error fetching embeds:', err);
                    setEmbedsError(err instanceof Error ? err : new Error('Failed to load embeds'));
                } finally {
                    setEmbedsLoading(false);
                }
            };
            fetchEmbeds();
        }
    }, [event?.slug]);


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
                                <div className="flex items-start justify-between">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.name}</h1>
                                    {user && (
                                        <button onClick={handleAttendToggle} aria-label={attending ? 'Unattend' : 'Attend'}>
                                            <Star
                                                className={`h-6 w-6 ${attending ? 'text-yellow-500' : 'text-gray-400'}`}
                                                fill={attending ? 'currentColor' : 'none'}
                                            />
                                        </button>
                                    )}
                                </div>
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
                                <CardContent className="p-4 pt-2">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            {event.event_type && (
                                                <div className="items-center">
                                                    <span className="text-gray-500 font-bold">
                                                        {event.event_type.name}
                                                    </span>
                                                    {event.promoter && (
                                                        <span>
                                                            <span className="m-1 text-gray-500 ">
                                                                by
                                                            </span>
                                                            <span className=" text-gray-500 font-bold">
                                                                {event.promoter.name}
                                                            </span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center text-sm text-gray-500">
                                                <CalendarDays className="mr-2 h-4 w-4" />
                                                {formatDate(event.start_at)}
                                            </div>

                                            {event.venue && (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    {event.venue.name}
                                                </div>
                                            )}

                                            {event.min_age !== null && event.min_age !== undefined && (
                                                <AgeRestriction minAge={event.min_age} />
                                            )}

                                            {(event.presale_price || event.door_price) && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                                    {event.presale_price && (
                                                        <span className="text-green-600">
                                                            Presale: ${event.presale_price}
                                                        </span>
                                                    )}
                                                    {event.door_price && (
                                                        <span className="text-gray-600">
                                                            Door: ${event.door_price}
                                                        </span>
                                                    )}
                                                    {event.ticket_link && (
                                                        <a
                                                            href={event.ticket_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                                            title="Buy tickets"
                                                        >
                                                            <Ticket className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <EntityBadges entities={event.entities} />

                                        <TagBadges tags={event.tags} />
                                    </div>
                                </CardContent>
                            </Card>

                            {user && event.created_by && user.id === event.created_by && (
                                <PhotoDropzone eventId={event.id} />
                            )}
                            <PhotoGallery fetchUrl={`/events/${event.slug}/all-photos`} />
                            {/* Audio Embeds Section */}
                            {embeds.length > 0 && !embedsLoading && (
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
        </div >
    );
}