import { useNavigate } from '@tanstack/react-router';
import { api } from '../lib/api';
import { Event } from '../types/api';
import { formatDate } from '../lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2, Music, CalendarDays, MapPin, DollarSign, Ticket, Star } from 'lucide-react';
import { AgeRestriction } from './AgeRestriction';
import { EntityBadges } from './EntityBadges';
import { TagBadges } from './TagBadges';
import { ImageLightbox } from './ImageLightbox';
import { useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { EventFilterContext } from '../context/EventFilterContext';
import { useState, useEffect } from 'react';


interface EventCardProps {
  event: Event;
  allImages: Array<{ src: string; alt: string }>;
  imageIndex: number;
}

const EventCard = ({ event, allImages, imageIndex }: EventCardProps) => {
  const navigate = useNavigate();
  const { setFilters } = useContext(EventFilterContext);
  const [embeds, setEmbeds] = useState<string[]>([]);
  const [embedsLoading, setEmbedsLoading] = useState(false);
  const [embedsError, setEmbedsError] = useState<Error | null>(null);
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
      console.log('Attending event:', event.slug);
      await api.post(`/events/${event.slug}/attend`);
    },
    onSuccess: () => {
      setAttending(true);
    },
  });

  const unattendMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/events/${event.slug}/attend`);
    },
    onSuccess: () => {
      setAttending(false);
    },
  });

  const handleTagClick = (tagName: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, tag: tagName }));
  };

  const handleEntityClick = (entityName: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, entity: entityName }));
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
    if (attending) {
      unattendMutation.mutate();
    } else {
      attendMutation.mutate();
    }
  };

  const placeHolderImage = `${window.location.origin}/event-placeholder.png`;
  const embedsEnabled = false; // This should be set based on your feature flag or config

  // Fetch event embeds after the event detail is loaded
  useEffect(() => {
    // Only fetch embeds if the event has an ID and the feature is enabled
    if (event?.id && embedsEnabled) {
      const fetchEmbeds = async () => {
        setEmbedsLoading(true);
        try {
          const response = await api.get<{ data: string[] }>(`/events/${event.id}/minimal-embeds`);
          console.log('Fetched embeds:', response.data.data, 'Length:', response.data.data.length);
          setEmbeds(response.data.data);
        } catch (err) {
          console.error('Error fetching embeds:', err);
          setEmbedsError(err instanceof Error ? err : new Error('Failed to load embeds'));
        } finally {
          setEmbedsLoading(false);
        }
      };
      fetchEmbeds();
    }
  }, [event?.id]);

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md event-card">
      <div className="top-row">

        <div className="thumbnail">
          <ImageLightbox
            thumbnailUrl={event.primary_photo || placeHolderImage}
            alt={event.name}
            allImages={allImages}
            initialIndex={imageIndex}
          />
        </div>

        <div className="title-description">
          <CardHeader className="p-4 pb-2">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
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
                  <button onClick={handleAttendToggle} aria-label={attending ? 'Unattend' : 'Attend'}>
                    <Star
                      className={`h-5 w-5 ${attending ? 'text-yellow-500' : 'text-gray-400'}`}
                      fill={attending ? 'currentColor' : 'none'}
                    />
                  </button>
                )}
              </div>
              {event.short && (
                <p className="line-clamp-2 text-sm text-gray-500">{event.short}</p>
              )}
            </div>
          </CardHeader>
        </div>
      </div>
      <div className="bottom-row">
        <CardContent className="p-4 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
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

            <EntityBadges
              entities={event.entities}
              onClick={handleEntityClick}
            />

            <TagBadges tags={event.tags} onClick={handleTagClick} />
          </div>
        </CardContent>
      </div>
      {/* Audio Embeds Section */}
      {embeds.length > 0 && !embedsLoading && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Audio</h2>
            </div>
            <div className="space-y-4">
              {embeds.map((embed, index) => (
                <div key={index} className="rounded-md overflow-hidden">
                  <div
                    dangerouslySetInnerHTML={{ __html: embed }}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading state for embeds */}
      {embedsLoading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading audio...</span>
        </div>
      )}

      {/* Error state for embeds */}
      {embedsError && !embedsLoading && (
        <div className="text-red-500 text-sm">
          Error loading audio content. Please try again later.
        </div>
      )}
    </Card>
  );
};

export default EventCard;
