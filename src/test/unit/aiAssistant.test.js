import { describe, it, expect } from 'vitest';
import reducer, {
  sendAIMessage,
  fetchAISession,
  createAISession,
  deleteAISession,
  setActiveAISession,
} from '../../modules/ai-assistant/redux/aiAssistantSlice';
import {
  groupSessionsByDate,
  parseAIText,
  plainAIText,
  buildAgendaNote,
  normalizeAgenda,
  buildCustomAnswer,
  googleMapsSearchUrl,
} from '../../modules/ai-assistant/utils/aiAssistantUtils';
import { getCustomAnswerSchema } from '../../modules/ai-assistant/validation/aiAssistantValidation';

const timeCard = () => ({
  type: 'choices',
  stepId: 'time',
  status: 'open',
  selectedOptionIds: [],
  options: [{ id: 'slot:1', label: 'T7 · 09:00' }],
});

const stateWithCard = () => {
  const state = reducer(undefined, { type: '@@init' });
  return reducer(
    state,
    fetchAISession.fulfilled(
      { session: { id: 's1', title: 'Hẹn chơi', messageCount: 1, messageCap: 30, planDraft: null, messages: [{ id: 'a1', role: 'assistant', content: 'Chọn giờ', cards: [timeCard()] }] } },
      'req',
      's1',
    ),
  );
};

describe('aiAssistantSlice', () => {
  it('shows the message at once, marks the tapped card, then swaps in the server reply', () => {
    const arg = { sessionId: 's1', content: 'Chọn: T7 · 09:00', choice: { messageId: 'a1', stepId: 'time', optionIds: ['slot:1'] }, localId: 'local-1' };
    let state = reducer(stateWithCard(), sendAIMessage.pending('req', arg));
    expect(state.sendingSessionIds).toEqual(['s1']);
    expect(state.messagesBySession.s1[1]).toMatchObject({ id: 'local-1', status: 'pending', role: 'user' });
    expect(state.messagesBySession.s1[0].cards[0]).toMatchObject({ status: 'answered', selectedOptionIds: ['slot:1'] });

    state = reducer(
      state,
      sendAIMessage.fulfilled(
        {
          session: { id: 's1', title: 'Hẹn chơi', messageCount: 2, messageCap: 30 },
          userMessage: { id: 'u2', role: 'user', content: arg.content },
          reply: { id: 'a2', role: 'assistant', content: 'Mời bạn nào?', cards: [] },
          planDraft: { status: 'collecting' },
          quota: { limit: 5, used: 1, remaining: 4 },
        },
        'req',
        arg,
      ),
    );
    expect(state.messagesBySession.s1.map((m) => m.id)).toEqual(['a1', 'u2', 'a2']);
    expect(state.sessionsById.s1).toMatchObject({ messageCount: 2, planDraft: { status: 'collecting' } });
    expect(state.quota).toEqual({ limit: 5, used: 1, remaining: 4 });
    expect(state.sessions[0].id).toBe('s1');
    expect(state.sendingSessionIds).toEqual([]);
  });

  it('keeps a failed message with its error code and reopens the card', () => {
    const arg = { sessionId: 's1', content: 'x', choice: { messageId: 'a1', stepId: 'time', optionIds: ['slot:1'] }, localId: 'local-1' };
    let state = reducer(stateWithCard(), sendAIMessage.pending('req', arg));
    state = reducer(state, sendAIMessage.rejected(null, 'req', arg, { error: { code: 'AI_RATE_LIMITED' } }));
    expect(state.messagesBySession.s1[1]).toMatchObject({ status: 'failed', errorCode: 'AI_RATE_LIMITED' });
    expect(state.messagesBySession.s1[0].cards[0].status).toBe('open');

    // Retry reuses the same message
    state = reducer(state, sendAIMessage.pending('req2', arg));
    expect(state.messagesBySession.s1).toHaveLength(2);
    expect(state.messagesBySession.s1[1]).toMatchObject({ status: 'pending', errorCode: null });
  });

  it('swaps in the tapped card as stored by the server, or reopens it when the server did not apply it', () => {
    const arg = { sessionId: 's1', content: 'Chọn', choice: { messageId: 'a1', stepId: 'time', optionIds: ['slot:1'] }, localId: 'local-1' };
    const payload = (answeredCard) => ({
      session: { id: 's1', title: 'Hẹn chơi', messageCount: 2, messageCap: 30 },
      userMessage: { id: 'u2', role: 'user', content: 'Chọn' },
      reply: { id: 'a2', role: 'assistant', content: 'Ok', cards: [] },
      planDraft: null,
      answeredCard,
    });
    const stored = { ...timeCard(), status: 'answered', playdateId: 'p1' };
    let state = reducer(stateWithCard(), sendAIMessage.pending('req', arg));
    state = reducer(state, sendAIMessage.fulfilled(payload({ messageId: 'a1', cards: [stored] }), 'req', arg));
    expect(state.messagesBySession.s1[0].cards[0]).toMatchObject({ status: 'answered', playdateId: 'p1' });

    state = reducer(stateWithCard(), sendAIMessage.pending('req', arg));
    state = reducer(state, sendAIMessage.fulfilled(payload(null), 'req', arg));
    expect(state.messagesBySession.s1[0].cards[0].status).toBe('open');
  });

  it('keeps sending in one conversation while another one finishes', () => {
    const inS1 = { sessionId: 's1', content: 'a', localId: 'local-1' };
    const inS2 = { sessionId: 's2', content: 'b', localId: 'local-2' };
    let state = reducer(stateWithCard(), sendAIMessage.pending('r1', inS1));
    state = reducer(state, sendAIMessage.pending('r2', inS2));
    state = reducer(state, sendAIMessage.rejected(null, 'r1', inS1, { error: { code: 'AI_PROVIDER_ERROR' } }));
    expect(state.sendingSessionIds).toEqual(['s2']);
  });

  it('drops a failed message on reload once the server has it, keeps the others', () => {
    const timedOut = { sessionId: 's1', content: 'Đã lưu', localId: 'local-1' };
    const failed = { sessionId: 's1', content: 'Chưa lưu', localId: 'local-2' };
    let state = stateWithCard();
    for (const arg of [timedOut, failed]) {
      state = reducer(state, sendAIMessage.pending(arg.localId, arg));
      state = reducer(state, sendAIMessage.rejected(null, arg.localId, arg, { error: { code: 'NETWORK_ERROR' } }));
    }
    const later = new Date(Date.now() + 1000).toISOString();
    state = reducer(
      state,
      fetchAISession.fulfilled(
        {
          session: {
            id: 's1',
            title: 'Hẹn chơi',
            messageCount: 2,
            messageCap: 30,
            planDraft: null,
            messages: [
              { id: 'a1', role: 'assistant', content: 'Chọn giờ', cards: [] },
              { id: 'u2', role: 'user', content: 'Đã lưu', createdAt: later },
              { id: 'a2', role: 'assistant', content: 'Ok', cards: [], createdAt: later },
            ],
          },
        },
        'req',
        's1',
      ),
    );
    expect(state.messagesBySession.s1.map((m) => m.id)).toEqual(['a1', 'u2', 'a2', 'local-2']);
  });

  it('marks a new conversation busy while its session is created', () => {
    let state = reducer(undefined, createAISession.pending('req'));
    expect(state.isCreatingSession).toBe(true);
    expect(reducer(state, createAISession.rejected(null, 'req')).isCreatingSession).toBe(false);
    state = reducer(state, createAISession.fulfilled({ session: { id: 's9', title: 'Mới', messageCount: 0, messageCap: 30 } }, 'req'));
    expect(state.isCreatingSession).toBe(false);
  });

  it('opens a created session and forgets a deleted one', () => {
    let state = reducer(undefined, createAISession.fulfilled({ session: { id: 's9', title: 'Mới', messageCount: 0, messageCap: 30 } }, 'req'));
    expect(state.activeSessionId).toBe('s9');
    expect(state.messagesBySession.s9).toEqual([]);
    state = reducer(state, deleteAISession.fulfilled({ id: 's9' }, 'req', 's9'));
    expect(state.activeSessionId).toBeNull();
    expect(state.sessions).toHaveLength(0);
    expect(reducer(state, setActiveAISession('s1')).activeSessionId).toBe('s1');
  });
});

