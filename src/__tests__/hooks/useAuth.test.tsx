import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { AuthProvider } from '../../context/AuthContext';

// Mock the auth service
vi.mock('../../services/auth.service', () => ({
    authService: {
        isAuthenticated: vi.fn(),
        getCurrentUser: vi.fn(),
    },
}));

describe('useAuth', () => {
    const mockUserWithPermissions = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        status: { id: 1, name: 'Active' },
        email_verified_at: null,
        last_active: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        followed_tags: [],
        followed_entities: [],
        followed_series: [],
        followed_threads: [],
        groups: [
            { id: 1, name: 'Admin', slug: 'admin' },
            { id: 2, name: 'Super Admin', slug: 'super_admin' },
        ],
        permissions: [
            { id: 18, name: 'Show Admin', slug: 'show_admin' },
            { id: 16, name: 'Edit Group', slug: 'edit_group' },
            { id: 14, name: 'Edit Permission', slug: 'edit_permission' },
        ],
        photos: [],
    };

    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        vi.clearAllMocks();
    });

    afterEach(() => {
        queryClient.clear();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryClientProvider>
    );

    it('should return isAuthenticated as false when no token present', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(false);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
    });

    it('should return user data when authenticated', async () => {
        vi.mocked(authService.isAuthenticated).mockReturnValue(true);
        vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUserWithPermissions);
    });

    describe('hasPermission', () => {
        it('should return true when user has the permission', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasPermission('show_admin')).toBe(true);
            expect(result.current.hasPermission('edit_group')).toBe(true);
        });

        it('should return false when user does not have the permission', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasPermission('delete_user')).toBe(false);
        });

        it('should return false when user is not authenticated', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(false);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasPermission('show_admin')).toBe(false);
        });
    });

    describe('hasAnyPermission', () => {
        it('should return true when user has at least one of the permissions', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasAnyPermission(['show_admin', 'delete_user'])).toBe(true);
        });

        it('should return false when user has none of the permissions', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasAnyPermission(['delete_user', 'ban_user'])).toBe(false);
        });
    });

    describe('hasAllPermissions', () => {
        it('should return true when user has all of the permissions', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasAllPermissions(['show_admin', 'edit_group'])).toBe(true);
        });

        it('should return false when user is missing at least one permission', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasAllPermissions(['show_admin', 'delete_user'])).toBe(false);
        });
    });

    describe('hasGroup', () => {
        it('should return true when user belongs to the group', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasGroup('admin')).toBe(true);
            expect(result.current.hasGroup('super_admin')).toBe(true);
        });

        it('should return false when user does not belong to the group', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasGroup('moderator')).toBe(false);
        });

        it('should return false when user is not authenticated', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(false);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasGroup('admin')).toBe(false);
        });
    });

    describe('hasAnyGroup', () => {
        it('should return true when user belongs to at least one of the groups', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasAnyGroup(['admin', 'moderator'])).toBe(true);
        });

        it('should return false when user belongs to none of the groups', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasAnyGroup(['moderator', 'guest'])).toBe(false);
        });
    });

    describe('hasAllGroups', () => {
        it('should return true when user belongs to all of the groups', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasAllGroups(['admin', 'super_admin'])).toBe(true);
        });

        it('should return false when user is missing at least one group', async () => {
            vi.mocked(authService.isAuthenticated).mockReturnValue(true);
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUserWithPermissions);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.hasAllGroups(['admin', 'moderator'])).toBe(false);
        });
    });
});

describe('useAuth outside AuthProvider', () => {
    it('should throw an error when used outside AuthProvider', () => {
        const queryClient = new QueryClient();
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );

        // Suppress console.error for the expected error
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useAuth(), { wrapper });
        }).toThrow('useAuth must be used within an AuthProvider');

        consoleError.mockRestore();
    });
});
