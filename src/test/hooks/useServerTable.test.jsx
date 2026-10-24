import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useServerTable } from '../../hooks/useServerTable';

const page = (items, pagination = { page: 1, limit: 10, total: items.length, totalPages: 1 }) =>
  Promise.resolve({ success: true, data: { items, pagination } });

const renderTable = (options, route = '/admin/users') =>
  renderHook(() => useServerTable(options), {
    wrapper: ({ children }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>,
  });

describe('useServerTable', () => {
  it('loads the first page with the default params and unwraps the API body', async () => {
    const fetcher = vi.fn(() => page([{ id: 1 }]));
    const { result } = renderTable({ fetcher, defaultParams: { status: 'active' } });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetcher).toHaveBeenCalledWith({ page: 1, limit: 10, status: 'active' });
    expect(result.current.rows).toEqual([{ id: 1 }]);
    expect(result.current.filters).toEqual({ status: 'active' });
  });

  it('reads the initial state from the URL query', async () => {
    const fetcher = vi.fn(() => page([]));
    renderTable({ fetcher }, '/admin/users?page=3&search=lan&isActive=false');

    await waitFor(() =>
      expect(fetcher).toHaveBeenCalledWith({ page: 3, limit: 10, search: 'lan', isActive: 'false' }),
    );
  });

  it('goes back to page 1 when a filter or the sort changes, and drops empty filters', async () => {
    const fetcher = vi.fn(() => page([]));
    const { result } = renderTable({ fetcher }, '/admin/users?page=4');
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setFilter('status', 'locked'));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith({ page: 1, limit: 10, status: 'locked' }));

    act(() => result.current.setPage(2));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith({ page: 2, limit: 10, status: 'locked' }));

    act(() => result.current.setSort({ sortKey: 'createdAt', sortDir: 'desc' }));
    await waitFor(() =>
      expect(fetcher).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        status: 'locked',
        sortKey: 'createdAt',
        sortDir: 'desc',
      }),
    );

    act(() => result.current.setFilters({ status: null, sortKey: '', sortDir: '' }));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith({ page: 1, limit: 10 }));
  });

  it('applies the typed search after the debounce', async () => {
    const fetcher = vi.fn(() => page([]));
    const { result } = renderTable({ fetcher, debounceMs: 20 });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setSearch('  Nguyễn Lan '));
    expect(result.current.searchInput).toBe('  Nguyễn Lan ');
    await waitFor(() =>
      expect(fetcher).toHaveBeenLastCalledWith({ page: 1, limit: 10, search: 'Nguyễn Lan' }),
    );
  });

  it('keeps state in memory when syncWithUrl is false, and exposes errors', async () => {
    const error = { error: { code: 'FORBIDDEN' } };
    const fetcher = vi.fn().mockResolvedValueOnce({ data: { items: [] } }).mockRejectedValueOnce(error);
    const { result } = renderTable({ fetcher, syncWithUrl: false }, '/admin/subscriptions?page=5');

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetcher).toHaveBeenCalledWith({ page: 1, limit: 10 });

    act(() => result.current.refetch());
    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.isLoading).toBe(false);
  });
});
