import { Link } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Tag, Event, Entity, Series, PaginatedResponse } from '../types/api';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Star } from 'lucide-react';
import EventCardCondensed from './EventCardCondensed';
import EntityCardCondensed from './EntityCardCondensed';
import SeriesCardCondensed from './SeriesCardCondensed';
import { authService } from '../services/auth.service';
import { useState, useEffect } from 'react';

export default function TagDetail({ slug }: { slug: string }) {
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

    const { data: eventsData, isLoading: eventsLoading } = useQuery<PaginatedResponse<Event>>({
        queryKey: ['tagEvents', slug],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', '1');
            params.append('limit', '5');
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
            params.append('limit', '5');
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
            params.append('limit', '5');
            params.append('filters[tag]', slug);
            const { data } = await api.get<PaginatedResponse<Series>>(`/series?${params.toString()}`);
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

    return (
        <div className="min-h-screen">
            <div className="mx-auto px-6 py-8 max-w-[2400px]">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                            <Link to="/tags">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Tags
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-start justify-between">
                        <h1 className="text-4xl font-bold text-gray-900">{tag.name}</h1>
                        {user && (
                            <div className="flex items-center gap-2">
                                <button onClick={handleFollowToggle} aria-label={following ? 'Unfollow' : 'Follow'}>
                                    <Star className={`h-6 w-6 ${following ? 'text-yellow-500' : 'text-gray-400'}`} fill={following ? 'currentColor' : 'none'} />
                                </button>
                                {tag.created_by && user.id === tag.created_by && (
                                    <Button size="sm" variant="outline" asChild>
                                        <Link to="/tags/$slug/edit" params={{ slug }}>
                                            Edit Tag
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Events</h2>
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
                            <h2 className="text-2xl font-semibold mb-4">Entities</h2>
                            {entitiesLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            ) : entitiesData && entitiesData.data.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                    {entitiesData.data.map((entity, idx) => (
                                        <EntityCardCondensed key={entity.id} entity={entity} allImages={entityImages} imageIndex={idx} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No entities found.</p>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Series</h2>
                            {seriesLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            ) : seriesData && seriesData.data.length > 0 ? (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
        </div>
    );
}
