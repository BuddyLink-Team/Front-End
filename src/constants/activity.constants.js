import {
  Bike,
  Waves,
  Castle,
  Trees,
  Footprints,
  Trophy,
  BookOpen,
  Landmark,
  Dice5,
  Scissors,
  Puzzle,
  Palette,
  CakeSlice,
  Music,
  FlaskConical,
  PawPrint,
  Umbrella,
  Wind,
  Sprout,
  Clapperboard,
  Dumbbell,
  PartyPopper,
} from 'lucide-react';

/**
 * Single source of the kids activities: the child profile (favoriteActivities), the quick
 * suggestions of a new playdate and the category of a playdate card all read this list.
 * The Back-End mirror is CHILD_ACTIVITIES in Back-End/src/modules/child/child.constants.js (seed data).
 */

export const ACTIVITY_CATEGORIES = Object.freeze({
  OUTDOOR: 'outdoor',
  SPORTS: 'sports',
  CREATIVE: 'creative',
  EXPLORE: 'explore',
  FUN: 'fun',
});

export const ACTIVITY_CATEGORY_META = Object.freeze({
  [ACTIVITY_CATEGORIES.OUTDOOR]: { label: 'Dã ngoại', icon: Trees },
  [ACTIVITY_CATEGORIES.SPORTS]: { label: 'Vận động', icon: Dumbbell },
  [ACTIVITY_CATEGORIES.CREATIVE]: { label: 'Sáng tạo', icon: Palette },
  [ACTIVITY_CATEGORIES.EXPLORE]: { label: 'Khám phá', icon: BookOpen },
  [ACTIVITY_CATEGORIES.FUN]: { label: 'Vui chơi', icon: PartyPopper },
});

/**
 * value: saved in child.favoriteActivities (keep existing values unchanged: profiles already store them)
 * playdateTitle: filled into the activity of a new playdate when the suggestion is picked
 */
