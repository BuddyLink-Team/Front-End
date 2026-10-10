import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import discoveryReducer, { setFilters } from '../../modules/discovery/redux/discoverySlice';
import parentReducer from '../../modules/parent/redux/parentSlice';
import childReducer from '../../modules/child/redux/childSlice';

const { mockGet, mockToastError } = vi.hoisted(() => ({ mockGet: vi.fn(), mockToastError: vi.fn() }));
vi.mock('../../services/apiClient', () => ({ default: { get: mockGet, post: vi.fn() } }));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: mockToastError, loading: vi.fn(), dismiss: vi.fn() },
}));

import { useDiscovery } from '../../modules/discovery/hooks/useDiscovery';

let CHILDREN = [{ id: 'k1', displayName: 'Na' }];
const PARENT_PROFILE = { preferences: { maxDistanceKm: 8, preferredAgeRange: { min: 3, max: 6 } } };

const respond = (url) => {
  if (url === '/user/me') return Promise.resolve({ success: true, data: PARENT_PROFILE });
  if (url === '/children') return Promise.resolve({ success: true, data: CHILDREN });
  if (url === '/discovery') return Promise.resolve({ success: true, data: { profiles: [], meta: { remainingViews: 5 } } });
  return Promise.reject(new Error(`Unexpected GET ${url}`));
};

const renderDiscovery = () => {
  const store = configureStore({
    reducer: { discovery: discoveryReducer, parent: parentReducer, child: childReducer },
  });
  const wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );
  return { store, ...renderHook(() => useDiscovery(), { wrapper }) };
};

describe('useDiscovery', () => {
  beforeEach(() => {
    CHILDREN = [{ id: 'k1', displayName: 'Na' }];
    mockGet.mockReset();
    mockGet.mockImplementation(respond);
    mockToastError.mockReset();
  });

  it('uses the parent preferences as default filters and fetches discovery once', async () => {
    const { result, store } = renderDiscovery();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const discoveryCalls = mockGet.mock.calls.filter(([url]) => url === '/discovery');
    expect(discoveryCalls).toHaveLength(1);
    expect(discoveryCalls[0][1].params).toEqual({ maxDistanceKm: 8, ageMin: 3, ageMax: 6, childId: 'k1' });

    expect(store.getState().discovery.filters).toEqual({ maxDistance: 8, minAge: 3, maxAge: 6, personalities: [] });
    expect(result.current.filterSummary).toEqual({ hasActiveFilter: false, distanceLabel: '8 km', ageLabel: '3-6 tuổi' });
    expect(result.current.searchingForLabel).toBe('Na');
  });

  it('falls back to the standard defaults when the parent profile cannot be loaded', async () => {
    mockGet.mockImplementation((url) =>
      url === '/user/me' ? Promise.reject({ error: { code: 'SOME_UNMAPPED_CODE' } }) : respond(url),
    );
    const { result } = renderDiscovery();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const discoveryCalls = mockGet.mock.calls.filter(([url]) => url === '/discovery');
    expect(discoveryCalls).toHaveLength(1);
    expect(discoveryCalls[0][1].params).toEqual({ maxDistanceKm: 15, ageMin: 1, ageMax: 12, childId: 'k1' });
    // Unmapped code → module fallback message explaining the default filters
    expect(mockToastError).toHaveBeenCalledWith('Không tải được tiêu chí tìm bạn của bạn, đang dùng bộ lọc mặc định.');
  });

  it('tells the parent when the children list cannot be loaded and searches for all children', async () => {
    mockGet.mockImplementation((url) =>
      url === '/children' ? Promise.reject({ error: { code: 'NETWORK_ERROR' } }) : respond(url),
    );
    const { result } = renderDiscovery();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const calls = mockGet.mock.calls.filter(([url]) => url === '/discovery');
    expect(calls).toHaveLength(1);
    expect(calls[0][1].params.childId).toBeUndefined();
    // Mapped shared code → shared Vietnamese message
    expect(mockToastError).toHaveBeenCalledWith('Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.');
  });

  const discoveryCalls = () => mockGet.mock.calls.filter(([url]) => url === '/discovery');

  it('searches again when filters are applied', async () => {
    const { result, store } = renderDiscovery();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      store.dispatch(setFilters({ maxDistance: 30, minAge: 2, maxAge: 9, personalities: [] }));
    });

    await waitFor(() => expect(discoveryCalls()).toHaveLength(2));
    expect(discoveryCalls()[1][1].params).toEqual({ maxDistanceKm: 30, ageMin: 2, ageMax: 9, childId: 'k1' });
  });

  it('lets the parent pick a child when there are several, and searches for that child', async () => {
    CHILDREN = [
      { id: 'k1', displayName: 'Na' },
      { id: 'k2', displayName: 'Bin' },
    ];
    const { result } = renderDiscovery();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.childOptions).toEqual([
      { value: 'k1', label: 'Na' },
      { value: 'k2', label: 'Bin' },
    ]);
    expect(result.current.selectedChildId).toBe('k1');
    expect(discoveryCalls()).toHaveLength(1);

    act(() => result.current.selectChild('k2'));

    await waitFor(() => expect(discoveryCalls()).toHaveLength(2));
    expect(discoveryCalls()[1][1].params.childId).toBe('k2');
    expect(result.current.searchingForLabel).toBe('Bin');
  });
});
