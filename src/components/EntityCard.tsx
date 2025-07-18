import { useNavigate } from '@tanstack/react-router';
import { Entity } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '../lib/api';
import MapPin from '@/components/icons/MapPin';
import Users from '@/components/icons/Users';
import { TagBadges } from './TagBadges';
import { ImageLightbox } from './ImageLightbox';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';

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
                            <TagBadges tags={entity.tags} indexPath="/entities" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EntityCard;

