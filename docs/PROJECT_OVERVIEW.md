# BuddyLink

**English:** AI-Powered Child Playmate Matching and Playdate Planning Platform using ReactJS, NodeJS and MongoDB

**Vietnamese:** Nền tảng tìm bạn chơi cho trẻ và hỗ trợ lập kế hoạch gặp gỡ ứng dụng AI sử dụng ReactJS, NodeJS and MongoDB

---

## 1. Giới thiệu dự án

**BuddyLink** là nền tảng giúp phụ huynh tìm kiếm và kết nối với các gia đình có trẻ phù hợp dựa trên độ tuổi, sở thích, hoạt động và khoảng cách.

Hệ thống hỗ trợ phụ huynh **tìm bạn chơi, kết nối, trò chuyện và tổ chức Playdate** cho trẻ. BuddyLink sử dụng **Smart Matching** để đề xuất các kết nối phù hợp và **AI Playdate & Family Assistant Agent** để hỗ trợ tìm bạn chơi, hoạt động, địa điểm và lập kế hoạch Playdate.

---

# 2. Roles

| Role       | Chức năng chính                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Parent** | Quản lý profile, Child Profile, tìm bạn chơi, kết nối, chat, Playdate, AI Agent, gamification, Premium, Safety & Privacy |
| **Admin**  | Quản lý Parent, Child Profile, Connection, Playdate, Report, Badge/Reward, Premium Plan và Analytics                     |

---

# 3. Parent Features

## 3.1 Authentication

| Function        | Mô tả                              |
| --------------- | ---------------------------------- |
| Register        | Đăng ký tài khoản                  |
| Login           | Đăng nhập                          |
| Logout          | Đăng xuất                          |
| Forgot Password | Yêu cầu đặt lại mật khẩu           |
| Reset Password  | Đặt lại mật khẩu                   |
| Google Login    | Đăng nhập bằng Google _(optional)_ |

**Tech:** React + Node.js + JWT + bcrypt

---

## 3.2 Parent Profile

| Function               | Mô tả                            |
| ---------------------- | -------------------------------- |
| View Profile           | Xem thông tin cá nhân            |
| Edit Profile           | Chỉnh sửa thông tin              |
| Upload Avatar          | Quản lý ảnh đại diện             |
| Manage Location        | Quản lý khu vực                  |
| Public/Private Profile | Thiết lập quyền hiển thị profile |

---

## 3.3 Child Profile

| Function       | Mô tả                  |
| -------------- | ---------------------- |
| Create Child   | Tạo hồ sơ trẻ          |
| View Child     | Xem hồ sơ trẻ          |
| Edit Child     | Chỉnh sửa hồ sơ        |
| Delete Child   | Xóa hồ sơ              |
| Manage Privacy | Quản lý quyền riêng tư |

**Child Information:** Display Name, Age, Gender, Interests, Favorite Activities, Personality, Location/Area.

Một Parent có thể quản lý **một hoặc nhiều Child Profile**.

---

# 4. Discovery & Matching

## 4.1 Child Discovery

| Function          | Mô tả                          |
| ----------------- | ------------------------------ |
| Discover Profiles | Khám phá Child Profile phù hợp |
| Swipe             | Swipe để bỏ qua hoặc quan tâm  |
| Search            | Tìm kiếm profile               |
| Filter            | Lọc profile                    |

**UI:** Swipe Card

---

## 4.2 Smart Matching

Match Score dựa trên:

| Criteria         |
| ---------------- |
| Age              |
| Location         |
| Shared Interests |
| Activities       |
| Personality      |
| Preferences      |

**MVP:** Rule-based Matching
**Future:** AI Recommendation

---

## 4.3 Connection

| Function          | Mô tả                  |
| ----------------- | ---------------------- |
| Send Request      | Gửi Connection Request |
| View Requests     | Xem request            |
| Accept            | Chấp nhận              |
| Decline           | Từ chối                |
| Remove Connection | Hủy kết nối            |
| Block User        | Chặn người dùng        |

**Chat chỉ khả dụng sau khi Connection được chấp nhận.**

---

### 5. Communication

#### 5.1 Direct Chat

