// ConnectionDTO shape (GET /connections): `partner` is the other parent with their first child,
// `childPairs` the children matched on the connection (my child = the mock host's first child)
const partner = (id, fullName, area, child, isVerifiedParent = true) => ({
  id,
  fullName,
  avatarUrl: null,
  location: { area, city: 'Thành phố Đà Nẵng' },
  isVerifiedParent,
  preferences: {
    preferredPlaydateDays: ['weekend'],
    preferredTimeSlots: ['morning', 'afternoon'],
    preferredLocations: ['park', 'kids_cafe'],
  },
  child,
});

const child = (id, displayName, age, gender, interests) => ({
  id,
  displayName,
  age,
  gender,
  interests,
  favoriteActivities: [],
});

const MY_CHILD = { id: 'child-host-1', displayName: 'Bé Bơ', age: 4, gender: 'boy' };

const pairWith = (partnerChild, source = 'discovery', matchScore = 80) => ({
  myChild: MY_CHILD,
  partnerChild: { id: partnerChild.id, displayName: partnerChild.displayName, age: partnerChild.age, gender: partnerChild.gender },
  source,
  matchScore,
});

const BONG = child('mock-child-2', 'Bông', 5, 'girl', ['Vẽ tranh', 'Xếp hình Lego']);
const TOM = child('mock-child-3', 'Tôm', 6, 'boy', ['Bóng đá / Thể thao']);

export const INITIAL_MOCK_CONNECTIONS = [
  {
    id: 'mock-conn-1',
    status: 'accepted',
    direction: 'outgoing',
    partner: partner('mock-parent-2', 'Trần Thị Mai', 'Phường Hải Châu', BONG),
    childPairs: [pairWith(BONG, 'playdate', null)],
    connectedAt: '2026-09-20T03:00:00.000Z',
    createdAt: '2026-09-19T03:00:00.000Z',
  },
  {
    id: 'mock-conn-2',
    status: 'pending',
    direction: 'incoming',
    partner: partner('mock-parent-3', 'Lê Văn Hùng', 'Phường Sơn Trà', TOM, false),
    childPairs: [pairWith(TOM, 'discovery', 64)],
    connectedAt: null,
    createdAt: '2026-10-08T03:00:00.000Z',
  },
  {
    id: 'mock-conn-3',
    status: 'pending',
    direction: 'outgoing',
    // Older connection without child pairs: the card falls back to the partner's first child
    partner: partner('mock-parent-4', 'Phạm Ngọc Ánh', 'Phường Ngũ Hành Sơn', child('mock-child-4', 'Na', 4, 'girl', ['Bơi lội'])),
    childPairs: [],
    connectedAt: null,
    createdAt: '2026-10-09T03:00:00.000Z',
  },
];
