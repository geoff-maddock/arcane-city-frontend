import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Event, UserMinimalResponse } from '@/types/api';

// Minimal shape for current user (could also import a fuller type if available)
interface CurrentUser { id: number }

export function useAttend(slug: string | undefined) {
    const queryClient = useQueryClient();
    const [attending, setAttending] = useState(false);

    // Derive initial attending state from any cached event detail query
    useEffect(() => {
        if (!slug) return;
        const cached = queryClient.getQueryData<Event>(['event', slug]);
        const currentUser = queryClient.getQueryData<CurrentUser>(['currentUser']);
        if (cached && currentUser) {
            setAttending(!!cached.attendees?.some(u => u.id === currentUser.id));
        }
    }, [slug, queryClient]);

    const updateCachedEvent = (slug: string, add: boolean, userId: number | undefined) => {
        if (!userId) return;
        queryClient.setQueryData<Event | undefined>(['event', slug], (prev) => {
            if (!prev) return prev;
            const already = prev.attendees?.some(u => u.id === userId);
            if (add && already) return prev;
            if (!add && !already) return prev;
            return {
                ...prev,
                attendees: add
                    ? [...(prev.attendees || []), { id: userId, name: 'You', username: 'you', slug: 'you' } as UserMinimalResponse]
                    : (prev.attendees || []).filter(u => u.id !== userId),
                attending: add ? (prev.attending ?? 0) + 1 : Math.max(0, (prev.attending ?? 1) - 1)
            };
        });
    };

    const invalidateLists = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['userAttendingEvents'] });
    };

    const attendMutation = useMutation({
        mutationFn: async () => {
            if (!slug) return;
            await api.post(`/events/${slug}/attend`);
        },
        onMutate: () => {
            const currentUser = queryClient.getQueryData<CurrentUser>(['currentUser']);
            if (!slug || !currentUser) return;
            setAttending(true);
            updateCachedEvent(slug, true, currentUser.id);
        },
        onSuccess: () => {
            invalidateLists();
        },
        onError: () => {
            const currentUser = queryClient.getQueryData<CurrentUser>(['currentUser']);
            if (!slug || !currentUser) return;
            setAttending(false);
            updateCachedEvent(slug, false, currentUser.id);
        }
    });

    const unattendMutation = useMutation({
        mutationFn: async () => {
            if (!slug) return;
            await api.delete(`/events/${slug}/attend`);
        },
        onMutate: () => {
            const currentUser = queryClient.getQueryData<CurrentUser>(['currentUser']);
            if (!slug || !currentUser) return;
            setAttending(false);
            updateCachedEvent(slug, false, currentUser.id);
        },
        onSuccess: () => {
            invalidateLists();
        },
        onError: () => {
            const currentUser = queryClient.getQueryData<CurrentUser>(['currentUser']);
            if (!slug || !currentUser) return;
            setAttending(true);
            updateCachedEvent(slug, true, currentUser.id);
        }
    });

    const toggle = () => {
        if (!slug) return;
        if (attending) {
            unattendMutation.mutate();
        } else {
            attendMutation.mutate();
        }
    };

    const isPending = attendMutation.isPending || unattendMutation.isPending;

    return { attending, toggle, isPending };
}
