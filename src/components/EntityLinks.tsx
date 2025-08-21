import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { authService } from '../services/auth.service';
import { Link as EntityLink } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Link2 as LinkIcon, Pencil, Plus, Loader2, ExternalLink, Trash2 } from 'lucide-react';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

interface EntityLinksProps {
    entityId: number;
    entitySlug: string;
    canEdit: boolean;
}

export default function EntityLinks({ entityId, entitySlug, canEdit }: EntityLinksProps) {
    const { data, isLoading, error, refetch } = useQuery<EntityLink[]>({
        queryKey: ['entity', entitySlug, 'links'],
        queryFn: async () => {
            try {
                const response = await api.get<EntityLink[]>(`/entities/${entitySlug}/links`);
                return response.data || [];
            } catch (error) {
                console.error('Error fetching entity links:', error);
                return [];
            }
        },
    });

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const [editing, setEditing] = useState<EntityLink | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState<Partial<EntityLink>>({
        title: '',
        text: '',
        url: '',
        is_primary: false,
    });

    const updateMutation = useMutation({
        mutationFn: async (link: EntityLink) => {
            await api.put(`/entities/${entityId}/links/${link.id}`, link);
        },
        onSuccess: () => {
            refetch();
            setIsEditOpen(false);
        },
        onError: (error: ApiError) => {
            console.error('Error updating link:', error);
            if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Failed to update link. Please try again.');
            }
        },
    });

    const createMutation = useMutation({
        mutationFn: async (link: Partial<EntityLink>) => {
            await api.post(`/entities/${entityId}/links`, link);
        },
        onSuccess: () => {
            refetch();
            setIsCreateOpen(false);
            setCreating({ title: '', text: '', url: '', is_primary: false });
        },
        onError: (error: ApiError) => {
            console.error('Error creating link:', error);
            if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Failed to create link. Please try again.');
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (linkId: number) => {
            await api.delete(`/entities/${entityId}/links/${linkId}`);
        },
        onSuccess: () => {
            refetch();
        },
        onError: (error: ApiError) => {
            console.error('Error deleting link:', error);
            if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Failed to delete link. Please try again.');
            }
        },
    });

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        if (!editing.url?.trim()) {
            alert('URL is required');
            return;
        }
        updateMutation.mutate(editing);
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!creating.url?.trim()) {
            alert('URL is required');
            return;
        }
        createMutation.mutate(creating);
    };

    const handleDelete = (linkId: number) => {
        if (window.confirm('Are you sure you want to delete this link?')) {
            deleteMutation.mutate(linkId);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Links</h2>
                    </div>
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600">Loading links...</span>
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
                        <LinkIcon className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Links</h2>
                    </div>
                    <div className="text-red-500 text-sm">Error loading links. Please try again later.</div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return canEdit ? (
            <>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5" />
                                <h2 className="text-xl font-semibold">Links</h2>
                            </div>
                            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="flex items-center gap-1">
                                <Plus className="h-4 w-4" />
                                Add Link
                            </Button>
                        </div>
                        <div className="text-gray-500 text-sm">No links found for this entity.</div>
                    </CardContent>
                </Card>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Link</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="create-link-title">Title</Label>
                                <Input
                                    id="create-link-title"
                                    value={creating.title ?? ''}
                                    onChange={(e) => setCreating({ ...creating, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-link-url">URL</Label>
                                <Input
                                    id="create-link-url"
                                    value={creating.url ?? ''}
                                    onChange={(e) => setCreating({ ...creating, url: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-link-text">Text</Label>
                                <Textarea
                                    id="create-link-text"
                                    value={creating.text ?? ''}
                                    onChange={(e) => setCreating({ ...creating, text: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="create-link-primary"
                                    checked={!!creating.is_primary}
                                    onCheckedChange={(checked) => setCreating({ ...creating, is_primary: checked })}
                                />
                                <Label htmlFor="create-link-primary">Primary link</Label>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
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
        ) : null;
    }

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Links</h2>
                    </div>
                    {canEdit && (
                        <Button size="sm" onClick={() => setIsCreateOpen(true)} className="flex items-center gap-1">
                            <Plus className="h-4 w-4" />
                            Add Link
                        </Button>
                    )}
                </div>

                <ul className="space-y-3">
                    {data.map((link) => (
                        <li key={link.id} className="flex justify-between gap-2 text-sm">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        title={link.title || link.text}
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 break-all inline-flex items-center gap-1"
                                    >
                                        {link.text || link.url}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                    {link.is_primary && (
                                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                                            Primary
                                        </span>
                                    )}
                                </div>
                            </div>
                            {(canEdit || (user && link.created_by === user.id)) && (
                                <div className="flex gap-2">
                                    {canEdit && (
                                        <button
                                            className="text-gray-600 hover:text-gray-900"
                                            onClick={() => {
                                                setEditing(link);
                                                setIsEditOpen(true);
                                            }}
                                            aria-label="Edit link"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    )}
                                    {user && link.created_by === user.id && (
                                        <button
                                            className="text-red-600 hover:text-red-900"
                                            onClick={() => handleDelete(link.id)}
                                            aria-label="Delete link"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Link</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="create-link-title">Title</Label>
                                <Input
                                    id="create-link-title"
                                    value={creating.title ?? ''}
                                    onChange={(e) => setCreating({ ...creating, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-link-url">URL</Label>
                                <Input
                                    id="create-link-url"
                                    value={creating.url ?? ''}
                                    onChange={(e) => setCreating({ ...creating, url: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-link-text">Text</Label>
                                <Textarea
                                    id="create-link-text"
                                    value={creating.text ?? ''}
                                    onChange={(e) => setCreating({ ...creating, text: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="create-link-primary"
                                    checked={!!creating.is_primary}
                                    onCheckedChange={(checked) => setCreating({ ...creating, is_primary: checked })}
                                />
                                <Label htmlFor="create-link-primary">Primary link</Label>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                                        </>
                                    ) : (
                                        'Create'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Link</DialogTitle>
                        </DialogHeader>
                        {editing && (
                            <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-link-title">Title</Label>
                                    <Input
                                        id="edit-link-title"
                                        value={editing.title ?? ''}
                                        onChange={(e) => setEditing({ ...editing!, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-link-url">URL</Label>
                                    <Input
                                        id="edit-link-url"
                                        value={editing.url ?? ''}
                                        onChange={(e) => setEditing({ ...editing!, url: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-link-text">Text</Label>
                                    <Textarea
                                        id="edit-link-text"
                                        value={editing.text ?? ''}
                                        onChange={(e) => setEditing({ ...editing!, text: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="edit-link-primary"
                                        checked={!!editing.is_primary}
                                        onCheckedChange={(checked) => setEditing({ ...editing!, is_primary: checked })}
                                    />
                                    <Label htmlFor="edit-link-primary">Primary link</Label>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updateMutation.isPending}>
                                        {updateMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
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
            </CardContent>
        </Card>
    );
}
