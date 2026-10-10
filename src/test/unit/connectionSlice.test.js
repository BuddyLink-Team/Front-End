import { describe, it, expect } from 'vitest';
import reducer, {
  fetchConnectionLists,
  fetchConnectionList,
  acceptConnection,
  resetConnections,
} from '../../modules/connection/redux/connectionSlice';

const page = (ids, total = ids.length, pageNumber = 1) => ({
  items: ids.map((id) => ({ id, partner: { id: `p-${id}`, fullName: id } })),
  pagination: { page: pageNumber, limit: 10, total, totalPages: Math.ceil(total / 10) || 1 },
});

const loaded = () =>
  reducer(
    undefined,
    fetchConnectionLists.fulfilled(
      { accepted: page(['a1'], 12), incoming: page(['i1']), outgoing: page(['o1']) },
      'req',
      {},
    ),
  );

describe('connectionSlice', () => {
  it('stores each list with its pagination', () => {
    const state = loaded();
    expect(state.accepted.items).toHaveLength(1);
    expect(state.accepted.pagination).toMatchObject({ total: 12, totalPages: 2 });
    expect(state.incoming.items[0].id).toBe('i1');
    expect(state.isLoading).toBe(false);
  });

  it('replaces only the requested list when changing page', () => {
    const state = reducer(
      loaded(),
      fetchConnectionList.fulfilled(page(['a11', 'a12'], 12, 2), 'req', { list: 'accepted', page: 2 }),
    );
    expect(state.accepted.items.map((c) => c.id)).toEqual(['a11', 'a12']);
    expect(state.accepted.pagination.page).toBe(2);
    expect(state.incoming.items[0].id).toBe('i1');
  });

  it('tracks loading and errors of the lists', () => {
    let state = reducer(loaded(), fetchConnectionList.pending('req', { list: 'accepted' }));
    expect(state.isLoading).toBe(true);
    state = reducer(state, fetchConnectionList.rejected(null, 'req', { list: 'accepted' }, { error: { code: 'X' } }));
    expect(state.isLoading).toBe(false);
    expect(state.error).toEqual({ error: { code: 'X' } });
  });

  it('tracks the connection being changed', () => {
    let state = reducer(loaded(), acceptConnection.pending('req', 'i1'));
    expect(state.pendingActionId).toBe('i1');
    state = reducer(state, acceptConnection.fulfilled({ id: 'i1' }, 'req', 'i1'));
    expect(state.pendingActionId).toBeNull();
  });

  it('resets on logout', () => {
    expect(reducer(loaded(), resetConnections()).accepted.items).toHaveLength(0);
  });
});
