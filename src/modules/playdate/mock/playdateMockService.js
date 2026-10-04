import {
  MOCK_CURRENT_PARENT,
  MOCK_HOST_CHILDREN,
  MOCK_FRIENDS,
  INITIAL_MOCK_PLAYDATES,
  INITIAL_MOCK_RESCHEDULES,
  MOCK_NEARBY_PLACES,
} from './playdateMockData';

const STORAGE_KEY_PLAYDATES = 'buddylink_mock_playdates_v2';
const STORAGE_KEY_RESCHEDULES = 'buddylink_mock_reschedules_v2';

// Small artificial delay to simulate realistic network latency
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

class PlaydateMockService {
  /**
   * Retrieve all mock playdates from localStorage with fallback to default dataset
   */
  _getStoredPlaydates() {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_PLAYDATES) : null;
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Fallback on JSON parse error
    }
    this._saveStoredPlaydates(INITIAL_MOCK_PLAYDATES);
    return [...INITIAL_MOCK_PLAYDATES];
  }

  /**
   * Save playdates list back to localStorage
   */
  _saveStoredPlaydates(list) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_PLAYDATES, JSON.stringify(list));
      }
    } catch (e) {
      // LocalStorage error handling
    }
  }

  /**
   * Retrieve mock reschedules from localStorage
   */
  _getStoredReschedules() {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_RESCHEDULES) : null;
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Fallback
    }
    this._saveStoredReschedules(INITIAL_MOCK_RESCHEDULES);
    return { ...INITIAL_MOCK_RESCHEDULES };
  }

  /**
   * Save mock reschedules back to localStorage
   */
  _saveStoredReschedules(map) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_RESCHEDULES, JSON.stringify(map));
      }
    } catch (e) {
      // LocalStorage error handling
    }
  }

  /**
   * Reset mock data back to clean factory initial state
   */
  resetFactoryData() {
    this._saveStoredPlaydates(INITIAL_MOCK_PLAYDATES);
    this._saveStoredReschedules(INITIAL_MOCK_RESCHEDULES);
  }

  /**
   * GET /api/v1/playdates (List with filter tabs & search)
   */
  async getPlaydates(params = {}) {
    await delay();
    const playdates = this._getStoredPlaydates();
    const { status, search } = params;

    // Filter by search query
    let filtered = [...playdates];
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.activity?.toLowerCase().includes(q) ||
          p.location?.name?.toLowerCase().includes(q) ||
          p.location?.address?.toLowerCase().includes(q)
      );
    }

    // Compute status counts based on full list
    const counts = {
      all: playdates.length,
      upcoming: playdates.filter((p) => p.status === 'upcoming').length,
      pending: playdates.filter(
        (p) =>
          p.status === 'upcoming' &&
          (p.displayStatus === 'pending' || p.myParticipantStatus === 'pending')
      ).length,
      confirmed: playdates.filter(
        (p) =>
          p.status === 'upcoming' &&
          (p.displayStatus === 'confirmed' || p.isHost)
      ).length,
      completed: playdates.filter((p) => p.status === 'completed').length,
      cancelled: playdates.filter((p) => p.status === 'cancelled').length,
    };

    // Filter by tab status
    if (status && status !== 'all') {
      const normalized = status.toLowerCase();
      if (normalized === 'upcoming') {
        filtered = filtered.filter((p) => p.status === 'upcoming');
      } else if (normalized === 'pending') {
        filtered = filtered.filter(
          (p) =>
            p.status === 'upcoming' &&
            (p.displayStatus === 'pending' || p.myParticipantStatus === 'pending')
        );
      } else if (normalized === 'confirmed') {
        filtered = filtered.filter(
          (p) =>
            p.status === 'upcoming' &&
            (p.displayStatus === 'confirmed' || p.isHost)
        );
      } else if (normalized === 'completed') {
        filtered = filtered.filter((p) => p.status === 'completed');
      } else if (normalized === 'cancelled') {
        filtered = filtered.filter((p) => p.status === 'cancelled');
      }
    }

    return {
      success: true,
      message: 'Lấy danh sách cuộc hẹn thành công',
      data: {
        playdates: filtered,
        counts,
        pagination: {
          total: filtered.length,
          page: 1,
          limit: 20,
        },
      },
    };
  }

  /**
   * GET /api/v1/playdates/:id (Single playdate details)
   */
  async getPlaydateById(id) {
    await delay();
    const playdates = this._getStoredPlaydates();
    const found = playdates.find((p) => (p.id || p._id) === id);

    if (!found) {
      const err = new Error('Không tìm thấy cuộc hẹn chơi');
      err.response = { data: { message: 'Không tìm thấy cuộc hẹn chơi', error: { code: 'PLAYDATE_NOT_FOUND' } } };
      throw err;
    }

    return {
      success: true,
      message: 'Lấy chi tiết cuộc hẹn thành công',
      data: found,
    };
  }

  /**
   * POST /api/v1/playdates (Create new playdate)
   */
  async createPlaydate(payload) {
    await delay();
    const playdates = this._getStoredPlaydates();
    const newId = `pd-mock-${Date.now()}`;

    // Resolve host child details
    const selectedChild =
      MOCK_HOST_CHILDREN.find((c) => (c.id || c._id) === payload.hostChildId) ||
      MOCK_HOST_CHILDREN[0];

    // Resolve invited participants details
    const formattedParticipants = (payload.participants || []).map((p) => {
      const friend = MOCK_FRIENDS.find((f) => (f.id || f._id) === p.parentId);
      const child = friend?.children?.find((c) => (c.id || c._id) === p.childId);
      return {
        parentId: p.parentId,
        parent: {
          id: p.parentId,
          fullName: friend?.fullName || 'Phụ huynh khách',
          avatarUrl: friend?.avatarUrl || '',
          isVerified: true,
        },
        child: {
          id: p.childId,
          displayName: child?.displayName || 'Bé khách',
        },
        status: 'pending',
      };
    });

    const newPlaydate = {
      id: newId,
      _id: newId,
      activity: payload.activity,
      scheduledDate: payload.scheduledDate,
      time: payload.time,
      location: payload.location,
      note: payload.note || '',
      status: 'upcoming',
      displayStatus: 'confirmed',
      isHost: true,
      myParticipantStatus: 'host',
      chatConversationId: `mock-conv-${Date.now()}`,
      hostParent: {
        id: MOCK_CURRENT_PARENT.id,
        fullName: MOCK_CURRENT_PARENT.fullName,
        avatarUrl: MOCK_CURRENT_PARENT.avatarUrl,
        isVerified: true,
      },
      hostChild: {
        id: selectedChild.id || selectedChild._id,
        displayName: selectedChild.displayName,
        interests: selectedChild.interests,
      },
      participants: formattedParticipants,
      createdAt: new Date().toISOString(),
    };

    playdates.unshift(newPlaydate);
    this._saveStoredPlaydates(playdates);

    return {
      success: true,
      message: 'Khởi tạo cuộc hẹn chơi thành công!',
      data: newPlaydate,
    };
  }

  /**
   * GET /api/v1/playdates/friends (Invitable connected friends)
   */
  async getFriends() {
    await delay();
    return {
      success: true,
      message: 'Lấy danh sách bạn bè kết nối thành công',
      data: {
        friends: MOCK_FRIENDS,
      },
    };
  }

  /**
   * PATCH /api/v1/playdates/:id/complete (Host marks playdate as completed)
   */
  async completePlaydate(id) {
    await delay();
    const playdates = this._getStoredPlaydates();
    const idx = playdates.findIndex((p) => (p.id || p._id) === id);

    if (idx === -1) {
      throw new Error('Không tìm thấy cuộc hẹn');
    }

    playdates[idx].status = 'completed';
    playdates[idx].displayStatus = 'completed';
    this._saveStoredPlaydates(playdates);

    return {
      success: true,
      message: 'Đã hoàn thành cuộc hẹn chơi thành công',
      data: playdates[idx],
    };
  }

  /**
   * PATCH /api/v1/playdates/:id/cancel (Host cancels playdate)
   */
  async cancelPlaydate(id, payload = {}) {
    await delay();
    const playdates = this._getStoredPlaydates();
    const idx = playdates.findIndex((p) => (p.id || p._id) === id);

    if (idx === -1) {
      throw new Error('Không tìm thấy cuộc hẹn');
    }

    playdates[idx].status = 'cancelled';
    playdates[idx].displayStatus = 'cancelled';
    playdates[idx].cancellationReason = payload.reason || 'Người tổ chức đã hủy cuộc hẹn';
    this._saveStoredPlaydates(playdates);

    return {
      success: true,
      message: 'Đã hủy cuộc hẹn chơi thành công',
      data: playdates[idx],
    };
  }

  /**
   * PUT /api/v1/playdates/:id/respond (RSVP: accept / decline)
   */
  async respondToPlaydate(id, status) {
    await delay();
    const playdates = this._getStoredPlaydates();
    const idx = playdates.findIndex((p) => (p.id || p._id) === id);

    if (idx === -1) {
      throw new Error('Không tìm thấy cuộc hẹn');
    }

    playdates[idx].myParticipantStatus = status;
    playdates[idx].displayStatus = status === 'accepted' ? 'confirmed' : 'declined';

    // Update participant record in array
    if (playdates[idx].participants) {
      playdates[idx].participants = playdates[idx].participants.map((p) =>
        p.parentId === MOCK_CURRENT_PARENT.id ? { ...p, status } : p
      );
    }

    this._saveStoredPlaydates(playdates);

    return {
      success: true,
      message: status === 'accepted' ? 'Đã chấp nhận tham gia cuộc hẹn!' : 'Đã từ chối cuộc hẹn',
      data: playdates[idx],
    };
  }

  /**
   * GET /api/v1/playdates/:id/reschedule (Active reschedule request)
   */
  async getReschedule(id) {
    await delay();
    const reschedules = this._getStoredReschedules();
    return {
      success: true,
      message: 'Thành công',
      data: reschedules[id] || null,
    };
  }

  /**
   * POST /api/v1/playdates/:id/reschedule (Propose reschedule)
   */
  async createReschedule(id, payload) {
    await delay();
    const reschedules = this._getStoredReschedules();
    const playdates = this._getStoredPlaydates();
    const pIdx = playdates.findIndex((p) => (p.id || p._id) === id);

    const proposal = {
      _id: `resched-mock-${Date.now()}`,
      id: `resched-mock-${Date.now()}`,
      playdateId: id,
      status: 'pending',
      requestedBy: {
        id: MOCK_CURRENT_PARENT.id,
        fullName: MOCK_CURRENT_PARENT.fullName,
      },
      reason: payload.reason,
      newDate: payload.newDate,
      newStartTime: payload.newStartTime,
      newLocation: payload.newLocation || { name: 'Địa điểm mới', address: '' },
      responses: [
        {
          parentId: 'parent-friend-1',
          status: 'pending',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    reschedules[id] = proposal;
    this._saveStoredReschedules(reschedules);

    return {
      success: true,
      message: 'Đã gửi đề xuất dời lịch thành công!',
      data: {
        rescheduleRequest: proposal,
        isAutoApplied: false,
        playdate: pIdx !== -1 ? playdates[pIdx] : null,
      },
    };
  }

  /**
   * PUT /api/v1/playdates/:id/reschedule/vote (Vote on reschedule request)
   */
  async voteReschedule(id, payload) {
    await delay();
    const reschedules = this._getStoredReschedules();
    const playdates = this._getStoredPlaydates();

    const proposal = reschedules[id];
    if (!proposal) {
      throw new Error('Không tìm thấy yêu cầu dời lịch');
    }

    const { status } = payload; // 'accepted' | 'declined'

    // Update vote response
    if (proposal.responses) {
      proposal.responses = proposal.responses.map((r) =>
        r.parentId === MOCK_CURRENT_PARENT.id ? { ...r, status } : r
      );
    }

    const pIdx = playdates.findIndex((p) => (p.id || p._id) === id);

    if (status === 'accepted') {
      if (pIdx !== -1) {
        playdates[pIdx].scheduledDate = proposal.newDate;
        playdates[pIdx].time = proposal.newStartTime;
        if (proposal.newLocation?.name) {
          playdates[pIdx].location = proposal.newLocation;
        }
        this._saveStoredPlaydates(playdates);
      }
      proposal.status = 'accepted';
    } else {
      proposal.status = 'declined';
    }

    reschedules[id] = proposal;
    this._saveStoredReschedules(reschedules);

    return {
      success: true,
      message: status === 'accepted' ? 'Đã đồng ý lịch mới!' : 'Đã từ chối đề xuất dời lịch',
      data: {
        rescheduleRequest: proposal,
        playdate: pIdx !== -1 ? playdates[pIdx] : null,
      },
    };
  }

  /**
   * GET /api/v1/places/nearby (Nearby venues adapter)
   */
  async getNearbyPlaces(params = {}) {
    await delay();
    const { type, search, keyword } = params;
    let list = [...MOCK_NEARBY_PLACES];

    if (type && type !== 'all') {
      list = list.filter((p) => p.placeType === type.toLowerCase());
    }

    const term = (search || keyword || '').trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.address?.toLowerCase().includes(term)
      );
    }

    return {
      success: true,
      message: 'Lấy danh sách địa điểm thành công',
      data: list,
    };
  }

  /**
   * Helper mock for Host Children
   */
  async getMyChildren() {
    await delay();
    return {
      success: true,
      message: 'Lấy danh sách bé thành công',
      data: MOCK_HOST_CHILDREN,
    };
  }
}

export const playdateMockService = new PlaydateMockService();
export default playdateMockService;
