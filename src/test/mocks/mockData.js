/**
 * Mock data for tests.
 */
export const mockUser = {
  id: 'usr_001',
  fullName: 'Nguyễn Lan Anh',
  email: 'lananh@example.com',
  role: 'parent',
  isVerified: true,
};

export const mockChild = {
  id: 'chd_001',
  name: 'Bé Bo',
  age: 5,
  gender: 'male',
  interests: ['Lego', 'Vẽ tranh', 'Bơi lội'],
  parentId: 'usr_001',
};

export const mockPlaydate = {
  id: 'pld_001',
  title: 'Buổi chơi Lego & Công viên',
  status: 'confirmed',
  date: '2026-10-05',
  time: '15:00',
  location: 'Công viên Cầu Ánh Sao, Quận 7',
  hostId: 'usr_001',
  childId: 'chd_001',
};
