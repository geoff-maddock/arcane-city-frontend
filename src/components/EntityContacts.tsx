import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Contact } from '../types/api';
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
import { User, Pencil, Trash2, Loader2, Mail, Phone } from 'lucide-react';

interface EntityContactsProps {
    entitySlug: string;
    canEdit: boolean;
}

export default function EntityContacts({ entitySlug, canEdit }: EntityContactsProps) {
    const { data, isLoading, error, refetch } = useQuery<Contact[]>({
        queryKey: ['entity', entitySlug, 'contacts'],
        queryFn: async () => {
            const { data } = await api.get<{ data: Contact[] }>(`/entities/${entitySlug}/contacts`);
            return data.data;
        },
    });

    const [editing, setEditing] = useState<Contact | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [deleting, setDeleting] = useState<Contact | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const saveMutation = useMutation({
        mutationFn: async (contact: Contact) => {
            await api.put(`/entity-contacts/${contact.id}`, contact);
        },
        onSuccess: () => {
            refetch();
            setIsEditOpen(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/entity-contacts/${id}`);
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
                        <User className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Contacts</h2>
                    </div>
                    <ul className="space-y-3">
                        {data.map((c) => (
                            <li key={c.id} className="flex justify-between gap-2 text-sm">
                                <div className="flex-1">
                                    <div className="font-medium">{c.name}</div>
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
                                </div>
                                {canEdit && (
                                    <div className="flex gap-2">
                                        <button
                                            className="text-gray-600 hover:text-gray-900"
                                            onClick={() => {
                                                setEditing(c);
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
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-email">Email</Label>
                                <Input
                                    id="contact-email"
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

