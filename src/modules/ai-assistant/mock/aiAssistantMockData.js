import { MOCK_HOST_CHILDREN, MOCK_FRIENDS, MOCK_NEARBY_PLACES } from '../../playdate/mock/playdateMockData';

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDay = (offset) => new Date(Date.now() + offset * DAY_MS).toISOString().slice(0, 10);

export const MOCK_AI_LIMITS = Object.freeze({ SESSIONS_PER_MONTH: 5, MESSAGES_PER_SESSION: 30 });

export const MOCK_AI_HOST_CHILD = MOCK_HOST_CHILDREN[0];

// Next weekend's mornings / afternoon
export const buildMockTimeSlots = () => [
  { date: isoDay(6), time: '09:00', durationMinutes: 120, dayType: 'weekend', timeSlot: 'morning', matchedParents: 2, totalParents: 2 },
  { date: isoDay(7), time: '09:00', durationMinutes: 120, dayType: 'weekend', timeSlot: 'morning', matchedParents: 2, totalParents: 2 },
  { date: isoDay(6), time: '15:00', durationMinutes: 120, dayType: 'weekend', timeSlot: 'afternoon', matchedParents: 1, totalParents: 2 },
];

export const MOCK_AI_PLAYMATES = MOCK_FRIENDS.flatMap((friend) =>
  friend.children.map((child) => ({
    childId: child.id,
    displayName: child.displayName,
    age: 4,
    gender: child.gender || 'girl',
    avatarUrl: child.avatarUrl || '',
    interests: child.interests || [],
    sharedInterests: (child.interests || []).slice(0, 1),
    matchScore: 78,
    source: 'friend',
    warnings: [],
    parent: { parentId: friend.id, fullName: friend.fullName, avatarUrl: friend.avatarUrl, area: friend.location.area, isVerifiedParent: friend.isVerified },
  })),
);

export const MOCK_AI_ACTIVITIES = [
  { key: 'Xếp hình Lego', title: 'Buổi chơi xếp hình Lego & giao lưu', placeTypes: ['kids_cafe', 'library'], reason: 'Cả hai bé đều thích xếp hình lego' },
  { key: 'Vẽ tranh', title: 'Buổi vẽ tranh sáng tạo ngoài trời', placeTypes: ['park'], reason: 'Bé Bơ thích vẽ' },
  { key: 'Dã ngoại ngoài trời', title: 'Dã ngoại & vận động tại công viên', placeTypes: ['park'], reason: 'Hợp với mọi lứa tuổi' },
];

export const MOCK_AI_PLACES = MOCK_NEARBY_PLACES.slice(0, 3).map((place) => ({
  id: place.id,
  placeId: place.placeId,
  name: place.name,
  address: place.address,
  placeType: place.placeType,
  distanceKm: Math.round(place.distanceMeters / 100) / 10,
  openingHours: place.openingHours,
  coordinates: place.coordinates,
  osmUrl: place.osmUrl,
  familyDistances: [
    { label: 'Nhà bạn', distanceKm: Math.round(place.distanceMeters / 500) / 2 },
    { label: MOCK_FRIENDS[0].fullName, distanceKm: 2 },
  ],
}));

export const MOCK_AI_MATCHES = MOCK_AI_PLAYMATES.map((child, index) => ({
  ...child,
  matchScore: 85 - index * 9,
  distanceKm: 1.5 + index,
}));
