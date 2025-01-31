import { useNavigate } from '@tanstack/react-router';
import { Series } from '../types/api';
import { formatDate } from '../lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';
import { useContext } from 'react';
import { SeriesFilterContext } from '../context/SeriesFilterContext';

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

interface SeriesCardProps {
  series: Series;
  allImages: Array<{ src: string; alt: string }>;
  imageIndex: number;
}

const SeriesCard = ({ series, allImages, imageIndex }: SeriesCardProps) => {
  const navigate = useNavigate();
  const { setFilters } = useContext(SeriesFilterContext);

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

  const ageRestriction = getAgeRestriction(series.min_age);
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
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="mr-2 h-4 w-4" />
                  {ageRestriction}
                </div>
              )}


            </div>

            {series.entities && series.entities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {series.entities.map((entity) => (
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

            {series.tags && series.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {series.tags.map((tag) => (
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
    </Card>
  );
};

export default SeriesCard;
