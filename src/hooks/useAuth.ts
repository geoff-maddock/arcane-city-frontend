import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { User, LoginCredentials } from '../types/auth';

/**
 * Hook for authentication state and operations
 * Provides access to current user, permissions, and auth operations
 */
export const useAuth = () => {
    const queryClient = useQueryClient();

    // Query for current user
    const { data: user, isLoading } = useQuery<User | null>({
        queryKey: ['currentUser'],
        queryFn: async () => {
            if (!authService.isAuthenticated()) {
                return null;
            }
            try {
                return await authService.getCurrentUser();
            } catch {
                // If getCurrentUser fails, clear the invalid token
                localStorage.removeItem('token');
                return null;
            }
        },
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        retry: false,
    });

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            await authService.login(credentials);
            return await authService.getCurrentUser();
        },
        onSuccess: (userData) => {
            queryClient.setQueryData(['currentUser'], userData);
        },
    });

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: async () => {
            await authService.logout();
        },
        onSuccess: () => {
            queryClient.setQueryData(['currentUser'], null);
            queryClient.clear();
        },
    });

    // Helper function to check if user has a specific permission
    const hasPermission = (permissionSlug: string): boolean => {
        if (!user || !user.permissions) return false;
        return user.permissions.some(permission => permission.slug === permissionSlug);
    };

    // Helper function to check if user has a specific role
    const hasRole = (roleSlug: string): boolean => {
        if (!user || !user.roles) return false;
        return user.roles.some(role => role.slug === roleSlug);
    };

    // Helper function to check if user has any of the specified permissions
    const hasAnyPermission = (permissionSlugs: string[]): boolean => {
        return permissionSlugs.some(slug => hasPermission(slug));
    };

    // Helper function to check if user has all of the specified permissions
    const hasAllPermissions = (permissionSlugs: string[]): boolean => {
        return permissionSlugs.every(slug => hasPermission(slug));
    };

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        permissions: user?.permissions ?? [],
        roles: user?.roles ?? [],
    };
};
