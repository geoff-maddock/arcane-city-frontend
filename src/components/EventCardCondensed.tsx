import { useNavigate } from '@tanstack/react-router';
import { Event } from '../types/api';
import { formatDate } from '../lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CalendarDays, MapPin, DollarSign, Ticket, Star } from 'lucide-react';
import { AgeRestriction } from './AgeRestriction';
import { EntityBadges } from './EntityBadges';
import { TagBadges } from './TagBadges';
import { ImageLightbox } from './ImageLightbox';
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { EventFilterContext } from '../context/EventFilterContext';
import { useAttend } from '@/hooks/useAttend';


interface EventCardProps {
    event: Event;
    allImages: Array<{ src: string; alt: string }>;
    imageIndex: number;
}

const EventCardCondensed = ({ event, allImages, imageIndex }: EventCardProps) => {
    const navigate = useNavigate();
    const { setFilters } = useContext(EventFilterContext);
    const placeHolderImage = `${window.location.origin}/event-placeholder.png`;
    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });
    const attend = useAttend(event.slug);

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
        attend.toggle();
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
                                        <button onClick={handleAttendToggle} aria-label={attend.attending ? 'Unattend' : 'Attend'}>
                                            <Star
                                                className={`h-5 w-5 ${attend.attending ? 'text-yellow-500' : 'text-gray-400'}`}
                                                fill={attend.attending ? 'currentColor' : 'none'}
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
                                                <span className="m-1 text-gray-500 ">
                                                    by
                                                </span>
                                                <span className=" text-gray-500 font-bold">
                                                    {event.promoter.name}
                                                </span>
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
                                    {formatDate(event.start_at)}
                                </div>

                                {event.venue && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {event.venue.name}
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
                        </div>
                    </CardContent>
                </div>
            </div>
        </Card>
    );
};

export default EventCardCondensed;