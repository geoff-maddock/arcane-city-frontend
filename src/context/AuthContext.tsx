import React, { ReactNode, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext, AuthContextType } from './AuthContextDefinition';
import { authService } from '../services/auth.service';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const isTokenPresent = authService.isAuthenticated();

    const { data: user, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: isTokenPresent,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 1,
    });

    const contextValue = useMemo<AuthContextType>(() => {
        const hasPermission = (permissionSlug: string): boolean => {
            if (!user?.permissions) return false;
            return user.permissions.some(p => p.slug === permissionSlug);
        };

        const hasAnyPermission = (permissionSlugs: string[]): boolean => {
            if (!user?.permissions) return false;
            return permissionSlugs.some(slug => hasPermission(slug));
        };

        const hasAllPermissions = (permissionSlugs: string[]): boolean => {
            if (!user?.permissions) return false;
            return permissionSlugs.every(slug => hasPermission(slug));
        };

        const hasGroup = (groupSlug: string): boolean => {
            if (!user?.groups) return false;
            return user.groups.some(g => g.slug === groupSlug);
        };

        const hasAnyGroup = (groupSlugs: string[]): boolean => {
            if (!user?.groups) return false;
            return groupSlugs.some(slug => hasGroup(slug));
        };

        const hasAllGroups = (groupSlugs: string[]): boolean => {
            if (!user?.groups) return false;
            return groupSlugs.every(slug => hasGroup(slug));
        };

        return {
            user: user ?? null,
            isAuthenticated: !!user,
            isLoading,
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
            hasGroup,
            hasAnyGroup,
            hasAllGroups,
        };
    }, [user, isLoading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
