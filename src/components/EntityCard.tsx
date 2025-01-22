import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import MapPin from '@/components/icons/MapPin';
import Users from '@/components/icons/Users';
import { Badge } from '@/components/ui/badge';
import { useContext } from 'react';
import { EntityFilterContext } from '../context/EntityFilterContext';

interface EntityType {
    id: number;
    name: string;
}

interface EntityStatus {
    id: number;
    name: string;
}

interface Link {
    id: number;
    url: string;
}

interface Tag {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
}

interface EntityCardProps {
    entity: {
        id: number;
        slug: string;
        name: string;
        short?: string;
        description?: string;
        entity_type: EntityType;
        entity_status: EntityStatus;
        facebook_username?: string;
        twitter_username?: string;
        links: Link[];
        tags: Tag[];
        roles: Role[];
        primary_photo?: string;
        primary_photo_thumbnail?: string;
    };
    allImages: Array<{ src: string; alt: string }>;
    imageIndex: number;
}

const EntityCard: React.FC<EntityCardProps> = ({ entity }) => {
    const { setFilters } = useContext(EntityFilterContext);
    const navigate = useNavigate();

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
        <Card>
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
                    <div className="aspect-video relative overflow-hidden rounded-lg">
                        <img
                            src={entity.primary_photo || placeHolderImage}
                            alt={entity.name}
                            className="object-cover w-full h-full"
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
                        <p className="text-gray-600">{entity.description}</p>
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