# Đặc tả Kiến trúc Giao diện (UI Architecture Specification) - BuddyLink

Dựa trên việc phân tích cấu trúc CSDL (`DATABASE_SCHEMA.md`) và yêu cầu nghiệp vụ (`PROJECT_OVERVIEW.md`), dưới đây là tài liệu Đặc tả Kiến trúc Giao diện chi tiết, sẵn sàng để tích hợp vào tài liệu SRS và làm tài liệu đầu vào cho đội ngũ UI/UX Designer, Frontend Developer (React/Angular).

---

## 1. Danh sách màn hình (List Screens)

### 1.1. Phân hệ Parent (Mobile App / Web Responsive)

| Phân hệ chức năng | Tên Giao diện (UI Component) | Loại UI (UI Type) | Ghi chú & Logic Database liên kết |
| :--- | :--- | :--- | :--- |
| **Authentication** | Đăng nhập (Login) | `[Screen]` | Đăng nhập qua Email/Password hoặc Google OAuth. |
| | Đăng ký (Register) | `[Screen]` | |
| | **Xác thực OTP (Phone/Email)** | `[Modal/Screen]` | Nhập OTP/Token xác thực từ `auth_tokens`. Hỗ trợ đếm ngược TTL. |
| | Quên mật khẩu / Đặt lại mật khẩu | `[Screen]` | Xác thực qua token (`auth_tokens`). |
| **Parent/Child Profile** | Cài đặt Parent Preferences | `[Screen]` | Onboarding luồng đầu tiên để thiết lập bộ lọc Matching. |
| | Quản lý Child Profiles | `[Screen]` | Danh sách các bé của Parent. |
| | Thêm/Sửa Child Profile | `[Bottom Sheet/Screen]` | Nhập độ tuổi, sở thích, tính cách. |
| | Parent Profile & Cài đặt (Settings) | `[Screen]` | Chỉnh sửa Avatar, Bio, Vị trí (Location). |
| | Cài đặt Quyền riêng tư (Privacy) | `[Screen]` | Cấu hình ẩn/hiện profile, tin nhắn từ `privacySettings`. |
| **Discovery & Matching** | Khám phá Bạn chơi (Discovery) | `[Tab/Screen]` | Giao diện Swipe thẻ Child Profile. |
| | Bộ lọc Tìm kiếm (Filters) | `[Bottom Sheet]` | Điều chỉnh khoảng cách, độ tuổi, sở thích. |
| | Chi tiết Child Profile | `[Modal/Screen]` | Xem thông tin chi tiết trước khi gửi Connection Request. |
| | **Cảnh báo Hết hạn mức (Paywall)** | `[Popup/Modal]` | Hiển thị khi Parent Free vượt quá quota (dựa trên `usage_quotas` cho views/requests). Khuyến nghị nâng cấp Premium. |
| **Connection & Chat** | Danh sách Connections & Requests | `[Tab/Screen]` | Quản lý lời mời (Pending) và Bạn bè (Accepted). |
| | Chi tiết Connection Request | `[Modal]` | Xác nhận Chấp nhận (Accept) / Từ chối (Decline). |
| | Danh sách Hộp thoại (Conversations) | `[Tab/Screen]` | Danh sách Direct Chat và Playdate Chat. |
| | Trò chuyện 1-1 (Direct Chat) | `[Screen]` | Nhắn tin trực tiếp giữa 2 Parents. |
| | Playdate Group Chat | `[Screen]` | Trò chuyện chung của sự kiện Playdate. |
| **Playdate Mgmt.** | Danh sách Sự kiện (Playdates) | `[Tab/Screen]` | Liệt kê Upcoming, Completed, Cancelled. |
| | Chi tiết Playdate | `[Screen]` | Trạng thái từng participant, địa điểm, thời gian. |
| | Tạo Playdate (Create) | `[Screen]` | Form nhập liệu hoạt động, địa điểm, chọn bé và participants. |
| | Tìm kiếm Địa điểm (Places Search) | `[Bottom Sheet]` | Tích hợp map/list lấy từ `places_cache` và Google Maps. |
| | **Đề xuất Đổi lịch (Reschedule)** | `[Modal]` | Nhập Date/Time/Location mới, cập nhật vào bảng `reschedule_requests`. Yêu cầu sự đồng thuận. |
| | **Đánh giá & Nhận xét (Rating)** | `[Modal/Popup]` | Hiển thị ngay khi Playdate chuyển sang `completed`. Lưu vào `ratings_feedbacks`. |
| **AI Assistant** | **Giao diện AI Family Assistant** | `[Screen]` | Chatbot UI chuyên biệt lưu trữ vào `ai_chat_sessions`. Hỗ trợ các khối UI Tool Calls phong phú (Thẻ địa điểm, Popup tạo/đổi lịch Playdate). |
| **Gamification** | Bảng Thành tích (Badges & Streak) | `[Screen]` | Hiển thị Streak và các Badge (từ `user_badges`). |
| | Thông báo Đạt Huy hiệu/Streak | `[Popup]` | Bắn popup chúc mừng với animation sinh động. |
| **Subscription** | Quản lý Gói cước (Plans) | `[Screen]` | So sánh Free vs Premium, mua gói (`subscription_plans`). |
| | Cổng Thanh toán (Checkout) | `[Screen]` | Tích hợp payment gateway. Cập nhật vào `payments`. |
| | Lịch sử Giao dịch | `[Screen]` | Hóa đơn và thời hạn gia hạn của `subscriptions`. |
| **Safety** | Báo cáo Vi phạm (Report) | `[Bottom Sheet]` | Báo cáo User/Message/Playdate vào `reports`. |
| | Quản lý Chặn (Blocked Users) | `[Screen]` | Danh sách người bị chặn từ `blocks`. |

