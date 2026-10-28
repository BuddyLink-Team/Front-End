import {
  MOCK_AI_LIMITS,
  MOCK_AI_HOST_CHILD,
  MOCK_AI_PLAYMATES,
  MOCK_AI_ACTIVITIES,
  MOCK_AI_PLACES,
  MOCK_AI_MATCHES,
  buildMockTimeSlots,
} from './aiAssistantMockData';
import { buildAgendaNote, choiceMessageText, googleMapsSearchUrl } from '../utils/aiAssistantUtils';

const STORAGE_KEY = 'buddylink_mock_ai_assistant_v1';
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));
const ok = (data, message = 'OK') => ({ success: true, message, data, error: null });
const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const currentMonth = () => new Date().toISOString().slice(0, 7);
const placeLinks = (place) => [
  { kind: 'osm', href: place.osmUrl },
  { kind: 'google_maps', href: googleMapsSearchUrl(place) },
];

const choiceCard = (stepId, title, options, extra = {}) => ({
  type: 'choices',
  stepId,
  title,
  selectionMode: 'single',
  status: 'open',
  selectedOptionIds: [],
  allowCustom: false,
  allowSkip: false,
  options,
  ...extra,
});

/**
 * Scripted assistant for `npm run dev:mock`: same contract as /api/v1/ai-assistant (sessions, quota per
 * session, choice cards for the playdate steps, playdate draft), driven by keywords instead of a model.
 */
