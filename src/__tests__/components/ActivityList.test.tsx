import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ActivityList from '../../components/ActivityList';
import * as useActivitiesHook from '../../hooks/useActivities';
import type { UseQueryResult } from '@tanstack/react-query';
import type { PaginatedResponse, Activity } from '../../types/api';

// Mock the router
vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual('@tanstack/react-router');
    return {
        ...actual,
        Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
            <a href={to} className={className}>{children}</a>
        ),
    };
});

describe('ActivityList', () => {
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

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    it('should render loading state', () => {
        vi.spyOn(useActivitiesHook, 'useActivities').mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null,
        } as Partial<UseQueryResult<PaginatedResponse<Activity>>> as UseQueryResult<PaginatedResponse<Activity>>);

        const { container } = render(<ActivityList />, { wrapper });
        expect(screen.getByText('Activity Index')).toBeInTheDocument();
        // Check for loader by finding the SVG with the specific class
        const loader = container.querySelector('.animate-spin');
        expect(loader).toBeInTheDocument();
    });

    it('should render error state', () => {
        vi.spyOn(useActivitiesHook, 'useActivities').mockReturnValue({
            data: undefined,
            isLoading: false,
            error: new Error('Test error'),
        } as Partial<UseQueryResult<PaginatedResponse<Activity>>> as UseQueryResult<PaginatedResponse<Activity>>);

        render(<ActivityList />, { wrapper });
        expect(screen.getByText(/There was an error loading activities/i)).toBeInTheDocument();
    });

    it('should render empty state when no activities', () => {
        vi.spyOn(useActivitiesHook, 'useActivities').mockReturnValue({
            data: { data: [], current_page: 1, last_page: 1, per_page: 25, total: 0 },
            isLoading: false,
            error: null,
        } as Partial<UseQueryResult<PaginatedResponse<Activity>>> as UseQueryResult<PaginatedResponse<Activity>>);

        render(<ActivityList />, { wrapper });
        expect(screen.getByText(/No activities found/i)).toBeInTheDocument();
    });

    it('should render activities list', () => {
        const mockData = {
            data: [
                {
                    id: 81078,
                    object_table: 'event',
                    object_id: 6833,
                    object_name: "Painted Dog 'Mirror' Album Release Show",
                    child_object_table: '',
                    child_object_id: 0,
                    child_object_name: '',
                    action: 'Instagram Post',
                    user_id: 1,
                    user_full_name: 'Geoffrey Maddock',
                    ip_address: '74.109.235.248',
                    created_at: '2025-11-04T00:43:00Z',
                },
                {
                    id: 81077,
                    object_table: 'entity',
                    object_id: 123,
                    object_name: 'Test Entity',
                    child_object_table: '',
                    child_object_id: 0,
                    child_object_name: '',
                    action: 'Update',
                    user_id: 2,
                    user_full_name: 'Test User',
                    ip_address: '192.168.1.1',
                    created_at: '2025-11-03T23:41:00Z',
                },
            ],
            current_page: 1,
            last_page: 1,
            per_page: 25,
            total: 2,
        };

        vi.spyOn(useActivitiesHook, 'useActivities').mockReturnValue({
            data: mockData,
            isLoading: false,
            error: null,
        } as Partial<UseQueryResult<PaginatedResponse<Activity>>> as UseQueryResult<PaginatedResponse<Activity>>);

        render(<ActivityList />, { wrapper });

        expect(screen.getByText('Activity Index')).toBeInTheDocument();
        expect(screen.getByText("Painted Dog 'Mirror' Album Release Show")).toBeInTheDocument();
        expect(screen.getByText('Test Entity')).toBeInTheDocument();
        expect(screen.getByText('Geoffrey Maddock')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should display IP addresses when available', () => {
        const mockData = {
            data: [
                {
                    id: 81078,
                    object_table: 'event',
                    object_id: 6833,
                    object_name: 'Test Event',
                    child_object_table: '',
                    child_object_id: 0,
                    child_object_name: '',
                    action: 'Create',
                    user_id: 1,
                    user_full_name: 'Test User',
                    ip_address: '192.168.1.1',
                    created_at: '2025-11-04T00:43:00Z',
                },
            ],
            current_page: 1,
            last_page: 1,
            per_page: 25,
            total: 1,
        };

        vi.spyOn(useActivitiesHook, 'useActivities').mockReturnValue({
            data: mockData,
            isLoading: false,
            error: null,
        } as Partial<UseQueryResult<PaginatedResponse<Activity>>> as UseQueryResult<PaginatedResponse<Activity>>);

        render(<ActivityList />, { wrapper });
        expect(screen.getByText(/192.168.1.1/)).toBeInTheDocument();
    });
});
