import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Contact } from '../types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { User, Pencil, Trash2, Loader2, Mail, Phone, Plus } from 'lucide-react';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

interface EntityContactsProps {
    entityId: number;
    entitySlug: string;
    canEdit: boolean;
}

export default function EntityContacts({ entityId, entitySlug, canEdit }: EntityContactsProps) {
    // Shared field classes to match Create Entity form contrast (light/dark)
    const fieldClasses = "bg-white border-slate-300 text-slate-900 placeholder-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400";
    const { data, isLoading, error, refetch } = useQuery<Contact[]>({
        queryKey: ['entity', entitySlug, 'contacts'],
        queryFn: async () => {
            try {
                const response = await api.get<Contact[]>(`/entities/${entitySlug}/contacts`);
                return response.data || [];
            } catch (error) {
                console.error('Error fetching entity contacts:', error);
                return [];
            }
        },
    });

    const [editing, setEditing] = useState<Contact | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleting, setDeleting] = useState<Contact | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState<Partial<Contact>>({
        name: '',
        email: '',
        phone: '',
        other: '',
        type: 'general',
        visibility_id: 1
    });

    const saveMutation = useMutation({
        mutationFn: async (contact: Contact) => {
            await api.put(`/entities/${entityId}/contacts/${contact.id}`, contact);
        },
        onSuccess: () => {
            refetch();
            setIsEditOpen(false);
        },
        onError: (error: ApiError) => {
            console.error('Error updating contact:', error);
            // Show user-friendly error message
            if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Failed to update contact. Please try again.');
            }
        },
    });

    const createMutation = useMutation({
        mutationFn: async (contact: Partial<Contact>) => {
            await api.post(`/entities/${entityId}/contacts`, contact);
        },
        onSuccess: () => {
            refetch();
            setIsCreateOpen(false);
            // Reset the creating state
            setCreating({
                name: '',
                email: '',
                phone: '',
                other: '',
                type: 'general',
                visibility_id: 1
            });
        },
        onError: (error: ApiError) => {
            console.error('Error creating contact:', error);
            // Show user-friendly error message
            if (error.response?.data?.message) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert('Failed to create contact. Please try again.');
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/entities/${entityId}/contacts/${id}`);
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
            if (!editing.type.trim()) {
                alert('Type is required');
                return;
            }
            if (editing.email && editing.email.trim()) {
                // Simple email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(editing.email.trim())) {
                    alert('Please enter a valid email address');
                    return;
                }
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
        if (!creating.type?.trim()) {
            alert('Type is required');
            return;
        }
        if (creating.email && creating.email.trim()) {
            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(creating.email.trim())) {
                alert('Please enter a valid email address');
                return;
            }
        }

        createMutation.mutate(creating);
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Contacts</h2>
                    </div>
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600">Loading contacts...</span>
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
                        <User className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Contacts</h2>
                    </div>
                    <div className="text-red-500 text-sm">
                        Error loading contacts. Please try again later.
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return canEdit ? (
            <>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Contact</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="create-contact-name">Name</Label>
                                <Input
                                    id="create-contact-name"
                                    value={creating.name}
                                    onChange={(e) => setCreating({ ...creating, name: e.target.value })}
                                    className={fieldClasses}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-contact-type">Type</Label>
                                <Select
                                    value={creating.type}
                                    onValueChange={(value) => setCreating({ ...creating, type: value })}
                                >
                                    <SelectTrigger className="bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400">
                                        <SelectValue placeholder="Select contact type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="booking">Booking</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                        <SelectItem value="promoter">Promoter</SelectItem>
                                        <SelectItem value="technical">Technical</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-contact-email">Email</Label>
                                <Input
                                    id="create-contact-email"
                                    type="email"
                                    value={creating.email ?? ''}
                                    onChange={(e) => setCreating({ ...creating, email: e.target.value })}
                                    className={fieldClasses}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-contact-phone">Phone</Label>
                                <Input
                                    id="create-contact-phone"
                                    value={creating.phone ?? ''}
                                    onChange={(e) => setCreating({ ...creating, phone: e.target.value })}
                                    className={fieldClasses}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="create-contact-other">Other Info</Label>
                                <Input
                                    id="create-contact-other"
                                    value={creating.other ?? ''}
                                    onChange={(e) => setCreating({ ...creating, other: e.target.value })}
                                    className={fieldClasses}
                                />
                            </div>
                            <DialogFooter>
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

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <h2 className="text-xl font-semibold">Contacts</h2>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setIsCreateOpen(true)}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Add Contact
                            </Button>
                        </div>
                        <div className="text-gray-500 text-sm">
                            No contacts found for this entity.
                        </div>
                    </CardContent>
                </Card>
            </>
        ) : null;
    }

    return (
        <>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Contact</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="create-contact-name">Name</Label>
                            <Input
                                id="create-contact-name"
                                value={creating.name}
                                onChange={(e) => setCreating({ ...creating, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-contact-type">Type</Label>
                            <Select
                                value={creating.type}
                                onValueChange={(value) => setCreating({ ...creating, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select contact type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="booking">Booking</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="promoter">Promoter</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-contact-email">Email</Label>
                            <Input
                                id="create-contact-email"
                                type="email"
                                value={creating.email ?? ''}
                                onChange={(e) => setCreating({ ...creating, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-contact-phone">Phone</Label>
                            <Input
                                id="create-contact-phone"
                                value={creating.phone ?? ''}
                                onChange={(e) => setCreating({ ...creating, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-contact-other">Other Info</Label>
                            <Input
                                id="create-contact-other"
                                value={creating.other ?? ''}
                                onChange={(e) => setCreating({ ...creating, other: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
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

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">Contacts</h2>
                        </div>
                        {canEdit && (
                            <Button
                                size="sm"
                                onClick={() => setIsCreateOpen(true)}
                                className="flex items-center gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Add Contact
                            </Button>
                        )}
                    </div>
                    <ul className="space-y-3">
                        {data.map((c) => (
                            <li key={c.id} className="flex justify-between gap-2 text-sm">
                                <div className="flex-1">
                                    <div className="font-medium">{c.name}</div>
                                    {c.type && (
                                        <div className="text-xs text-gray-500 capitalize mb-1">
                                            {c.type}
                                        </div>
                                    )}
                                    {c.email && (
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            <span>{c.email}</span>
                                        </div>
                                    )}
                                    {c.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{c.phone}</span>
                                        </div>
                                    )}
                                    {c.other && (
                                        <div className="text-xs text-gray-600 mt-1">
                                            {c.other}
                                        </div>
                                    )}
                                </div>
                                {canEdit && (
                                    <div className="flex gap-2">
                                        <button
                                            className="text-gray-600 hover:text-gray-900"
                                            onClick={() => {
                                                // Ensure type has a default value if empty
                                                const contactToEdit = {
                                                    ...c,
                                                    type: c.type || 'general'
                                                };
                                                setEditing(contactToEdit);
                                                setIsEditOpen(true);
                                            }}
                                            aria-label="Edit contact"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-800"
                                            onClick={() => {
                                                setDeleting(c);
                                                setIsDeleteOpen(true);
                                            }}
                                            aria-label="Delete contact"
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
                        <DialogTitle>Edit Contact</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="contact-name">Name</Label>
                                <Input
                                    id="contact-name"
                                    value={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-type">Type</Label>
                                <Select
                                    value={editing.type}
                                    onValueChange={(value) => setEditing({ ...editing, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select contact type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="booking">Booking</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                        <SelectItem value="promoter">Promoter</SelectItem>
                                        <SelectItem value="technical">Technical</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-email">Email</Label>
                                <Input
                                    id="contact-email"
                                    type="email"
                                    value={editing.email ?? ''}
                                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-phone">Phone</Label>
                                <Input
                                    id="contact-phone"
                                    value={editing.phone ?? ''}
                                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-other">Other Info</Label>
                                <Input
                                    id="contact-other"
                                    value={editing.other ?? ''}
                                    onChange={(e) => setEditing({ ...editing, other: e.target.value })}
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
                        <DialogTitle>Delete Contact</DialogTitle>
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

