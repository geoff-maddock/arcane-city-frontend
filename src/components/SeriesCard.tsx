import { useNavigate } from '@tanstack/react-router';
import { Series } from '../types/api';
import { formatDate } from '../lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CalendarDays, MapPin, Star } from 'lucide-react';
import { AgeRestriction } from './AgeRestriction';
import { EntityBadges } from './EntityBadges';
import { TagBadges } from './TagBadges';
import { ImageLightbox } from './ImageLightbox';
import { useContext, useState, useEffect } from 'react';
import { SeriesFilterContext } from '../context/SeriesFilterContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { api } from '../lib/api';


interface SeriesCardProps {
  series: Series;
  allImages: Array<{ src: string; alt: string }>;
  imageIndex: number;
}

const SeriesCard = ({ series, allImages, imageIndex }: SeriesCardProps) => {
  const navigate = useNavigate();
  const { setFilters } = useContext(SeriesFilterContext);
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
  });

  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (user) {
      setFollowing(user.followed_series.some(s => s.slug === series.slug));
    }
  }, [user, series.slug]);

  const followMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/series/${series.slug}/follow`);
    },
    onSuccess: () => {
      setFollowing(true);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/series/${series.slug}/unfollow`);
    },
    onSuccess: () => {
      setFollowing(false);
    },
  });

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (following) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const handleTagClick = (tagName: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, tag: tagName }));
  };

  const handleEntityClick = (entityName: string) => {
    setFilters((prevFilters) => ({ ...prevFilters, entity: entityName }));
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate({
      to: '/series/$slug',
      params: { slug: series.slug }
    });
  };

  const placeHolderImage = `${window.location.origin}/event-placeholder.png`;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md event-card">
      <div className="top-row">

        <div className="thumbnail">
          <ImageLightbox
            thumbnailUrl={series.primary_photo || placeHolderImage}
            alt={series.name}
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
                    href={`/series/${series.slug}`}
                    onClick={handleClick}
                    className="hover:text-primary transition-colors"
                  >
                    {series.name}
                  </a>
                </h3>
                {user && (
                  <button onClick={handleFollowToggle} aria-label={following ? 'Unfollow' : 'Follow'}>
                    <Star className={`h-5 w-5 ${following ? 'text-yellow-500' : 'text-gray-400'}`} fill={following ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>
              {series.short && (
                <p className="line-clamp-2 text-sm text-gray-500">{series.short}</p>
              )}
              {series.occurrence_type && (
                <p className="text-gray-600">{series.occurrence_type.name} {series.occurrence_repeat}</p>
              )}
            </div>
          </CardHeader>
        </div>
      </div>
      <div className="bottom-row">
        <CardContent className="p-4 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              {series.event_type && (
                <div className="items-center">
                  <span className="text-gray-500 font-bold">
                    {series.event_type.name}
                  </span>
                  {series.promoter && (
                    <span>
                      <span className="m-1 text-gray-500 ">by</span>
                      {series.promoter.slug ? (
                        <a
                          href={`/entities/${series.promoter.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate({
                              to: '/entities/$entitySlug',
                              params: { entitySlug: series.promoter!.slug }
                            });
                          }}
                          className="text-gray-500 font-bold hover:text-primary transition-colors underline-offset-2 hover:underline"
                        >
                          {series.promoter.name}
                        </a>
                      ) : (
                        <span className="text-gray-500 font-bold" title="Promoter slug unavailable">{series.promoter.name}</span>
                      )}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500">
                {series.next_start_at ? (
                  <>
                    <CalendarDays className="mr-2 h-5 w-5" />
                    <span>{formatDate(series.next_start_at)}</span>
                  </>
                ) : (
                  <>
                    <CalendarDays className="mr-2 h-5 w-5" />
                    <span>No upcoming events scheduled</span>
                  </>
                )}
              </div>

              {series.venue && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-2 h-4 w-4" />
                  {series.venue.slug ? (
                    <a
                      href={`/entities/${series.venue.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate({
                          to: '/entities/$entitySlug',
                          params: { entitySlug: series.venue!.slug }
                        });
                      }}
                      className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                    >
                      {series.venue.name}
                    </a>
                  ) : (
                    <span title="Venue slug unavailable">{series.venue.name}</span>
                  )}
                </div>
              )}

              {series.min_age !== null && series.min_age !== undefined && (
                <AgeRestriction minAge={series.min_age} />
              )}


            </div>

            <EntityBadges entities={series.entities} onClick={handleEntityClick} />

            <TagBadges tags={series.tags} onClick={handleTagClick} />
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default SeriesCard;

