import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '../lib/api';
import type { User } from '../types/auth';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function UserDetail({ id, initialUser }: { id: string; initialUser?: User }) {
    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ['user', id],
        queryFn: async () => {
            const { data } = await api.get<User>(`/users/${id}`);
            return data;
        },
        // Seed cache with loader-provided data to avoid duplicate refetch and show content immediately
        initialData: initialUser,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="text-center text-red-500">Error loading user. Please try again later.</div>
        );
    }

    const photo = user.photos && user.photos.length > 0 ? user.photos[0].thumbnail_path : null;
    const placeholder = `${window.location.origin}/user-placeholder.jpg`;
    const joinDate = format(new Date(user.created_at), 'MM.dd.yy');
    const lastActive = user.last_active ? format(new Date(user.last_active.created_at), 'MM.dd.yy') : 'N/A';

    return (
        <div className="min-h-screen">
            <div className="mx-auto px-6 py-8 max-w-[2400px] space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                        <Link to="/users">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Users
                        </Link>
                    </Button>
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                    <img
                        src={photo || placeholder}
                        alt={user.name}
                        className="h-48 w-48 object-cover rounded"
                    />
                    <div className="flex-1 space-y-6">
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <div className="grid grid-cols-[180px_1fr] gap-2 text-sm">
                            <span className="font-semibold text-gray-600">Status:</span>
                            <span>{user.status.name}</span>
                            {user.profile?.setting_public_profile === 1 ? (
                                <>
                                    <span className="font-semibold text-gray-600">Email:</span>
                                    <span>{user.email}</span>
                                    <span className="font-semibold text-gray-600">Contact:</span>
                                    <span>{user.email}</span>
                                </>
                            ) : null}
                            <span className="font-semibold text-gray-600">Alias:</span>
                            <span>{user.profile?.alias ?? 'N/A'}</span>
                            <span className="font-semibold text-gray-600">Location:</span>
                            <span>{user.profile?.location ?? 'N/A'}</span>
                            <span className="font-semibold text-gray-600">Bio:</span>
                            <span>{user.profile?.bio ?? 'N/A'}</span>
                            {user.profile?.default_theme && (
                                <>
                                    <span className="font-semibold text-gray-600">Default Theme:</span>
                                    <span>{user.profile.default_theme}</span>
                                </>
                            )}
                        </div>

                        {user.profile && user.profile.setting_public_profile === 1 && (
                            <div className="space-y-2">
                                <h2 className="text-xl font-semibold">Settings</h2>
                                <div className="grid grid-cols-[220px_1fr] gap-2 text-sm">
                                    <span className="font-semibold text-gray-600">Receive Weekly Updates:</span>
                                    <span>{user.profile.setting_weekly_update ? 'Yes' : 'No'}</span>
                                    <span className="font-semibold text-gray-600">Receive Daily Updates:</span>
                                    <span>{user.profile.setting_daily_update ? 'Yes' : 'No'}</span>
                                    <span className="font-semibold text-gray-600">Receive Instant Updates:</span>
                                    <span>{user.profile.setting_instant_update ? 'Yes' : 'No'}</span>
                                    <span className="font-semibold text-gray-600">Receive Forum Updates:</span>
                                    <span>{user.profile.setting_forum_update ? 'Yes' : 'No'}</span>
                                    <span className="font-semibold text-gray-600">Public Profile:</span>
                                    <span>{user.profile.setting_public_profile ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        )}

                        <div className="text-sm text-gray-500">
                            Joined: {joinDate} | Last Active: {lastActive}
                        </div>

                        {user.profile?.setting_public_profile === 1 && (
                            <>
                                {user.followed_tags && user.followed_tags.length > 0 && (
                                    <section className="space-y-2">
                                        <h3 className="text-lg font-semibold">Followed Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {user.followed_tags.map(tag => (
                                                <Link
                                                    key={tag.id}
                                                    to="/tags/$slug"
                                                    params={{ slug: tag.slug }}
                                                    className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                                                >
                                                    {tag.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {user.followed_entities && user.followed_entities.length > 0 && (
                                    <section className="space-y-2">
                                        <h3 className="text-lg font-semibold">Followed Entities</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {user.followed_entities.map(entity => (
                                                <Link
                                                    key={entity.id}
                                                    to="/entities/$entitySlug"
                                                    params={{ entitySlug: entity.slug }}
                                                    className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
                                                >
                                                    {entity.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {user.followed_series && user.followed_series.length > 0 && (
                                    <section className="space-y-2">
                                        <h3 className="text-lg font-semibold">Followed Series</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {user.followed_series.map(series => (
                                                <Link
                                                    key={series.id}
                                                    to="/series/$slug"
                                                    params={{ slug: series.slug }}
                                                    className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded hover:bg-green-200 dark:hover:bg-green-700"
                                                >
                                                    {series.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {user.followed_threads && user.followed_threads.length > 0 && (
                                    <section className="space-y-2">
                                        <h3 className="text-lg font-semibold">Followed Threads</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {user.followed_threads.map(thread => (
                                                <span
                                                    key={thread.id}
                                                    className="bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
                                                >
                                                    {thread.name}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
