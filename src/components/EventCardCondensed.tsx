import { useNavigate } from '@tanstack/react-router';
import { Event } from '../types/api';
import { formatEventDate } from '../lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, CalendarDays, MapPin, DollarSign, Ticket, Star } from 'lucide-react';
import { AgeRestriction } from './AgeRestriction';
import { EntityBadges } from './EntityBadges';
import { TagBadges } from './TagBadges';
import { ImageLightbox } from './ImageLightbox';
import { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { api } from '../lib/api';
import { EventFilterContext } from '../context/EventFilterContext';
import { useMinimalEmbeds } from '../hooks/useMinimalEmbeds';
import { useMediaPlayerContext } from '../context/MediaPlayerContext';
import { sanitizeEmbed } from '../lib/sanitize';

interface EventCardProps {
    event: Event;
    allImages: Array<{ src: string; alt: string }>;
    imageIndex: number;
}

const EventCardCondensed = ({ event, allImages, imageIndex }: EventCardProps) => {
    const navigate = useNavigate();
    const { setFilters } = useContext(EventFilterContext);
    const { mediaPlayersEnabled } = useMediaPlayerContext();
    const { embeds, loading: embedsLoading, error: embedsError } = useMinimalEmbeds({
        resourceType: 'events',
        slug: event.slug,
        enabled: mediaPlayersEnabled // Only fetch embeds when media players are enabled
    });
    const placeHolderImage = `${window.location.origin}/event-placeholder.png`;
    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });
    const [attending, setAttending] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (user && event.attendees) {
            setAttending(event.attendees.some((u) => u.id === user.id));
        }
    }, [user, event.attendees]);

    const attendMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/events/${event.id}/attend`);
        },
        onSuccess: () => {
            setAttending(true);
            // Optimistically add to attending events query cache so Radar updates immediately
            if (user?.id) {
                queryClient.setQueryData<import('../types/api').PaginatedResponse<Event> | undefined>(['userAttendingEvents', user.id], (old) => {
                    if (!old) return old; // no cache yet
                    if (old.data?.some((e: Event) => e.id === event.id)) return old;
                    const newData = [...old.data, event].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
                    return { ...old, data: newData, total: (old.total ?? newData.length) + 1 };
                });
            }
            // Also trigger a background refetch for accuracy
            queryClient.invalidateQueries({ queryKey: ['userAttendingEvents'] });
        },
    });

    const unattendMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/events/${event.id}/attend`);
        },
        onSuccess: () => {
            setAttending(false);
            // Remove from attending events cache immediately
            if (user?.id) {
                queryClient.setQueryData<import('../types/api').PaginatedResponse<Event> | undefined>(['userAttendingEvents', user.id], (old) => {
                    if (!old) return old;
                    if (!old.data?.some((e: Event) => e.id === event.id)) return old;
                    const newData = old.data.filter((e) => e.id !== event.id);
                    return { ...old, data: newData, total: Math.max(0, (old.total ?? newData.length) - 1) };
                });
            }
            queryClient.invalidateQueries({ queryKey: ['userAttendingEvents'] });
        },
    });

    const handleTagClick = (tagName: string) => {
        setFilters((prevFilters) => ({ ...prevFilters, tag: tagName }));
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate({
            to: '/events/$slug',
            params: { slug: event.slug }
        });
    };

    const handleAttendToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (attending) {
            unattendMutation.mutate();
        } else {
            attendMutation.mutate();
        }
    };


    return (
        <Card className="group overflow-hidden transition-all hover:shadow-md">
            <div className="flex">

                <div className="flex-1">

                    <CardHeader className="p-4 pb-2">
                        <div className="flex">
                            <div className="w-1/3 mr-4">
                                <ImageLightbox
                                    thumbnailUrl={event.primary_photo_thumbnail || placeHolderImage}
                                    alt={event.name}
                                    allImages={allImages}
                                    initialIndex={imageIndex}
                                />
                            </div>
                            <div className="w-2/3">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-gray-900">
                                        <a
                                            href={`/events/${event.slug}`}
                                            onClick={handleClick}
                                            className="hover:text-primary transition-colors"
                                        >
                                            {event.name}
                                        </a>
                                    </h3>
                                    {user && (
                                        <button onClick={handleAttendToggle} aria-label={attending ? 'Unattend' : 'Attend'}>
                                            <Star
                                                className={`h-5 w-5 ${attending ? 'text-yellow-500' : 'text-gray-400'}`}
                                                fill={attending ? 'currentColor' : 'none'}
                                            />
                                        </button>
                                    )}
                                </div>
                                {event.short && (
                                    <p className="line-clamp-2 text-sm text-gray-500 mb-2">{event.short}</p>
                                )}
                                {event.event_type && (
                                    <div className="items-center">
                                        <span className="text-gray-500 font-bold">
                                            {event.event_type.name}
                                        </span>
                                        {event.promoter && (
                                            <span>
                                                <span className="m-1 text-gray-500 ">by</span>
                                                {event.promoter.slug ? (
                                                    <a
                                                        href={`/entities/${event.promoter.slug}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            navigate({
                                                                to: '/entities/$entitySlug',
                                                                params: { entitySlug: event.promoter!.slug }
                                                            });
                                                        }}
                                                        className="text-gray-500 font-bold hover:text-primary transition-colors underline-offset-2 hover:underline"
                                                    >
                                                        {event.promoter.name}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-500 font-bold" title="Promoter slug unavailable">{event.promoter.name}</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="space-y-4">
                            <div className="space-y-2">


                                <div className="flex items-center text-sm text-gray-500">
                                    <CalendarDays className="mr-2 h-4 w-4" />
                                    {formatEventDate(event.start_at, { timeZone: 'America/New_York', fixESTUtcBug: true })}
                                </div>

                                {event.venue && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {event.venue.slug ? (
                                            <a
                                                href={`/entities/${event.venue.slug}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    navigate({
                                                        to: '/entities/$entitySlug',
                                                        params: { entitySlug: event.venue!.slug }
                                                    });
                                                }}
                                                className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                                            >
                                                {event.venue.name}
                                            </a>
                                        ) : (
                                            <span title="Venue slug unavailable">{event.venue.name}</span>
                                        )}
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

                            <TagBadges tags={event.tags} onClick={handleTagClick} />
                            {/* Slim Audio Embeds Section */}
                            {mediaPlayersEnabled && embeds.length > 0 && !embedsLoading && (
                                <div className="space-y-2">
                                    <div className="space-y-2">
                                        {embeds.slice(0, 1).map((embed, index) => {
                                            const safe = sanitizeEmbed(embed);
                                            const isSoundCloud = /player\.soundcloud\.com|w\.soundcloud\.com/i.test(embed);
                                            return (
                                                <div key={index} className="rounded-md bg-gray-50 dark:bg-gray-800">
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: safe }}
                                                        className={`w-full ${!isSoundCloud ? '[&_iframe]:max-h-20 [&_iframe]:min-h-10' : ''}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Loading state for embeds */}
                            {mediaPlayersEnabled && embedsLoading && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Loading audio...</span>
                                </div>
                            )}

                            {/* Error state for embeds */}
                            {mediaPlayersEnabled && embedsError && !embedsLoading && (
                                <div className="text-red-500 text-xs">
                                    Error loading audio content.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </div>
            </div>
        </Card>
    );
};

export default EventCardCondensed;