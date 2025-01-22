import { useNavigate } from '@tanstack/react-router';
import { Entity } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import MapPin from '@/components/icons/MapPin';
import Users from '@/components/icons/Users';
import { Badge } from '@/components/ui/badge';
import { ImageLightbox } from './ImageLightbox';
import { useContext } from 'react';
import { EntityFilterContext } from '../context/EntityFilterContext';

// interface EntityType {
//     id: number;
//     name: string;
// }

// interface EntityStatus {
//     id: number;
//     name: string;
// }

// interface Link {
//     id: number;
//     url: string;
// }

// interface Tag {
//     id: number;
//     name: string;
// }

// interface Role {
//     id: number;
//     name: string;
// }

interface EntityCardProps {
    entity: Entity;
    allImages: Array<{ src: string; alt: string }>;
    imageIndex: number;
}

const EntityCard = ({ entity, allImages, imageIndex }: EntityCardProps) => {
    const navigate = useNavigate();
    const { setFilters } = useContext(EntityFilterContext);

    const handleTagClick = (tagName: string) => {
        setFilters((prevFilters) => ({ ...prevFilters, tag: tagName }));
    };

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate({
            to: '/entities/$entitySlug',
            params: { entitySlug: entity.slug }
        });
    };

    const placeHolderImage = `${window.location.origin}/src/assets/entity-placeholder.png`;

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                    <h2 className="text-xl font-bold">
                        <a
                            href={`/entities/${entity.slug}`}
                            onClick={handleClick}
                            className="hover:text-primary transition-colors"
                        >
                            {entity.name}
                        </a>
                    </h2>
                    {entity.short && <p className="text-gray-600">{entity.short}</p>}
                    <div className="thumbnail">
                        <ImageLightbox
                            thumbnailUrl={entity.primary_photo || placeHolderImage}
                            alt={entity.name}
                            allImages={allImages}
                            initialIndex={imageIndex}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-5 w-5" />
                        <span>{entity.entity_type.name}</span>
                    </div>
                    {entity.roles.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-5 w-5" />
                            <span>{entity.roles.map((role) => role.name).join(', ')}</span>
                        </div>
                    )}
                    {entity.description && (
                        <p className="text-gray-600">
                            {entity.description.length > 1200
                                ? `${entity.description.substring(0, 1200)}...`
                                : entity.description}
                        </p>
                    )}
                    {entity.links.length > 0 && (
                        <div className="space-y-2">
                            <ul className="list-inside overflow-hidden text-ellipsis">
                                {entity.links.map((link) => (
                                    <li key={link.id} className="truncate">
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                                            {link.url}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {entity.tags.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {entity.tags.map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant="secondary"
                                        className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                                        onClick={() => handleTagClick(tag.name)}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EntityCard;