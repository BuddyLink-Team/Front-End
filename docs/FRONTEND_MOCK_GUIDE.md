# BuddyLink Frontend Mocking Guide & Rules (Quy chuẩn Kiến trúc Mock Tập trung FE)

Tài liệu hướng dẫn và quy chuẩn kỹ thuật cho hệ thống **Centralized Mock HTTP Engine** trên Front-End BuddyLink.

Kiến trúc này được thiết kế để giải quyết triệt để bài toán: **Loại bỏ 100% mã mock hoặc điều kiện rẽ nhánh `isMock` ra khỏi code chức năng chính (Production Coding Functions)**. Mọi lập trình viên Frontend đều có thể dễ dàng cắm mock data cho tính năng của mình mà không làm bẩn mã nguồn API/Service thực tế.

---

## 🚀 1. Mục tiêu & Nguyên lý Kiến trúc Cốt lõi

1. **Pure Production Code (Mã nguồn chức năng thuần khiết 100%)**:
   - Toàn bộ file API (`playdateApi.js`, `childApi.js`, `userApi.js`, v.v.), Custom Hooks, Redux Slices, UI Components **tuyệt đối không chứa** cờ `isMock`, không `import *MockService`, không toán tử 3 ngôi `isMock ? mockService : api`.
   - Production code viết như thế nào khi kết nối Backend thật thì giữ nguyên 100% như vậy.
2. **Axios Network Adapter Interception (Chặn ở tầng Transport Network)**:
   - Thay vì rẽ nhánh ở từng hàm JS, hệ thống thay thế `apiClient.defaults.adapter` của Axios bằng một **Central Mock HTTP Engine** (`src/mock/index.js`).
   - Khi chạy ở chế độ Mock (`npm run dev:mock`), mọi HTTP request (`apiClient.get`, `post`, `put`, `patch`, `delete`) sẽ tự động được bộ adapter chặn lại trước khi gửi ra internet và điều hướng tới handler tương ứng.
3. **Zero Production Pollution (Không rác Production)**:
   - Khi chạy `npm run dev` thông thường hoặc build `npm run build`, Mock Server không bao giờ được khởi tạo (`initMockServer()` chỉ chạy khi `MODE === 'mock'`). Axios giữ nguyên adapter mạng mặc định.
4. **Stateful & Realistic Simulation (Mô phỏng chân thực có lưu trữ)**:
   - Dữ liệu mock được lưu trong `localStorage` (có versioning), dữ liệu thêm/sửa/xóa không bị mất khi F5 tải lại trang.
   - Có độ trễ giả lập (`delay(120ms)`) để kiểm tra loading skeleton và spinner.
5. **Cơ chế Fallthrough (Hỗ trợ phát triển Hybrid)**:
   - Nếu một endpoint chưa được viết mock handler, adapter có thể chuyển tiếp (pass-through) ra mạng thật tới Backend server.

---

## ⚡ 2. Cách khởi chạy chế độ Mock

Để chạy ứng dụng ở chế độ Mock tập trung, mở terminal tại thư mục `Front-End` và chạy:

```bash
npm run dev:mock
```

