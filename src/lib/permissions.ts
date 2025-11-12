/**
 * Permission utility functions and constants
 * 
 * Provides reusable permission checking logic and permission slug constants
 * to ensure consistency across the application.
 */

import { User } from '../types/auth';

/**
 * Permission slug constants
 * Use these instead of magic strings for type safety and refactoring
 */
export const PERMISSIONS = {
    ADMIN: 'admin',
    EDIT_EVENTS: 'edit-events',
    EDIT_ENTITIES: 'edit-entities',
    EDIT_SERIES: 'edit-series',
    DELETE_EVENTS: 'delete-events',
    DELETE_ENTITIES: 'delete-entities',
    MODERATE: 'moderate',
    FEATURE_CONTENT: 'feature-content',
} as const;

/**
 * Role slug constants
 */
export const ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    USER: 'user',
} as const;

/**
 * Check if a user can edit a resource
 * User can edit if they created it OR have admin permission
 */
export function canUserEdit(
    user: User | null | undefined,
    resourceCreatorId: number | null | undefined,
    adminPermission: string = PERMISSIONS.ADMIN
): boolean {
    if (!user) return false;
    
    // Check ownership
    if (resourceCreatorId && user.id === resourceCreatorId) {
        return true;
    }
    
    // Check admin permission
    if (user.permissions?.some(p => p.slug === adminPermission)) {
        return true;
    }
    
    return false;
}

/**
 * Check if a user can delete a resource
 * Usually same as edit, but separated for flexibility
 */
export function canUserDelete(
    user: User | null | undefined,
    resourceCreatorId: number | null | undefined,
    adminPermission: string = PERMISSIONS.ADMIN
): boolean {
    return canUserEdit(user, resourceCreatorId, adminPermission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
    user: User | null | undefined,
    permissionSlugs: string[]
): boolean {
    if (!user || !user.permissions) return false;
    return permissionSlugs.some(slug => 
        user.permissions!.some(permission => permission.slug === slug)
    );
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
    user: User | null | undefined,
    permissionSlugs: string[]
): boolean {
    if (!user || !user.permissions) return false;
    return permissionSlugs.every(slug =>
        user.permissions!.some(permission => permission.slug === slug)
    );
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
    user: User | null | undefined,
    permissionSlug: string
): boolean {
    if (!user || !user.permissions) return false;
    return user.permissions.some(permission => permission.slug === permissionSlug);
}

/**
 * Check if a user has a specific role
 */
export function hasRole(
    user: User | null | undefined,
    roleSlug: string
): boolean {
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.slug === roleSlug);
}

/**
 * Check if user is an admin (convenience function)
 */
export function isAdmin(user: User | null | undefined): boolean {
    return hasPermission(user, PERMISSIONS.ADMIN) || hasRole(user, ROLES.ADMIN);
}

/**
 * Check if user is a moderator or admin (convenience function)
 */
export function isModerator(user: User | null | undefined): boolean {
    return isAdmin(user) || hasRole(user, ROLES.MODERATOR);
}
