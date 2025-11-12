# User Permissions System

This document describes the user permissions and roles system implemented in the Arcane City Frontend.

## Overview

The permissions system allows the application to display or hide UI elements based on the logged-in user's permissions and roles. This is purely for UI convenience - **all actual authorization must be done on the backend**.

## Architecture

### Key Components

1. **Type Definitions** (`src/types/auth.ts`)
   - `Role`: Represents a user role (e.g., admin, editor)
   - `Permission`: Represents a specific permission (e.g., edit-events, delete-events)
   - `User`: Extended to include optional `roles[]` and `permissions[]` arrays

2. **useAuth Hook** (`src/hooks/useAuth.ts`)
   - Central authentication state management
   - Provides user data, loading states, and permission checking functions
   - Handles login/logout with proper error handling
   - Automatically clears invalid tokens

3. **Auth Service** (`src/services/auth.service.ts`)
   - Handles API communication for authentication
   - Manages token storage in localStorage
   - Fetches user data including permissions from backend

## Usage

### Basic Authentication Check

```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.name}!</div>;
}
```

### Permission-Based UI

```typescript
import { useAuth } from '../hooks/useAuth';

function EventActions() {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission('edit-events') && (
        <button>Edit Event</button>
      )}
      {hasPermission('delete-events') && (
        <button>Delete Event</button>
      )}
    </div>
  );
}
```

### Role-Based UI

```typescript
import { useAuth } from '../hooks/useAuth';

function AdminPanel() {
  const { hasRole } = useAuth();
  
  if (!hasRole('admin')) {
    return <div>Access denied</div>;
  }
  
  return (
    <div>
      <h1>Admin Panel</h1>
      {/* Admin features */}
    </div>
  );
}
```

### Multiple Permission Checks

```typescript
import { useAuth } from '../hooks/useAuth';

function ContentEditor() {
  const { hasAnyPermission, hasAllPermissions } = useAuth();
  
  // User needs at least ONE of these permissions
  const canEdit = hasAnyPermission([
    'edit-events',
    'edit-entities',
    'edit-series'
  ]);
  
  // User needs ALL of these permissions
  const canPublish = hasAllPermissions([
    'edit-events',
    'publish-events'
  ]);
  
  return (
    <div>
      {canEdit && <button>Edit</button>}
      {canPublish && <button>Publish</button>}
    </div>
  );
}
```

### Login with useAuth

```typescript
import { useAuth } from '../hooks/useAuth';

function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password }, {
      onSuccess: () => {
        // Navigate to dashboard or show success message
      },
      onError: () => {
        setError('Login failed');
      }
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoggingIn}>
        {isLoggingIn ? 'Logging in...' : 'Login'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### Logout with useAuth

```typescript
import { useAuth } from '../hooks/useAuth';

