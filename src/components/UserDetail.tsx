import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { User } from '../types/auth';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function UserDetail({ id }: { id: string }) {
    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ['user', id],
        queryFn: async () => {
            const { data } = await api.get<User>(`/users/${id}`);
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

    if (error || !user) {
        return (
            <div className="text-center text-red-500">Error loading user. Please try again later.</div>
        );
    }

    const photo = user.photos && user.photos.length > 0 ? user.photos[0].thumbnail_path : null;
    const placeholder = `${window.location.origin}/event-placeholder.png`;

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
                <div className="space-y-4">
                    <img src={photo || placeholder} alt={user.name} className="h-32 w-32 object-cover rounded" />
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-gray-600">{user.email}</p>
                    {user.profile && (
                        <div className="space-y-2">
                            {user.profile.alias && <p>Alias: {user.profile.alias}</p>}
                            {user.profile.location && <p>Location: {user.profile.location}</p>}
                            {user.profile.bio && <p>Bio: {user.profile.bio}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