export const ACTIVITIES = Object.freeze([
  // Dã ngoại
  { value: 'Dã ngoại ngoài trời', playdateTitle: 'Dã ngoại & vận động tại công viên', category: ACTIVITY_CATEGORIES.OUTDOOR, icon: Trees },
  { value: 'Chơi cát & Tắm biển', playdateTitle: 'Xây lâu đài cát & tắm biển', category: ACTIVITY_CATEGORIES.OUTDOOR, icon: Umbrella },
  { value: 'Thả diều', playdateTitle: 'Thả diều trên bãi cỏ rộng', category: ACTIVITY_CATEGORIES.OUTDOOR, icon: Wind },
  { value: 'Tham quan vườn thú', playdateTitle: 'Tham quan vườn thú & thế giới động vật', category: ACTIVITY_CATEGORIES.OUTDOOR, icon: PawPrint },
  { value: 'Làm vườn & Trồng cây', playdateTitle: 'Trồng cây & chăm sóc vườn mini', category: ACTIVITY_CATEGORIES.OUTDOOR, icon: Sprout },

  // Vận động
  { value: 'Đạp xe công viên', playdateTitle: 'Đạp xe cùng nhau ở công viên', category: ACTIVITY_CATEGORIES.SPORTS, icon: Bike },
  { value: 'Bơi lội', playdateTitle: 'Bơi lội & chơi nước cho các bé', category: ACTIVITY_CATEGORIES.SPORTS, icon: Waves },
  { value: 'Bóng đá / Thể thao', playdateTitle: 'Đá bóng & trò chơi rèn luyện thể chất', category: ACTIVITY_CATEGORIES.SPORTS, icon: Trophy },
  { value: 'Trượt patin', playdateTitle: 'Trượt patin cùng bạn', category: ACTIVITY_CATEGORIES.SPORTS, icon: Footprints },

  // Sáng tạo
  { value: 'Xếp hình Lego', playdateTitle: 'Buổi chơi xếp hình Lego & giao lưu', category: ACTIVITY_CATEGORIES.CREATIVE, icon: Puzzle },
  { value: 'Vẽ tranh', playdateTitle: 'Buổi vẽ tranh sáng tạo ngoài trời', category: ACTIVITY_CATEGORIES.CREATIVE, icon: Palette },
  { value: 'Thủ công sáng tạo', playdateTitle: 'Làm đồ thủ công & đất nặn', category: ACTIVITY_CATEGORIES.CREATIVE, icon: Scissors },
  { value: 'Làm bánh & Nấu ăn', playdateTitle: 'Lớp học làm bánh mini cho các bé', category: ACTIVITY_CATEGORIES.CREATIVE, icon: CakeSlice },
  { value: 'Âm nhạc & Ca hát', playdateTitle: 'Hát & chơi nhạc cụ cùng nhau', category: ACTIVITY_CATEGORIES.CREATIVE, icon: Music },

  // Khám phá
  { value: 'Thư viện / Đọc sách', playdateTitle: 'Giao lưu đọc sách & kể chuyện cho bé', category: ACTIVITY_CATEGORIES.EXPLORE, icon: BookOpen },
  { value: 'Ghé thăm viện bảo tàng', playdateTitle: 'Tham quan bảo tàng cùng các bé', category: ACTIVITY_CATEGORIES.EXPLORE, icon: Landmark },
  { value: 'Khám phá khoa học', playdateTitle: 'Thí nghiệm khoa học vui cho bé', category: ACTIVITY_CATEGORIES.EXPLORE, icon: FlaskConical },

  // Vui chơi
  { value: 'Khu vui chơi trong nhà (Kids Cafe)', playdateTitle: 'Vui chơi tại khu vui chơi trong nhà', category: ACTIVITY_CATEGORIES.FUN, icon: Castle },
  { value: 'Trò chơi tương tác / Board games', playdateTitle: 'Chơi board game & trò chơi tương tác', category: ACTIVITY_CATEGORIES.FUN, icon: Dice5 },
  { value: 'Xem phim hoạt hình', playdateTitle: 'Xem phim hoạt hình cùng nhau', category: ACTIVITY_CATEGORIES.FUN, icon: Clapperboard },
]);

/** Activities grouped by category, in ACTIVITY_CATEGORY_META order */
export const ACTIVITY_GROUPS = Object.freeze(
  Object.entries(ACTIVITY_CATEGORY_META).map(([category, meta]) => ({
    category,
    ...meta,
    activities: ACTIVITIES.filter((a) => a.category === category),
  }))
);

// Keywords of free-text playdate activities that match no catalog entry
const CATEGORY_KEYWORDS = Object.freeze([
  [ACTIVITY_CATEGORIES.OUTDOOR, ['ngoại', 'công viên', 'thảo cầm viên', 'picnic', 'biển', 'diều', 'vườn']],
  [ACTIVITY_CATEGORIES.CREATIVE, ['lego', 'vẽ', 'sáng tạo', 'bánh', 'thủ công', 'nhạc', 'hát']],
  [ACTIVITY_CATEGORIES.EXPLORE, ['sách', 'truyện', 'khoa học', 'thư viện', 'bảo tàng']],
  [ACTIVITY_CATEGORIES.SPORTS, ['bóng', 'bơi', 'vận động', 'thể thao', 'đạp xe', 'patin']],
]);

/**
 * Category of a playdate / child activity text: catalog entry first, then keywords, else "Vui chơi"
 * @param {string} text
 * @returns {string} ACTIVITY_CATEGORIES value
 */
export const getActivityCategory = (text = '') => {
  const normalized = text.trim().toLowerCase();
  const entry = ACTIVITIES.find(
    (a) => a.value.toLowerCase() === normalized || a.playdateTitle.toLowerCase() === normalized
  );
  if (entry) return entry.category;
  const match = CATEGORY_KEYWORDS.find(([, words]) => words.some((w) => normalized.includes(w)));
  return match ? match[0] : ACTIVITY_CATEGORIES.FUN;
};