class AIAssistantMockService {
  _load() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored && stored.month === currentMonth()) return stored;
    } catch {
      // Storage unavailable or corrupted
    }
    return { month: currentMonth(), used: 0, sessions: {} };
  }

  _save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable
    }
  }

  _fail(code, message, status = 400, details = []) {
    const err = new Error(message);
    err.response = { status, data: { success: false, message, data: null, error: { code, details } } };
    throw err;
  }

  _summary(session) {
    const { id, title, createdAt, updatedAt, lastMessageAt, messageCount } = session;
    return { id, title, createdAt, updatedAt, lastMessageAt, messageCount, messageCap: MOCK_AI_LIMITS.MESSAGES_PER_SESSION };
  }

  _draftResponse(draft) {
    if (!draft) return null;
    const ready = Boolean(draft.date && draft.activity && draft.location && draft.agendaConfirmed && draft.extraDone);
    const nextStep = !draft.date
      ? 'time'
      : !draft.participantsDone
        ? 'playmates'
        : !draft.activity
          ? 'activity'
          : !draft.location
            ? 'place'
            : !draft.agendaConfirmed
              ? 'agenda'
              : !draft.extraDone
                ? 'extra'
                : 'confirm';
    return {
      status: ready ? 'ready' : 'collecting',
      nextStep,
      hostChild: { childId: MOCK_AI_HOST_CHILD.id, displayName: MOCK_AI_HOST_CHILD.displayName },
      hostChildId: MOCK_AI_HOST_CHILD.id,
      scheduledDate: draft.date || null,
      time: draft.time || null,
      endTime: draft.time ? `${String((Number(draft.time.slice(0, 2)) + 2) % 24).padStart(2, '0')}${draft.time.slice(2)}` : null,
      durationMinutes: draft.durationMinutes || 120,
      activity: draft.activity || '',
      agenda: draft.agenda || [],
      location: draft.location || null,
      participants: draft.participants || [],
      extraNote: draft.note || '',
      note: buildAgendaNote(draft.agenda || [], draft.note || ''),
      warnings: [],
    };
  }

  async listSessions({ page = 1, limit = 20 } = {}) {
    await delay(150);
    const all = Object.values(this._load().sessions).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const start = (Number(page) - 1) * Number(limit);
    return ok({
      sessions: all.slice(start, start + Number(limit)).map((s) => this._summary(s)),
      pagination: { page: Number(page), limit: Number(limit), total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)) },
    });
  }

  async createSession() {
    await delay(100);
    const state = this._load();
    const now = new Date().toISOString();
    const session = { id: newId('ai-session'), title: 'Cuộc trò chuyện mới', createdAt: now, updatedAt: now, lastMessageAt: now, messageCount: 0, quotaConsumed: false, draft: null, messages: [] };
    state.sessions[session.id] = session;
    this._save(state);
    return ok({ session: this._summary(session) }, 'Chat session created');
  }

  async getSession(id) {
    await delay(150);
    const session = this._load().sessions[id];
    if (!session) this._fail('AI_SESSION_NOT_FOUND', 'Chat session not found', 404);
    return ok({ session: { ...this._summary(session), planDraft: this._draftResponse(session.draft), messages: session.messages } });
  }

  async deleteSession(id) {
    await delay(100);
    const state = this._load();
    if (!state.sessions[id]) this._fail('AI_SESSION_NOT_FOUND', 'Chat session not found', 404);
    delete state.sessions[id];
    this._save(state);
    return ok(null, 'Chat session deleted');
  }

  async sendMessage(id, { content, choice }) {
    await delay();
    const state = this._load();
    const session = state.sessions[id];
    if (!session) this._fail('AI_SESSION_NOT_FOUND', 'Chat session not found', 404);
    if (session.messageCount >= MOCK_AI_LIMITS.MESSAGES_PER_SESSION) {
      this._fail('AI_SESSION_FULL', 'This conversation is full', 409, { cap: MOCK_AI_LIMITS.MESSAGES_PER_SESSION });
    }
    if (!session.quotaConsumed && state.used >= MOCK_AI_LIMITS.SESSIONS_PER_MONTH) {
      this._fail('QUOTA_EXCEEDED', 'Monthly AI assistant conversation limit reached', 403, {
        feature: 'ai_assistant',
        limit: MOCK_AI_LIMITS.SESSIONS_PER_MONTH,
        currentUsed: state.used,
      });
    }

    const { text, cards, toolsUsed, answeredCard = null } = choice
      ? this._answerChoice(session, choice)
      : this._answerText(session, content);
    if (!session.quotaConsumed) {
      session.quotaConsumed = true;
      state.used += 1;
    }

    const now = new Date().toISOString();
    const userMessage = { id: newId('msg'), role: 'user', content, cards: [], toolsUsed: [], choice: choice || null, createdAt: now };
    const reply = { id: newId('msg'), role: 'assistant', content: text, cards, toolsUsed, choice: null, createdAt: now };
    session.messages.push(userMessage, reply);
    if (!session.messageCount) session.title = content.split('\n')[0].slice(0, 60);
    session.messageCount += 1;
    session.updatedAt = now;
    session.lastMessageAt = now;
    this._save(state);

    return ok({
      session: this._summary(session),
      userMessage,
      reply,
      planDraft: this._draftResponse(session.draft),
      answeredCard,
      quota: { limit: MOCK_AI_LIMITS.SESSIONS_PER_MONTH, used: state.used, remaining: Math.max(0, MOCK_AI_LIMITS.SESSIONS_PER_MONTH - state.used) },
    });
  }

  _answerText(session, content) {
    const text = content.toLowerCase();
    if (/bạn chơi|tìm bạn/.test(text)) {
      const criteria = { childId: MOCK_AI_HOST_CHILD.id, childName: MOCK_AI_HOST_CHILD.displayName, ageMin: 3, ageMax: 5, interests: [], preferInterests: MOCK_AI_HOST_CHILD.interests, maxDistanceKm: 10 };
      return {
        text: `Mình sẽ tìm bạn cho bé ${MOCK_AI_HOST_CHILD.displayName} theo các tiêu chí dưới đây. Bạn xác nhận giúp mình nhé?`,
        toolsUsed: ['getMyChildren', 'findMatches'],
        cards: [
          choiceCard('match_criteria', `Tìm bạn cho ${MOCK_AI_HOST_CHILD.displayName}`, [
            { id: 'criteria:confirm', label: 'Đúng, tìm luôn', description: `3–5 tuổi · ưu tiên bạn thích ${MOCK_AI_HOST_CHILD.interests.join(', ')} · trong 10 km`, data: criteria, links: [] },
          ], { allowCustom: true }),
        ],
      };
    }
    if (/kế hoạch|hẹn|playdate|lịch/.test(text)) {
      session.draft = { durationMinutes: 120 };
      return { text: 'Mình bắt đầu lên kế hoạch nhé. Bạn muốn hẹn vào lúc nào?', toolsUsed: ['proposePlaydate'], cards: [this._timeCard()] };
    }
    if (/địa điểm|công viên|chỗ chơi|vui chơi/.test(text)) {
      return {
        text: 'Đây là vài địa điểm vui chơi gần nhà bạn.',
        toolsUsed: ['findNearbyPlaces'],
        cards: [{ type: 'place_suggestions', items: MOCK_AI_PLACES.map((place) => ({ ...place, links: placeLinks(place) })) }],
      };
    }
    return {
      text: 'Mình có thể giúp bạn:\n- Tìm bạn chơi phù hợp cho bé\n- Gợi ý địa điểm vui chơi gần nhà\n- Lên kế hoạch hẹn chơi từng bước\nBạn muốn bắt đầu với việc nào?',
      toolsUsed: [],
      cards: [],
    };
  }

  _timeCard() {
    return choiceCard(
      'time',
      'Chọn thời gian',
      buildMockTimeSlots().map((slot) => ({
        id: `slot:${slot.date}T${slot.time}`,
        label: `${slot.date.split('-').reverse().slice(0, 2).join('/')} · ${slot.time}`,
        description: `2 giờ · ${slot.matchedParents === slot.totalParents ? 'Hợp lịch ưu tiên của các gia đình' : 'Hợp với 1/2 gia đình'}`,
        data: slot,
        links: [],
      })),
      { allowCustom: true, durationMinutes: 120 },
    );
  }

  _answerChoice(session, choice) {
    const message = session.messages.find((m) => m.id === choice.messageId);
    const card = message?.cards?.find((c) => ['choices', 'playdate_draft'].includes(c.type) && c.stepId === choice.stepId);
    if (!card || card.status !== 'open') this._fail('AI_INVALID_CHOICE', 'This choice is no longer available');
    const picked = (card.options || []).filter((option) => (choice.optionIds || []).includes(option.id));
    const answeredCard = { messageId: message.id, cards: message.cards };
    card.status = 'answered';
    card.selectedOptionIds = choice.optionIds || [];
    if (choice.custom) card.customAnswer = choice.custom;
    const draft = session.draft || (session.draft = { durationMinutes: 120 });

    switch (choice.stepId) {
      case 'match_criteria':
        return {
          text: 'Đây là các bạn phù hợp nhất với bé quanh nhà bạn.',
          toolsUsed: ['findMatches'],
          cards: [{ type: 'match_suggestions', forChildId: MOCK_AI_HOST_CHILD.id, items: MOCK_AI_MATCHES }],
        };
      case 'time': {
        const slot = choice.custom || picked[0].data;
        Object.assign(draft, { date: slot.date, time: slot.time });
        return {
          text: `Đã chốt ${choiceMessageText(picked.length ? picked : [{ label: `${slot.date} ${slot.time}` }]).replace('Chọn: ', '')}. Bạn muốn mời bạn nào?`,
          toolsUsed: [],
          cards: [
            choiceCard(
              'playmates',
              'Mời bạn nào cùng chơi?',
              MOCK_AI_PLAYMATES.map((child) => ({
                id: `playmate:${child.childId}`,
                label: child.displayName,
                description: `${child.age} tuổi · bé nhà ${child.parent.fullName}`,
                badge: null,
                data: child,
                links: [{ kind: 'child_profile', childId: child.childId }],
              })),
              { selectionMode: 'multiple', allowSkip: true },
            ),
          ],
        };
      }
      case 'playmates':
        draft.participants = picked.map((option) => ({
          parentId: option.data.parent.parentId,
          childId: option.data.childId,
          childName: option.data.displayName,
          parentName: option.data.parent.fullName,
        }));
        draft.participantsDone = true;
        return {
          text: 'Các bé sẽ chơi gì nhỉ? Đây là vài gợi ý theo sở thích chung.',
          toolsUsed: [],
          cards: [
            choiceCard(
              'activity',
              'Các bé sẽ chơi gì?',
              MOCK_AI_ACTIVITIES.map((activity) => ({ id: `activity:${activity.key}`, label: activity.title, description: activity.reason, data: activity, links: [] })),
              { allowCustom: true },
            ),
          ],
        };
      case 'activity':
        draft.activity = choice.custom ? choice.custom.title : picked[0].data.title;
        return {
          text: 'Giờ chọn địa điểm nhé, các nơi này nằm giữa các gia đình.',
          toolsUsed: [],
          cards: [
            choiceCard(
              'place',
              'Chọn địa điểm',
              MOCK_AI_PLACES.map((place) => ({ id: `place:${place.id}`, label: place.name, description: place.address, data: place, links: placeLinks(place) })),
              { allowCustom: true },
            ),
          ],
        };
      case 'place': {
        const place = choice.custom || picked[0].data;
        draft.location = {
          name: place.name,
          address: place.address || place.name,
          placeId: place.placeId,
          coordinates: place.coordinates ? { type: 'Point', coordinates: place.coordinates.coordinates || place.coordinates } : undefined,
        };
        draft.agenda = ['Thi xếp Lego theo chủ đề', `${draft.activity} theo nhóm`, 'Trò chơi bịt mắt bắt dê'];
        return {
          text: 'Đây là các hoạt động chính mình gợi ý, bạn sửa thoải mái nhé.',
          toolsUsed: ['proposePlaydate'],
          answeredCard,
          cards: [
            choiceCard(
              'agenda',
              'Hoạt động chính của buổi hẹn',
              draft.agenda.map((item, index) => ({ id: `agenda:${index}`, label: item, description: '', data: {}, links: [] })),
              { allowCustom: true },
            ),
          ],
        };
      }
      case 'agenda':
        draft.agenda = choice.custom?.agenda || draft.agenda;
        draft.agendaConfirmed = true;
        return {
          text: 'Bạn có muốn yêu cầu thêm gì cho buổi hẹn không?',
          toolsUsed: [],
          answeredCard,
          cards: [
            choiceCard(
              'extra',
              'Bạn có muốn yêu cầu thêm gì không?',
              [{ id: 'extra:none', label: 'Không, xem lịch hẹn', description: 'Mình sẽ tổng hợp bảng chi tiết để bạn xác nhận', data: {}, links: [] }],
              { allowCustom: true },
            ),
          ],
        };
      case 'extra':
        draft.extraDone = true;
        if (choice.custom?.request) draft.note = choice.custom.request;
        return {
          text: 'Đây là chi tiết buổi hẹn. Bạn kiểm tra và bấm xác nhận nhé.',
          toolsUsed: [],
          answeredCard,
          cards: [{ type: 'playdate_draft', stepId: 'confirm', status: 'open', draft: this._draftResponse(draft) }],
        };
      case 'confirm':
        card.playdateId = newId('mock-playdate');
        session.draft = null;
        return { text: 'Đã tạo lịch hẹn và gửi lời mời! Chúc các bé có buổi chơi thật vui nhé.', toolsUsed: [], answeredCard, cards: [] };
      default:
        return this._fail('AI_INVALID_CHOICE', 'This choice is no longer available');
    }
  }
}

export const aiAssistantMockService = new AIAssistantMockService();
export default aiAssistantMockService;
