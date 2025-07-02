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

export default function SeriesCardCondensed({ series, allImages, imageIndex }: SeriesCardProps) {
    const navigate = useNavigate();
    const { setFilters } = useContext(SeriesFilterContext);

    const handleTagClick = (tagName: string) => {
        setFilters(prev => ({ ...prev, tag: tagName }));
    };

    const handleEntityClick = (entityName: string) => {
        setFilters(prev => ({ ...prev, entity: entityName }));
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate({
            to: '/series/$slug',
            params: { slug: series.slug }
        });
    };

    const placeholder = `${window.location.origin}/event-placeholder.png`;

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-md">
            <div className="flex">
                <div className="flex-1">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex">
                            {(series.primary_photo_thumbnail || series.primary_photo) && (
                                <div className="w-1/3 mr-4">
                                    <ImageLightbox
                                        thumbnailUrl={series.primary_photo_thumbnail || series.primary_photo || placeholder}
                                        alt={series.name}
                                        allImages={allImages}
                                        initialIndex={imageIndex}
                                    />
                                </div>
                            )}
                            <div className="w-2/3">
                                <div className="flex justify-between items-start mb-2">
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
                                    <p className="line-clamp-2 text-sm text-gray-500 mb-2">{series.short}</p>
                                )}
                                {series.event_type && (
                                    <div className="items-center">
                                        <span className="text-gray-500 font-bold">
                                            {series.event_type.name}
                                        </span>
                                        {series.promoter && (
                                            <span>
                                                <span className="m-1 text-gray-500 ">by</span>
                                                <span className=" text-gray-500 font-bold">{series.promoter.name}</span>
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
                            <TagBadges tags={series.tags} onClick={handleTagClick} />
                        </div>
                    </CardContent>
                </div>
            </div>
        </Card>
    );
}