| Function              | Business Notes                                       |
| --------------------- | ---------------------------------------------------- |
| **View Chat**         | Chat 1–1 giữa Parents đã Connected.                  |
| **Send Message**      | Chỉ gửi khi hai bên vẫn Connected và không bị Block. |
| **Send Emoji**        | Emoji được gửi như một message.                      |
| **Send Image**        | Ảnh lưu Cloud Storage, message lưu URL.              |
| **Read Status**       | Hiển thị message đã gửi/đã đọc.                      |
| **Typing Indicator**  | Hiển thị trạng thái đang nhập theo thời gian thực.   |
| **View Chat History** | Lưu và xem lại lịch sử trò chuyện.                   |

---

#### 5.2 Playdate Chat

| Function              | Business Notes                              |
| --------------------- | ------------------------------------------- |
| **View Chat**         | Mỗi Playdate có một chat riêng.             |
| **Send Message**      | Chỉ Accepted Participants được gửi message. |
| **Send Emoji**        | Hỗ trợ emoji trong Playdate Chat.           |
| **Send Image**        | Hỗ trợ chia sẻ hình ảnh trong Playdate.     |
| **Read Status**       | Theo dõi trạng thái đã đọc.                 |
| **Typing Indicator**  | Hiển thị người đang nhập realtime.          |
| **View Participants** | Xem các Parent tham gia Playdate.           |
| **View Chat History** | Có thể xem lại lịch sử chat của Playdate.   |

---

#### 5.3 Notification

| Function                    | Business Notes                                      |
| --------------------------- | --------------------------------------------------- |
| **View Notifications**      | Hiển thị các thông báo liên quan đến tài khoản.     |
| **Mark as Read**            | Đánh dấu thông báo đã đọc.                          |
| **Message Notification**    | Thông báo khi có message mới.                       |
| **Connection Notification** | Thông báo Request/Accepted Connection.              |
| **Playdate Notification**   | Thông báo Invitation, Reminder, Changed, Cancelled. |
| **System Notification**     | Thông báo Badge, Streak và AI Recommendation.       |

---

# 6. Playdate

## 6.1 Create Playdate

| Field            | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| **Child**        | Chọn trẻ sẽ tham gia Playdate.                                 |
| **Participants** | Chọn các Parent/Family muốn mời tham gia.                      |
| **Date**         | Chọn ngày tổ chức Playdate.                                    |
| **Time**         | Chọn thời gian bắt đầu Playdate.                               |
| **Activity**     | Nhập hoạt động dự kiến, ví dụ: Picnic, đi công viên, vẽ tranh. |
| **Location**     | Chọn địa điểm tổ chức Playdate.                                |
| **Note**         | Thêm ghi chú hoặc thông tin cần lưu ý cho các Participants.    |

---

## 6.2 Playdate Management

| Function      | Mô tả                                    |
| ------------- | ---------------------------------------- |
| View Playdate | Xem thông tin Playdate                   |
| Accept        | Chấp nhận lời mời                        |
| Decline       | Từ chối lời mời                          |
| Reschedule    | Đề xuất thay đổi ngày, giờ hoặc địa điểm |
| Cancel        | Hủy Playdate                             |
| Complete      | Đánh dấu Playdate đã hoàn thành          |
| Playdate Chat | Chat với các participants của Playdate   |

### Playdate Status

```text
Upcoming
Completed
Cancelled
```

Trạng thái **chung của Playdate**:

```text
Create Playdate
      │
      ▼
   Upcoming
   /      \
  │        │
  │        └── Host Cancel
  │                │
  │                ▼
  │            Cancelled
  │
  └── Date/Time arrives
          │
          ▼
      Completed
```

**Rule:**

- Playdate được tạo → `Upcoming`
- Host Cancel → `Cancelled`
- Playdate diễn ra và hoàn tất → `Completed`

> `Upcoming` không phụ thuộc vào việc tất cả participants đều Accept hay chưa. Participant có status riêng.

---

### Participant Status

```text
Pending
Accepted
Declined
```

Trạng thái riêng của **từng Parent**:

```text
Playdate Invitation
        │
        ▼
     Pending
      /    \
 Accept    Decline
   │          │
   ▼          ▼
Accepted   Declined
```

- `Pending`: Chưa phản hồi lời mời
- `Accepted`: Đồng ý tham gia
- `Declined`: Từ chối tham gia

---

### Playdate Chat

Mỗi Playdate có **một chat riêng** dành cho các participants.

```text
Create Playdate
      │
      ▼
Playdate Chat Created
      │
      ├── Parent A
      ├── Parent B
      ├── Parent C
      └── ...
```

---

### Reschedule Request Status