function UserMenu() {
  const { logout, isLoggingOut, user } = useAuth();
  
  return (
    <div>
      <span>{user?.name}</span>
      <button onClick={() => logout()} disabled={isLoggingOut}>
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}
```

## API Reference

### useAuth Hook

Returns an object with the following properties and methods:

#### Properties

- `user: User | null` - Current logged-in user with roles and permissions
- `isLoading: boolean` - True while fetching user data
- `isAuthenticated: boolean` - True if user is logged in
- `isLoggingIn: boolean` - True during login process
- `isLoggingOut: boolean` - True during logout process
- `permissions: Permission[]` - Array of user's permissions (empty if not authenticated)
- `roles: Role[]` - Array of user's roles (empty if not authenticated)

#### Methods

- `login(credentials, options?)` - Login with username/password
  - `credentials: { username: string, password: string }`
  - `options: { onSuccess?: () => void, onError?: (error) => void }`

- `logout()` - Logout current user and clear cache

- `hasPermission(slug: string): boolean` - Check if user has specific permission
  - Returns `false` if not authenticated or permission not found

- `hasRole(slug: string): boolean` - Check if user has specific role
  - Returns `false` if not authenticated or role not found

- `hasAnyPermission(slugs: string[]): boolean` - Check if user has any of the permissions
  - Returns `true` if user has at least one of the specified permissions

- `hasAllPermissions(slugs: string[]): boolean` - Check if user has all permissions
  - Returns `true` only if user has every specified permission

## Security Best Practices

### ⚠️ Critical Security Notes

1. **Never Trust Client-Side Permissions**: The permissions stored in the frontend are only for UI convenience. They can be manipulated by users with browser dev tools. Always validate permissions on the backend for any actual authorization.

2. **Use for UI Only**: Permissions should only control:
   - Showing/hiding buttons
   - Showing/hiding menu items
   - Showing/hiding UI sections
   - Client-side navigation guards (UX only)

3. **Backend Must Validate**: Every API endpoint must validate permissions independently. Examples:
   ```typescript
   // ❌ BAD - Don't do this
   if (hasPermission('delete-events')) {
     api.delete('/events/123'); // Backend might still reject this
   }
   
   // ✅ GOOD - Do this
   if (hasPermission('delete-events')) {
     // Show delete button
     <button onClick={() => deleteEvent()}>Delete</button>
   }
   // Backend will validate the permission when deleteEvent() calls the API
   ```

4. **Sensitive Data**: Never use permissions to hide sensitive data that's already loaded. Use backend permissions to control what data is sent to the frontend.

## Data Storage

- **Token**: Stored in `localStorage` as 'token'
  - Persists across browser sessions
  - Automatically sent with API requests
  - Cleared on logout or 401 responses

- **User Data & Permissions**: Stored in React Query cache (memory only)
  - Automatically cleared on page refresh
  - Cleared on logout
  - Not accessible to other browser tabs/windows
  - Stale time: 5 minutes (can be adjusted)

## Backend API Requirements

The backend API should return user data with the following structure:

```typescript
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "roles": [
    {
      "id": 1,
      "name": "Admin",
      "slug": "admin"
    }
  ],
  "permissions": [
    {
      "id": 1,
      "name": "Edit Events",
      "slug": "edit-events"
    },
    {
      "id": 2,
      "name": "Delete Events",
      "slug": "delete-events"
    }
  ],
  // ... other user fields
}
```

### API Endpoints Used

- `POST /api/tokens/create` - Login and get token
- `GET /api/auth/me` - Get current user with permissions
- (Optional) `POST /api/auth/logout` - Logout endpoint

## Testing

Tests are located in `src/__tests__/hooks/useAuth.test.tsx`. Run tests with:

```bash
npm test -- src/__tests__/hooks/useAuth.test.tsx
```

Example test:

```typescript
it('should check permissions correctly', async () => {
  // Mock authenticated user with permissions
  vi.mocked(authService.isAuthenticated).mockReturnValue(true);
  vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
  
  const { result } = renderHook(() => useAuth(), {
    wrapper: createWrapper(),
  });
  
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  
  expect(result.current.hasPermission('edit-events')).toBe(true);
  expect(result.current.hasPermission('non-existent')).toBe(false);
});
```

## Common Patterns

### Conditional Rendering by Role

```typescript
function Navigation() {
  const { hasRole } = useAuth();
  
  return (
    <nav>
      <Link to="/home">Home</Link>
      <Link to="/events">Events</Link>
      {hasRole('admin') && <Link to="/admin">Admin</Link>}
      {hasRole('moderator') && <Link to="/moderate">Moderate</Link>}
    </nav>
  );
}
```

### Loading States

```typescript
function ProtectedPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Protected content for {user?.name}</div>;
}
```

### Feature Flags with Permissions

```typescript
function EventDetail() {
  const { hasPermission } = useAuth();
  
  const features = {
    canEdit: hasPermission('edit-events'),
    canDelete: hasPermission('delete-events'),
    canPublish: hasPermission('publish-events'),
    canViewAnalytics: hasPermission('view-analytics'),
  };
  
  return (
    <div>
      <EventInfo />
      {features.canEdit && <EditButton />}
      {features.canDelete && <DeleteButton />}
      {features.canPublish && <PublishButton />}
      {features.canViewAnalytics && <AnalyticsPanel />}
    </div>
  );
}
```

## Troubleshooting

### Permissions not updating after login

The user query has a stale time of 5 minutes. To force a refresh:

```typescript
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['currentUser'] });
```

### User data not persisting across page refreshes

This is expected behavior. The user data is fetched from the API on each page load using the stored token. If the token is valid, the user data will be fetched automatically.

### hasPermission always returns false

Make sure:
1. User is logged in (`isAuthenticated === true`)
2. Backend is returning permissions in the correct format
3. You're using the correct permission slug (case-sensitive)
4. The user query has finished loading (`isLoading === false`)

## Future Enhancements

Potential improvements to the permissions system:

1. **Permission Groups**: Group related permissions for easier checking
2. **Permission Context**: Context-aware permissions (e.g., "can edit this specific event")
3. **Permission Caching**: Cache permission checks for better performance
4. **Audit Logging**: Log when users attempt actions they don't have permissions for
5. **Real-time Updates**: WebSocket support for permission changes while user is logged in