describe('aiAssistantUtils', () => {
  it('groups sessions by day like the Stitch history', () => {
    const now = new Date('2026-10-25T10:00:00');
    const groups = groupSessionsByDate(
      [
        { id: 'a', lastMessageAt: '2026-10-25T08:00:00' },
        { id: 'b', lastMessageAt: '2026-10-24T20:00:00' },
        { id: 'c', lastMessageAt: '2026-10-20T08:00:00' },
        { id: 'd', lastMessageAt: '2026-09-01T08:00:00' },
      ],
      now,
    );
    expect(groups.map((g) => [g.key, g.sessions.map((s) => s.id)])).toEqual([
      ['today', ['a']],
      ['yesterday', ['b']],
      ['last7Days', ['c']],
      ['older', ['d']],
    ]);
  });

  it('parses paragraphs, bullets and bold without HTML', () => {
    const blocks = parseAIText('Chào **mẹ**!\n<script>x</script>\n\n- Vẽ\n- Bơi');
    expect(blocks[0]).toEqual({
      type: 'paragraph',
      lines: [
        [{ bold: false, text: 'Chào ' }, { bold: true, text: 'mẹ' }, { bold: false, text: '!' }],
        [{ bold: false, text: '<script>x</script>' }],
      ],
    });
    expect(blocks[1]).toEqual({ type: 'list', items: [[{ bold: false, text: 'Vẽ' }], [{ bold: false, text: 'Bơi' }]] });
  });

  it('turns [[section]] into a link to that part of the app, unknown names into plain text', () => {
    const [block] = parseAIText('Xem trong mục [[Hẹn chơi]] hoặc [[Lịch hẹn]] nhé.');
    expect(block.lines[0]).toEqual([
      { bold: false, text: 'Xem trong mục ' },
      { bold: false, text: 'Hẹn chơi', href: '/playdates' },
      { bold: false, text: ' hoặc ' },
      { bold: false, text: 'Lịch hẹn' },
      { bold: false, text: ' nhé.' },
    ]);
    expect(plainAIText('Mở [[Gói hội viên & Hạn mức]] nhé')).toBe('Mở Gói hội viên & Hạn mức nhé');
  });

  it('writes the agenda into the note', () => {
    const note = buildAgendaNote(['Vẽ tranh', ' Vẽ tranh ', 'Picnic'], 'Mang nón');
    expect(note).toBe('Hoạt động chính (gợi ý bởi BuddyLink AI):\n1. Vẽ tranh\n2. Picnic\n\nLưu ý thêm:\n- Mang nón');
    expect(normalizeAgenda(['a', 'b', 'c', 'd', 'e', 'f'])).toHaveLength(5);
  });

  it('opens Google Maps on the place name and address, coordinates only without an address', () => {
    expect(googleMapsSearchUrl({ name: 'Công viên Gia Định', address: 'Hoàng Minh Giám, Gò Vấp', coordinates: [106.67, 10.81] })).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Công viên Gia Định, Hoàng Minh Giám, Gò Vấp')}`,
    );
    expect(googleMapsSearchUrl({ name: 'Sân chơi', coordinates: { type: 'Point', coordinates: [106.67, 10.81] } })).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('10.81,106.67')}`,
    );
    expect(googleMapsSearchUrl({})).toBeNull();
  });

  it('checks the other answers of a choice card with the schema of its step', () => {
    const check = (card, values) => getCustomAnswerSchema(card).safeParse(values);
    expect(check({ stepId: 'time' }, { date: '2001-01-01', time: '09:00' }).success).toBe(false);
    expect(check({ stepId: 'time' }, { date: '2099-01-03', time: '9h' }).success).toBe(false);
    expect(check({ stepId: 'activity' }, { title: ' ' }).success).toBe(false);
    expect(check({ stepId: 'playmates', hostChildId: 'c1' }, { playmates: [] }).success).toBe(false);
    expect(check({ stepId: 'playmates' }, { text: '' }).success).toBe(false);
    expect(check({ stepId: 'child' }, { text: '' }).success).toBe(false);
    expect(check({ stepId: 'place' }, {}).success).toBe(false);
    expect(check({ stepId: 'match_criteria' }, { ageMin: 6, ageMax: 4, maxDistanceKm: 5 }).success).toBe(false);
    expect(check({ stepId: 'match_criteria' }, { ageMin: 3, ageMax: 5, maxDistanceKm: '' }).success).toBe(false);
    expect(check({ stepId: 'confirm' }, {}).success).toBe(false);
    expect(check({ stepId: 'match_criteria' }, { childId: 'c1', ageMin: '3', ageMax: '5', maxDistanceKm: '8', interests: ['Vẽ'] }).data).toEqual({
      childId: 'c1',
      ageMin: 3,
      ageMax: 5,
      maxDistanceKm: 8,
      interests: ['Vẽ'],
    });
  });

  it('builds the answer sent for a checked "other answer"', () => {
    expect(buildCustomAnswer({ stepId: 'time', durationMinutes: 90 }, { date: '2099-01-03', time: '09:30' })).toEqual({
      custom: { date: '2099-01-03', time: '09:30', durationMinutes: 90 },
      label: 'Chọn giờ khác: 03/01/2099 · 09:30',
    });
    expect(buildCustomAnswer({ stepId: 'playmates' }, { text: 'Bin, Mít' })).toEqual({ custom: { text: 'Bin, Mít' }, label: 'Mời: Bin, Mít' });
    expect(buildCustomAnswer({ stepId: 'playmates' }, { playmates: [{ childId: 'c2', name: 'Bin' }, { childId: 'c3', name: 'Mít' }] })).toEqual({
      custom: { childIds: ['c2', 'c3'] },
      label: 'Mời: Bin, Mít',
    });
    expect(buildCustomAnswer({ stepId: 'extra' }, { request: 'Mang nón' }).custom).toEqual({ request: 'Mang nón' });
    expect(buildCustomAnswer({ stepId: 'place' }, { name: 'Công viên', coordinates: { type: 'Point', coordinates: [1, 2] } }).custom.coordinates).toEqual([1, 2]);
    expect(
      buildCustomAnswer({ stepId: 'match_criteria' }, { childId: 'c1', ageMin: 3, ageMax: 5, maxDistanceKm: 8, interests: ['Vẽ', 'Bơi'] }).custom,
    ).toEqual({ childId: 'c1', ageMin: 3, ageMax: 5, maxDistanceKm: 8, interests: ['Vẽ', 'Bơi'] });
  });
});
