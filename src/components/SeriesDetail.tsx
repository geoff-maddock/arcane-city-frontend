import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Series } from '../types/api';
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
import { Loader2, ArrowLeft, CalendarDays, MapPin, DollarSign, Ticket, Star, MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { sanitizeHTML } from '../lib/sanitize';
import PhotoGallery from './PhotoGallery';
import PhotoDropzone from './PhotoDropzone';
import { AgeRestriction } from './AgeRestriction';
import { formatDate } from '../lib/utils';
import { authService } from '../services/auth.service';
import { EntityBadges } from './EntityBadges';
import { TagBadges } from './TagBadges';
import { SeriesFilterContext } from '../context/SeriesFilterContext';
import { useContext } from 'react';
import SeriesEvents from './SeriesEvents';

export default function SeriesDetail({ slug, initialSeries }: { slug: string; initialSeries?: Series }) {
    const navigate = useNavigate();
    const placeHolderImage = `${window.location.origin}/event-placeholder.png`;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const [following, setFollowing] = useState(false);
    const { setFilters } = useContext(SeriesFilterContext);
    useEffect(() => {
        if (user) {
            setFollowing(user.followed_series.some(s => s.slug === slug));
        }
    }, [user, slug]);

    const followMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/series/${slug}/follow`);
        },
        onSuccess: () => {
            setFollowing(true);
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/series/${slug}/unfollow`);
        },
        onSuccess: () => {
            setFollowing(false);
        },
    });

    const handleFollowToggle = () => {
        if (following) {
            unfollowMutation.mutate();
        } else {
            followMutation.mutate();
        }
    };

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/series/${slug}`);
        },
        onSuccess: () => {
            // Navigate back to series list after successful deletion
            navigate({ to: '/series' });
        },
        onError: (error) => {
            console.error('Error deleting series:', error);
            // You could add a toast notification here for better UX
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate();
        setDeleteDialogOpen(false);
    };

    const handleTagClick = (tagName: string) => {
        setFilters((prevFilters) => ({ ...prevFilters, tag: tagName }));
    };

    const handleEntityClick = (entityName: string) => {
        setFilters((prevFilters) => ({ ...prevFilters, entity: entityName }));
    };

    // Fetch the series data
    const { data: series, isLoading, error, refetch } = useQuery<Series>({
        queryKey: ['series', slug],
        queryFn: async () => {
            const { data } = await api.get<Series>(`/series/${slug}`);
            return data;
        },
        initialData: initialSeries,
        staleTime: 60_000,
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
                            <Link to="/series">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Series
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                        {/* Main Content */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-start justify-between">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">{series.name}</h1>
                                    {user && (
                                        <div className="flex items-center gap-2">
                                            <button onClick={handleFollowToggle} aria-label={following ? 'Unfollow' : 'Follow'} className="p-2 rounded-md hover:bg-gray-100">
                                                <Star className={`h-5 w-5 ${following ? 'text-yellow-500' : 'text-gray-400'}`} fill={following ? 'currentColor' : 'none'} />
                                            </button>
                                            {user.id === series.created_by && (
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
                                                            <Link
                                                                to="/series/$slug/edit"
                                                                params={{ slug: series.slug }}
                                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors w-full"
                                                                onClick={() => setActionsMenuOpen(false)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                Edit Series
                                                            </Link>

                                                            <button
                                                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                                                                onClick={() => {
                                                                    setActionsMenuOpen(false);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Delete Series
                                                            </button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Delete Confirmation Dialog */}
                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete Series</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete "{series.name}"? This action cannot be undone.
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
                                {series.short && (
                                    <p className="line-clamp-2 text-sm text-gray-500">{series.short}</p>
                                )}

                            </div>


                            <div className="aspect-video relative overflow-hidden rounded-lg">
                                <img
                                    src={series.primary_photo || placeHolderImage}
                                    alt={series.name}
                                    className="object-cover w-full h-full"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>


                            {series.description && (
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
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-3">
                                        {series.occurrence_type && (
                                            <p className="text-gray-600">{series.occurrence_type.name} {series.occurrence_repeat}</p>
                                        )}

                                        {series.event_type && (
                                            <div className="items-center">
                                                <span className="text-gray-500 font-bold">
                                                    {series.event_type.name}
                                                </span>
                                                {series.promoter && (
                                                    <span>
                                                        <span className="m-1 text-gray-500 ">by</span>
                                                        {series.promoter.slug ? (
                                                            <Link
                                                                to="/entities/$entitySlug"
                                                                params={{ entitySlug: series.promoter.slug }}
                                                                className="text-gray-500 font-bold hover:text-primary transition-colors underline-offset-2 hover:underline"
                                                                title="View Promoter"
                                                            >
                                                                {series.promoter.name}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-gray-500 font-bold" title="Promoter slug unavailable">{series.promoter.name}</span>
                                                        )}
                                                    </span>
                                                )}

                                                {series.primary_link && (
                                                    <a
                                                        href={series.primary_link}
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

                                        <div className="flex items-center gap-2 text-gray-600">
                                            {series.next_start_at && series.occurrence_type && series.occurrence_type.name !== 'No Schedule' ? (
                                                <>
                                                    <CalendarDays className="h-5 w-5" />
                                                    <span>{formatDate(series.next_start_at)}</span>
                                                </>
                                            ) : series.next_event && series.occurrence_type && series.occurrence_type.name === 'No Schedule' ? (
                                                <>
                                                    <CalendarDays className="h-5 w-5" />
                                                    <span>{formatDate(series.next_event.start_at)}</span>
                                                </>
                                            ) :
                                                (
                                                    <>
                                                        <CalendarDays className="h-5 w-5" />
                                                        <span>No upcoming events scheduled</span>
                                                    </>
                                                )}
                                        </div>
                                        {series.founded_at && (
                                            <p className="text-sm text-gray-500">
                                                Founded {new Date(series.founded_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </p>
                                        )}
                                        {series.venue && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-5 w-5" />
                                                {series.venue.slug ? (
                                                    <Link
                                                        to="/entities/$entitySlug"
                                                        params={{ entitySlug: series.venue.slug }}
                                                        className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                                                        title="View Venue"
                                                    >
                                                        {series.venue.name}
                                                    </Link>
                                                ) : (
                                                    <span title="Venue slug unavailable">{series.venue.name}</span>
                                                )}
                                            </div>
                                        )}

                                        {series.min_age !== null && series.min_age !== undefined && (
                                            <AgeRestriction minAge={series.min_age} />
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

                                    <EntityBadges entities={series.entities} onClick={handleEntityClick} />

                                    <TagBadges tags={series.tags} onClick={handleTagClick} />

                                </CardContent>
                            </Card>

                            {user && series.created_by && user.id === series.created_by && (
                                <PhotoDropzone seriesId={series.id} />
                            )}

                            <PhotoGallery
                                fetchUrl={`/series/${slug}/all-photos`}
                                onPrimaryUpdate={refetch}
                            />
                        </div>
                    </div>
                </div>

                {/* Series Events Section */}
                <SeriesEvents seriesName={series.name} />
            </div>
        </div>
    );
}
