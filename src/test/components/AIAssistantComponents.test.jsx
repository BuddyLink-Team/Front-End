import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { renderWithProviders, screen, fireEvent, waitFor } from '../utils/testUtils';
import authReducer from '../../modules/auth/redux/authSlice';
import childReducer from '../../modules/child/redux/childSlice';
import parentReducer from '../../modules/parent/redux/parentSlice';
import subscriptionReducer from '../../modules/subscription/redux/subscriptionSlice';
import playdateReducer from '../../modules/playdate/redux/playdateSlice';
import discoveryReducer from '../../modules/discovery/redux/discoverySlice';
import aiAssistantReducer from '../../modules/ai-assistant/redux/aiAssistantSlice';
import { ChoiceCard } from '../../modules/ai-assistant/components/ChoiceCard';
import { MessageBubble } from '../../modules/ai-assistant/components/MessageBubble';
import { QuotaBanner } from '../../modules/ai-assistant/components/QuotaBanner';
import { PlaydateDraftCard } from '../../modules/ai-assistant/components/PlaydateDraftCard';
import { AgendaCard } from '../../modules/ai-assistant/components/AgendaCard';
import { AIChatPanel } from '../../modules/ai-assistant/components/AIChatPanel';
import { AIAssistantFab } from '../../modules/ai-assistant/components/AIAssistantFab';
import { aiAssistantApi } from '../../modules/ai-assistant/api/aiAssistantApi';
import { playdateApi } from '../../modules/playdate/api/playdateApi';
import { childApi } from '../../modules/child/api/childApi';
import { subscriptionApi } from '../../modules/subscription/api/subscriptionApi';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({ ...(await importOriginal()), useNavigate: () => mockNavigate }));

vi.mock('../../modules/ai-assistant/api/aiAssistantApi', () => ({
  aiAssistantApi: { createSession: vi.fn(), listSessions: vi.fn(), getSession: vi.fn(), sendMessage: vi.fn(), deleteSession: vi.fn() },
}));
vi.mock('../../modules/playdate/api/playdateApi', () => ({
  playdateApi: { createPlaydate: vi.fn(), getBusyTimes: vi.fn(), getFriends: vi.fn() },
}));
vi.mock('../../modules/child/api/childApi', () => ({ childApi: { getMyChildren: vi.fn() } }));
vi.mock('../../modules/subscription/api/subscriptionApi', () => ({ subscriptionApi: { getMySubscriptionQuota: vi.fn() } }));

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      child: childReducer,
      parent: parentReducer,
      subscription: subscriptionReducer,
      playdate: playdateReducer,
      discovery: discoveryReducer,
      aiAssistant: aiAssistantReducer,
    },
    preloadedState,
  });

const card = (overrides = {}) => ({
  type: 'choices',
  stepId: 'time',
  title: 'Chọn thời gian',
  selectionMode: 'single',
  status: 'open',
  selectedOptionIds: [],
  allowCustom: true,
  allowSkip: false,
  options: [
    { id: 'slot:1', label: 'T7 01/11 · 09:00', description: '2 giờ', links: [] },
    { id: 'slot:2', label: 'CN 02/11 · 09:00', description: '2 giờ', links: [] },
  ],
  ...overrides,
});

const DRAFT = {
  status: 'ready',
  hostChild: { childId: 'child-1', displayName: 'Bé Na' },
  hostChildId: 'child-1',
  scheduledDate: '2099-11-01',
  time: '09:00',
  endTime: '11:00',
  durationMinutes: 120,
  activity: 'Vẽ tranh',
  agenda: ['Vẽ tranh màu nước', 'Picnic'],
  location: { name: 'Công viên A', address: '1 Đường A', placeId: 'osm-1', coordinates: { type: 'Point', coordinates: [106.7, 10.8] } },
  placeDetails: {
    placeType: 'park',
    openingHours: '05:00-22:00',
    osmUrl: 'https://www.openstreetmap.org/way/1',
    familyDistances: [{ label: 'Nhà bạn', distanceKm: 1.2 }, { label: 'Mẹ Lan', distanceKm: 2.4 }],
  },
  participants: [{ parentId: 'p2', childId: 'c2', childName: 'Bin', parentName: 'Mẹ Lan' }],
  note: 'Hoạt động chính (gợi ý bởi BuddyLink AI):\n• Vẽ tranh màu nước\n• Picnic\n\nMang nón',
  extraNote: 'Mang nón',
  warnings: [{ code: 'UNUSUAL_HOUR' }],
};

