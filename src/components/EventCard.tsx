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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { EventFilterContext } from '../context/EventFilterContext';
import { useState, useEffect } from 'react';
import { sanitizeEmbed } from '../lib/sanitize';
import { useMinimalEmbeds } from '../hooks/useMinimalEmbeds';
import { useMediaPlayerToggle } from '../hooks/useMediaPlayerToggle';


interface EventCardProps {
  event: Event;
  allImages: Array<{ src: string; alt: string }>;
  imageIndex: number;
}

const EventCard = ({ event, allImages, imageIndex }: EventCardProps) => {
  const navigate = useNavigate();
  const { setFilters } = useContext(EventFilterContext);
  const { mediaPlayersEnabled } = useMediaPlayerToggle();
  const { embeds, loading: embedsLoading, error: embedsError } = useMinimalEmbeds({
    resourceType: 'events',
    slug: event.slug,
    enabled: mediaPlayersEnabled // Only fetch embeds when media players are enabled
  });
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
  });
  const [attending, setAttending] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && event.attendees) {
      setAttending(event.attendees.some((u) => u.id === user.id));
    }
  }, [user, event.attendees]);

  const attendMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/events/${event.slug}/attend`);
    },
    onSuccess: () => {
      setAttending(true);
      if (user?.id) {
        queryClient.setQueryData<import('../types/api').PaginatedResponse<Event> | undefined>(['userAttendingEvents', user.id], (old) => {
          if (!old) return old;
          if (old.data.some(e => e.id === event.id)) return old;
          const newData = [...old.data, event].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
          return { ...old, data: newData, total: (old.total ?? newData.length) + 1 };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['userAttendingEvents'] });
    },
  });

  const unattendMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/events/${event.slug}/attend`);
    },
    onSuccess: () => {
      setAttending(false);
      if (user?.id) {
        queryClient.setQueryData<import('../types/api').PaginatedResponse<Event> | undefined>(['userAttendingEvents', user.id], (old) => {
          if (!old) return old;
          if (!old.data.some(e => e.id === event.id)) return old;
          const newData = old.data.filter(e => e.id !== event.id);
          return { ...old, data: newData, total: Math.max(0, (old.total ?? newData.length) - 1) };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['userAttendingEvents'] });
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
                  {event.series ? (
                    <span className="text-gray-500 font-normal">
                      <a
                        href={`/series/${event.series.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate({
                            to: '/series/$slug',
                            params: { slug: event.series!.slug }
                          });
                        }}
                        className="hover:text-primary transition-colors font-medium decoration-1 underline-offset-2"
                      >
                        {event.series.name}
                      </a>
                      {' '}series  <span className="text-gray-500 font-bold">{event.event_type.name}</span>
                    </span>
                  ) : (
                    <span className="text-gray-500 font-bold">
                      {event.event_type.name}
                    </span>
                  )}

                  {event.promoter && (
                    <span>
                      <span className="m-1 text-gray-500 ">
                        by
                      </span>
                      {event.promoter.slug ? (
                        <a
                          href={`/entities/${event.promoter.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate({
                              to: '/entities/$entitySlug',
                              params: { entitySlug: event.promoter!.slug }
                            });
                          }}
                          className="text-gray-500 font-bold hover:text-primary transition-colors underline-offset-2 hover:underline"
                        >
                          {event.promoter.name}
                        </a>
                      ) : (
                        <span className="text-gray-500 font-bold" title="Promoter slug unavailable">
                          {event.promoter.name}
                        </span>
                      )}
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
                  {event.venue.slug ? (
                    <a
                      href={`/entities/${event.venue.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate({
                          to: '/entities/$entitySlug',
                          params: { entitySlug: event.venue!.slug }
                        });
                      }}
                      className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                    >
                      {event.venue.name}
                    </a>
                  ) : (
                    <span title="Venue slug unavailable">{event.venue.name}</span>
                  )}
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

            {/* Slim Audio Embeds Section */}
            {mediaPlayersEnabled && embeds.length > 0 && !embedsLoading && (
              <div className="space-y-2">
                <div className="space-y-2">
                  {embeds.slice(0, 1).map((embed, index) => {
                    const safe = sanitizeEmbed(embed);
                    const isSoundCloud = /player\.soundcloud\.com|w\.soundcloud\.com/i.test(embed);
                    return (
                      <div key={index} className="rounded-md bg-gray-50 dark:bg-gray-800">
                        <div
                          dangerouslySetInnerHTML={{ __html: safe }}
                          className={`w-full ${!isSoundCloud ? '[&_iframe]:max-h-20 [&_iframe]:min-h-10' : ''}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading state for embeds */}
            {mediaPlayersEnabled && embedsLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading audio...</span>
              </div>
            )}

            {/* Error state for embeds */}
            {mediaPlayersEnabled && embedsError && !embedsLoading && (
              <div className="text-red-500 text-xs">
                Error loading audio content.
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default EventCard;
