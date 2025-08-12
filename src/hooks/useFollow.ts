import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { authService } from '@/services/auth.service';
import type { User } from '@/types/auth';

// Generic follow hook for tags & series
export function useFollow(resource: 'tags' | 'series', slug: string) {
    const qc = useQueryClient();
    const [following, setFollowing] = useState(false);

    useEffect(() => {
        // Try to read current user from cache first
        const user = qc.getQueryData<User>(['currentUser']);
        if (user) {
            const list = resource === 'tags' ? user.followed_tags : user.followed_series;
            setFollowing(list.some(r => r.slug === slug));
        }
    }, [qc, resource, slug]);

    const follow = useMutation({
        mutationFn: () => api.post(`/${resource}/${slug}/follow`),
        onSuccess: async () => {
            setFollowing(true);
            // Refresh current user
            if (authService.isAuthenticated()) {
                await qc.invalidateQueries({ queryKey: ['currentUser'] });
            }
        }
    });

    const unfollow = useMutation({
        mutationFn: () => api.post(`/${resource}/${slug}/unfollow`),
        onSuccess: async () => {
            setFollowing(false);
            if (authService.isAuthenticated()) {
                await qc.invalidateQueries({ queryKey: ['currentUser'] });
            }
        }
    });

    return {
        following,
        toggle: () => (following ? unfollow.mutate() : follow.mutate()),
        pending: follow.isPending || unfollow.isPending,
    };
}
