import { useNavigate } from '@tanstack/react-router';
import { Tag } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { useTagImage } from '../hooks/useTagImage';
import { useTagUpcomingEvents } from '../hooks/useTagUpcomingEvents';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { api } from '../lib/api';
import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EnhancedTagCardProps {
    tag: Tag;
}

export default function EnhancedTagCard({ tag }: EnhancedTagCardProps) {
    const navigate = useNavigate();
    const { url, alt } = useTagImage(tag.slug);
    const placeholder = typeof window !== 'undefined' 
        ? `${window.location.origin}/event-placeholder.png` 
        : '/event-placeholder.png';
    
    // Fetch upcoming events for this tag
    const { data: upcomingEvents = [] } = useTagUpcomingEvents({ 
        tagSlug: tag.slug, 
        limit: 4 
    });

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

    const handleTagClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate({
            to: '/tags/$slug',
            params: { slug: tag.slug }
        });
    };

    const handleEventClick = (e: React.MouseEvent, eventSlug: string) => {
        e.preventDefault();
        e.stopPropagation();
        navigate({
            to: '/events/$slug',
            params: { slug: eventSlug }
        });
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center space-y-2">
                {/* Tag Image */}
                <div className="h-24 w-full bg-gray-200 rounded overflow-hidden">
                    <img
                        src={url || placeholder}
                        alt={alt}
                        className="h-24 w-full object-cover"
                    />
                </div>
                
                {/* Tag Name and Follow Button */}
                <div className="flex justify-between items-center w-full">
                    <h2 className="text-lg font-semibold text-center flex-1">
                        <a
                            href={`/tags/${tag.slug}`}
                            onClick={handleTagClick}
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

                {/* Upcoming Events Grid */}
                {upcomingEvents.length > 0 && (
                    <div className="w-full grid grid-cols-2 gap-2 pt-2">
                        {upcomingEvents.slice(0, 4).map((event) => (
                            <div 
                                key={event.id}
                                className="relative group cursor-pointer aspect-[4/3] overflow-hidden rounded"
                                onClick={(e) => handleEventClick(e, event.slug)}
                            >
                                <img
                                    src={event.primary_photo_thumbnail || event.primary_photo || placeholder}
                                    alt={event.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Event Name and Type Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                    <div className="text-white text-center text-xs">
                                        <p className="font-semibold line-clamp-2">{event.name}</p>
                                        {event.event_type && (
                                            <p className="text-gray-300 mt-1">{event.event_type.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
