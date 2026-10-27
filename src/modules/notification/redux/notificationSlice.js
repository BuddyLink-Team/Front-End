import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import notificationApi from '../api/notificationApi';
import {
  NOTIFICATION_TABS,
  TAB_DEFINITIONS,
  NOTIFICATION_PAGE_LIMIT,
  NOTIFICATION_PREVIEW_LIMIT,
} from '../constants/notification.constants';
import { logout, logoutUser, restoreSession } from '../../auth/redux/authSlice';

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchDropdownNotifications = createAsyncThunk(
  'notification/fetchDropdownNotifications',
  async (params = { page: 1, limit: NOTIFICATION_PREVIEW_LIMIT }, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getUnreadCount();
      return response.data?.unreadCount || 0;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationApi.markAsRead(notificationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.markAllAsRead();
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const initialState = {
  // History page notifications
  items: [],
  pagination: {
    page: 1,
    limit: NOTIFICATION_PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  },
  isLoading: false,
  // Latest history request: older responses (fast tab/page switches) are ignored
  latestRequestId: null,

  // Dropdown preview notifications (separate state to avoid overwriting page view)
  previewItems: [],
  isPreviewLoading: false,

  unreadCount: 0,
  isMarkingRead: false,
  error: null,
  activeTab: NOTIFICATION_TABS.ALL,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    receiveRealtimeNotification: (state, action) => {
      const newNotification = action.payload;
      if (!newNotification || !newNotification.id) return;

      // 1. Update dropdown preview items
      const existsInPreview = state.previewItems.some((item) => item.id === newNotification.id);
      if (!existsInPreview) {
        state.previewItems.unshift(newNotification);
        if (state.previewItems.length > NOTIFICATION_PREVIEW_LIMIT) {
          state.previewItems.pop();
        }
      }

      // 2. Update history page items if on page 1 and matches active tab
      const existsInItems = state.items.some((item) => item.id === newNotification.id);
      if (!existsInItems) {
        const tabDef = TAB_DEFINITIONS.find((t) => t.id === state.activeTab);
        const matchesTab = !tabDef?.types || tabDef.types.includes(newNotification.type);
        const currentPage = state.pagination?.page || 1;
        const currentLimit = state.pagination?.limit || NOTIFICATION_PAGE_LIMIT;

        if (matchesTab) {
          if (currentPage === 1) {
            state.items.unshift(newNotification);
            if (state.items.length > currentLimit) {
              state.items.pop();
            }
          }
          // Only the active tab's total grows; other tabs are refetched when opened
          state.pagination.total = (state.pagination?.total || 0) + 1;
          state.pagination.totalPages = Math.max(
            1,
            Math.ceil(state.pagination.total / currentLimit)
          );
        }
        state.unreadCount += 1;
      }
    },
    updateRealtimeUnreadCount: (state, action) => {
      if (typeof action.payload?.unreadCount === 'number') {
        state.unreadCount = action.payload.unreadCount;
      }
    },
    realtimeNotificationRead: (state, action) => {
      const { notificationId, unreadCount } = action.payload || {};
      const now = new Date().toISOString();
      if (notificationId) {
        const item = state.items.find((n) => n.id === notificationId);
        if (item) {
          item.isRead = true;
          item.readAt = now;
        }
        const previewItem = state.previewItems.find((n) => n.id === notificationId);
        if (previewItem) {
          previewItem.isRead = true;
          previewItem.readAt = now;
        }
      }
      if (typeof unreadCount === 'number') {
        state.unreadCount = unreadCount;
      }
    },
    realtimeAllRead: (state) => {
      const now = new Date().toISOString();
      state.items.forEach((item) => {
        item.isRead = true;
        if (!item.readAt) item.readAt = now;
      });
      state.previewItems.forEach((item) => {
        item.isRead = true;
        if (!item.readAt) item.readAt = now;
      });
      state.unreadCount = 0;
    },
    clearNotifications: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications (history page)
      .addCase(fetchNotifications.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.isLoading = false;
        if (action.payload) {
          state.items = action.payload.items || [];
          if (typeof action.payload.unreadCount === 'number') {
            state.unreadCount = action.payload.unreadCount;
          }
          if (action.payload.pagination) {
            state.pagination = {
              ...state.pagination,
              ...action.payload.pagination,
            };
          }
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.isLoading = false;
        state.error = action.payload;
      })

      // fetchDropdownNotifications (dropdown preview)
      .addCase(fetchDropdownNotifications.pending, (state) => {
        state.isPreviewLoading = true;
      })
      .addCase(fetchDropdownNotifications.fulfilled, (state, action) => {
        state.isPreviewLoading = false;
        if (action.payload) {
          state.previewItems = (action.payload.items || []).slice(0, NOTIFICATION_PREVIEW_LIMIT);
          if (typeof action.payload.unreadCount === 'number') {
            state.unreadCount = action.payload.unreadCount;
          }
        }
      })
      .addCase(fetchDropdownNotifications.rejected, (state) => {
        state.isPreviewLoading = false;
      })

      // fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // markNotificationAsRead
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const result = action.payload;
        if (result?.notification) {
          const index = state.items.findIndex((n) => n.id === result.notification.id);
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...result.notification };
          }
          const previewIndex = state.previewItems.findIndex((n) => n.id === result.notification.id);
          if (previewIndex !== -1) {
            state.previewItems[previewIndex] = { ...state.previewItems[previewIndex], ...result.notification };
          }
        }
        if (typeof result?.unreadCount === 'number') {
          state.unreadCount = result.unreadCount;
        } else {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // markAllNotificationsAsRead
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.isMarkingRead = true;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.isMarkingRead = false;
        const now = new Date().toISOString();
        state.items.forEach((n) => {
          n.isRead = true;
          if (!n.readAt) n.readAt = now;
        });
        state.previewItems.forEach((n) => {
          n.isRead = true;
          if (!n.readAt) n.readAt = now;
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.isMarkingRead = false;
        state.error = action.payload;
      })

      // Every way the session ends: never show the previous account's notifications
      .addMatcher(isAnyOf(logout, logoutUser.fulfilled, restoreSession.rejected), () => initialState);
  },
});

export const {
  setActiveTab,
  receiveRealtimeNotification,
  updateRealtimeUnreadCount,
  realtimeNotificationRead,
  realtimeAllRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
