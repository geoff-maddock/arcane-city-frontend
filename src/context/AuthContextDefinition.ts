import { createContext } from 'react';
import { User } from '../types/auth';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    /**
     * Check if the user has a specific permission by slug
     */
    hasPermission: (permissionSlug: string) => boolean;
    /**
     * Check if the user has any of the specified permissions by slug
     */
    hasAnyPermission: (permissionSlugs: string[]) => boolean;
    /**
     * Check if the user has all of the specified permissions by slug
     */
    hasAllPermissions: (permissionSlugs: string[]) => boolean;
    /**
     * Check if the user belongs to a specific group by slug
     */
    hasGroup: (groupSlug: string) => boolean;
    /**
     * Check if the user belongs to any of the specified groups by slug
     */
    hasAnyGroup: (groupSlugs: string[]) => boolean;
    /**
     * Check if the user belongs to all of the specified groups by slug
     */
    hasAllGroups: (groupSlugs: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
