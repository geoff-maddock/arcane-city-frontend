# Permission System Usage Guide

## Overview

The Arcane City Frontend uses a permission-based authorization system that stores user roles and permissions from the API and makes them available throughout the application for conditional rendering and access control.

## How It Works

### 1. Authentication Flow

When a user logs in:
1. Username/password are sent to `/tokens/create` endpoint
2. A bearer token is returned and stored in `localStorage`
3. The token is used to fetch the current user from `/auth/me` endpoint
4. User data (including roles and permissions) is stored in React Query cache

### 2. User Type Structure

```typescript
export interface User {
    id: number;
    name: string;
    email: string;
    // ... other fields
    roles?: Role[];
    permissions?: Permission[];
}

export interface Role {
    id: number;
    name: string;
    slug: string;  // e.g., "admin", "moderator", "user"
}

export interface Permission {
    id: number;
    name: string;
    slug: string;  // e.g., "edit-events", "edit-entities", "admin"
}
```

### 3. Backend Requirements

Your API's `/auth/me` endpoint **must return** the user object with populated `roles` and `permissions` arrays:

```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "roles": [
    { "id": 1, "name": "Admin", "slug": "admin" }
  ],
  "permissions": [
    { "id": 1, "name": "Edit Events", "slug": "edit-events" },
    { "id": 2, "name": "Edit Entities", "slug": "edit-entities" },
    { "id": 3, "name": "Admin", "slug": "admin" }
  ],
  "profile": { ... },
  "followed_tags": [...],
  // ... other user fields
}
```

## Using the `useAuth` Hook

The `useAuth` hook provides all authentication state and permission checking utilities:

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
    const {
        user,                    // Current user object or null
        isLoading,              // Loading state
        isAuthenticated,        // Boolean: is user logged in
        hasPermission,          // Function: check single permission
        hasRole,                // Function: check single role
        hasAnyPermission,       // Function: check if has any of multiple permissions
        hasAllPermissions,      // Function: check if has all of multiple permissions
        permissions,            // Array of user's permissions
        roles,                  // Array of user's roles
        login,                  // Login function
        logout,                 // Logout function
        isLoggingIn,           // Login mutation loading state
        isLoggingOut,          // Logout mutation loading state
    } = useAuth();
}
```

## Permission Checking Methods

### Single Permission Check

```typescript
const { hasPermission } = useAuth();

// Check if user has specific permission
if (hasPermission('admin')) {
    // Show admin controls
}

if (hasPermission('edit-events')) {
    // Show event edit button
}
```

### Role Check

```typescript
const { hasRole } = useAuth();

if (hasRole('moderator')) {
    // Show moderator features
}
```

### Multiple Permission Checks

```typescript
const { hasAnyPermission, hasAllPermissions } = useAuth();

// Check if user has ANY of these permissions
if (hasAnyPermission(['edit-events', 'edit-entities', 'admin'])) {
    // User can edit at least one type of content
}