```text
Pending
Accepted
Declined
Cancelled
```

Mỗi lần đổi lịch tạo một **Reschedule Request riêng**:

```text
Accepted
    │
    │ Host → Reschedule
    ▼
Pending
 /     \
Accept  Decline
  │        │
  ▼        ▼
Accepted  Declined
  │
  ▼
Update Playdate
  │
  ▼
Playdate → Upcoming
```

**Rule:** Tất cả participants đang `Accepted` phải đồng ý lịch mới thì Reschedule Request mới được `Accepted`.

Nếu có một participant từ chối:

```text
Reschedule Request
        │
        ▼
     Pending
        │
        ▼
Participant Declined
        │
        ▼
     Declined
        │
        ▼
Giữ lịch cũ
```

---

### Tổng thể

```text
PLAYDATE STATUS

Upcoming ──────────────→ Completed
    │
    └───────────────────→ Cancelled


PARTICIPANT STATUS

Pending ──→ Accepted
    │
    └──────→ Declined


RESCHEDULE REQUEST

Pending ──→ Accepted ──→ Update Playdate
    │
    ├──────→ Declined
    │
    └──────→ Cancelled
```

---

## 6.3 Playdate History

| Category  |
| --------- |
| Upcoming  |
| Completed |
| Cancelled |

---

# 7. Activity & Location

## 7.1 Activity Suggestions

| Function           | Mô tả                                   |
| ------------------ | --------------------------------------- |
| Suggest Activities | AI gợi ý hoạt động phù hợp cho Playdate |

Recommendation criteria:

- Age
- Interests
- Favorite Activities
- Personality
- Location
- Participants

---

## 7.2 Nearby Places

| Function      | Mô tả                    |
| ------------- | ------------------------ |
| Search Places | Tìm địa điểm             |
| Nearby Places | Tìm địa điểm gần khu vực |
| Place Details | Xem thông tin địa điểm   |

**Place Types:** Park, Kids Café, Playground, Library, Sports Center, Workshop.

**Tech:** Google Maps / Places API

---

# 8. AI Playdate & Family Assistant Agent ⭐

AI Agent hỗ trợ thực hiện các tác vụ liên quan đến tìm bạn chơi và Playdate.

| Function / Tool           | Chức năng                                                |
| ------------------------- | -------------------------------------------------------- |
| `findMatches()`           | Tìm Child Profile phù hợp                                |
| `findActivities()`        | Gợi ý hoạt động phù hợp                                  |
| `findNearbyPlaces()`      | Tìm địa điểm phù hợp                                     |
| `getPlaydates()`          | Xem và kiểm tra Playdate                                 |
| `createPlaydate()`        | Tạo Playdate với Child, Participants, Activity, Location |
| `updatePlaydate()`        | Cập nhật thông tin Playdate                              |
| `reschedulePlaydate()`    | Đề xuất thay đổi lịch Playdate                           |
| `cancelPlaydate()`        | Hủy Playdate                                             |
| `sendConnectionRequest()` | Gửi Connection Request                                   |
| `sendMessage()`           | Gửi tin nhắn                                             |

### AI Agent Flow

```text
User Request
     ↓
Understand Intent
     ↓
Call Tools
     ↓
Get System Data
     ↓
Generate Recommendation
     ↓
User Confirmation
     ↓
Execute Action
```

**Tech:**

- React → Agent Chat UI
- Node.js → Agent Service
- Gemini / OpenAI → LLM
- Function Calling / Tool Calling

**reschedulePlaydate()** nên được thiết kế để AI đề xuất/gửi Reschedule Request, không tự động đổi lịch ngay. Việc đổi lịch vẫn phải tuân theo rule các Accepted Participants cần đồng ý.

---

# 10. Gamification

## 10.1 Playdate Streak

| Function          | Description                                               |
| ----------------- | --------------------------------------------------------- |
| **Weekly Streak** | Duy trì bằng cách hoàn thành ít nhất 1 Playdate mỗi tuần. |
| **View Streak**   | Hiển thị số tuần liên tiếp đã duy trì.                    |

Bỏ Streak nếu tuần đó không hoàn thành Playdate.

---

## 10.2 Badge

