import { useNavigate } from '@tanstack/react-router';
import { Event } from '../types/api';
import { formatDate } from '../lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, MapPin, Star } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';
import { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { api } from '../lib/api';
import { EventFilterContext } from '../context/EventFilterContext';

interface EventCardGridProps {
    event: Event;
    allImages: Array<{ src: string; alt: string }>;
    imageIndex: number;
}

const EventCardGrid = ({ event, allImages, imageIndex }: EventCardGridProps) => {
    const navigate = useNavigate();
    const { setFilters } = useContext(EventFilterContext);
    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });
    const [attending, setAttending] = useState(false);

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
        },
    });

    const unattendMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/events/${event.id}/attend`);
        },
        onSuccess: () => {
            setAttending(false);
        },
    });

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

    const getEventPrice = () => {
        if (event.presale_price) {
            return `$${event.presale_price}`;
        }
        if (event.door_price) {
            return `$${event.door_price}`;
        }
        return null;
    };

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer h-full" onClick={handleClick}>
            {/* Image Section */}
            {event.primary_photo_thumbnail && event.primary_photo && (
                <div className="relative aspect-[4/3] overflow-hidden">
                    <div className="w-full h-full group-hover:scale-105 transition-transform duration-300">
                        <ImageLightbox
                            thumbnailUrl={event.primary_photo_thumbnail}
                            alt={event.name}
                            allImages={allImages}
                            initialIndex={imageIndex}
                        />
                    </div>
                    {/* Attend button overlay */}
                    {user && (
                        <button
                            onClick={handleAttendToggle}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
                            aria-label={attending ? 'Unattend' : 'Attend'}
                        >
                            <Star
                                className={`h-4 w-4 ${attending ? 'text-yellow-500' : 'text-gray-400'}`}
                                fill={attending ? 'currentColor' : 'none'}
                            />
                        </button>
                    )}
                    {/* Price badge */}
                    {getEventPrice() && (
                        <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                            {getEventPrice()}
                        </div>
                    )}
                </div>
            )}

            <CardContent className="p-3 flex-1 flex flex-col">
                {/* Event Title */}
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {event.name}
                </h3>

                {/* Date */}
                <div className="flex items-center text-xs text-gray-500 mb-1">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    {formatDate(event.start_at)}
                </div>

                {/* Venue */}
                {event.venue && (
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                        <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="line-clamp-1">{event.venue.name}</span>
                    </div>
                )}

                {/* Event Type */}
                {event.event_type && (
                    <div className="mt-auto">
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium">
                            {event.event_type.name}
                        </span>
                    </div>
                )}

                {/* Tags - show only first 2 tags */}
                {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {event.tags.slice(0, 2).map((tag) => (
                            <span
                                key={tag.id}
                                className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium cursor-pointer hover:bg-blue-200 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFilters((prevFilters) => ({ ...prevFilters, tag: tag.name }));
                                }}
                            >
                                {tag.name}
                            </span>
                        ))}
                        {event.tags.length > 2 && (
                            <span className="inline-block text-gray-400 text-xs px-1">
                                +{event.tags.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default EventCardGrid;
