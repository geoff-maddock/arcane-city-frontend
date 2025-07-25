import { useNavigate } from '@tanstack/react-router';
import { Tag } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { useTagImage } from '../hooks/useTagImage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { api } from '../lib/api';
import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TagCardProps {
    tag: Tag;
}

export default function TagCard({ tag }: TagCardProps) {
    const navigate = useNavigate();
    const { url, alt } = useTagImage(tag.slug);
    const placeholder = `${window.location.origin}/event-placeholder.png`;

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const [following, setFollowing] = useState(false);

    useEffect(() => {
        if (user) {
            setFollowing(user.followed_tags.some(t => t.slug === tag.slug));
        }
    }, [user, tag.slug]);

    const followMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/tags/${tag.slug}/follow`);
        },
        onSuccess: () => {
            setFollowing(true);
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/tags/${tag.slug}/unfollow`);
        },
        onSuccess: () => {
            setFollowing(false);
        },
    });

    const handleFollowToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (following) {
            unfollowMutation.mutate();
        } else {
            followMutation.mutate();
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate({
            to: '/tags/$slug',
            params: { slug: tag.slug }
        });
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center space-y-2">
                <div className="h-24 w-full bg-gray-200 rounded overflow-hidden">
                    <img
                        src={url || placeholder}
                        alt={alt}
                        className="h-24 w-full object-cover"
                    />
                </div>
                <div className="flex justify-between items-center w-full">
                    <h2 className="text-lg font-semibold text-center flex-1">
                        <a
                            href={`/tags/${tag.slug}`}
                            onClick={handleClick}
                            className="hover:text-primary transition-colors"
                        >
                            {tag.name}
                        </a>
                    </h2>
                    {user && (
                        <button onClick={handleFollowToggle} aria-label={following ? 'Unfollow' : 'Follow'}>
                            <Star className={`h-5 w-5 ${following ? 'text-yellow-500' : 'text-gray-400'}`} fill={following ? 'currentColor' : 'none'} />
                        </button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
