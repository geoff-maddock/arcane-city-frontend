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
import { MapPin, Pencil, Trash2, Loader2 } from 'lucide-react';

interface EntityLocationsProps {
    entityId: number;
    entitySlug: string;
    canEdit: boolean;
}

export default function EntityLocations({ entityId, entitySlug, canEdit }: EntityLocationsProps) {
    const { data, isLoading, error, refetch } = useQuery<Location[]>({
        queryKey: ['entity', entitySlug, 'locations'],
        queryFn: async () => {
            const { data } = await api.get<{ data: Location[] }>(`/entities/${entitySlug}/locations`);
            return data.data;
        },
    });

    const [editing, setEditing] = useState<Location | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleting, setDeleting] = useState<Location | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const saveMutation = useMutation({
        mutationFn: async (loc: Location) => {
            await api.put(`/entities/${entityId}/locations/${loc.id}`, loc);
        },
        onSuccess: () => {
            refetch();
            setIsEditOpen(false);
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
            saveMutation.mutate(editing);
        }
    };

    if (isLoading || error || !data || data.length === 0) {
        return null;
    }

    return (
        <>
            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Locations</h2>
                    </div>
                    <ul className="space-y-3">
                        {data.map((loc) => (
                            <li key={loc.id} className="flex justify-between gap-2 text-sm">
                                <div className="flex-1">
                                    <div className="font-medium">{loc.name}</div>
                                    {loc.address_line_one && <div>{loc.address_line_one}</div>}
                                    <div>
                                        {loc.city}
                                        {loc.state && `, ${loc.state}`}
                                    </div>
                                </div>
                                {canEdit && (
                                    <div className="flex gap-2">
                                        <button
                                            className="text-gray-600 hover:text-gray-900"
                                            onClick={() => {
                                                setEditing(loc);
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Location</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="location-name">Name</Label>
                                <Input
                                    id="location-name"
                                    value={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location-address-one">Address</Label>
                                <Input
                                    id="location-address-one"
                                    value={editing.address_line_one ?? ''}
                                    onChange={(e) =>
                                        setEditing({ ...editing, address_line_one: e.target.value })
                                    }
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
                                    value={editing.postal_code ?? ''}
                                    onChange={(e) => setEditing({ ...editing, postal_code: e.target.value })}
                                />
                            </div>
                            <DialogFooter>
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
        </>
    );
}