---

### 1.2. Phân hệ Admin (Web Dashboard)

| Phân hệ chức năng | Tên Giao diện (UI Component) | Loại UI (UI Type) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Authentication** | Đăng nhập Admin | `[Screen]` | Login dành riêng cho Role Admin. |
| **Dashboard** | Analytics Dashboard | `[Screen]` | Biểu đồ tổng quan Users, Playdates, Revenue, AI Usage. |
| **User Mgmt.** | Quản lý Users (Parents & Children) | `[Screen]` | Datatable với bộ lọc tìm kiếm. |
| | Chi tiết User & Subscription | `[Drawer/Modal]` | Xem đầy đủ hồ sơ, lịch sử payment, danh sách con cái. |
| **Playdate Mgmt.** | Quản lý Connections & Playdates | `[Screen]` | Datatable hiển thị các kết nối và lịch hẹn trên hệ thống. |
| **Safety Mgmt.** | **Danh sách Reports (Vi phạm)** | `[Screen]` | Bảng danh sách báo cáo cần xử lý. |
| | **Chi tiết Xử lý Vi phạm** | `[Drawer/Modal]` | Hiển thị bằng chứng (Message/User info), nhập Notes và thao tác Resolve/Ban/Unban. |
| **Billing Mgmt.** | Quản lý Gói cước & Doanh thu | `[Screen]` | Thống kê dòng tiền, thiết lập giá gói cước. |

---

## 2. Screen Flow (Luồng điều hướng cốt lõi)

### 2.1. Luồng Người dùng Parent

**A. Đăng ký & Onboarding (Có Database Tracking)**
```text
[Đăng ký/Register] 
  ──> [Modal Nhập Email OTP] (Lưu/check từ auth_tokens)
  ──> [Modal Nhập Phone OTP] (Lưu/check từ auth_tokens) 
  ──> [Onboarding: Parent Preferences] (Cập nhật `parents.preferences`)
  ──> [Tạo Child Profile] (Insert vào `children`)
  ──> [Màn hình chính: Discovery Tab]
```

