import { useNavigate } from '@tanstack/react-router';
import { Entity } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '../lib/api';
import { MapPin, Star, Target } from 'lucide-react';
import { TagBadges } from './TagBadges';
import { ImageLightbox } from './ImageLightbox';
import { EntityTypeIcon } from './EntityTypeIcon';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useState, useEffect } from 'react';


interface EntityCardProps {
    entity: Entity;
    allImages: Array<{ src: string; alt: string }>;
    imageIndex: number;
}

const EntityCard = ({ entity, allImages, imageIndex }: EntityCardProps) => {
    const navigate = useNavigate();
    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const [following, setFollowing] = useState(false);

    useEffect(() => {
        if (user) {
            setFollowing(user.followed_entities.some(e => e.slug === entity.slug));
        }
    }, [user, entity.slug]);

    const followMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/entities/${entity.slug}/follow`);
        },
        onSuccess: () => {
            setFollowing(true);
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/entities/${entity.slug}/unfollow`);
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

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log('Navigating to entity from entity card handle click:', entity.slug);
        navigate({
            to: '/entities/$entitySlug',
            params: { entitySlug: entity.slug }
        });
    };

    const placeHolderImage = `${window.location.origin}/entity-placeholder.png`;

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                    <div className="thumbnail">
                        <ImageLightbox
                            thumbnailUrl={entity.primary_photo || placeHolderImage}
                            alt={entity.name}
                            allImages={allImages}
                            initialIndex={imageIndex}
                        />
                    </div>

                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold">
                            <a
                                href={`/entities/${entity.slug}`}
                                onClick={handleClick}
                                className="hover:text-primary transition-colors"
                            >
                                {entity.name}
                            </a>
                        </h2>
                        {user && (
                            <button onClick={handleFollowToggle} aria-label={following ? 'Unfollow' : 'Follow'}>
                                <Star className={`h-5 w-5 ${following ? 'text-yellow-500' : 'text-gray-400'}`} fill={following ? 'currentColor' : 'none'} />
                            </button>
                        )}
                    </div>
                    {entity.short && <p className="text-gray-600">{entity.short}</p>}

                    <div className="flex items-center gap-2 text-gray-600">
                        <EntityTypeIcon entityTypeName={entity.entity_type.name} />
                        <span className="font-medium">{entity.entity_type.name}</span>
                    </div>

                    {entity.primary_location && (
                        <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <div className="break-words">
                                    {entity.primary_location.address_one && (
                                        <div className="text-sm">
                                            {entity.primary_location.address_one}
                                        </div>
                                    )}
                                    <div className="text-sm">
                                        {entity.primary_location.city}
                                        {entity.primary_location.state && (
                                            <span>, {entity.primary_location.state}</span>
                                        )}
                                    </div>
                                </div>
                                {entity.primary_location.map_url && (
                                    <a
                                        href={entity.primary_location.map_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm mt-1"
                                        title="View on Map"
                                    >
                                        <span>View on Map</span>
                                        <MapPin className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {entity.roles.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Target className="h-5 w-5" />
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
                            <TagBadges tags={entity.tags} indexPath="/entities" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EntityCard;

