import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { getEmbedCache, setEmbedCache, clearEmbedCache } from '../lib/embedCache';
import { Event } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, ArrowLeft, CalendarDays, CalendarPlus, MapPin, DollarSign, Ticket, Music, Star, MoreHorizontal, Edit, Trash2, Copy, Plus, ExternalLink, RefreshCw } from 'lucide-react';
// Lucide doesn't ship an Instagram brand icon; create a lightweight inline SVG component
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <circle cx="17.5" cy="6.5" r="1" />
    </svg>
);
import { authService } from '../services/auth.service';
import { AgeRestriction } from './AgeRestriction';
import { formatEventDate, generateGoogleCalendarLink } from '../lib/utils';
import { useState, useEffect } from 'react';
import { useSearchOptions } from '../hooks/useSearchOptions';
import { sanitizeHTML, sanitizeEmbed } from '../lib/sanitize';
import PhotoGallery from './PhotoGallery';
import PhotoDropzone from './PhotoDropzone';
import { EntityBadges } from './EntityBadges';
import { TagBadges } from './TagBadges';
import { useMediaPlayerContext } from '../hooks/useMediaPlayerContext';
import { useBackNavigation } from '../context/NavigationContext';
// Structured data is injected via the route head() now


export default function EventDetail({ slug, initialEvent }: { slug: string; initialEvent?: Event }) {
    const navigate = useNavigate();
    const { mediaPlayersEnabled } = useMediaPlayerContext();
    const { backHref, isFallback } = useBackNavigation('/events');
    const placeHolderImage = `${window.location.origin}/event-placeholder.png`;
    // Embeds now handled via React Query below; these legacy states removed.
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
    const [instagramDialogOpen, setInstagramDialogOpen] = useState(false);
    const [instagramResult, setInstagramResult] = useState<string | null>(null);
    const [imageOrientation, setImageOrientation] = useState<'landscape' | 'portrait' | null>(null);
    const [openSlideshowAtIndex, setOpenSlideshowAtIndex] = useState<number | null>(null);
    // Load visibility options to determine which id corresponds to Public
    const { data: visibilityOptions } = useSearchOptions('visibilities', '');
    const publicVisibilityId = visibilityOptions?.find(v => v.name.toLowerCase() === 'public')?.id;

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

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/events/${slug}`);
        },
        onSuccess: () => {
            // Navigate back to events list after successful deletion
            navigate({ to: '/events' });
        },
        onError: (error) => {
            console.error('Error deleting event:', error);
            // You could add a toast notification here for better UX
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate();
        setDeleteDialogOpen(false);
    };

    // Instagram post mutation
    const instagramPostMutation = useMutation<{ message: string } | unknown, Error>({
        mutationFn: async () => {
            if (!event) throw new Error('Event not loaded');
            const { data } = await api.post(`/events/${event.id}/instagram-post`);
            return data as { message?: string };
        },
        onSuccess: (data) => {
            const msg = (data as { message?: string })?.message || 'Event posted to Instagram.';
            setInstagramResult(msg);
        },
        onError: (err) => {
            console.error('Instagram post failed', err);
            setInstagramResult('Failed to post to Instagram.');
        },
        onSettled: () => {
            // Keep the dialog open to show result; user can close manually.
        }
    });

    const handleInstagramPost = () => {
        setInstagramResult(null);
        instagramPostMutation.mutate();
    };


    // Fetch the event data
    const { data: event, isLoading, error, refetch } = useQuery<Event>({
        queryKey: ['event', slug],
        queryFn: async () => {
            const { data } = await api.get<Event>(`/events/${slug}`);
            return data;
        },
        initialData: initialEvent,
        staleTime: 60_000,
    });

    useEffect(() => {
        if (user && event?.attendees) {
            setAttending(event.attendees.some((u) => u.id === user.id));
        }
    }, [user, event?.attendees]);

    // Detect image orientation when loaded
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        if (img.naturalWidth > img.naturalHeight) {
            setImageOrientation('landscape');
        } else {
            setImageOrientation('portrait');
        }
    };

    // Refresh embed cache by fetching from API and storing in cache
    const handleClearEmbedCache = async () => {
        if (!event?.slug) return;
        
        setActionsMenuOpen(false);
        
        try {
            // Clear the old cache first
            clearEmbedCache('events', event.slug, 'embeds');
            
            // Fetch fresh embeds from API
            const { data } = await api.get<{ data: string[] }>(`/events/${event.slug}/embeds`);
            const embedsData = data.data;
            
            // Store in localStorage
            setEmbedCache('events', event.slug, embedsData, 'embeds');
            
            // Refetch to display the new data
            await refetchEmbeds();
            
            // Show message if no embeds loaded
            if (!embedsData || embedsData.length === 0) {
                alert('No embeds available for this event.');
            }
        } catch (err) {
            console.error('Error refreshing embeds:', err);
            alert('Failed to refresh embeds. Please try again.');
        }
    };

    // React Query: fetch embeds when media players enabled & event slug available
    const {
        data: embeds = [],
        isLoading: embedsLoading,
        error: embedsError,
        refetch: refetchEmbeds,
    } = useQuery<string[], Error>({
        queryKey: ['eventEmbeds', event?.slug],
        queryFn: async () => {
            if (!event?.slug) return [];
            
            // Try to get from cache first
            const cachedEmbeds = getEmbedCache('events', event.slug, 'embeds');
            if (cachedEmbeds !== null) {
                return cachedEmbeds;
            }
            
            // Fetch from API if not cached
            const { data } = await api.get<{ data: string[] }>(`/events/${event.slug}/embeds`);
            const embedsData = data.data;
            
            // Cache the fetched embeds
            setEmbedCache('events', event.slug, embedsData, 'embeds');
            
            return embedsData;
        },
        enabled: !!event?.slug && mediaPlayersEnabled,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });


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
                            <Link to={backHref}>
                                <ArrowLeft className="h-4 w-4" />
                                {isFallback ? 'Back to Events' : 'Back'}
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                        {/* Main Content */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-start justify-between">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{event.name}</h1>
                                    <div className="flex items-center gap-2">
                                        {user && (
                                            <button onClick={handleAttendToggle} aria-label={attending ? 'Unattend' : 'Attend'} className="p-2 rounded-md hover:bg-gray-100">
                                                <Star
                                                    className={`h-6 w-6 ${attending ? 'text-yellow-500' : 'text-gray-400'}`}
                                                    fill={attending ? 'currentColor' : 'none'}
                                                />
                                            </button>
                                        )}
                                        {user && event.created_by && user.id === event.created_by && (
                                            <Popover open={actionsMenuOpen} onOpenChange={setActionsMenuOpen}>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100"
                                                        title="More actions"
                                                        aria-label="More actions"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-48 p-2" align="end">
                                                    <div className="space-y-1">
                                                        {/* Instagram Post Button: any authenticated user, public event only */}
                                                        {user && publicVisibilityId && event.visibility && event.visibility.id === publicVisibilityId && (
                                                            <button
                                                                onClick={() => setInstagramDialogOpen(true)}
                                                                aria-label="Post event to Instagram"
                                                                className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-800 transition-colors p-1 rounded-md hover:bg-purple-50"
                                                                title="Post to Instagram"
                                                            >
                                                                <InstagramIcon className="h-5 w-5" /> Post to Instagram
                                                            </button>
                                                        )}
                                                        <Link
                                                            to="/event/create"
                                                            search={{ duplicate: event.slug }}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors w-full"
                                                            onClick={() => setActionsMenuOpen(false)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                            Duplicate Event
                                                        </Link>
                                                        <Link
                                                            to="/series/create"
                                                            search={{ fromEvent: event.slug }}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors w-full"
                                                            onClick={() => setActionsMenuOpen(false)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            Create Series
                                                        </Link>
                                                        <Link
                                                            to="/event/$eventSlug/edit"
                                                            params={{ eventSlug: event.slug }}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors w-full"
                                                            onClick={() => setActionsMenuOpen(false)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Edit Event
                                                        </Link>
                                                        {mediaPlayersEnabled && embeds.length > 0 && (
                                                            <button
                                                                className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-md transition-colors w-full text-left"
                                                                onClick={handleClearEmbedCache}
                                                                title="Clear cached embeds and reload from API"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                                Clear Embed Cache
                                                            </button>
                                                        )}
                                                        <button
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                                                            onClick={() => {
                                                                setActionsMenuOpen(false);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete Event
                                                        </button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    </div>
                                </div>

                                {/* Delete Confirmation Dialog */}
                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete Event</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete "{event.name}"? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setDeleteDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDelete}
                                                disabled={deleteMutation.isPending}
                                            >
                                                {deleteMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Delete'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {/* Instagram Post Confirmation Dialog */}
                                <Dialog open={instagramDialogOpen} onOpenChange={(open) => { setInstagramDialogOpen(open); if (!open) setInstagramResult(null); }}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Post to Instagram</DialogTitle>
                                            <DialogDescription>
                                                {instagramResult
                                                    ? 'Result:'
                                                    : `Are you sure you want to post "${event.name}" to Instagram?`}
                                            </DialogDescription>
                                        </DialogHeader>
                                        {instagramResult && (
                                            <div className={`text-sm ${instagramResult.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>{instagramResult}</div>
                                        )}
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setInstagramDialogOpen(false)}
                                                disabled={instagramPostMutation.isPending}
                                            >
                                                {instagramResult ? 'Close' : 'Cancel'}
                                            </Button>
                                            {!instagramResult && (
                                                <Button
                                                    onClick={handleInstagramPost}
                                                    disabled={instagramPostMutation.isPending}
                                                >
                                                    {instagramPostMutation.isPending ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Posting...
                                                        </>
                                                    ) : (
                                                        'Post'
                                                    )}
                                                </Button>
                                            )}
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {event.short && (
                                    <p className="text-xl text-gray-600">{event.short}</p>
                                )}
                            </div>


                            <div className={imageOrientation === 'portrait' ? 'flex justify-center bg-card rounded-lg p-6 border shadow' : 'aspect-video relative overflow-hidden rounded-lg'}>
                                <button
                                    onClick={() => setOpenSlideshowAtIndex(-1)}
                                    className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                                    aria-label="View full size image"
                                    type="button"
                                >
                                    <img
                                        src={event.primary_photo || placeHolderImage}
                                        alt={event.name}
                                        className={imageOrientation === 'portrait' ? 'max-h-[600px] w-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity' : 'object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity'}
                                        onLoad={handleImageLoad}
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </button>
                            </div>


                            {event.description && (
                                <Card>
                                    <CardContent className="prose max-w-none p-6">
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(formattedDescription) }} />
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

                                                    {event.series && (
                                                        <span >
                                                            <Link
                                                                to="/series/$slug"
                                                                params={{ slug: event.series.slug }}
                                                                className="text-gray-600 font-bold hover:text-primary transition-colors"
                                                                title="View Series"
                                                            >
                                                                {event.series.name}
                                                            </Link>

                                                            {' '}series{' '}
                                                        </span>
                                                    )}

                                                    <span className="text-gray-500 font-bold">
                                                        {event.event_type.name}
                                                    </span>


                                                    {event.promoter && (
                                                        <span>
                                                            <span className="m-1 text-gray-500 ">by</span>
                                                            {event.promoter.slug ? (
                                                                <Link
                                                                    to="/entities/$entitySlug"
                                                                    params={{ entitySlug: event.promoter.slug }}
                                                                    className="text-gray-500 font-bold hover:text-primary transition-colors underline-offset-2 hover:underline"
                                                                    title="View Promoter"
                                                                >
                                                                    {event.promoter.name}
                                                                </Link>
                                                            ) : (
                                                                <span className="text-gray-500 font-bold" title="Promoter slug unavailable">{event.promoter.name}</span>
                                                            )}
                                                        </span>
                                                    )}

                                                    {event.primary_link && (
                                                        <a
                                                            href={event.primary_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 ml-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                                            title="Event link"
                                                        >
                                                            <ExternalLink className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center text-sm text-gray-500">
                                                <CalendarDays className="mr-2 h-4 w-4" />
                                                {formatEventDate(event.start_at, { timeZone: 'America/New_York', fixESTUtcBug: true })}
                                                <a
                                                    href={generateGoogleCalendarLink(event)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                                    title="Add to Google Calendar"
                                                >
                                                    <CalendarPlus className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                                                </a>
                                            </div>

                                            {event.venue && (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    {event.venue.slug ? (
                                                        <Link
                                                            to="/entities/$entitySlug"
                                                            params={{ entitySlug: event.venue.slug }}
                                                            className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                                                            title="View Venue"
                                                        >
                                                            {event.venue.name}
                                                        </Link>
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

                                        <TagBadges tags={event.tags} />

                                    </div>
                                </CardContent>
                            </Card>

                            {user && event.created_by && user.id === event.created_by && (
                                <PhotoDropzone eventId={event.id} />
                            )}

                            <PhotoGallery
                                fetchUrl={`/events/${event.slug}/all-photos`}
                                onPrimaryUpdate={refetch}
                                openAtIndex={openSlideshowAtIndex}
                                onSlideshowClose={() => setOpenSlideshowAtIndex(null)}
                            />
                            {/* Audio Embeds Section */}
                            {mediaPlayersEnabled && embeds.length > 0 && !embedsLoading && (
                                <Card>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Music className="h-5 w-5" />
                                            <h2 className="text-xl font-semibold">Audio</h2>
                                        </div>
                                        <div className="space-y-4">
                                            {embeds.map((embed, index) => {
                                                const safe = sanitizeEmbed(embed);
                                                return (
                                                    <div key={index} className="rounded-md overflow-hidden">
                                                        <div
                                                            dangerouslySetInnerHTML={{ __html: safe }}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Loading state for embeds */}
                            {mediaPlayersEnabled && embedsLoading && (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    <span className="ml-2 text-gray-600">Loading audio...</span>
                                </div>
                            )}

                            {/* Error state for embeds */}
                            {mediaPlayersEnabled && embedsError && !embedsLoading && (
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