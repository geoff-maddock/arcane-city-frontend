import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Location } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Pencil, Trash2, Loader2, Plus } from 'lucide-react';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

interface EntityLocationsProps {
    entityId: number;
    entitySlug: string;
    canEdit: boolean;
}

export default function EntityLocations({ entityId, entitySlug, canEdit }: EntityLocationsProps) {
    const { data, isLoading, error, refetch } = useQuery<Location[]>({
        queryKey: ['entity', entitySlug, 'locations'],
        queryFn: async () => {
            try {
                const response = await api.get<Location[]>(`/entities/${entitySlug}/locations`);
                return response.data || [];
            } catch (error) {
                console.error('Error fetching entity locations:', error);
                return [];
            }
        },
    });

    const [editing, setEditing] = useState<Location | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleting, setDeleting] = useState<Location | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState<Partial<Location>>({
        name: '',
        slug: '',
        address_one: '',
        address_two: '',
        neighborhood: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        map_url: '',
        latitude: 0,
        longitude: 0,
        visibility_id: 1,
        location_type_id: 1
    });

    const saveMutation = useMutation({
        mutationFn: async (loc: Location) => {
            await api.put(`/entities/${entityId}/locations/${loc.id}`, loc);
        },
        onSuccess: () => {
            refetch();
            setIsEditOpen(false);
        },
        onError: (error: ApiError) => {
            console.error('Error updating location:', error);
            // Show user-friendly error message
            if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Failed to update location. Please try again.');
            }
        },
    });

    const createMutation = useMutation({
        mutationFn: async (loc: Partial<Location>) => {
            await api.post(`/entities/${entityId}/locations`, loc);
        },
        onSuccess: () => {
            refetch();
            setIsCreateOpen(false);
            // Reset the creating state
            setCreating({
                name: '',
                slug: '',
                address_one: '',
                address_two: '',
                neighborhood: '',
                city: '',
                state: '',
                postcode: '',
                country: '',
                map_url: '',
                latitude: 0,
                longitude: 0,
                visibility_id: 1,
                location_type_id: 1
            });
        },
        onError: (error: ApiError) => {
            console.error('Error creating location:', error);
            // Show user-friendly error message
            if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Failed to create location. Please try again.');
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/entities/${entityId}/locations/${id}`);
        },
        onSuccess: () => {
            refetch();
            setIsDeleteOpen(false);
        },
    });

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            // Basic validation
            if (!editing.name.trim()) {
                alert('Name is required');
                return;
            }
            if (!editing.slug.trim()) {
                alert('Slug is required');
                return;
            }

            saveMutation.mutate(editing);
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!creating.name?.trim()) {
            alert('Name is required');
            return;
        }
        if (!creating.slug?.trim()) {
            alert('Slug is required');
            return;
        }

        createMutation.mutate(creating);
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Locations</h2>
                    </div>
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600">Loading locations...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Locations</h2>
                    </div>
                    <div className="text-red-500 text-sm">
                        Error loading locations. Please try again later.
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return canEdit ? (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">Locations</h2>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            Add Location
                        </Button>
                    </div>
                    <div className="text-gray-500 text-sm">
                        No locations found for this entity.
                    </div>
                </CardContent>
            </Card>
        ) : null;
    }

    return (
        <>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">Locations</h2>
                        </div>
                        {canEdit && (
                            <Button
                                size="sm"
                                onClick={() => setIsCreateOpen(true)}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Add Location
                            </Button>
                        )}
                    </div>
                    <ul className="space-y-3">
                        {data.map((loc) => (
                            <li key={loc.id} className="flex justify-between gap-2 text-sm">
                                <div className="flex-1">
                                    <div className="font-medium">{loc.name}</div>
                                    {loc.address_one && <div>{loc.address_one}</div>}
                                    {loc.address_two && <div>{loc.address_two}</div>}
                                    {loc.neighborhood && (
                                        <div className="text-xs text-gray-600">{loc.neighborhood}</div>
                                    )}
                                    <div>
                                        {loc.city}
                                        {loc.state && `, ${loc.state}`}
                                        {loc.postcode && ` ${loc.postcode}`}
                                    </div>
                                    {loc.country && loc.country !== loc.city && (
                                        <div className="text-xs text-gray-600">{loc.country}</div>
                                    )}
                                </div>
                                {canEdit && (
                                    <div className="flex gap-2">
                                        <button
                                            className="text-gray-600 hover:text-gray-900"
                                            onClick={() => {
                                                // Ensure all fields have default values
                                                const locationToEdit = {
                                                    ...loc,
                                                    latitude: loc.latitude ?? 0,
                                                    longitude: loc.longitude ?? 0,
                                                    visibility_id: loc.visibility_id ?? 1,
                                                    location_type_id: loc.location_type_id ?? 1
                                                };
                                                setEditing(locationToEdit);
                                                setIsEditOpen(true);
                                            }}
                                            aria-label="Edit location"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-800"
                                            onClick={() => {
                                                setDeleting(loc);
                                                setIsDeleteOpen(true);
                                            }}
                                            aria-label="Delete location"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Location</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="space-y-4 mt-2 overflow-y-auto flex-1 pr-2">
                                <div className="space-y-2">
                                    <Label htmlFor="location-name">Name</Label>
                                    <Input
                                        id="location-name"
                                        value={editing.name}
                                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location-slug">Slug</Label>
                                    <Input
                                        id="location-slug"
                                        value={editing.slug}
                                        onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location-address-one">Address Line 1</Label>
                                    <Input
                                        id="location-address-one"
                                        value={editing.address_one ?? ''}
                                        onChange={(e) =>
                                            setEditing({ ...editing, address_one: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location-address-two">Address Line 2</Label>
                                    <Input
                                        id="location-address-two"
                                        value={editing.address_two ?? ''}
                                        onChange={(e) =>
                                            setEditing({ ...editing, address_two: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location-neighborhood">Neighborhood</Label>
                                    <Input
                                        id="location-neighborhood"
                                        value={editing.neighborhood ?? ''}
                                        onChange={(e) => setEditing({ ...editing, neighborhood: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location-city">City</Label>
                                    <Input
                                        id="location-city"
                                        value={editing.city ?? ''}
                                        onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location-state">State</Label>
                                    <Input
                                        id="location-state"
                                        value={editing.state ?? ''}
                                        onChange={(e) => setEditing({ ...editing, state: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location-postal">Postal Code</Label>
                                    <Input
                                        id="location-postal"
                                        value={editing.postcode ?? ''}
                                        onChange={(e) => setEditing({ ...editing, postcode: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location-country">Country</Label>
                                    <Input
                                        id="location-country"
                                        value={editing.country ?? ''}
                                        onChange={(e) => setEditing({ ...editing, country: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location-map-url">Map URL</Label>
                                    <Input
                                        id="location-map-url"
                                        value={editing.map_url ?? ''}
                                        onChange={(e) => setEditing({ ...editing, map_url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saveMutation.isPending}>
                                    {saveMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Location</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleting?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleting && deleteMutation.mutate(deleting.id)}
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

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Create New Location</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-hidden">
                        <div className="space-y-4 mt-2 overflow-y-auto flex-1 pr-2">
                            <div className="space-y-2">
                                <Label htmlFor="create-location-name">Name</Label>
                                <Input
                                    id="create-location-name"
                                    value={creating.name}
                                    onChange={(e) => setCreating({ ...creating, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-location-slug">Slug</Label>
                                <Input
                                    id="create-location-slug"
                                    value={creating.slug}
                                    onChange={(e) => setCreating({ ...creating, slug: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-location-address-one">Address Line 1</Label>
                                <Input
                                    id="create-location-address-one"
                                    value={creating.address_one ?? ''}
                                    onChange={(e) =>
                                        setCreating({ ...creating, address_one: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-location-address-two">Address Line 2</Label>
                                <Input
                                    id="create-location-address-two"
                                    value={creating.address_two ?? ''}
                                    onChange={(e) =>
                                        setCreating({ ...creating, address_two: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-location-neighborhood">Neighborhood</Label>
                                <Input
                                    id="create-location-neighborhood"
                                    value={creating.neighborhood ?? ''}
                                    onChange={(e) => setCreating({ ...creating, neighborhood: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-location-city">City</Label>
                                <Input
                                    id="create-location-city"
                                    value={creating.city ?? ''}
                                    onChange={(e) => setCreating({ ...creating, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-location-state">State</Label>
                                <Input
                                    id="create-location-state"
                                    value={creating.state ?? ''}
                                    onChange={(e) => setCreating({ ...creating, state: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-location-postal">Postal Code</Label>
                                <Input
                                    id="create-location-postal"
                                    value={creating.postcode ?? ''}
                                    onChange={(e) => setCreating({ ...creating, postcode: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-location-country">Country</Label>
                                <Input
                                    id="create-location-country"
                                    value={creating.country ?? ''}
                                    onChange={(e) => setCreating({ ...creating, country: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-location-map-url">Map URL</Label>
                                <Input
                                    id="create-location-map-url"
                                    value={creating.map_url ?? ''}
                                    onChange={(e) => setCreating({ ...creating, map_url: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