### Cơ chế hoạt động:
- Lệnh trên kích hoạt `vite --mode mock`.
- Vite nạp biến môi trường từ `.env.mock` (`VITE_USE_MOCK=true`).
- Tại file khởi chạy ứng dụng [src/main.jsx](file:///d:/buddy-ssh/Front-End/src/main.jsx), engine mock sẽ được kích hoạt ngay trước khi React render:

```javascript
// src/main.jsx
import { initMockServer } from './mock';

const isMock = import.meta.env.MODE === 'mock' || import.meta.env.VITE_USE_MOCK === 'true';

if (isMock) {
  initMockServer();
}
```

---

## 📂 3. Cấu trúc thư mục Chuẩn của Toàn dự án

```
src/
├── mock/
│   └── index.js                          # 🌟 CENTRAL MOCK SERVER ENGINE (Axios Adapter & Handlers Registry)
│
├── modules/
│   └── <feature>/                        # Ví dụ: playdate, child, chat, user, auth...
│       ├── api/
│       │   └── <feature>Api.js           # 🟢 100% PURE PRODUCTION CODE (Không có mock code nào ở đây!)
│       ├── mock/
│       │   ├── <feature>MockData.js      # Bộ dữ liệu mẫu hardcoded (UTF-8, đầy đủ ngữ cảnh)
│       │   ├── <feature>MockService.js   # Class nghiệp vụ mô phỏng, lưu trữ localStorage, latency
│       │   └── <feature>MockHandlers.js  # 🎯 Danh sách khai báo Route Handlers cho Central Mock Engine
│       ├── components/                  # UI Components
│       ├── hooks/                       # Custom hooks
│       ├── pages/                       # Pages
│       └── redux/                       # Redux state slices
```

---

## 🛠️ 4. Hướng dẫn 3 Bước để Thêm Mock cho một Feature Mới

Giả sử bạn đang phát triển module `chat` và muốn mock API chat mà không muốn sửa code trong `chatApi.js`:

### Bước 1: Tạo Mock Data & Mock Service trong module của bạn

Tạo file `src/modules/chat/mock/chatMockData.js`:
```javascript
export const INITIAL_MOCK_CONVERSATIONS = [
  {
    id: 'conv-mock-1',
    participantName: 'Mẹ Lan',
    lastMessage: 'Hẹn gặp bé chiều nay nhé!',
    updatedAt: new Date().toISOString(),
  },
];
```

Tạo file `src/modules/chat/mock/chatMockService.js`:
```javascript
import { INITIAL_MOCK_CONVERSATIONS } from './chatMockData';

const STORAGE_KEY = 'buddylink_mock_chat_v1';
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

class ChatMockService {
  _getStored() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [...INITIAL_MOCK_CONVERSATIONS];
  }

  resetFactoryData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CONVERSATIONS));
  }

  async getConversations() {
    await delay();
    return {
      success: true,
      message: 'Lấy danh sách hội thoại thành công',
      data: this._getStored(),
    };
  }

  async sendMessage(conversationId, payload) {
    await delay();
    const list = this._getStored();
    const newMsg = { id: `msg-${Date.now()}`, text: payload.text, createdAt: new Date().toISOString() };
    // Update logic...
    return {
      success: true,
      data: newMsg,
    };
  }
}

export const chatMockService = new ChatMockService();
export default chatMockService;
```

---

### Bước 2: Khai báo Route Handlers (`<feature>MockHandlers.js`)

Tạo file `src/modules/chat/mock/chatMockHandlers.js`:
File này định nghĩa method HTTP và đường dẫn URL tương ứng mà Backend sẽ cung cấp:

```javascript
import chatMockService from './chatMockService';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const chatMockHandlers = [
  // GET /api/v1/chat/conversations
  {
    method: 'GET',
    pattern: `${API_ENDPOINTS.CHAT.BASE}/conversations`,
    handler: ({ query }) => chatMockService.getConversations(query),
  },

  // POST /api/v1/chat/conversations/:id/messages (hỗ trợ dynamic route param :id)
  {
    method: 'POST',
    pattern: `${API_ENDPOINTS.CHAT.BASE}/conversations/:id/messages`,
    handler: ({ params, body }) => chatMockService.sendMessage(params.id, body),
  },
];

export default chatMockHandlers;
```

> **Ghi chú về Route Parameters**:
> Mock engine hỗ trợ cú pháp `:paramName` (ví dụ: `/playdates/:id/reschedule`). Tham số sẽ tự động được parse và truyền vào `params` trong handler.

---

### Bước 3: Đăng ký Handler vào Central Mock Server Engine

Mở file [src/mock/index.js](file:///d:/buddy-ssh/Front-End/src/mock/index.js) và thêm bộ handlers của bạn vào mảng `mockHandlers`:

```javascript
// src/mock/index.js
import playdateMockHandlers from '../modules/playdate/mock/playdateMockHandlers';
import chatMockHandlers from '../modules/chat/mock/chatMockHandlers'; // 👈 Thêm import handler mới

const mockHandlers = [
  ...playdateMockHandlers,
  ...chatMockHandlers, // 👈 Thêm vào danh sách đăng ký tập trung
];
```

**Xong!** Ngay lập tức:
- Khi code của bạn gọi `chatApi.getConversations()` (vốn chỉ là gọi `apiClient.get(...)`), Axios Adapter sẽ tự động chặn request và trả về mock data từ `chatMockService`.
- File [chatApi.js](file:///d:/buddy-ssh/Front-End/src/modules/chat/api/chatApi.js) của bạn giữ nguyên 100% code sạch (Pure Axios Calls)!

---

## 🛡️ 5. Bằng chứng: Mã API Chức năng hoàn toàn sạch (100% Pure Code)

Xem ví dụ thực tế tại [src/modules/playdate/api/playdateApi.js](file:///d:/buddy-ssh/Front-End/src/modules/playdate/api/playdateApi.js):

```javascript
// src/modules/playdate/api/playdateApi.js
import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

/**
 * 100% PURE PRODUCTION CODE
 * Không có bất kỳ logic mock, cờ `isMock`, hay mock service import nào!
 */
export const playdateApi = {
  getPlaydates: (params = {}) => apiClient.get(API_ENDPOINTS.PLAYDATE.BASE, { params }),
  getPlaydateById: (id) => apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}`),
  createPlaydate: (payload) => apiClient.post(API_ENDPOINTS.PLAYDATE.BASE, payload),
  completePlaydate: (id) => apiClient.patch(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/complete`),
  cancelPlaydate: (id, payload) => apiClient.patch(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/cancel`, payload),
  respondToPlaydate: (id, status) => apiClient.put(`${API_ENDPOINTS.PLAYDATE.BASE}/${id}/respond`, { status }),
  getFriends: () => apiClient.get(`${API_ENDPOINTS.PLAYDATE.BASE}/friends`),
  getNearbyPlaces: (params = {}) => apiClient.get(API_ENDPOINTS.PLACES.NEARBY, { params }),
};

export default playdateApi;
```

Tương tự, [src/modules/child/api/childApi.js](file:///d:/buddy-ssh/Front-End/src/modules/child/api/childApi.js) cũng hoàn toàn không cần biết mock là gì:

```javascript
// src/modules/child/api/childApi.js
import apiClient from '../../../services/apiClient';
import { API_ENDPOINTS } from '../../../constants/api.constants';

export const childApi = {
  getMyChildren: () => apiClient.get(API_ENDPOINTS.CHILD.BASE),
  createChild: (payload) => apiClient.post(API_ENDPOINTS.CHILD.BASE, payload),
  // ...
};

export default childApi;
```

---

## 🔑 6. Tự động Khởi tạo Phiên Đăng Nhập Mẫu (Mock Auth Seeding)

Các trang trong dự án thường được bọc bởi `ProtectedRoute`. Để dev có thể truy cập thẳng vào trang tính năng mà không bị điều hướng ngược về `/login`:

- [src/mock/index.js](file:///d:/buddy-ssh/Front-End/src/mock/index.js) tự động kiểm tra `localStorage`.
- Nếu chưa có token, engine sẽ tự động seed các thông tin mẫu:
  - `ACCESS_TOKEN`: `'mock-jwt-token-playdates'`
  - `USER_INFO`: Tài khoản người dùng mẫu có quyền truy cập và cờ `isPremium: true`.
  - `PARENT_INFO`: Hồ sơ phụ huynh mẫu.

---

## 🧪 7. Kiểm thử Tự động (Unit Tests)

Dự án có sẵn kiểm thử tự động cho hệ thống Centralized Mock Engine:
- Kiểm thử tích hợp adapter: [src/test/unit/mockAdapter.test.js](file:///d:/buddy-ssh/Front-End/src/test/unit/mockAdapter.test.js)
  - Xác minh rằng khi gọi `playdateApi` hoặc `childApi` thực tế, request được chặn và xử lý bởi mock engine một cách trong suốt.
- Kiểm thử logic dịch vụ: [src/test/unit/playdateMockService.test.js](file:///d:/buddy-ssh/Front-End/src/test/unit/playdateMockService.test.js)

Chạy kiểm thử:
```bash
npx vitest run
```

---

## 📋 8. Checklist & Quy tắc bắt buộc (Do's and Don'ts)

| NÊN LÀM (DO) ✅ | KHÔNG ĐƯỢC LÀM (DON'T) ❌ |
| :--- | :--- |
| Giữ file `<feature>Api.js` thuần 100% `apiClient` calls. | **Tuyệt đối không** import mock service hoặc kiểm tra `isMock` trong file API chức năng. |
| Khai báo endpoint trong `<feature>MockHandlers.js` theo đúng method và pattern URL. | Không hardcode đường dẫn URL không khớp với `api.constants.js`. |
| Đăng ký handler mới vào `mockHandlers` trong `src/mock/index.js`. | Không gọi trực tiếp mock handler hoặc mock service trong UI Component. |
| Dữ liệu mock trả về cấu trúc `{ success: true, message: '...', data: ... }`. | Không trả về mảng thô nếu Backend trả về dạng bọc object. |
| Dùng `localStorage` để dữ liệu được bảo toàn khi dev thao tác trên UI và reload trang. | Không lưu biến global trong memory RAM (sẽ mất khi F5). |
| Chạy `npx vitest run` và `npm run build` trước khi bàn giao. | Không làm thay đổi hành vi của lệnh `npm run dev` thông thường. |

---

## 🌟 9. Tham chiếu Triển khai Mẫu

- **Central Mock Server Engine**: [src/mock/index.js](file:///d:/buddy-ssh/Front-End/src/mock/index.js)
- **Feature Mock Handlers**: [src/modules/playdate/mock/playdateMockHandlers.js](file:///d:/buddy-ssh/Front-End/src/modules/playdate/mock/playdateMockHandlers.js)
- **Feature Mock Service**: [src/modules/playdate/mock/playdateMockService.js](file:///d:/buddy-ssh/Front-End/src/modules/playdate/mock/playdateMockService.js)
- **Feature Mock Data**: [src/modules/playdate/mock/playdateMockData.js](file:///d:/buddy-ssh/Front-End/src/modules/playdate/mock/playdateMockData.js)
- **Pure Production API**: [src/modules/playdate/api/playdateApi.js](file:///d:/buddy-ssh/Front-End/src/modules/playdate/api/playdateApi.js) & [src/modules/child/api/childApi.js](file:///d:/buddy-ssh/Front-End/src/modules/child/api/childApi.js)
- **Integration Test**: [src/test/unit/mockAdapter.test.js](file:///d:/buddy-ssh/Front-End/src/test/unit/mockAdapter.test.js)
