import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Tag, Event, Entity, Series, PaginatedResponse, RelatedTags } from '../types/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Star, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import EventCardCondensed from './EventCardCondensed';
import EntityCardCondensed from './EntityCardCondensed';
import SeriesCardCondensed from './SeriesCardCondensed';
import { authService } from '../services/auth.service';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useBackNavigation } from '../context/NavigationContext';

export default function TagDetail({ slug }: { slug: string }) {
    const navigate = useNavigate();
    const { backHref, isFallback } = useBackNavigation('/tags');

    const { data: tag, isLoading, error } = useQuery<Tag>({
        queryKey: ['tag', slug],
        queryFn: async () => {
            const { data } = await api.get<Tag>(`/tags/${slug}`);
            return data;
        },
    });

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const [following, setFollowing] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setFollowing(user.followed_tags.some(t => t.slug === slug));
        }
    }, [user, slug]);

    const followMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/tags/${slug}/follow`);
        },
        onSuccess: () => {
            setFollowing(true);
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/tags/${slug}/unfollow`);
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
            await api.delete(`/tags/${slug}`);
        },
        onSuccess: () => {
            navigate({ to: '/tags' });
        },
        onError: (error) => {
            console.error('Error deleting tag:', error);
        },
    });

    const handleDelete = () => {
        deleteMutation.mutate();
        setDeleteDialogOpen(false);
    };

    const { data: eventsData, isLoading: eventsLoading } = useQuery<PaginatedResponse<Event>>({
        queryKey: ['tagEvents', slug],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', '1');
            params.append('limit', '8');
            params.append('filters[tag]', slug);
            params.append('sort', 'start_at');
            params.append('direction', 'desc');
            const { data } = await api.get<PaginatedResponse<Event>>(`/events?${params.toString()}`);
            return data;
        },
        enabled: !!tag,
    });

    const { data: entitiesData, isLoading: entitiesLoading } = useQuery<PaginatedResponse<Entity>>({
        queryKey: ['tagEntities', slug],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', '1');
            params.append('limit', '8');
            params.append('filters[tag]', slug);
            const { data } = await api.get<PaginatedResponse<Entity>>(`/entities?${params.toString()}`);
            return data;
        },
        enabled: !!tag,
    });

    const { data: seriesData, isLoading: seriesLoading } = useQuery<PaginatedResponse<Series>>({
        queryKey: ['tagSeries', slug],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', '1');
            params.append('limit', '8');
            params.append('filters[tag]', slug);
            const { data } = await api.get<PaginatedResponse<Series>>(`/series?${params.toString()}`);
            return data;
        },
        enabled: !!tag,
    });

    const { data: relatedTagsData, isLoading: relatedTagsLoading } = useQuery<RelatedTags>({
        queryKey: ['tagRelatedTags', slug],
        queryFn: async () => {
            const { data } = await api.get<RelatedTags>(`/tags/${slug}/related-tags`);
            return data;
        },
        enabled: !!tag,
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !tag) {
        return (
            <div className="text-center text-red-500">Error loading tag. Please try again later.</div>
        );
    }

    const eventImages = eventsData?.data.filter(e => e.primary_photo && e.primary_photo_thumbnail).map(e => ({
        src: e.primary_photo!,
        alt: e.name,
        thumbnail: e.primary_photo_thumbnail,
    })) ?? [];

    const entityImages = entitiesData?.data.filter(e => e.primary_photo && e.primary_photo_thumbnail).map(e => ({
        src: e.primary_photo!,
        alt: e.name,
        thumbnail: e.primary_photo_thumbnail,
    })) ?? [];

    const seriesImages = seriesData?.data.filter(s => s.primary_photo && s.primary_photo_thumbnail).map(s => ({
        src: s.primary_photo!,
        alt: s.name,
        thumbnail: s.primary_photo_thumbnail,
    })) ?? [];

    // Convert related tags object to sorted array
    const sortedRelatedTags = relatedTagsData
        ? Object.entries(relatedTagsData)
            .sort(([, a], [, b]) => b - a)
            .map(([name, score]) => ({ name, score }))
        : [];

    return (
        <div className="min-h-screen">
            <div className="mx-auto px-6 py-8 max-w-[2400px]">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                            <Link to={backHref}>
                                <ArrowLeft className="h-4 w-4" />
                                {isFallback ? 'Back to Tags' : 'Back'}
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">{tag.name}</h1>
                            {tag.tag_type && (
                                <p className="text-xl text-gray-600">{tag.tag_type.name}</p>
                            )}
                            {tag.description && (
                                <p className="mt-2 text-gray-700">{tag.description}</p>
                            )}
                        </div>
                        {user && (
                            <div className="flex items-center gap-2">
                                <button onClick={handleFollowToggle} aria-label={following ? 'Unfollow' : 'Follow'}>
                                    <Star className={`h-6 w-6 ${following ? 'text-yellow-500' : 'text-gray-400'}`} fill={following ? 'currentColor' : 'none'} />
                                </button>
                                {tag.created_by && user.id === tag.created_by && (
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
                                                    to="/tags/$slug/edit"
                                                    params={{ slug }}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors w-full"
                                                    onClick={() => setActionsMenuOpen(false)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Edit Tag
                                                </Link>
                                                <button
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                                                    onClick={() => {
                                                        setActionsMenuOpen(false);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete Tag
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
                                <DialogTitle>Delete Tag</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete "{tag.name}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
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

                    <div>
                        <h2 className="text-l font-semibold mb-4">Related Tags</h2>
                        {relatedTagsLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        ) : sortedRelatedTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {sortedRelatedTags.map(({ name }) => (
                                    <Link
                                        key={name}
                                        to="/tags/$slug"
                                        params={{ slug: name.toLowerCase().replace(/\s+/g, '-') }}
                                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100 transition-colors border border-gray-200 dark:border-slate-600"
                                    >
                                        <span className="font-medium">{name}</span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No related tags found.</p>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="flex items-baseline gap-3 mb-4">
                                <h2 className="text-2xl font-semibold">Events</h2>
                                <Link
                                    to="/events/tag/$slug"
                                    params={{ slug }}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                >
                                    View all
                                </Link>
                            </div>
                            {eventsLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            ) : eventsData && eventsData.data.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                                    {eventsData.data.map((event, idx) => (
                                        <EventCardCondensed
                                            key={event.id}
                                            event={event}
                                            allImages={eventImages}
                                            imageIndex={idx}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No events found.</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-baseline gap-3 mb-4">
                                <h2 className="text-2xl font-semibold">Entities</h2>
                                <Link
                                    to="/entities/tag/$slug"
                                    params={{ slug }}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                >
                                    View all
                                </Link>
                            </div>
                            {entitiesLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            ) : entitiesData && entitiesData.data.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                                    {entitiesData.data.map((entity, idx) => (
                                        <EntityCardCondensed key={entity.id} entity={entity} allImages={entityImages} imageIndex={idx} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No entities found.</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-baseline gap-3 mb-4">
                                <h2 className="text-2xl font-semibold">Series</h2>
                                <Link
                                    to="/series/tag/$slug"
                                    params={{ slug }}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                >
                                    View all
                                </Link>
                            </div>
                            {seriesLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            ) : seriesData && seriesData.data.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4">
                                    {seriesData.data.map((series, idx) => (
                                        <SeriesCardCondensed key={series.id} series={series} allImages={seriesImages} imageIndex={idx} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No series found.</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}