| Badge                | Condition                                                    |
| -------------------- | ------------------------------------------------------------ |
| **First Connection** | Có ít nhất **1 Connection** ở trạng thái `Connected`.        |
| **First Playdate**   | Có ít nhất **1 Playdate** ở trạng thái `Completed`.          |
| **4-Week Streak**    | Duy trì **Weekly Playdate Streak ≥ 4 tuần liên tiếp**.       |
| **10 Playdates**     | Có ít nhất **10 Playdates** ở trạng thái `Completed`.        |
| **Social Family**    | Có ít nhất **10 Connections** ở trạng thái `Connected`.      |
| **Explorer**         | Đã hoàn thành Playdate tại ít nhất **5 địa điểm khác nhau**. |

**Lưu ý:** Badge nên được unlock một lần và giữ vĩnh viễn, không bị mất khi số liệu sau đó giảm.

---

# 11. Rating & Feedback

| Function                   | Description                                     |
| -------------------------- | ----------------------------------------------- |
| **Rate Playdate**          | Đánh giá Playdate từ 1–5 ⭐ sau khi hoàn thành. |
| **Give Feedback**          | Gửi nhận xét về trải nghiệm Playdate.           |
| **View Rating & Feedback** | Xem đánh giá và feedback của Playdate.          |

**Business Rule:**

- Chỉ Parent đã tham gia và hoàn thành Playdate mới được đánh giá.
- Mỗi Parent chỉ được đánh giá một lần cho mỗi Playdate.
- Rating và Feedback được lưu để đánh giá chất lượng trải nghiệm và hỗ trợ Admin/Analytics.

---

# 12. Safety & Privacy ⭐

## 12.1 Safety

| Function          | Description                                           |
| ----------------- | ----------------------------------------------------- |
| Block User        | Chặn Parent; hai bên không thể kết nối hoặc nhắn tin. |
| Report User       | Báo cáo Parent khi có hành vi không phù hợp.          |
| Report Message    | Báo cáo message không phù hợp.                        |
| Remove Connection | Xóa Connection; không thể tiếp tục Direct Chat.       |

---

## 12.2 Privacy

| Function           | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| Hide Profile       | Ẩn Parent và Child Profile khỏi người dùng khác trong Discovery/Matching. |
| Connection Privacy | Cho phép chọn **Everyone** hoặc **Nobody** được gửi Connection Request.   |
| Message Privacy    | Chỉ cho phép **Connected Parents** gửi Direct Message.                    |

**Privacy Rules:**

- Thông tin Child chỉ hiển thị theo quyền riêng tư của Parent.

---

# 13. Verification

| Function           | Description                           |
| ------------------ | ------------------------------------- |
| Email Verification | Xác minh email khi đăng ký tài khoản. |
| Phone Verification | Xác minh số điện thoại bằng OTP.      |

Hiển thị **Verified Badge** khi Parent đã verify Email + Phone

**Flow**

```text
Register
   ↓
Verify Email
   ↓
Verify Phone
   ↓
✓ Verified Parent
```

---

# 14. Premium Subscription ⭐

## 14.1 Feature Comparation

| Feature                |                 Free |       Premium |
| ---------------------- | -------------------: | ------------: |
| Parent Profile         |                    1 |             1 |
| Child Profiles         |          **1 child** | **Unlimited** |
| Discovery / Matching   |   **5 profiles/day** | **Unlimited** |
| Connection Requests    | **5 requests/month** | **Unlimited** |
| Direct Chat            |                    ✓ |             ✓ |
| Playdate Chat          |                    ✓ |             ✓ |
| Playdate Creation      |          **3/month** | **Unlimited** |
| Playdate Participation |          **3/month** | **Unlimited** |
| Weekly Playdate Streak |                    ✓ |             ✓ |
| Badge                  |                    ✓ |             ✓ |
| Rating & Feedback      |                    ✓ |             ✓ |
| Safety & Privacy       |                    ✓ |             ✓ |
| AI Assistant           | **5 requests/month** | **Unlimited** |

---

## 14.2 Subscription Management

| Function                 | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| View Current Plan        | Xem gói hiện tại: Free hoặc Premium.                     |
| Subscribe to Premium     | Đăng ký gói Premium.                                     |
| Cancel Subscription      | Hủy gia hạn Premium.                                     |
| View Subscription Status | Xem trạng thái subscription: Active, Cancelled, Expired. |
| View Expiration Date     | Xem ngày hết hạn của Premium.                            |
| View Payment History     | Xem lịch sử thanh toán Premium.                          |

---

# 15. Admin Dashboard

## 15.1 User Management

