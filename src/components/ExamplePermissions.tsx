/**
 * Example component showing permission-based UI rendering patterns
 * 
 * This is a reference implementation showing common permission patterns.
 * You can copy these patterns to your own components.
 * 
 * Note: This file contains example routes that don't exist in the app.
 * TypeScript errors are expected - this is for reference only, not imported by the app.
 * @example-only
 */

import { useAuth } from '../hooks/useAuth';
import { canUserEdit, PERMISSIONS, isAdmin } from '../lib/permissions';
import { Button } from './ui/button';
import { Link } from '@tanstack/react-router';
import { Edit, Trash2, Star, Shield } from 'lucide-react';

interface ExampleResourceProps {
    resource: {
        id: number;
        name: string;
        slug: string;
        created_by: number;
        description: string;
    };
}

export function ExampleResourceDetail({ resource }: ExampleResourceProps) {
    const { user, hasPermission, isAuthenticated } = useAuth();

    // Pattern 1: Check if user can edit (owner OR admin)
    const canEdit = canUserEdit(user, resource.created_by);

    // Pattern 2: Check specific permission
    const canFeature = hasPermission('feature-content');

    // Pattern 3: Check if admin using utility
    const userIsAdmin = isAdmin(user);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{resource.name}</h1>

                {/* Pattern 4: Show button only to authenticated users */}
                {isAuthenticated && (
                    <Button variant="outline" size="sm">
                        <Star className="h-4 w-4 mr-2" />
                        Follow
                    </Button>
                )}

                {/* Pattern 5: Show edit controls only if user can edit */}
                {canEdit && (
                    <div className="flex gap-2">
                        <Link to={`/resource/${resource.slug}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                )}
            </div>

            <div className="prose max-w-none">
                <p>{resource.description}</p>
            </div>

            {/* Pattern 6: Admin-only features */}
            {userIsAdmin && (
                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-red-600" />
                        Admin Controls
                    </h3>
                    <div className="flex gap-2">
                        {canFeature && (
                            <Button variant="secondary" size="sm">
                                Feature This Resource
                            </Button>
                        )}
                        <Button variant="outline" size="sm">
                            View Audit Log
                        </Button>
                    </div>
                </div>
            )}

            {/* Pattern 7: Display permission info to user (for debugging) */}
            {user && process.env.NODE_ENV === 'development' && (
                <details className="bg-gray-100 p-4 rounded">
                    <summary className="cursor-pointer font-semibold">
                        Debug: Your Permissions
                    </summary>
                    <div className="mt-2 space-y-1 text-sm">
                        <p>User ID: {user.id}</p>
                        <p>Can Edit: {canEdit ? '✅' : '❌'}</p>
                        <p>Is Admin: {userIsAdmin ? '✅' : '❌'}</p>
                        <p>Can Feature: {canFeature ? '✅' : '❌'}</p>
                        <div className="mt-2">
                            <p className="font-semibold">Permissions:</p>
                            <ul className="list-disc list-inside">
                                {user.permissions?.map(p => (
                                    <li key={p.id}>{p.name} ({p.slug})</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </details>
            )}
        </div>
    );
}

/**
 * Example: Menu bar with conditional navigation
 */
export function ExampleMenuBar() {
    const { isAuthenticated, hasPermission } = useAuth();

    return (
        <nav className="flex gap-4 p-4 bg-gray-100">
            <Link to="/">Home</Link>
            <Link to="/events">Events</Link>
            <Link to="/entities">Entities</Link>

            {/* Show only to authenticated users */}
            {isAuthenticated && (
                <>
                    <Link to="/event/create">Create Event</Link>
                    <Link to="/profile">Profile</Link>
                </>
            )}

            {/* Show only to users with specific permission */}
            {hasPermission(PERMISSIONS.ADMIN) && (
                <Link to="/admin" className="text-red-600 font-semibold">
                    Admin Panel
                </Link>
            )}
        </nav>
    );
}

/**
 * Example: Card with conditional action buttons
 */
interface ExampleCardProps {
    item: {
        id: number;
        name: string;
        slug: string;
        created_by: number;
    };
}

export function ExampleResourceCard({ item }: ExampleCardProps) {
    const { user } = useAuth();
    const canEdit = canUserEdit(user, item.created_by);

    return (
        <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{item.name}</h3>

            <div className="flex gap-2 mt-4">
                <Link to={`/resource/${item.slug}`}>
                    <Button size="sm">View</Button>
                </Link>

                {/* Edit button only visible to creator or admin */}
                {canEdit && (
                    <Link to={`/resource/${item.slug}/edit`}>
                        <Button variant="outline" size="sm">
                            Edit
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
