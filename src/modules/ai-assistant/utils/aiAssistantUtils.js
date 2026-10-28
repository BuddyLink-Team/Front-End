import { SESSION_GROUPS, AI_LIMITS, AI_STEPS, AI_APP_SECTIONS } from '../constants/aiAssistantConstants';
import { ACTIVITIES, ACTIVITY_GROUPS, toActivityOption } from '../../../constants/activity.constants';
import { POPULAR_INTERESTS } from '../../child/constants/childConstants';

const DAY_MS = 24 * 60 * 60 * 1000;
const AGENDA_NOTE_HEADER = 'Hoạt động chính (gợi ý bởi BuddyLink AI):';
const EXTRA_NOTE_HEADER = 'Lưu ý thêm:';

const startOfDay = (date) => {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

/**
 * Sessions grouped like the Stitch history: today, yesterday, last 7 days, older (order kept)
 * @param {Array<{ updatedAt?: string, lastMessageAt?: string }>} sessions - Most recent first
 * @param {Date} [now]
 * @returns {Array<{ key: string, sessions: Array<Object> }>} Non-empty groups only
 */
export const groupSessionsByDate = (sessions = [], now = new Date()) => {
  const today = startOfDay(now);
  const groupOf = (session) => {
    const day = startOfDay(session.lastMessageAt || session.updatedAt || session.createdAt || now);
    if (day >= today) return SESSION_GROUPS.TODAY;
    if (day >= today - DAY_MS) return SESSION_GROUPS.YESTERDAY;
    if (day >= today - 7 * DAY_MS) return SESSION_GROUPS.LAST_7_DAYS;
    return SESSION_GROUPS.OLDER;
  };

  const order = Object.values(SESSION_GROUPS);
  const groups = new Map(order.map((key) => [key, []]));
  sessions.forEach((session) => groups.get(groupOf(session)).push(session));
  return order.map((key) => ({ key, sessions: groups.get(key) })).filter((group) => group.sessions.length > 0);
};

const SECTION_REGEX = /\[\[([^\]]+)\]\]/g;

/**
 * AI reply text without the [[section]] markers (copied text)
 * @param {string} text
 * @returns {string}
 */
export const plainAIText = (text = '') => String(text).replace(SECTION_REGEX, '$1');

/**
 * AI reply text -> blocks to render as React nodes (never as HTML):
 * paragraphs and "-" / "•" / "*" bullet lists, each line split into plain, **bold** and [[section]] segments.
 * A section of the app (AI_APP_SECTIONS) gets its route as `href`; an unknown name stays plain text.
 * @param {string} text
 * @returns {Array<{ type: 'paragraph', segments: Array } | { type: 'list', items: Array<Array> }>}
 */
export const parseAIText = (text = '') => {
  const toSegment = (part) => {
    if (part.startsWith('**') && part.endsWith('**')) return { bold: true, text: part.slice(2, -2) };
    const section = part.match(/^\[\[([^\]]+)\]\]$/);
    if (section) {
      const name = section[1].trim();
      return AI_APP_SECTIONS[name] ? { bold: false, text: name, href: AI_APP_SECTIONS[name] } : { bold: false, text: name };
    }
    return { bold: false, text: part };
  };
  const toSegments = (line) =>
    line
      .split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g)
      .filter(Boolean)
      .map(toSegment);

  const blocks = [];
  String(text)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .forEach((rawLine) => {
      const line = rawLine.trim();
      const last = blocks[blocks.length - 1];
      if (!line) {
        if (last) last.closed = true;
        return;
      }
      const bullet = line.match(/^[-•*]\s+(.*)$/);
      if (bullet) {
        if (last?.type === 'list' && !last.closed) last.items.push(toSegments(bullet[1]));
        else blocks.push({ type: 'list', items: [toSegments(bullet[1])] });
        return;
      }
      if (last?.type === 'paragraph' && !last.closed) last.lines.push(toSegments(line));
      else blocks.push({ type: 'paragraph', lines: [toSegments(line)] });
    });
  return blocks.map(({ closed: _closed, ...block }) => block);
};

/**
 * 3-5 short main activities, no duplicates (same rules as the BE draft)
 * @param {string[]} agenda
 * @returns {string[]}
 */
export const normalizeAgenda = (agenda = []) =>
  [
    ...new Set(
      agenda
        .map((item) => String(item || '').replace(/\s+/g, ' ').trim().slice(0, AI_LIMITS.AGENDA_ITEM_MAX_LENGTH))
        .filter(Boolean)
    ),
  ].slice(0, AI_LIMITS.MAX_AGENDA_ITEMS);

/**
 * Playdate note: the agenda as a numbered list, then the parent's own note under its header, one "- " line
 * per line of the request (same format as the BE draft)
 * @param {string[]} agenda
 * @param {string} [note]
 * @returns {string}
 */
