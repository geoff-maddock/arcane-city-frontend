import { useNavigate } from '@tanstack/react-router';
import { Entity } from '../types/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import MapPin from '@/components/icons/MapPin';
import Users from '@/components/icons/Users';
import { TagBadges } from './TagBadges';
import { ImageLightbox } from './ImageLightbox';
import { useContext } from 'react';
import { EntityFilterContext } from '../context/EntityFilterContext';

interface EntityCardProps {
    entity: Entity;
    allImages: Array<{ src: string; alt: string }>;
    imageIndex: number;
}

export default function EntityCardCondensed({ entity, allImages, imageIndex }: EntityCardProps) {
    const navigate = useNavigate();
    const { setFilters } = useContext(EntityFilterContext);

    const handleTagClick = (tagName: string) => {
        setFilters(prev => ({ ...prev, tag: tagName }));
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate({
            to: '/entities/$entitySlug',
            params: { entitySlug: entity.slug }
        });
    };

    const placeholder = `${window.location.origin}/entity-placeholder.png`;

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-md">
            <div className="flex">
                <div className="flex-1">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex">
                            {(entity.primary_photo_thumbnail || entity.primary_photo) && (
                                <div className="w-1/3 mr-4">
                                    <ImageLightbox
                                        thumbnailUrl={entity.primary_photo_thumbnail || entity.primary_photo || placeholder}
                                        alt={entity.name}
                                        allImages={allImages}
                                        initialIndex={imageIndex}
                                    />
                                </div>
                            )}
                            <div className="w-2/3">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="line-clamp-2 text-xl font-semibold leading-tight text-gray-900">
                                        <a
                                            href={`/entities/${entity.slug}`}
                                            onClick={handleClick}
                                            className="hover:text-primary transition-colors"
                                        >
                                            {entity.name}
                                        </a>
                                    </h3>
                                </div>
                                {entity.short && (
                                    <p className="line-clamp-2 text-sm text-gray-500 mb-2">{entity.short}</p>
                                )}
                                <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    {entity.entity_type.name}
                                </div>
                                {entity.roles.length > 0 && (
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <Users className="mr-2 h-4 w-4" />
                                        {entity.roles.map(role => role.name).join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <TagBadges tags={entity.tags} onClick={handleTagClick} />
                    </CardContent>
                </div>
            </div>
        </Card>
    );
}
