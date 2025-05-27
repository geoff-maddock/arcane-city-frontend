import { useNavigate } from '@tanstack/react-router';
import { api } from '../lib/api';
import { Event } from '../types/api';
import { formatDate } from '../lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Music, CalendarDays, MapPin, Users, DollarSign, Ticket } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';
import { useContext } from 'react';
import { EventFilterContext } from '../context/EventFilterContext';
import { useState, useEffect } from 'react';

const getAgeRestriction = (minAge: number | null | undefined): string => {
  if (minAge === null || minAge === undefined) return 'Age requirement unknown';
  switch (minAge) {
    case 0:
      return 'All Ages';
    case 18:
      return '18+';
    case 21:
      return '21+';
    default:
      return `${minAge}+`;  // Just in case there's a different age restriction
  }
};

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

  const ageRestriction = getAgeRestriction(event.min_age);
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
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="mr-2 h-4 w-4" />
                  {ageRestriction}
                </div>
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

            {event.entities && event.entities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {event.entities.map((entity) => (
                  <Badge
                    key={entity.id}
                    variant="default"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1"
                    onClick={() => handleEntityClick(entity.name)}
                  >
                    {entity.name}
                  </Badge>
                ))}
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleTagClick(tag.name)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
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
