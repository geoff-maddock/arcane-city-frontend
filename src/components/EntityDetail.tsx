import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Entity } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, MapPin, Music, Star, Pencil, Power, Target, Trash2, MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { sanitizeHTML, sanitizeEmbed } from '../lib/sanitize';
import PhotoGallery from './PhotoGallery';
import EntityEvents from './EntityEvents';
import { TagBadges } from './TagBadges';
import PhotoDropzone from './PhotoDropzone';
import { authService } from '../services/auth.service';
import { EntityTypeIcon } from './EntityTypeIcon';
import { SocialLinks } from './SocialLinks';
import EntityLocations from './EntityLocations';
import EntityContacts from './EntityContacts';
import EntityLinks from './EntityLinks';
// SEO handled at route level
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

export default function EntityDetail({ entitySlug }: { entitySlug: string }) {
    const navigate = useNavigate();
    const [embeds, setEmbeds] = useState<string[]>([]);
    const [embedsLoading, setEmbedsLoading] = useState(false);
    const [embedsError, setEmbedsError] = useState<Error | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

    const { data: entity, isLoading, error, refetch } = useQuery<Entity>({
        queryKey: ['entity', entitySlug],
        queryFn: async () => {
            const { data } = await api.get<Entity>(`/entities/${entitySlug}`);
            return data;
        },
    });

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const [following, setFollowing] = useState(false);

    useEffect(() => {
        if (user) {
            setFollowing(user.followed_entities.some(e => e.slug === entitySlug));
        }
    }, [user, entitySlug]);

    const followMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/entities/${entitySlug}/follow`);
        },
        onSuccess: () => {
            setFollowing(true);
        },
    });

    const unfollowMutation = useMutation({
        mutationFn: async () => {
            await api.post(`/entities/${entitySlug}/unfollow`);
        },
        onSuccess: () => {
            setFollowing(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            await api.delete(`/entities/${entitySlug}`);
        },
        onSuccess: () => {
            // Navigate back to entities list after successful deletion
            navigate({ to: '/entities' });
        },
        onError: (error) => {
            console.error('Error deleting entity:', error);
            // You could add a toast notification here for better UX
        },
    });

    const handleFollowToggle = () => {
        if (following) {
            unfollowMutation.mutate();
        } else {
            followMutation.mutate();
        }
    };

    const handleDelete = () => {
        deleteMutation.mutate();
        setDeleteDialogOpen(false);
    };

    // Fetch event embeds after the entity detail is loaded
    useEffect(() => {
        if (entity?.slug) {
            const fetchEmbeds = async () => {
                setEmbedsLoading(true);
                try {
                    const response = await api.get<{ data: string[] }>(`/entities/${entity.slug}/embeds`);
                    console.log('Fetched embeds:', response.data.data, 'Length:', response.data.data.length);
                    setEmbeds(response.data.data);
                } catch (err) {
                    console.error('Error fetching embeds:', err);
                    setEmbedsError(err instanceof Error ? err : new Error('Failed to load embeds'));
                } finally {
                    setEmbedsLoading(false);
                }
            };
            fetchEmbeds();
        }
    }, [entity?.slug]);


    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !entity) {
        return (
            <div className="text-center text-red-500">
                Error loading entity. Please try again later.
            </div>
        );
    }

    // Replace newlines with <br /> tags in the description
    const formattedDescription = entity.description ? entity.description.replace(/\n/g, '<br />') : '';
    const placeHolderImage = `${window.location.origin}/entity-placeholder.png`;
    const canEdit = !!user && user.id === entity.created_by;

    return (
        <div className="min-h-screen">
            <div className="mx-auto px-6 py-8 max-w-[2400px]">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            asChild
                        >
                            <Link to="/entities">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Entities
                            </Link>
                        </Button>
                    </div>


                    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                        {/* Main Content */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-start justify-between">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{entity.name}</h1>
                                    {user && (
                                        <div className="flex items-center gap-2">
                                            <button onClick={handleFollowToggle} aria-label={following ? 'Unfollow' : 'Follow'}>
                                                <Star className={`h-5 w-5 ${following ? 'text-yellow-500' : 'text-gray-400'}`} fill={following ? 'currentColor' : 'none'} />
                                            </button>
                                            {user.id === entity.created_by && (
                                                <Popover open={actionsMenuOpen} onOpenChange={setActionsMenuOpen}>
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100"
                                                            title="More actions"
                                                            aria-label="More actions"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-48 p-2" align="end">
                                                        <div className="space-y-1">
                                                            <Link
                                                                to="/entity/$entitySlug/edit"
                                                                params={{ entitySlug: entity.slug }}
                                                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors w-full"
                                                                onClick={() => setActionsMenuOpen(false)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                Edit Entity
                                                            </Link>

                                                            <button
                                                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                                                                onClick={() => {
                                                                    setActionsMenuOpen(false);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Delete Entity
                                                            </button>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Delete Confirmation Dialog */}
                                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete Entity</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete "{entity.name}"? This action cannot be undone.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setDeleteDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDelete}
                                                disabled={deleteMutation.isPending}
                                            >
                                                {deleteMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Delete'
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                {entity.short && (
                                    <p className="text-xl text-gray-600">{entity.short}</p>
                                )}
                            </div>


                            <div className="aspect-video relative overflow-hidden rounded-lg">
                                <img
                                    src={entity.primary_photo || placeHolderImage}
                                    alt={entity.name}
                                    className="object-cover w-full h-full"
                                />
                            </div>


                            {entity.description && (
                                <Card>
                                    <CardContent className="prose max-w-none p-6">
                                        <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(formattedDescription) }} />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-3">
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

                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Power className="h-5 w-5" />
                                            <span>{entity.entity_status.name}</span>
                                        </div>
                                        {entity.roles.length > 0 && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Target className="h-5 w-5" />
                                                <span>{entity.roles.map((role) => role.name).join(', ')}</span>
                                            </div>
                                        )}

                                        <SocialLinks
                                            facebookUsername={entity.facebook_username}
                                            twitterUsername={entity.twitter_username}
                                            instagramUsername={entity.instagram_username}
                                        />

                                        {/* Deprecated inline links list is replaced by the EntityLinks card below */}
                                        {entity.tags.length > 0 && (
                                            <div className="space-y-2">
                                                <TagBadges tags={entity.tags} indexPath="/entities" />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <EntityLocations entityId={entity.id} entitySlug={entity.slug} canEdit={canEdit} />
                            <EntityContacts entityId={entity.id} entitySlug={entity.slug} canEdit={canEdit} />
                            <EntityLinks entityId={entity.id} entitySlug={entity.slug} canEdit={canEdit} />

                            <PhotoGallery
                                fetchUrl={`/entities/${entity.slug}/photos`}
                                onPrimaryUpdate={refetch}
                            />

                            {/* Photo Upload for logged in users */}
                            {user && (
                                <PhotoDropzone entityId={entity.id} />
                            )}

                            {/* Audio Embeds Section */}
                            {embeds.length > 0 && !embedsLoading && (
                                <Card>
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Music className="h-5 w-5" />
                                            <h2 className="text-xl font-semibold">Audio</h2>
                                        </div>
                                        <div className="space-y-4">
                                            {embeds.map((embed, index) => {
                                                const safe = sanitizeEmbed(embed);
                                                return (
                                                    <div key={index} className="rounded-md overflow-hidden">
                                                        <div
                                                            dangerouslySetInnerHTML={{ __html: safe }}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Loading state for embeds */}
                            {embedsLoading && (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    <span className="ml-2 text-gray-600">Loading audio...</span>
                                </div>
                            )}

                            {/* Error state for embeds */}
                            {embedsError && !embedsLoading && (
                                <div className="text-red-500 text-sm">
                                    Error loading audio content. Please try again later.
                                </div>
                            )}
                        </div>
                    </div>
                    <EntityEvents entityName={entity.name} />
                </div>
            </div>
        </div>
    );
}
