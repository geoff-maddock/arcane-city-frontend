import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AjaxSelect from '@/components/AjaxSelect';
import { useSearchOptions, useSelectedOptions } from '../../hooks/useSearchOptions';

// Mock the useSearchOptions hook
vi.mock('../../hooks/useSearchOptions');

const mockUseSearchOptions = vi.mocked(useSearchOptions);
const mockUseSelectedOptions = vi.mocked(useSelectedOptions);

const mockOptions = [
  { id: 1, name: 'Concert' },
  { id: 2, name: 'Conference' },
  { id: 3, name: 'Party' },
  { id: 4, name: 'Festival' },
];

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('AjaxSelect Client Side Filtering', () => {
  const defaultProps = {
    label: 'Test Select',
    endpoint: 'test-endpoint',
    value: '' as number | '',
    onChange: vi.fn(),
    placeholder: 'Type to search...',
    clientSideFiltering: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useSearchOptions to return ALL options regardless of query
    mockUseSearchOptions.mockReturnValue({
      data: mockOptions,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      status: 'success',
      fetchStatus: 'idle',
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isRefetching: false,
      isFetching: false,
      isFetched: true,
      isFetchedAfterMount: true,
      isPlaceholderData: false,
      isStale: false,
      refetch: vi.fn(),
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isInitialLoading: false,
      isPaused: false,
      isEnabled: true,
      promise: Promise.resolve(mockOptions),
    } as const);

    // Mock useSelectedOptions to return empty by default
    mockUseSelectedOptions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      status: 'success',
      fetchStatus: 'idle',
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isRefetching: false,
      isFetching: false,
      isFetched: true,
      isFetchedAfterMount: true,
      isPlaceholderData: false,
      isStale: false,
      refetch: vi.fn(),
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isInitialLoading: false,
      isPaused: false,
      isEnabled: true,
      promise: Promise.resolve([]),
    } as const);
  });

  it('filters options client-side based on search query', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <AjaxSelect {...defaultProps} />
      </TestWrapper>
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    
    // Initially all options should be visible
    expect(screen.getByText('Concert')).toBeInTheDocument();
    expect(screen.getByText('Conference')).toBeInTheDocument();
    expect(screen.getByText('Party')).toBeInTheDocument();
    expect(screen.getByText('Festival')).toBeInTheDocument();

    // Type 'Con' - should show Concert and Conference
    await user.type(input, 'Con');

    await waitFor(() => {
      expect(screen.getByText('Concert')).toBeInTheDocument();
      expect(screen.getByText('Conference')).toBeInTheDocument();
      expect(screen.queryByText('Party')).not.toBeInTheDocument();
      expect(screen.queryByText('Festival')).not.toBeInTheDocument();
    });

    // Type 'f' - should show Conference and Festival (case insensitive)
    await user.clear(input);
    await user.type(input, 'f');

    await waitFor(() => {
      expect(screen.queryByText('Concert')).not.toBeInTheDocument();
      expect(screen.getByText('Conference')).toBeInTheDocument();
      expect(screen.queryByText('Party')).not.toBeInTheDocument();
      expect(screen.getByText('Festival')).toBeInTheDocument();
    });
  });

  it('calls useSearchOptions with empty query when clientSideFiltering is true', () => {
    render(
      <TestWrapper>
        <AjaxSelect {...defaultProps} />
      </TestWrapper>
    );

    expect(mockUseSearchOptions).toHaveBeenCalledWith(
      'test-endpoint',
      '', // Empty query
      {},
      { limit: 100 } // Limit override
    );
  });
});
