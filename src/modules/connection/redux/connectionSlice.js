import { createSlice, isAnyOf, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';
import { createApiThunk } from '../../../utils/reduxUtils';
import { connectionApi } from '../api/connectionApi';
import { CONNECTION_LIST_QUERIES, CONNECTION_LISTS, CONNECTION_PAGE_SIZE } from '../constants/connection.constants';

/** One page of a list (ConnectionDTO items + pagination) */
const fetchPage = (list, { page = 1, search } = {}) =>
  connectionApi
    .getConnections({
      ...CONNECTION_LIST_QUERIES[list],
      page,
      limit: CONNECTION_PAGE_SIZE,
      ...(search ? { search } : {}),
    })
    .then((response) => response.data);

// ---- Thunks (rejected payload: API error body { message, error: { code } }) ----

/**
 * Every list at once (tab counts come from their totals)
 * @param {{ search?: string, pages?: Object<string, number> }} [arg] - Page to load per list (default 1)
 */
export const fetchConnectionLists = createApiThunk('connection/fetchLists', async ({ search, pages = {} } = {}) => {
  const lists = Object.values(CONNECTION_LISTS);
  const results = await Promise.all(lists.map((list) => fetchPage(list, { page: pages[list] || 1, search })));
  return { data: Object.fromEntries(lists.map((list, index) => [list, results[index]])) };
});

/**
 * One page of one list
 * @param {{ list: string, page?: number, search?: string }} arg
 */
export const fetchConnectionList = createApiThunk('connection/fetchList', async ({ list, page, search }) => ({
  data: await fetchPage(list, { page, search }),
}));

export const sendConnectionRequest = createApiThunk('connection/sendRequest', (recipientId) =>
  connectionApi.sendRequest(recipientId),
);

export const acceptConnection = createApiThunk('connection/accept', (id) => connectionApi.acceptRequest(id));

export const declineConnection = createApiThunk('connection/decline', (id) => connectionApi.declineRequest(id));

/** Remove an accepted connection, or cancel a sent request */
export const removeConnection = createApiThunk('connection/remove', (id) => connectionApi.removeConnection(id));

const emptyList = { items: [], pagination: { page: 1, limit: CONNECTION_PAGE_SIZE, total: 0, totalPages: 1 } };

const initialState = {
  [CONNECTION_LISTS.ACCEPTED]: emptyList,
  [CONNECTION_LISTS.INCOMING]: emptyList,
  [CONNECTION_LISTS.OUTGOING]: emptyList,
  isLoading: false,
  // Connection id of the action in progress (accept / decline / remove)
  pendingActionId: null,
  error: null,
};

const toList = (data) => ({ items: data?.items || [], pagination: data?.pagination || emptyList.pagination });

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    // Called on logout (useAuth)
    resetConnections: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnectionLists.fulfilled, (state, action) => {
        Object.values(CONNECTION_LISTS).forEach((list) => {
          state[list] = toList(action.payload[list]);
        });
      })
      .addCase(fetchConnectionList.fulfilled, (state, action) => {
        state[action.meta.arg.list] = toList(action.payload);
      })
      .addMatcher(isPending(fetchConnectionLists, fetchConnectionList), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(isFulfilled(fetchConnectionLists, fetchConnectionList), (state) => {
        state.isLoading = false;
      })
      .addMatcher(isRejected(fetchConnectionLists, fetchConnectionList), (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error;
      })
      // Track the connection being changed (disables its buttons); lists are reloaded afterwards
      .addMatcher(isPending(acceptConnection, declineConnection, removeConnection), (state, action) => {
        state.pendingActionId = action.meta.arg;
      })
      .addMatcher(
        isAnyOf(
          isFulfilled(acceptConnection, declineConnection, removeConnection),
          isRejected(acceptConnection, declineConnection, removeConnection),
        ),
        (state) => {
          state.pendingActionId = null;
        },
      );
  },
});

export const { resetConnections } = connectionSlice.actions;

export default connectionSlice.reducer;
