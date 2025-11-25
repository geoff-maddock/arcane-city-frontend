import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContextDefinition';

/**
 * Hook to access authentication state and permission utilities.
 * 
 * @example
 * ```tsx
 * const { user, hasPermission, hasGroup, isAuthenticated } = useAuth();
 * 
 * // Check single permission
 * if (hasPermission('edit_group')) {
 *   // Show edit button
 * }
 * 
 * // Check if user belongs to admin group
 * if (hasGroup('admin')) {
 *   // Show admin panel
 * }
 * 
 * // Check multiple permissions
 * if (hasAnyPermission(['show_admin', 'edit_group'])) {
 *   // Show admin features
 * }
 * ```
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