beforeEach(() => {
  vi.clearAllMocks();
  playdateApi.getBusyTimes.mockResolvedValue({ data: { busy: [] } });
  playdateApi.getFriends.mockResolvedValue({ data: { matched: [], others: [] } });
  childApi.getMyChildren.mockResolvedValue({ data: [{ id: 'child-1', displayName: 'Bé Na' }] });
  subscriptionApi.getMySubscriptionQuota.mockResolvedValue({
    data: { isPremium: false, effectivePlanCode: 'free', subscription: null, usage: { ai_assistant: { limit: 5, used: 2, remaining: 3 } } },
  });
});

describe('ChoiceCard', () => {
  it('answers a single choice with one tap', () => {
    const onChoose = vi.fn();
    renderWithProviders(<ChoiceCard card={card()} onChoose={onChoose} />);
    fireEvent.click(screen.getByRole('button', { name: /T7 01\/11/ }));
    expect(onChoose).toHaveBeenCalledWith({ optionIds: ['slot:1'] });
  });

  it('collects several playmates, can skip, and opens their profile', () => {
    const onChoose = vi.fn();
    const onViewChild = vi.fn();
    renderWithProviders(
      <ChoiceCard
        card={card({
          stepId: 'playmates',
          selectionMode: 'multiple',
          allowSkip: true,
          allowCustom: false,
          options: [
            { id: 'playmate:a', label: 'Bin', links: [{ kind: 'child_profile', childId: 'a' }] },
            { id: 'playmate:b', label: 'Na', links: [] },
          ],
        })}
        onChoose={onChoose}
        onViewChild={onViewChild}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /^Bin/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Na/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Xong (2)' }));
    expect(onChoose).toHaveBeenCalledWith({ optionIds: ['playmate:a', 'playmate:b'] });

    fireEvent.click(screen.getByRole('button', { name: 'Xem hồ sơ' }));
    expect(onViewChild).toHaveBeenCalledWith('a');
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua' }));
    expect(onChoose).toHaveBeenLastCalledWith({ optionIds: ['__skip'], label: 'Bỏ qua bước này' });
  });

  it('sends another time typed by the parent', async () => {
    const onChoose = vi.fn();
    renderWithProviders(<ChoiceCard card={card({ durationMinutes: 90 })} onChoose={onChoose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Chọn giờ khác' }));
    fireEvent.change(screen.getByLabelText('Ngày'), { target: { value: '2099-01-03' } });
    fireEvent.change(screen.getByLabelText('Giờ'), { target: { value: '10:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
    await waitFor(() =>
      expect(onChoose).toHaveBeenCalledWith({
        custom: { date: '2099-01-03', time: '10:30', durationMinutes: 90 },
        label: 'Chọn giờ khác: 03/01/2099 · 10:30',
      }),
    );
  });

  it('sends connection requests to the children the parent named, already ticked', () => {
    const onChoose = vi.fn();
    renderWithProviders(
      <ChoiceCard
        card={card({
          stepId: 'connect',
          title: 'Gửi lời mời kết bạn',
          selectionMode: 'multiple',
          allowCustom: false,
          preselectedOptionIds: ['connect:a', 'connect:b'],
          options: [
            { id: 'connect:a', label: 'Bống', links: [] },
            { id: 'connect:b', label: 'Mít', links: [] },
            { id: 'connect:c', label: 'Tôm', links: [] },
          ],
        })}
        onChoose={onChoose}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời (2)' }));
    expect(onChoose).toHaveBeenCalledWith({ optionIds: ['connect:a', 'connect:b'] });
  });

  it('searches the friends\' children by name, without accents, instead of typing a name', async () => {
    playdateApi.getFriends.mockResolvedValue({
      data: {
        matched: [{ child: { id: 'c-thu', displayName: 'Minh Thư', age: 5 }, parent: { fullName: 'Mẹ Lan' } }],
        others: [{ child: { id: 'c-an', displayName: 'Thiên Ân', age: 4 }, parent: { fullName: 'Bố Hùng' } }],
      },
    });
    const onChoose = vi.fn();
    renderWithProviders(
      <ChoiceCard
        card={card({
          stepId: 'playmates',
          selectionMode: 'multiple',
          allowSkip: true,
          hostChildId: 'child-1',
          options: [{ id: 'playmate:a', label: 'Bin', links: [] }],
        })}
        onChoose={onChoose}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tìm bạn khác' }));
    expect(playdateApi.getFriends).toHaveBeenCalledWith({ childId: 'child-1', limit: 100 });
    fireEvent.change(await screen.findByLabelText('Tìm bạn muốn mời'), { target: { value: 'thu' } });
    expect(screen.queryByRole('option', { name: /Thiên Ân/ })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('option', { name: /Minh Thư/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
    await waitFor(() => expect(onChoose).toHaveBeenCalledWith({ custom: { childIds: ['c-thu'] }, label: 'Mời: Minh Thư' }));
  });

  it('asks to pick a friend before sending the search', async () => {
    const onChoose = vi.fn();
    renderWithProviders(
      <ChoiceCard card={card({ stepId: 'playmates', selectionMode: 'multiple', hostChildId: 'child-1', options: [] })} onChoose={onChoose} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tìm bạn khác' }));
    expect(await screen.findByText('Bạn chưa kết nối với gia đình nào.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
    expect(await screen.findByText('Vui lòng chọn ít nhất một bạn.')).toBeInTheDocument();
    expect(onChoose).not.toHaveBeenCalled();
  });

  it('still takes a typed name on playmate cards of older sessions (no search)', async () => {
    const onChoose = vi.fn();
    renderWithProviders(
      <ChoiceCard
        card={card({ stepId: 'playmates', selectionMode: 'multiple', allowSkip: true, options: [{ id: 'playmate:a', label: 'Bin', links: [] }] })}
        onChoose={onChoose}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tìm bạn khác' }));
    fireEvent.change(screen.getByLabelText('Tên các bạn muốn mời'), { target: { value: 'Bống, Mít' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
    await waitFor(() => expect(onChoose).toHaveBeenCalledWith({ custom: { text: 'Bống, Mít' }, label: 'Mời: Bống, Mít' }));
  });

  it('picks interests of the search criteria from a list', async () => {
    const onChoose = vi.fn();
    renderWithProviders(
      <ChoiceCard
        card={card({
          stepId: 'match_criteria',
          options: [{ id: 'criteria:confirm', label: 'Đúng, tìm luôn', links: [], data: { childId: 'c1', ageMin: 3, ageMax: 5, maxDistanceKm: 10, interests: [] } }],
        })}
        onChoose={onChoose}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sửa tiêu chí' }));
    fireEvent.change(screen.getByLabelText('Sở thích (không bắt buộc)'), { target: { value: 'khung long' } });
    fireEvent.click(screen.getByRole('option', { name: 'Khủng long' }));
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
    await waitFor(() =>
      expect(onChoose).toHaveBeenCalledWith(
        expect.objectContaining({ custom: { childId: 'c1', ageMin: 3, ageMax: 5, maxDistanceKm: 10, interests: ['Khủng long'] } }),
      ),
    );
  });

  it('shows the error of each field and sends nothing while the criteria are wrong', async () => {
    const onChoose = vi.fn();
    renderWithProviders(
      <ChoiceCard
        card={card({
          stepId: 'match_criteria',
          options: [{ id: 'criteria:confirm', label: 'Đúng, tìm luôn', links: [], data: { childId: 'c1', ageMin: 3, ageMax: 5, maxDistanceKm: 10, interests: [] } }],
        })}
        onChoose={onChoose}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sửa tiêu chí' }));
    fireEvent.change(screen.getByLabelText('Đến tuổi'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Trong (km)'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
    expect(await screen.findByText('Khoảng cách từ 1 đến 50 km.')).toBeInTheDocument();

    // The age order is checked once every field is valid
    fireEvent.change(screen.getByLabelText('Trong (km)'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
    expect(await screen.findByText('Tuổi lớn nhất không nhỏ hơn tuổi nhỏ nhất.')).toBeInTheDocument();
    expect(onChoose).not.toHaveBeenCalled();
  });

  it('is read only once answered', () => {
    const onChoose = vi.fn();
    renderWithProviders(<ChoiceCard card={card({ status: 'answered', selectedOptionIds: ['slot:2'] })} onChoose={onChoose} />);
    expect(screen.getByText('Đã chọn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CN 02\/11/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /T7 01\/11/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Chọn giờ khác' })).not.toBeInTheDocument();
  });
});

describe('MessageBubble', () => {
  const handlers = { onChoose: vi.fn(), onViewChild: vi.fn(), onUsePlace: vi.fn(), isPlanActive: true, latestDraftMessageId: null };

  it('shows the assistant reply with the tools used and its cards', () => {
    renderWithProviders(
      <MessageBubble
        message={{ id: 'a1', role: 'assistant', content: 'Bạn chọn giờ nhé', cards: [card()], toolsUsed: ['proposePlaydate'] }}
        onRetry={vi.fn()}
        cardHandlers={handlers}
      />,
    );
    expect(screen.getByText('Bạn chọn giờ nhé')).toBeInTheDocument();
    expect(screen.getByText(/Đã dùng: Kế hoạch hẹn chơi/)).toBeInTheDocument();
    expect(screen.getByText('Chọn thời gian')).toBeInTheDocument();
  });

  it('offers a retry for a failed message, but not when the quota is used up', () => {
    const onRetry = vi.fn();
    const failed = { id: 'l1', localId: 'l1', role: 'user', content: 'Xin chào', status: 'failed', errorCode: 'AI_PROVIDER_ERROR' };
    const { rerender } = renderWithProviders(<MessageBubble message={failed} onRetry={onRetry} cardHandlers={handlers} />);
    fireEvent.click(screen.getByRole('button', { name: /Thử lại/ }));
    expect(onRetry).toHaveBeenCalledWith(failed);

    rerender(<MessageBubble message={{ ...failed, errorCode: 'QUOTA_EXCEEDED' }} onRetry={onRetry} cardHandlers={handlers} />);
    expect(screen.queryByRole('button', { name: /Thử lại/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nâng cấp Premium' })).toHaveAttribute('href', '/subscription');
  });
});

describe('QuotaBanner', () => {
  it('shows the conversations left this month', () => {
    renderWithProviders(<QuotaBanner quota={{ isUnlimited: false, isExhausted: false, limit: 5, used: 2, remaining: 3 }} />);
    expect(screen.getByText(/cuộc trò chuyện AI tháng này/)).toHaveTextContent('Còn 3/5');
  });

  it('asks to upgrade when the quota is used up', () => {
    renderWithProviders(<QuotaBanner quota={{ isUnlimited: false, isExhausted: true, limit: 5, used: 5, remaining: 0 }} />);
    expect(screen.getByText(/đã dùng hết 5 cuộc trò chuyện/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Nâng cấp Premium/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/subscription');
  });

  it('warns when the conversation is almost full', () => {
    renderWithProviders(
      <QuotaBanner quota={{ isUnlimited: true, isExhausted: false, limit: -1, used: 0, remaining: null }} messagesLeft={3} isSessionBilled />,
    );
    expect(screen.getByText('Cuộc trò chuyện sắp đầy (còn 3 tin).')).toBeInTheDocument();
  });
});

describe('AgendaCard', () => {
  const agendaCard = (overrides = {}) =>
    card({
      stepId: 'agenda',
      title: 'Hoạt động chính của buổi hẹn',
      options: [
        { id: 'agenda:0', label: 'Thi xếp Lego', links: [] },
        { id: 'agenda:1', label: 'Vẽ tranh màu nước', links: [] },
      ],
      ...overrides,
    });

  it('sends the main activities as the parent edited them', () => {
    const onChoose = vi.fn();
    renderWithProviders(<AgendaCard card={agendaCard()} onChoose={onChoose} />);
    fireEvent.change(screen.getByLabelText('Hoạt động chính 2'), { target: { value: 'Kéo co' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xóa hoạt động 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Thêm hoạt động' }));
    fireEvent.change(screen.getByLabelText('Hoạt động chính 2'), { target: { value: 'Bịt mắt bắt dê' } });
    fireEvent.click(screen.getByRole('button', { name: 'Dùng các hoạt động này' }));
    expect(onChoose).toHaveBeenCalledWith({ custom: { agenda: ['Kéo co', 'Bịt mắt bắt dê'] }, label: 'Dùng các hoạt động chính này' });
  });

  it('shows the kept list read only once sent', () => {
    renderWithProviders(<AgendaCard card={agendaCard({ status: 'answered', customAnswer: { agenda: ['Kéo co'] } })} onChoose={vi.fn()} />);
    expect(screen.getByText('Kéo co')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Dùng các hoạt động này' })).not.toBeInTheDocument();
  });
});

describe('PlaydateDraftCard', () => {
  it('shows every detail of the playdate like its detail page, with its warnings and the confirm button', () => {
    const onConfirm = vi.fn();
    renderWithProviders(<PlaydateDraftCard card={{ type: 'playdate_draft', stepId: 'confirm', status: 'open', draft: DRAFT }} onConfirm={onConfirm} />, {
      store: makeStore(),
    });
    expect(screen.getByText('Bé Na')).toBeInTheDocument();
    expect(screen.getByText('Mẹ Lan')).toBeInTheDocument();
    expect(screen.getByText('Sẽ được mời')).toBeInTheDocument();
    expect(screen.getByText('09:00 - 11:00')).toBeInTheDocument();
    expect(screen.getByText('2 giờ')).toBeInTheDocument();
    expect(screen.getByText('Công viên A')).toBeInTheDocument();
    // Same details as the place step: type, address, distance to each family, opening hours, map links
    expect(screen.getByText('Công viên · 1 Đường A')).toBeInTheDocument();
    expect(screen.getByText(/Nhà bạn 1,2 km · Mẹ Lan 2,4 km/)).toBeInTheDocument();
    expect(screen.getByText(/05:00-22:00/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /OpenStreetMap/ })).toHaveAttribute('href', 'https://www.openstreetmap.org/way/1');
    expect(screen.getByRole('link', { name: /Google Maps/ })).toHaveAttribute(
      'href',
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Công viên A, 1 Đường A')}`,
    );
    expect(screen.getByText('Vẽ tranh màu nước')).toBeInTheDocument();
    expect(screen.getByText('Mang nón')).toBeInTheDocument();
    expect(screen.getByText(/khá sớm hoặc khá muộn/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận tạo lịch hẹn' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('links to the created playdate and cannot be confirmed again', () => {
    renderWithProviders(
      <PlaydateDraftCard card={{ type: 'playdate_draft', stepId: 'confirm', status: 'answered', playdateId: 'pd-1', draft: DRAFT }} onConfirm={vi.fn()} />,
      { store: makeStore() },
    );
    expect(screen.getByRole('link', { name: /Xem lịch hẹn/ })).toHaveAttribute('href', '/playdates/pd-1');
    expect(screen.queryByRole('button', { name: 'Xác nhận tạo lịch hẹn' })).not.toBeInTheDocument();
  });
});

describe('AIChatPanel', () => {
  it('starts a conversation with a quick prompt and shows the typing indicator, then the reply', async () => {
    aiAssistantApi.createSession.mockResolvedValue({ data: { session: { id: 's1', title: 'Cuộc trò chuyện mới', messageCount: 0, messageCap: 30 } } });
    let resolveReply;
    aiAssistantApi.sendMessage.mockReturnValue(new Promise((resolve) => (resolveReply = resolve)));

    renderWithProviders(<AIChatPanel />, { store: makeStore() });
    fireEvent.click(screen.getByRole('button', { name: /Tìm bạn chơi cho bé/ }));

    await waitFor(() => expect(aiAssistantApi.sendMessage).toHaveBeenCalledWith('s1', { content: 'Tìm bạn chơi phù hợp cho bé nhà mình' }));
    expect(await screen.findByRole('status', { name: 'BuddyLink AI đang soạn' })).toBeInTheDocument();
    expect(screen.getByLabelText('Tin nhắn cho Trợ lý AI')).toBeDisabled();

    resolveReply({
      data: {
        session: { id: 's1', title: 'Tìm bạn chơi phù hợp cho bé nhà mình', messageCount: 1, messageCap: 30 },
        userMessage: { id: 'u1', role: 'user', content: 'Tìm bạn chơi phù hợp cho bé nhà mình', createdAt: new Date().toISOString() },
        reply: { id: 'a1', role: 'assistant', content: 'Mình tìm theo tiêu chí này nhé?', cards: [], toolsUsed: [], createdAt: new Date().toISOString() },
        planDraft: null,
        quota: { limit: 5, used: 3, remaining: 2 },
      },
    });
    expect(await screen.findByText('Mình tìm theo tiêu chí này nhé?')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tìm bạn chơi phù hợp cho bé nhà mình' })).toBeInTheDocument();
    expect(screen.getByText(/cuộc trò chuyện AI tháng này/)).toHaveTextContent('Còn 2/5');
  });

  it('disables the input of a new conversation when the quota is used up', async () => {
    subscriptionApi.getMySubscriptionQuota.mockResolvedValue({
      data: { isPremium: false, effectivePlanCode: 'free', subscription: null, usage: { ai_assistant: { limit: 5, used: 5, remaining: 0 } } },
    });
    renderWithProviders(<AIChatPanel />, { store: makeStore() });
    expect(await screen.findByText(/đã dùng hết 5 cuộc trò chuyện/)).toBeInTheDocument();
    expect(screen.getByLabelText('Tin nhắn cho Trợ lý AI')).toBeDisabled();
  });
});

describe('AIAssistantFab', () => {
  const parentState = () => ({
    auth: { ...authReducer(undefined, { type: '@@init' }), isAuthenticated: true, user: { role: 'parent' } },
  });

  beforeEach(() => sessionStorage.clear());

  it('shows a round chat bubble with a reminder message that opens the drawer', async () => {
    const store = makeStore(parentState());
    renderWithProviders(<AIAssistantFab />, { store, route: '/playdates' });

    expect(screen.getByRole('button', { name: 'Mở Trợ lý BuddyLink AI' })).toBeInTheDocument();
    const reminder = await screen.findByText('Hỏi BuddyLink AI', {}, { timeout: 3000 });
    fireEvent.click(reminder);
    expect(store.getState().aiAssistant.isDrawerOpen).toBe(true);
  });

  it('hides the reminder for the session once dismissed', async () => {
    renderWithProviders(<AIAssistantFab />, { store: makeStore(parentState()), route: '/playdates' });
    fireEvent.click(await screen.findByRole('button', { name: 'Ẩn lời nhắc' }, { timeout: 3000 }));
    expect(screen.queryByText('Hỏi BuddyLink AI')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('buddylink_ai_fab_reminder_dismissed')).toBe('1');
    expect(screen.getByRole('button', { name: 'Mở Trợ lý BuddyLink AI' })).toBeInTheDocument();
  });

  it('is not shown to visitors who are not signed in', () => {
    renderWithProviders(<AIAssistantFab />, { store: makeStore(), route: '/login' });
    expect(screen.queryByRole('button', { name: 'Mở Trợ lý BuddyLink AI' })).not.toBeInTheDocument();
  });
});