| Function           | Description                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| View Parent        | Xem thông tin và trạng thái tài khoản của Parent.                      |
| View Child         | Xem thông tin Child Profile thuộc Parent.                              |
| Block / Unblock    | Khóa hoặc mở khóa tài khoản Parent khi cần.                            |
| View User Activity | Xem hoạt động cơ bản của Parent như Connections, Playdates và Reports. |
| View Subscription  | Xem gói Subscription và trạng thái Premium của Parent.                 |

## 15.2 Connection Management

| Function                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| View Connections        | Xem các Connection giữa Parent                  |
| View Connection Details | Xem thông tin hai Parent và thời gian kết nối   |
| Remove Connection       | Gỡ Connection khi có vi phạm hoặc yêu cầu xử lý |

## 15.3 Playdate Management

| Function              | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| View Playdates        | Xem các Playdate trên hệ thống                                |
| View Playdate Details | Xem Host, Participants, thời gian, Activity, Location, status |
| Cancel Playdate       | Hủy Playdate nếu vi phạm quy định hoặc liên quan Safety       |

## 15.4 Safety Management

| Function            | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| View Reports        | Xem danh sách các báo cáo về Parent và Message.               |
| View Report Details | Xem chi tiết nội dung, người báo cáo và đối tượng bị báo cáo. |
| Resolve Report      | Xử lý và cập nhật trạng thái Report sau khi xem xét.          |
| Block User          | Khóa Parent có hành vi vi phạm hoặc không phù hợp.            |

## 15.5 Subscription Management

| Function                    | Description                                                               |
| --------------------------- | ------------------------------------------------------------------------- |
| Manage Subscription Plans   | Quản lý thông tin, giá và chu kỳ của Subscription Plans.                  |
| View Subscription Status    | Xem trạng thái Subscription của Parent.                                   |
| View Payment History        | Xem lịch sử thanh toán Premium của Parent.                                |
| View Subscription Analytics | Xem thống kê Free/Premium, Active, Expired, Cancelled và Conversion Rate. |

## 15.6 Analytics

| Metric                       | Description                                                   |
| ---------------------------- | ------------------------------------------------------------- |
| Total Parents                | Tổng số Parent đã đăng ký.                                    |
| Active Parents               | Số Parent có hoạt động trong hệ thống trong 30 ngày gần nhất. |
| Connections                  | Tổng số Connection đã được tạo.                               |
| Total Playdates              | Tổng số Playdate được tạo.                                    |
| Completed Playdates          | Tổng số Playdate đã hoàn thành.                               |
| Cancelled Playdates          | Tổng số Playdate đã bị hủy.                                   |
| Active Premium Subscriptions | Số Parent đang có Premium Subscription hoạt động.             |
| Conversion Rate              | Tỷ lệ Free Parent chuyển sang Premium.                        |
| Total Revenue                | Tổng doanh thu từ Premium Subscription.                       |
| Monthly Revenue              | Doanh thu Premium Subscription trong từng tháng.              |
| AI Usage                     | Tổng số lượt sử dụng AI Assistant.                            |
| Streak Statistics            | Thống kê Weekly Playdate Streak của Parent.                   |
| Reports Statistics           | Thống kê số lượng và trạng thái các Report.                   |

---

# 16. Feature Map

