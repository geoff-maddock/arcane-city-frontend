import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import MapPin from '@/components/icons/MapPin';
import Users from '@/components/icons/Users';

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
    const PlaceholderImage = () => (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="object-cover w-full h-full"
        >
            <rect width="400" height="200" fill="#E5E7EB" />
            <path
                d="M200 100C220.091 100 236 84.0914 236 64C236 43.9086 220.091 28 200 28C179.909 28 164 43.9086 164 64C164 84.0914 179.909 100 200 100Z"
                stroke="#9CA3AF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M340 180V160C340 142.326 325.674 128 308 128H92C74.3261 128 60 142.326 60 160V180"
                stroke="#9CA3AF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate({
            to: '/entities/$entitySlug',
            params: { entitySlug: entity.slug }
        });
    };

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
                        {entity.primary_photo ? (
                            <img
                                src={entity.primary_photo}
                                alt={entity.name}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <PlaceholderImage />
                        )}
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
                                    <span key={tag.id} className="px-2 py-1 bg-gray-200 rounded">
                                        {tag.name}
                                    </span>
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