// Check if user has ALL of these permissions
if (hasAllPermissions(['create-events', 'publish-events'])) {
    // User can both create and publish events
}
```

## Common Usage Patterns

### 1. Conditional Rendering with Ownership OR Admin Permission

This is the most common pattern - allow the creator OR admins to edit:

```typescript
function EventDetail({ event }: { event: Event }) {
    const { user, hasPermission } = useAuth();
    
    // User can edit if they created it OR have admin permission
    const canEdit = !!user && (user.id === event.created_by || hasPermission('admin'));
    
    return (
        <div>
            <h1>{event.name}</h1>
            {canEdit && (
                <Link to={`/event/${event.slug}/edit`}>
                    <Button>Edit Event</Button>
                </Link>
            )}
        </div>
    );
}
```

### 2. Admin-Only Features

```typescript
function EventActions({ event }: { event: Event }) {
    const { hasPermission } = useAuth();
    
    return (
        <div>
            {hasPermission('admin') && (
                <>
                    <Button onClick={handleFeature}>Feature Event</Button>
                    <Button onClick={handlePin}>Pin to Top</Button>
                    <Button onClick={handleModerate}>Moderate</Button>
                </>
            )}
        </div>
    );
}
```

### 3. Multiple Permission Levels

```typescript
function EntityManagement({ entity }: { entity: Entity }) {
    const { user, hasPermission } = useAuth();
    
    // Different levels of access
    const isOwner = user?.id === entity.created_by;
    const canEdit = isOwner || hasPermission('edit-entities');
    const canDelete = isOwner || hasPermission('admin');
    const canFeature = hasPermission('admin') || hasPermission('moderate');
    
    return (
        <div>
            {canEdit && <Button>Edit</Button>}
            {canDelete && <Button variant="destructive">Delete</Button>}
            {canFeature && <Button>Feature</Button>}
        </div>
    );
}
```

### 4. Navigation Menu with Permissions

```typescript
function MenuBar() {
    const { isAuthenticated, hasPermission } = useAuth();
    
    return (
        <nav>
            <Link to="/events">Events</Link>
            <Link to="/entities">Entities</Link>
            
            {isAuthenticated && (
                <>
                    <Link to="/event/create">Create Event</Link>
                    <Link to="/profile">Profile</Link>
                </>
            )}
            
            {hasPermission('admin') && (
                <Link to="/admin">Admin Panel</Link>
            )}
        </nav>
    );
}
```

### 5. Protected Routes (Route Guards)

```typescript
// In your route definition
export const Route = createFileRoute('/admin')({
    beforeLoad: ({ context }) => {
        const { hasPermission } = context.auth;
        if (!hasPermission('admin')) {
            throw redirect({ to: '/unauthorized' });
        }
    },
    component: AdminPage,
});
```

## Real-World Examples from the Codebase

### EventDetail Component

```typescript
// From src/components/EventDetail.tsx
export default function EventDetail({ slug, initialEvent }: { slug: string; initialEvent?: Event }) {
    const { user, hasPermission } = useAuth();
    
    // ... event fetching code
    
    // Check if user can edit this event
    const canEdit = !!user && event && (user.id === event.created_by || hasPermission('admin'));
    
    return (
        <div>
            {/* Edit/Delete menu only shown to creators or admins */}
            {canEdit && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button>Actions</Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Link to={`/event/${event.slug}/edit`}>Edit Event</Link>
                        <Button onClick={handleDelete}>Delete Event</Button>
                    </PopoverContent>
                </Popover>
            )}
            
            {/* Photo upload only for creators or admins */}
            {canEdit && (
                <PhotoDropzone eventId={event.id} />
            )}
        </div>
    );
}
```

### EntityDetail Component

```typescript
// From src/components/EntityDetail.tsx
export default function EntityDetail({ slug, initialEntity }: { slug: string; initialEntity?: Entity }) {
    const { user, hasPermission } = useAuth();
    
    // ... entity fetching code
    
    const canEdit = !!user && (user.id === entity.created_by || hasPermission('admin'));
    
    return (
        <div>
            {canEdit && (
                <Link to={`/entity/${entity.slug}/edit`}>
                    <Button>Edit Entity</Button>
                </Link>
            )}
            
            {/* Pass canEdit to child components */}
            <EntityLocations entityId={entity.id} canEdit={canEdit} />
            <EntityContacts entityId={entity.id} canEdit={canEdit} />
            <EntityLinks entityId={entity.id} canEdit={canEdit} />
        </div>
    );
}
```

## Permission Slug Conventions

Follow these naming conventions for permission slugs:

- **Actions**: `create-{resource}`, `edit-{resource}`, `delete-{resource}`
- **Special Powers**: `admin`, `moderate`, `feature-content`
- **Visibility**: `view-private`, `view-drafts`
- **Bulk Operations**: `bulk-delete`, `bulk-edit`

Examples:
- `edit-events`
- `edit-entities`
- `create-series`
- `delete-comments`
- `moderate-content`
- `admin`

## Testing with Permissions

When writing tests, mock the `useAuth` hook:

```typescript
import { vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            name: 'Test User',
            permissions: [
                { id: 1, name: 'Admin', slug: 'admin' }
            ],
            roles: [
                { id: 1, name: 'Admin', slug: 'admin' }
            ]
        },
        isAuthenticated: true,
        hasPermission: (slug: string) => slug === 'admin',
        hasRole: (slug: string) => slug === 'admin',
    })
}));
```

## Security Considerations

### Frontend vs Backend Authorization

**Important**: Frontend permission checks are for **UI/UX only**. They improve user experience by hiding unavailable features, but they are NOT security measures.

**Always enforce permissions on the backend**:

1. **Frontend**: Hide edit buttons from non-admins
2. **Backend**: Return 403 Forbidden if non-admin tries to edit

```typescript
// Frontend - Good for UX
const canEdit = hasPermission('admin');
{canEdit && <Button>Edit</Button>}

// Backend - Required for security
// PUT /api/events/:id
if (!user.hasPermission('admin') && user.id !== event.created_by) {
    return response.status(403).json({ error: 'Forbidden' });
}
```

### Token Validation

The `useAuth` hook automatically handles invalid tokens:

```typescript
// From useAuth.ts
const { data: user } = useQuery<User | null>({
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
});
```

## Troubleshooting

### Permissions not showing up

1. **Check API response**: Verify `/auth/me` returns `roles` and `permissions` arrays
2. **Check token**: Ensure token is valid and stored in localStorage
3. **Check browser console**: Look for API errors or failed requests
4. **Clear cache**: Try clearing localStorage and logging in again

### Permission checks always returning false

1. **Check slug names**: Ensure frontend slug matches backend slug exactly
2. **Case sensitivity**: Slugs are case-sensitive
3. **Check user object**: Console log `user.permissions` to see what's available

### Changes not reflecting immediately

The user query has a 5-minute `staleTime`. To force refresh:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Force refresh current user
await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
```

## Summary

The permission system provides a flexible, type-safe way to control access throughout the application:

1. **Backend**: Returns user with roles and permissions from `/auth/me`
2. **Frontend**: `useAuth` hook provides permission checking utilities
3. **Components**: Use `hasPermission()` and ownership checks to conditionally render UI
4. **Security**: Always enforce permissions on the backend; frontend is UX only

This approach enables:
- ✅ Admin users can edit any event/entity
- ✅ Regular users can edit their own content
- ✅ Flexible permission-based feature flags
- ✅ Type-safe permission checking
- ✅ Easy testing and mocking