```text
BUDDYLINK

│
├── AUTHENTICATION
│   ├── Register
│   ├── Login
│   ├── Logout
│   └── Password Recovery
│
├── PARENT
│   ├── Parent Profile
│   └── Child Profiles
│
├── DISCOVERY & MATCHING
│   ├── Discover Profiles
│   ├── Swipe
│   ├── Search
│   ├── Basic Filters
│   └── Smart Matching
│
├── CONNECTION
│   ├── Connection Request
│   ├── Accept / Decline
│   ├── Remove Connection
│   └── Block User
│
├── COMMUNICATION
│   ├── Direct Chat
│   ├── Playdate Chat
│   └── Notifications
│
├── PLAYDATE
│   ├── Create Playdate
│   ├── View / Manage Playdate
│   ├── Accept / Decline
│   ├── Reschedule
│   ├── Cancel
│   ├── Complete
│   ├── Playdate Chat
│   └── History
│
├── ACTIVITY & LOCATION
│   ├── Activity Suggestions
│   ├── Nearby Places
│   └── Place Details
│
├── AI
│   └── AI Family Assistant
│       ├── Find Matches
│       ├── Suggest Activities
│       ├── Find Nearby Places
│       ├── Plan Playdate
│       ├── Create / Update Playdate
│       ├── Reschedule Playdate
│       ├── Cancel Playdate
│       ├── Send Connection Request
│       └── Send Message
│
├── GAMIFICATION
│   ├── Weekly Playdate Streak
│   └── Badge
│
├── RATING & FEEDBACK
│   ├── Rate Playdate
│   ├── Give Feedback
│   └── View Rating & Feedback
│
├── SAFETY & PRIVACY
│   ├── Email Verification
│   ├── Phone Verification
│   ├── Block User
│   ├── Report User
│   ├── Report Message
│   ├── Remove Connection
│   ├── Hide Profile
│   ├── Connection Privacy
│   └── Message Privacy
│
├── PREMIUM
│   ├── Subscription
│   ├── Unlimited Children
│   ├── Unlimited Matching
│   ├── Unlimited Connection Requests
│   ├── Unlimited Playdate Creation
│   ├── Unlimited Playdate Participation
│   └── Unlimited AI Assistant
│
└── ADMIN
    ├── User Management
    │   ├── View Parent
    │   ├── View Child
    │   ├── Block / Unblock
    │   ├── View User Activity
    │   └── View Subscription
    │
    ├── Connection Management
    │   ├── View Connections
    │   └── Remove Connection
    │
    ├── Playdate Management
    │   ├── View Playdates
    │   ├── View Playdate Details
    │   └── Cancel Playdate
    │
    ├── Safety Management
    │   ├── View Reports
    │   ├── View Report Details
    │   ├── Resolve Report
    │   └── Block User
    │
    ├── Subscription Management
    │   ├── Manage Subscription Plans
    │   ├── View Subscription Status
    │   ├── View Payment History
    │   └── View Subscription Analytics
    │
    └── Analytics
        ├── User Statistics
        ├── Connection Statistics
        ├── Playdate Statistics
        ├── Subscription Statistics
        ├── Revenue
        └── AI Usage
```

---

# 17. Tech Stack

## Frontend

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React            | Build User Interface    |
| JavaScript       | Application Logic       |
| React Router     | Routing                 |
| Axios            | API Communication       |
| Tailwind CSS     | Styling                 |
| Socket.IO Client | Real-time Chat          |
| Recharts         | Analytics Visualization |

## Backend

| Technology | Purpose                    |
| ---------- | -------------------------- |
| Node.js    | Backend Runtime            |
| Express.js | REST API                   |
| JavaScript | Backend Application Logic  |
| MongoDB    | Database                   |
| Mongoose   | MongoDB Object Modeling    |
| JWT        | Authentication             |
| bcrypt     | Password Hashing           |
| Socket.IO  | Real-time Communication    |
| AI Agent   | AI Function / Tool Calling |

## External Services / APIs

| Technology / Service | Purpose                             |
| -------------------- | ----------------------------------- |
| Gemini / OpenAI API  | AI Assistant and AI Recommendations |
| Google Maps API      | Maps and Location Services          |
| Google Places API    | Search Nearby Places                |
| Cloud Storage        | Store Images and Media              |
| Email / OTP Service  | Email and Phone Verification        |

---

# 18. Business Model

**Primary Revenue Model: Premium Subscription**

```text
FREE
  ↓
Core Matching & Playdate Features
  ↓
Usage Limits & Advanced Needs
  ↓
PREMIUM
  ↓
Monthly Subscription
```

---

# 19. Product Value Proposition

> **BuddyLink helps parents find compatible playmates for their children, connect with other families, and use AI to plan meaningful playdates.**

### Core Differentiators

| Feature                 | Value                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Smart Matching**      | Tìm Child/Family phù hợp dựa trên độ tuổi, sở thích, hoạt động, personality, preferences và location.        |
| **AI Family Assistant** | AI hỗ trợ tìm bạn chơi, gợi ý hoạt động, tìm địa điểm và hỗ trợ lập kế hoạch Playdate thông qua một AI Chat. |
| **Playdate Planning**   | Chuyển kết nối online thành các Playdate thực tế với Participants, Activity, Date, Time và Location.         |
| **Gamification**        | Tăng engagement thông qua Weekly Playdate Streak và Badge.                                                   |
| **Premium Experience**  | Cung cấp unlimited usage và các tính năng nâng cao cho phụ huynh có nhu cầu sử dụng thường xuyên.            |
