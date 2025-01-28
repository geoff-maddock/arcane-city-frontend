import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSeries } from '../../hooks/useSeries';
import { api } from '../../lib/api';
import { PaginatedResponse, Series } from '../../types/api';

jest.mock('../../lib/api');

const mockApi = api as jest.Mocked<typeof api>;

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useSeries', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('fetches series data successfully', async () => {
    const mockData: PaginatedResponse<Series> = {
      data: [
        {
          id: 1,
          name: 'Series 1',
          primary_photo: 'photo1.jpg',
          primary_photo_thumbnail: 'thumbnail1.jpg',
          series_type: { name: 'Type 1' },
          primary_location: {
            address_line_one: '123 Main St',
            city: 'Test City',
            state: 'TS'
          },
          series_status: { name: 'Active' },
          roles: [{ name: 'Role 1' }],
          links: [{ id: 1, url: 'http://example.com' }],
          tags: [{ id: 1, name: 'Tag 1' }]
        }
      ],
      last_page: 1,
      total: 1
    };

    mockApi.get.mockResolvedValueOnce({ data: mockData });

    const { result, waitFor } = renderHook(() => useSeries(), { wrapper });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data).toEqual(mockData);
  });

  it('handles error state', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Failed to fetch series'));

    const { result, waitFor } = renderHook(() => useSeries(), { wrapper });

    await waitFor(() => result.current.isError);

    expect(result.current.error).toEqual(new Error('Failed to fetch series'));
  });

  it('fetches series data with filters, pagination, and sorting', async () => {
    const mockData: PaginatedResponse<Series> = {
      data: [
        {
          id: 1,
          name: 'Series 1',
          primary_photo: 'photo1.jpg',
          primary_photo_thumbnail: 'thumbnail1.jpg',
          series_type: { name: 'Type 1' },
          primary_location: {
            address_line_one: '123 Main St',
            city: 'Test City',
            state: 'TS'
          },
          series_status: { name: 'Active' },
          roles: [{ name: 'Role 1' }],
          links: [{ id: 1, url: 'http://example.com' }],
          tags: [{ id: 1, name: 'Tag 1' }]
        }
      ],
      last_page: 1,
      total: 1
    };

    mockApi.get.mockResolvedValueOnce({ data: mockData });

    const filters = {
      name: 'Series 1',
      series_type: 'Type 1',
      tag: 'Tag 1',
      created_at: {
        start: '2022-01-01T00:00:00.000Z',
        end: '2022-12-31T23:59:59.999Z'
      }
    };

    const { result, waitFor } = renderHook(() =>
      useSeries({ page: 1, itemsPerPage: 10, filters, sort: 'name', direction: 'asc' }), { wrapper });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data).toEqual(mockData);
  });
});
