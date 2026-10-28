import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '../../modules/chat/redux/chatSlice';
import authReducer from '../../modules/auth/redux/authSlice';
import safetyReducer from '../../modules/safety/redux/safetySlice';
import { useChat } from '../../modules/chat/hooks/useChat';

vi.mock('../../services/socket', () => ({
  default: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    getSocket: vi.fn().mockReturnValue(null),
    isConnected: vi.fn().mockReturnValue(false),
  },
}));

vi.mock('../../services/apiClient', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ success: true, data: [] }),
    post: vi.fn().mockResolvedValue({ success: true, data: {} }),
  },
}));

describe('useChat hook', () => {
  const createMockStore = (chatPreloaded = {}) => {
    return configureStore({
      reducer: {
        chat: chatReducer,
        auth: authReducer,
        safety: safetyReducer,
      },
      preloadedState: {
        auth: {
          parent: { _id: 'my-parent-id', fullName: 'My Parent' },
        },
        chat: {
          conversations: [
            {
              id: 'conv-1',
              type: 'direct',
              partner: { id: 'partner-1', fullName: 'Partner 1' },
              isBlockedByMe: true,
              isBlockedByPartner: false,
              isBlocked: true,
            },
          ],
          conversationsStatus: 'succeeded',
          activeConversationDetail: null,
          messages: [],
          isLoadingMessages: false,
          hasMoreMessages: false,
          isLoadingOlder: false,
          ...chatPreloaded,
        },
      },
    });
  };

  const createWrapper = (store) => {
    const Wrapper = ({ children }) => (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    );
    return Wrapper;
  };

  it('renders useChat hook without throwing ReferenceError for detailOfActive', () => {
    const store = createMockStore();
    const { result } = renderHook(() => useChat({ initialConversationId: 'conv-1' }), {
      wrapper: createWrapper(store),
    });

    expect(result.current.activeConversation).toBeDefined();
    expect(result.current.activeConversation.id).toBe('conv-1');
    expect(result.current.activeConversation.isBlockedByMe).toBe(true);
    expect(result.current.activeConversation.isBlocked).toBe(true);
  });

  it('correctly merges detailOfActive when available', () => {
    const store = createMockStore({
      activeConversationDetail: {
        id: 'conv-1',
        isBlockedByMe: true,
        isBlockedByPartner: false,
        isBlocked: true,
        blockedByMeParticipants: [{ id: 'partner-1', fullName: 'Partner 1' }],
      },
    });

    const { result } = renderHook(() => useChat({ initialConversationId: 'conv-1' }), {
      wrapper: createWrapper(store),
    });

    expect(result.current.activeConversation).toBeDefined();
    expect(result.current.activeConversation.blockedByMeParticipants).toHaveLength(1);
    expect(result.current.activeConversation.blockedByMeParticipants[0].fullName).toBe('Partner 1');
  });
});
