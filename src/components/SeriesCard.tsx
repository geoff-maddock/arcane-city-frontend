import { useNavigate } from '@tanstack/react-router';
import { Series } from '../types/api';
import { formatDate } from '../lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CalendarDays, MapPin } from 'lucide-react';
import { AgeRestriction } from './AgeRestriction';
import { EntityBadges } from './EntityBadges';
import { TagBadges } from './TagBadges';
import { ImageLightbox } from './ImageLightbox';
import { useContext } from 'react';
import { SeriesFilterContext } from '../context/SeriesFilterContext';


interface SeriesCardProps {
  series: Series;
  allImages: Array<{ src: string; alt: string }>;
  imageIndex: number;
}

const SeriesCard = ({ series, allImages, imageIndex }: SeriesCardProps) => {
  const navigate = useNavigate();
  const { setFilters } = useContext(SeriesFilterContext);

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
                      <span className="m-1 text-gray-500 ">
                        by
                      </span>
                      <span className=" text-gray-500 font-bold">
                        {series.promoter.name}
                      </span>
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <CalendarDays className="mr-2 h-4 w-4" />
                {formatDate(series.start_at)}
              </div>

              {series.venue && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="mr-2 h-4 w-4" />
                  {series.venue.name}
                </div>
              )}

              {series.min_age !== null && series.min_age !== undefined && (
                <AgeRestriction minAge={series.min_age} />
              )}


            </div>

            <EntityBadges entities={series.entities} onClick={handleEntityClick} />

            <TagBadges tags={series.tags} />
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default SeriesCard;
