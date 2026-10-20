import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationApi from '../api/notification.api';
import { NOTIFICATION_TABS } from '../constants/notification.constants';

export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotifications(params);
      return response.data?.data;
    } catch (error) {
      const message =
        error.response?.data?.message || 'Không thể tải danh sách thông báo';
      return rejectWithValue(message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getUnreadCount();
      return response.data?.data?.unreadCount || 0;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi đếm thông báo');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationApi.markAsRead(notificationId);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể đánh dấu đã đọc');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.markAllAsRead();
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể đánh dấu tất cả');
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  isLoading: false,
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

      const exists = state.items.some((item) => item.id === newNotification.id);
      if (!exists) {
        state.items.unshift(newNotification);
        state.unreadCount += 1;
        state.pagination.total += 1;
      }
    },
    updateRealtimeUnreadCount: (state, action) => {
      if (typeof action.payload?.unreadCount === 'number') {
        state.unreadCount = action.payload.unreadCount;
      }
    },
    realtimeNotificationRead: (state, action) => {
      const { notificationId, unreadCount } = action.payload || {};
      if (notificationId) {
        const item = state.items.find((n) => n.id === notificationId);
        if (item) {
          item.isRead = true;
          item.readAt = new Date().toISOString();
        }
      }
      if (typeof unreadCount === 'number') {
        state.unreadCount = unreadCount;
      }
    },
    realtimeAllRead: (state) => {
      state.items.forEach((item) => {
        item.isRead = true;
        if (!item.readAt) item.readAt = new Date().toISOString();
      });
      state.unreadCount = 0;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.pagination = { page: 1, limit: 10, total: 0, totalPages: 1 };
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.items = action.payload.items || [];
          if (typeof action.payload.unreadCount === 'number') {
            state.unreadCount = action.payload.unreadCount;
          }
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination;
          }
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
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
        state.items.forEach((n) => {
          n.isRead = true;
          if (!n.readAt) n.readAt = new Date().toISOString();
        });
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.isMarkingRead = false;
        state.error = action.payload;
      });
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
