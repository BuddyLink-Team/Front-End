import { describe, it, expect } from 'vitest';
import chatReducer, {
  fetchConversations,
  fetchPlaydateConversation,
  fetchMessages,
  messageReceived,
  optimisticMessageAdded,
  messagesReadByPartner,
  resetChatState,
} from '../../modules/chat/redux/chatSlice';

const action = (thunk, status, payload, arg) => ({ type: thunk[status].type, payload, meta: { arg } });

describe('chatSlice', () => {
  const initial = chatReducer(undefined, { type: 'init' });
  const withConversations = chatReducer(
    initial,
    action(fetchConversations, 'fulfilled', [
      { id: 'c1', unreadCount: 2 },
      { id: 'c2', unreadCount: 0 },
    ]),
  );

  it('ignores a late message response for a conversation the user already left', () => {
    let state = chatReducer(withConversations, action(fetchMessages, 'pending', undefined, 'c1'));
    state = chatReducer(state, action(fetchMessages, 'pending', undefined, 'c2'));

    // Response for c1 arrives after the user opened c2
    state = chatReducer(state, action(fetchMessages, 'fulfilled', [{ id: 'm-old', conversationId: 'c1' }], 'c1'));
    expect(state.messages).toEqual([]);

    state = chatReducer(state, action(fetchMessages, 'fulfilled', [{ id: 'm-new', conversationId: 'c2' }], 'c2'));
    expect(state.messages.map((m) => m.id)).toEqual(['m-new']);
  });

  it('replaces the optimistic copy and moves the conversation to the top', () => {
    let state = chatReducer(withConversations, action(fetchMessages, 'pending', undefined, 'c2'));
    state = chatReducer(state, action(fetchMessages, 'fulfilled', [], 'c2'));
    state = chatReducer(
      state,
      optimisticMessageAdded({ id: 'tmp-1', tempId: 'tmp-1', conversationId: 'c2', status: 'sending' }),
    );

    state = chatReducer(
      state,
      messageReceived({ message: { id: 'm-1', tempId: 'tmp-1', conversationId: 'c2', senderId: 'me' }, isMine: true }),
    );

    expect(state.messages).toHaveLength(1);
    expect(state.messages[0].id).toBe('m-1');
    expect(state.conversations[0].id).toBe('c2');
  });

  it('increments unread only for incoming messages of other conversations', () => {
    let state = chatReducer(withConversations, action(fetchMessages, 'pending', undefined, 'c2'));
    state = chatReducer(state, messageReceived({ message: { id: 'm-9', conversationId: 'c1' }, isMine: false }));
    expect(state.conversations.find((c) => c.id === 'c1').unreadCount).toBe(3);
  });

  it('marks only my messages as read when the partner reads', () => {
    let state = chatReducer(withConversations, action(fetchMessages, 'pending', undefined, 'c1'));
    state = chatReducer(
      state,
      action(fetchMessages, 'fulfilled', [
        { id: 'm-1', senderId: 'me', isRead: false },
        { id: 'm-2', senderId: 'partner', isRead: false },
      ], 'c1'),
    );

    state = chatReducer(state, messagesReadByPartner({ conversationId: 'c1', readerId: 'partner', currentParentId: 'me' }));
    expect(state.messages.find((m) => m.id === 'm-1').isRead).toBe(true);
    expect(state.messages.find((m) => m.id === 'm-2').isRead).toBe(false);
  });

  it('opens a playdate group chat: keeps its details and adds it to the list once', () => {
    const groupChat = { id: 'g1', type: 'playdate', playdate: { id: 'p1', host: { id: 'h1' } } };
    let state = chatReducer(withConversations, action(fetchPlaydateConversation, 'fulfilled', groupChat, 'p1'));
    state = chatReducer(state, action(fetchPlaydateConversation, 'fulfilled', groupChat, 'p1'));

    expect(state.activeConversationDetail).toEqual(groupChat);
    expect(state.conversations.map((c) => c.id)).toEqual(['g1', 'c1', 'c2']);
  });

  it('resets on logout', () => {
    expect(chatReducer(withConversations, resetChatState())).toEqual(initial);
  });
});
