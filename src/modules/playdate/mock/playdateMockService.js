import { getPlaydateStart, hasPlaydateStarted, addMinutesToTime } from '../utils/playdateTime';
import {
  MOCK_CURRENT_PARENT,
  MOCK_HOST_CHILDREN,
  MOCK_FRIENDS,
  MOCK_CHILD_PAIRS,
  MOCK_PLAYMATE_SCORES,
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
   * Reject like the real API: { message, error: { code } } with an HTTP status
   */
  _fail(code, message, status = 400) {
    const err = new Error(message);
    err.response = { status, data: { success: false, message, error: { code } } };
    throw err;
  }

  _findIndexOrFail(playdates, id) {
    const idx = playdates.findIndex((p) => (p.id || p._id) === id);
    if (idx === -1) this._fail('PLAYDATE_NOT_FOUND', 'Playdate not found', 404);
    return idx;
  }

  _assertUpcoming(playdate) {
    if (playdate.status === 'completed') this._fail('ALREADY_COMPLETED', 'Playdate already completed');
    if (playdate.status === 'cancelled') this._fail('ALREADY_CANCELLED', 'Playdate already cancelled');
  }

  // Cancel a pending reschedule when the playdate is closed (same as the API)
  _cancelPendingReschedule(playdateId) {
    const reschedules = this._getStoredReschedules();
    if (reschedules[playdateId]?.status === 'pending') {
      reschedules[playdateId] = { ...reschedules[playdateId], status: 'cancelled', resolvedAt: new Date().toISOString() };
      this._saveStoredReschedules(reschedules);
    }
  }

  // Same fields as RescheduleResponseDTO.toResponse(request, currentParentId)
  _toRescheduleResponse(request) {
    if (!request) return null;
    const myResponse = (request.responses || []).find((r) => r.parentId === MOCK_CURRENT_PARENT.id);
    return {
      ...request,
      isRequester: request.requestedBy?.id === MOCK_CURRENT_PARENT.id,
      myVote: myResponse ? myResponse.status : null,
    };
  }

  /**
   * GET /api/v1/playdates/:id (Single playdate details)
   */
  async getPlaydateById(id) {
    await delay();
    const playdates = this._getStoredPlaydates();
    const found = playdates[this._findIndexOrFail(playdates, id)];

    return {
      success: true,
      message: 'Playdate retrieved successfully',
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

    // Same past check as the API (calendar date + start of the time slot)
    if (getPlaydateStart(payload.scheduledDate, payload.time).getTime() <= Date.now()) {
      this._fail('PLAYDATE_IN_PAST', 'Playdate must start in the future');
    }

    // Resolve host child details
    const selectedChild =
      MOCK_HOST_CHILDREN.find((c) => (c.id || c._id) === payload.hostChildId) ||
      MOCK_HOST_CHILDREN[0];

    // Only connected friends can be invited
    const formattedParticipants = (payload.participants || []).map((p) => {
      const friend = MOCK_FRIENDS.find((f) => (f.id || f._id) === p.parentId);
      if (!friend) this._fail('NOT_CONNECTED_FRIEND', 'Participant is not a connected friend');
      const child = friend.children?.find((c) => (c.id || c._id) === p.childId);
      if (!child) this._fail('INVALID_PARTICIPANT_CHILD', 'Child does not belong to the invited parent');
      return {
        parentId: p.parentId,
        parent: {
          id: p.parentId,
          fullName: friend.fullName,
          avatarUrl: friend.avatarUrl || '',
          isVerified: true,
        },
        child: {
          id: p.childId,
          displayName: child.displayName,
        },
        status: 'pending',
      };
    });

    const durationMinutes = payload.durationMinutes || 120;
    const newPlaydate = {
      id: newId,
      _id: newId,
      activity: payload.activity,
      scheduledDate: payload.scheduledDate,
      time: payload.time,
      durationMinutes,
      endTime: addMinutesToTime(payload.time, durationMinutes),
      location: payload.location,
      note: payload.note || '',
      status: 'upcoming',
      displayStatus: formattedParticipants.length > 0 ? 'pending' : 'confirmed',
      isHost: true,
      myParticipantStatus: 'host',
      chatConversationId: `mock-conv-${Date.now()}`,
      hostParent: {
        id: MOCK_CURRENT_PARENT.id,
        fullName: MOCK_CURRENT_PARENT.fullName,
        avatarUrl: MOCK_CURRENT_PARENT.avatarUrl,
        isVerified: true,
        location: { area: MOCK_CURRENT_PARENT.location?.area, city: MOCK_CURRENT_PARENT.location?.city },
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
      message: 'Playdate created successfully',
      data: { ...newPlaydate, warnings: [] },
    };
  }

  /**
   * GET /api/v1/playdates/friends (Invitable connected friends, array like the API).
   * With ?childId=: the friends' children ranked for that child ({ matched, others }).
   */
  async getFriends(params = {}) {
    await delay();
    if (!params.childId) {
      return { success: true, message: 'Invitable friends retrieved successfully', data: MOCK_FRIENDS };
    }

    const pairs = MOCK_CHILD_PAIRS[params.childId] || {};
    const search = (params.search || '').trim().toLowerCase();
    const entries = MOCK_FRIENDS.filter((friend) => !search || friend.fullName.toLowerCase().includes(search)).flatMap(
      (friend) =>
        (friend.children || []).map((child) => ({
          parent: {
            id: friend.id,
            fullName: friend.fullName,
            avatarUrl: friend.avatarUrl || '',
            isVerified: Boolean(friend.isVerified),
            location: friend.location,
          },
          child: {
            id: child.id,
            displayName: child.displayName,
            age: Math.floor(child.age),
            gender: child.gender,
            interests: child.interests || [],
          },
          matchScore: MOCK_PLAYMATE_SCORES[child.id] ?? 50,
          source: pairs[child.id] || null,
          warnings: [],
        }))
    );
    const byScore = (a, b) => b.matchScore - a.matchScore;
    return {
      success: true,
      message: 'Connected friends retrieved successfully',
      data: {
        matched: entries.filter((e) => e.source).sort(byScore),
        others: entries.filter((e) => !e.source).sort(byScore),
      },
    };
  }

  /**
   * GET /api/v1/playdates/busy-times: the host child's other upcoming mock playdates that day
   */
  async getBusyTimes(params = {}) {
    await delay();
    const busy = this._getStoredPlaydates()
      .filter(
        (p) =>
          p.status === 'upcoming' &&
          p.id !== params.excludePlaydateId &&
          (p.hostChild?.id || p.hostChildId) === params.childId &&
          String(p.scheduledDate).slice(0, 10) === params.date
      )
      .map((p) => {
        const startsAt = getPlaydateStart(p.scheduledDate, p.time);
        const endsAt = new Date(startsAt.getTime() + (p.durationMinutes || 120) * 60000);
        return {
          childId: params.childId,
          childName: p.hostChild?.displayName || 'Bé',
          isOwnChild: true,
          start: p.time,
          end: addMinutesToTime(p.time, p.durationMinutes || 120),
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          playdateId: p.id,
        };
      });
    return { success: true, message: 'Busy times retrieved successfully', data: { date: params.date, busy } };
  }

  /**
   * GET /api/v1/playdates/suggestions/time-slots: the next weekend mornings / afternoon
   */
  async getTimeSlotSuggestions(params = {}) {
    await delay();
    const toDay = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const saturday = new Date();
    saturday.setDate(saturday.getDate() + (((6 - saturday.getDay() + 7) % 7) || 7));
    const sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
    const totalParents = 1 + (params.participantChildIds ? params.participantChildIds.split(',').length : 0);
    const slot = (date, time, timeSlot, matchedParents) => ({
      date: toDay(date),
      time,
      durationMinutes: Number(params.durationMinutes) || 120,
      dayType: 'weekend',
      timeSlot,
      matchedParents,
      totalParents,
    });
    return {
      success: true,
      message: 'Time slot suggestions retrieved successfully',
      data: {
        slots: [
          slot(saturday, '09:00', 'morning', totalParents),
          slot(sunday, '09:00', 'morning', totalParents),
          slot(saturday, '15:00', 'afternoon', 1),
        ],
      },
    };
  }

  /**
   * GET /api/v1/playdates/suggestions/places: nearest mock places, parks first
   */
  async getPlaceSuggestions() {
    await delay();
    const places = [...MOCK_NEARBY_PLACES]
      .sort((a, b) => Number(b.placeType === 'park') - Number(a.placeType === 'park') || a.distanceMeters - b.distanceMeters)
      .slice(0, 4)
      .map((place) => ({
        id: place.id,
        placeId: place.placeId,
        name: place.name,
        type: place.placeType,
        address: place.address,
        openingHours: place.openingHours || '',
        coordinates: place.coordinates,
        osmUrl: place.osmUrl,
        isPreferredType: place.placeType === 'park',
        // From each family's ward center (the caller first)
        familyDistances: [
          { parentId: MOCK_CURRENT_PARENT.id, label: 'Nhà bạn', area: MOCK_CURRENT_PARENT.location.area, distanceKm: Math.round(place.distanceMeters / 100) / 10 },
          { parentId: 'parent-friend-2', label: 'Mẹ Hà', area: 'Phường Đa Kao', distanceKm: Math.round(place.distanceMeters / 80) / 10 },
        ],
      }));
    return { success: true, message: 'Place suggestions retrieved successfully', data: { places } };
  }

  /**
   * GET /api/v1/playdates/suggestions/activities: activities with a reason
   */
  async getActivitySuggestions(params = {}) {
    await delay();
    const host = MOCK_HOST_CHILDREN.find((c) => c.id === params.childId) || MOCK_HOST_CHILDREN[0];
    const hasGuests = Boolean(params.participantChildIds);
    return {
      success: true,
      message: 'Activity suggestions retrieved successfully',
      data: {
        activities: [
          {
            key: 'Xếp hình Lego',
            title: 'Buổi chơi xếp hình Lego & giao lưu',
            placeTypes: ['kids_cafe', 'library'],
            durationMinutes: 120,
            sharedCount: hasGuests ? 2 : 1,
            reason: hasGuests ? 'Cả hai bé đều thích xếp hình lego' : `${host.displayName} thích xếp hình lego`,
          },
          {
            key: 'Đạp xe công viên',
            title: 'Đạp xe cùng nhau ở công viên',
            placeTypes: ['park'],
            durationMinutes: 90,
            sharedCount: 1,
            reason: `${host.displayName} thích đạp xe công viên`,
          },
        ],
      },
    };
  }

  /**
   * PATCH /api/v1/playdates/:id/complete (Host marks playdate as completed)
   */
  async completePlaydate(id) {
    await delay();
    const playdates = this._getStoredPlaydates();
    const idx = this._findIndexOrFail(playdates, id);
    const playdate = playdates[idx];

    if (!playdate.isHost) this._fail('FORBIDDEN_COMPLETE_PLAYDATE', 'Only the host can complete this playdate', 403);
    this._assertUpcoming(playdate);
    if (!hasPlaydateStarted(playdate.scheduledDate, playdate.time)) {
      this._fail('CANNOT_COMPLETE_YET', 'Playdate can only be completed after it starts');
    }

    playdates[idx] = {
      ...playdate,
      status: 'completed',
      displayStatus: 'completed',
      completedAt: new Date().toISOString(),
    };
    this._saveStoredPlaydates(playdates);
    this._cancelPendingReschedule(id);

    return {
      success: true,
      message: 'Playdate completed successfully',
      data: playdates[idx],
    };
  }

  /**
   * PATCH /api/v1/playdates/:id/cancel (Host cancels playdate)
   */
  async cancelPlaydate(id, payload = {}) {
    await delay();
    const playdates = this._getStoredPlaydates();
    const idx = this._findIndexOrFail(playdates, id);
    const playdate = playdates[idx];

    if (!playdate.isHost) this._fail('FORBIDDEN_CANCEL_PLAYDATE', 'Only the host can cancel this playdate', 403);
    this._assertUpcoming(playdate);

    playdates[idx] = {
      ...playdate,
      status: 'cancelled',
      displayStatus: 'cancelled',
      cancellation: {
        cancelledBy: MOCK_CURRENT_PARENT.id,
        reason: payload.reason || 'Cancelled by host',
        cancelledAt: new Date().toISOString(),
      },
    };
    this._saveStoredPlaydates(playdates);
    this._cancelPendingReschedule(id);

    return {
      success: true,
      message: 'Playdate cancelled successfully',
      data: playdates[idx],
    };
  }

  /**
   * PUT /api/v1/playdates/:id/respond (RSVP: accept / decline)
   */
  async respondToPlaydate(id, status) {
    await delay();
    const playdates = this._getStoredPlaydates();
    const idx = this._findIndexOrFail(playdates, id);
    const playdate = playdates[idx];

    if (playdate.isHost) this._fail('HOST_CANNOT_RSVP', 'Host does not need to respond');
    if (playdate.status === 'cancelled') this._fail('CANNOT_RESPOND_CANCELLED', 'Playdate is cancelled');
    if (playdate.status === 'completed') this._fail('CANNOT_RESPOND_COMPLETED', 'Playdate is completed');
    const mine = (playdate.participants || []).find((p) => p.parentId === MOCK_CURRENT_PARENT.id);
    if (!mine) this._fail('NOT_INVITED', 'You are not invited to this playdate', 403);
    if (mine.status !== 'pending') this._fail('ALREADY_RESPONDED', 'You already responded to this invitation');

    playdates[idx] = {
      ...playdate,
      myParticipantStatus: status,
      displayStatus: status === 'accepted' ? 'confirmed' : 'cancelled',
      participants: playdate.participants.map((p) => (p.parentId === MOCK_CURRENT_PARENT.id ? { ...p, status } : p)),
    };
    this._saveStoredPlaydates(playdates);

    // A parent who accepts while a reschedule is pending becomes a voter too
    if (status === 'accepted') {
      const reschedules = this._getStoredReschedules();
      const pending = reschedules[id];
      if (pending?.status === 'pending' && !pending.responses.some((r) => r.parentId === MOCK_CURRENT_PARENT.id)) {
        pending.responses.push({ parentId: MOCK_CURRENT_PARENT.id, status: 'pending' });
        this._saveStoredReschedules(reschedules);
      }
    }

    return {
      success: true,
      message: 'Response recorded successfully',
      data: playdates[idx],
    };
  }

  /**
   * GET /api/v1/playdates/:id/reschedule (Latest reschedule request)
   */
  async getReschedule(id) {
    await delay();
    const reschedules = this._getStoredReschedules();
    return {
      success: true,
      message: 'Reschedule request retrieved successfully',
      data: this._toRescheduleResponse(reschedules[id]),
    };
  }

  /**
   * POST /api/v1/playdates/:id/reschedule (Host proposes a new schedule, PROJECT_OVERVIEW 6.2)
   */
  async createReschedule(id, payload) {
    await delay();
    const reschedules = this._getStoredReschedules();
    const playdates = this._getStoredPlaydates();
    const idx = this._findIndexOrFail(playdates, id);
    const playdate = playdates[idx];

    if (!playdate.isHost) this._fail('FORBIDDEN_RESCHEDULE', 'Only the host can propose a reschedule', 403);
    if (playdate.status !== 'upcoming') {
      this._fail('INVALID_PLAYDATE_STATUS_FOR_RESCHEDULE', 'Only upcoming playdates can be rescheduled');
    }
    const { newLocation } = payload;
    if (newLocation && (!newLocation.name?.trim() || !newLocation.address?.trim())) {
      this._fail('INVALID_RESCHEDULE_LOCATION', 'New location needs both a name and an address');
    }
    if (getPlaydateStart(payload.newDate, payload.newStartTime).getTime() <= Date.now()) {
      this._fail('RESCHEDULE_IN_PAST', 'New schedule must be in the future');
    }

    // Voters are the accepted participants; with none, the new schedule applies at once
    const voters = (playdate.participants || []).filter((p) => p.status === 'accepted');
    const isAutoApplied = voters.length === 0;
    const requestId = `resched-mock-${Date.now()}`;

    const proposal = {
      _id: requestId,
      id: requestId,
      playdateId: id,
      status: isAutoApplied ? 'accepted' : 'pending',
      requestedBy: {
        id: MOCK_CURRENT_PARENT.id,
        fullName: MOCK_CURRENT_PARENT.fullName,
      },
      reason: payload.reason,
      newDate: payload.newDate,
      newStartTime: payload.newStartTime,
      newDurationMinutes: payload.newDurationMinutes || null,
      newEndTime: payload.newDurationMinutes ? addMinutesToTime(payload.newStartTime, payload.newDurationMinutes) : null,
      newLocation: newLocation || null,
      responses: voters.map((v) => ({ parentId: v.parentId, status: 'pending' })),
      createdAt: new Date().toISOString(),
      resolvedAt: isAutoApplied ? new Date().toISOString() : null,
    };

    if (isAutoApplied) {
      playdates[idx] = this._applySchedule(playdate, proposal);
      this._saveStoredPlaydates(playdates);
    }
    // A new proposal replaces the previous pending one
    reschedules[id] = proposal;
    this._saveStoredReschedules(reschedules);

    return {
      success: true,
      message: isAutoApplied ? 'Playdate rescheduled successfully' : 'Reschedule request created successfully',
      data: {
        rescheduleRequest: this._toRescheduleResponse(proposal),
        isAutoApplied,
        playdate: playdates[idx],
      },
    };
  }

  _applySchedule(playdate, proposal) {
    const durationMinutes = proposal.newDurationMinutes || playdate.durationMinutes || 120;
    return {
      ...playdate,
      scheduledDate: proposal.newDate,
      time: proposal.newStartTime,
      durationMinutes,
      endTime: addMinutesToTime(proposal.newStartTime, durationMinutes),
      ...(proposal.newLocation?.name ? { location: proposal.newLocation } : {}),
    };
  }

  /**
   * PUT /api/v1/playdates/:id/reschedule/vote (Accepted participants vote; all must agree)
   */
  async voteReschedule(id, payload) {
    await delay();
    const reschedules = this._getStoredReschedules();
    const playdates = this._getStoredPlaydates();
    const idx = this._findIndexOrFail(playdates, id);

    const proposal = reschedules[id];
    if (!proposal || proposal.status !== 'pending' || (payload.requestId && payload.requestId !== proposal.id)) {
      this._fail('RESCHEDULE_NOT_FOUND', 'No pending reschedule request found', 404);
    }
    const myResponse = proposal.responses.find((r) => r.parentId === MOCK_CURRENT_PARENT.id);
    if (!myResponse) this._fail('NOT_AUTHORIZED_TO_VOTE', 'You are not allowed to vote on this request', 403);
    if (myResponse.status !== 'pending') this._fail('ALREADY_VOTED', 'You already voted on this request');

    const { status } = payload; // 'accepted' | 'declined'
    proposal.responses = proposal.responses.map((r) =>
      r.parentId === MOCK_CURRENT_PARENT.id ? { ...r, status, respondedAt: new Date().toISOString() } : r,
    );

    if (status === 'declined') {
      // One decline keeps the old schedule
      proposal.status = 'declined';
      proposal.resolvedAt = new Date().toISOString();
    } else if (proposal.responses.every((r) => r.status === 'accepted')) {
      playdates[idx] = this._applySchedule(playdates[idx], proposal);
      this._saveStoredPlaydates(playdates);
      proposal.status = 'accepted';
      proposal.resolvedAt = new Date().toISOString();
    }

    reschedules[id] = proposal;
    this._saveStoredReschedules(reschedules);

    return {
      success: true,
      message: 'Vote recorded successfully',
      data: {
        rescheduleRequest: this._toRescheduleResponse(proposal),
        playdate: playdates[idx],
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
      message: 'Nearby places retrieved successfully',
      data: list.sort((a, b) => a.distanceMeters - b.distanceMeters),
    };
  }

  /**
   * GET /api/v1/places/:id (Place details)
   */
  async getPlaceById(id) {
    await delay();
    const place = MOCK_NEARBY_PLACES.find((p) => p.id === id);
    if (!place) this._fail('PLACE_NOT_FOUND', 'Place not found', 404);
    return { success: true, message: 'Place retrieved successfully', data: place };
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