**B. Khám phá (Discovery) & Kết nối**
```text
[Tab Khám phá (Swipe Thẻ)] 
  ──> (Quẹt Phải/Gửi Request) 
  ──> [Kiểm tra Limit - `usage_quotas`] 
         ├── (Nếu hết hạn mức) ──> [Popup/Paywall Upgrade Premium]
         └── (Nếu hợp lệ) ──> (Thành công - Ghi vào `connections`)
  ──> [Tab Notifications của Đối tác] 
  ──> [Tab Connections] ──> (Chấp nhận Lời mời)
  ──> [Mở khóa Hộp thoại] ──> [Màn hình Direct Chat 1-1]
```

**C. Lên lịch Playdate với AI Assistant (Sử dụng Tool Calls UI)**
```text
[Màn hình AI Assistant] 
  ──> (User chat: "Tìm địa điểm công viên cho bé")
  ──> [UI Block: Tool Call Gợi ý Địa điểm] (Render danh sách cards từ AI)
  ──> (User chọn Địa điểm & Chat: "Lên lịch chiều thứ 7 với bé A")
  ──> [UI Block: Modal/Popup Xác nhận Tạo Playdate]
  ──> (User bấm Xác nhận) 
  ──> (Playdate chuyển trạng thái `upcoming`)
  ──> [Tự động sinh Room Playdate Chat] ──> [Điều hướng vào Playdate Chat]
```

**D. Quản lý Sự kiện Playdate & Đánh giá/Gamification**
```text
[Thông báo Lời mời Playdate] 
  ──> [Màn hình Chi tiết Playdate]
  ──> (Phản hồi) 
         ├── (Accept) ──> Trạng thái Participant: `accepted`
         ├── (Decline) ──> Trạng thái Participant: `declined`
         └── (Reschedule) ──> [Modal Đề xuất Đổi lịch] ──> (Lưu `reschedule_requests` chờ duyệt)
  ──> (Sự kiện diễn ra xong) ──> (Chuyển trạng thái Playdate: `completed`)
  ──> [Modal Đánh giá & Feedback 5 Sao] (Xuất hiện ngay khi hoàn thành, lưu vào `ratings_feedbacks`)
  ──> (Cập nhật hệ thống logic Streak)
  ──> [Popup Chúc mừng Đạt Badge / Streak Mới]
```

**E. Nâng cấp Subscription Premium**
```text
[Popup Paywall] (từ Discovery/AI limit) hoặc [Settings] 
  ──> [Màn hình Quản lý Subscription Plans]
  ──> (Chọn gói) ──> [Cổng Thanh toán (Payment Gateway)]
  ──> (Thanh toán thành công) ──> (Cập nhật `payments` & `subscriptions`)
  ──> [Màn hình Success] ──> [Màn hình Lịch sử Giao dịch]
```

---

### 2.2. Luồng Quản trị viên (Admin)

**A. Quy trình Quản lý Tổng thể**
```text
[Login Admin] ──> [Dashboard Analytics (Biểu đồ, Thống kê tổng quan)]
  ──> (Điều hướng Sidebar)
         ├── [Quản lý User/Child] ──> [Drawer Chi tiết User]
         ├── [Quản lý Playdates] ──> [Drawer Chi tiết Sự kiện]
         └── [Báo cáo Doanh thu] ──> [Bảng chi tiết Transactions]
```

**B. Quy trình Safety / Moderation (Xử lý Vi phạm chuyên sâu)**
```text
[Menu Safety / Quản lý Báo cáo]
  ──> [Màn hình Danh sách Reports (Pending)]
  ──> (Click chọn một Report vi phạm)
  ──> [Drawer/Modal Chi tiết Báo cáo] 
         ├── (Xem bằng chứng Text, Image, ID Đối tượng bị report)
         ├── (Xem lịch sử vi phạm của User này)
  ──> (Nhập form Admin Notes xử lý)
  ──> (Hành động: Khóa User / Xóa Chat / Hủy Playdate)
  ──> (Chuyển trạng thái Report sang `resolved`)
  ──> [Quay lại Danh sách Reports]
```
