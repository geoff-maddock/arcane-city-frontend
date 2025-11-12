import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import type { User, LoginCredentials } from '../../types/auth';

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
    authService: {
        login: vi.fn(),
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        isAuthenticated: vi.fn(),
    },
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    status: { id: 1, name: 'active' },
    email_verified_at: '2024-01-01',
    last_active: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    followed_tags: [],
    followed_entities: [],
    followed_series: [],
    followed_threads: [],
    photos: [],
    roles: [
        { id: 1, name: 'Admin', slug: 'admin' },
        { id: 2, name: 'Editor', slug: 'editor' },
    ],
    permissions: [
        { id: 1, name: 'Edit Events', slug: 'edit-events' },
        { id: 2, name: 'Delete Events', slug: 'delete-events' },
        { id: 3, name: 'Manage Users', slug: 'manage-users' },
    ],
};

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should return null user when not authenticated', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(false);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return user when authenticated', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should check permissions correctly', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasPermission('edit-events')).toBe(true);
        expect(result.current.hasPermission('delete-events')).toBe(true);
        expect(result.current.hasPermission('non-existent')).toBe(false);
    });

    it('should check roles correctly', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasRole('admin')).toBe(true);
        expect(result.current.hasRole('editor')).toBe(true);
        expect(result.current.hasRole('user')).toBe(false);
    });

    it('should check multiple permissions with hasAnyPermission', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasAnyPermission(['edit-events', 'non-existent'])).toBe(true);
        expect(result.current.hasAnyPermission(['non-existent', 'another-non-existent'])).toBe(false);
    });

    it('should check multiple permissions with hasAllPermissions', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasAllPermissions(['edit-events', 'delete-events'])).toBe(true);
        expect(result.current.hasAllPermissions(['edit-events', 'non-existent'])).toBe(false);
    });

    it('should return false for permission checks when user has no permissions', async () => {
        const userWithoutPermissions: User = {
            ...mockUser,
            permissions: undefined,
            roles: undefined,
        };

        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue(userWithoutPermissions);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasPermission('edit-events')).toBe(false);
        expect(result.current.hasRole('admin')).toBe(false);
        expect(result.current.permissions).toEqual([]);
        expect(result.current.roles).toEqual([]);
    });

    it('should handle login', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(false);
        vi.mocked(authService.login).mockResolvedValue({ token: 'test-token' });
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const credentials: LoginCredentials = {
            username: 'test@example.com',
            password: 'password',
        };

        result.current.login(credentials);

        await waitFor(() => {
            expect(result.current.isLoggingIn).toBe(false);
        });

        expect(authService.login).toHaveBeenCalledWith(credentials);
    });

    it('should handle logout', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
        vi.mocked(authService.logout).mockResolvedValue();

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        result.current.logout();

        await waitFor(() => {
            expect(result.current.isLoggingOut).toBe(false);
        });

        expect(authService.logout).toHaveBeenCalled();
    });

    it('should clear token and return null if getCurrentUser fails', async () => {
        const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Unauthorized'));

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(removeItemSpy).toHaveBeenCalledWith('token');
    });
});