export const buildAgendaNote = (agenda = [], note = '') => {
  const ownNote = String(note || '').trim();
  const items = normalizeAgenda(agenda);
  if (!items.length) return ownNote;
  const list = [AGENDA_NOTE_HEADER, ...items.map((item, index) => `${index + 1}. ${item}`)].join('\n');
  if (!ownNote) return list;
  const points = ownNote
    .split('\n')
    .map((point) => point.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
  return `${list}\n\n${[EXTRA_NOTE_HEADER, ...points.map((point) => `- ${point}`)].join('\n')}`;
};

/**
 * Text of the user message sent when options are tapped ("Chọn: T7 01/11 · 09:00")
 * @param {Array<{ label: string }>} options
 * @returns {string}
 */
export const choiceMessageText = (options) => `Chọn: ${options.map((option) => option.label).join(', ')}`;

/**
 * Google Maps search for a place by its name and address (same link as the assistant's place options):
 * Google then opens that place, while the OpenStreetMap center of an area can show another address
 * @param {{ name?: string, address?: string, coordinates?: Object|Array }} [place]
 * @returns {string|null}
 */
export const googleMapsSearchUrl = ({ name, address, coordinates } = {}) => {
  const point = Array.isArray(coordinates) ? coordinates : coordinates?.coordinates;
  const query = address
    ? [name, address].filter(Boolean).join(', ')
    : Array.isArray(point)
      ? `${point[1]},${point[0]}`
      : name;
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;
};

/** Id of a message not sent yet */
export const createLocalId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Answer of the "other answer" form of a choice card, from values already checked by its schema
 * (validation/aiAssistantValidation.js)
 * @param {Object} card
 * @param {Object} values - Parsed form values of that step
 * @returns {{ custom: Object, label: string }}
 */
export const buildCustomAnswer = (card, values) => {
  switch (card.stepId) {
    case AI_STEPS.TIME: {
      const [year, month, day] = values.date.split('-');
      return {
        custom: { date: values.date, time: values.time, durationMinutes: card.durationMinutes },
        label: `Chọn giờ khác: ${day}/${month}/${year} · ${values.time}`,
      };
    }
    case AI_STEPS.PLAYMATES:
      // Picked in the friend search; open cards of older sessions have no search and still send typed names
      if (Array.isArray(values.playmates)) {
        return {
          custom: { childIds: values.playmates.map((playmate) => playmate.childId) },
          label: `Mời: ${values.playmates.map((playmate) => playmate.name).join(', ')}`,
        };
      }
      return { custom: { text: values.text }, label: `Mời: ${values.text}` };
    case AI_STEPS.CHILD:
      return { custom: { text: values.text }, label: `Bé: ${values.text}` };
    case AI_STEPS.ACTIVITY:
      return { custom: { title: values.title }, label: `Hoạt động: ${values.title}` };
    case AI_STEPS.EXTRA:
      return { custom: { request: values.request }, label: `Yêu cầu thêm: ${values.request}` };
    case AI_STEPS.PLACE:
      return {
        custom: {
          name: values.name,
          address: values.address || '',
          placeId: values.placeId || undefined,
          // The BE stores [lng, lat]; the place picker returns a GeoJSON point
          coordinates: values.coordinates?.coordinates || values.coordinates || undefined,
        },
        label: `Địa điểm: ${values.name}`,
      };
    case AI_STEPS.MATCH_CRITERIA: {
      const { childId, ageMin, ageMax, maxDistanceKm, interests = [] } = values;
      return {
        custom: { childId, ageMin, ageMax, maxDistanceKm, interests },
        label: `Tìm bạn ${ageMin}–${ageMax} tuổi trong ${maxDistanceKm} km${interests.length ? `, thích ${interests.join(', ')}` : ''}`,
      };
    }
    default:
      return null;
  }
};

/**
 * Starting values of the "other answer" form (criteria start from the suggested ones)
 * @param {Object} card
 * @returns {Object}
 */
export const customFormDefaults = (card) => {
  if (card.stepId === AI_STEPS.MATCH_CRITERIA) {
    const criteria = card.options[0]?.data || {};
    return {
      childId: criteria.childId || '',
      ageMin: criteria.ageMin ?? '',
      ageMax: criteria.ageMax ?? '',
      maxDistanceKm: criteria.maxDistanceKm ?? '',
      interests: [...(criteria.interests || [])],
    };
  }
  if (card.stepId === AI_STEPS.TIME) {
    const first = card.options[0]?.data;
    return { date: first?.date || '', time: first?.time || '' };
  }
  if (card.stepId === AI_STEPS.PLAYMATES && card.hostChildId) return { playmates: [] };
  return {};
};

/**
 * Interests the search criteria can be edited with: the ones of the child profiles (interests and
 * favorite activities), plus those already in the criteria
 * @param {string[]} [current]
 * @returns {Array<{ value: string, label: string }>}
 */
export const interestOptions = (current = []) =>
  [...new Set([...current, ...POPULAR_INTERESTS, ...ACTIVITIES.map((activity) => activity.value)])].map((value) => ({
    value,
    label: value,
  }));

/** Activities of the catalog for the activity step, listed by category */
export const ACTIVITY_OPTIONS = ACTIVITY_GROUPS.flatMap((group) => group.activities.map(toActivityOption(group.label)));
