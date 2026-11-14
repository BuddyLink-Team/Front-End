# 16. Kiến trúc hệ thống (System Architecture Diagram) — Giải thích & Kịch bản Thuyết trình

> **File sơ đồ gốc:** [`Doc/diagram/system_architecture.drawio`](../../Doc/diagram/system_architecture.drawio)

---

## 1. Tổng quan Kiến trúc Hệ thống (System Architecture Overview)

Hệ thống **BuddyLink (ACPM)** được thiết kế theo mô hình **Client-Server kết hợp Event-Driven Real-time Architecture**, tách biệt rõ ràng giữa **Front-End (Single Page Applications)**, **Back-End (Modular Monolith REST API & WebSocket Server)**, **Database (MongoDB Atlas)** và **Third-Party Services**.

Đặc biệt, hệ thống tách biệt **2 cổng giao tiếp độc lập (Dual-Portal Isolation)** cho **Parent** và **Admin** ở cả tầng Front-End lẫn Back-End để đảm bảo an toàn bảo mật và phân tải độc lập.

---

## 2. Chi tiết 5 Khối Kiến trúc trong Sơ đồ

### Khối 1: FRONT-END (Client Tier & Deployment)
- **Công nghệ cốt lõi:**
  - **React 18 + Vite:** Xây dựng giao diện SPA tốc độ cao, tối ưu bundle size và HMR.
  - **Tailwind CSS + Lucide / Motion:** Thiết kế UI/UX hiện đại, thân thiện với phụ huynh và mượt mà trên cả Desktop/Mobile.
  - **Redux Toolkit:** Quản lý Global State đồng bộ (Auth state, Chat unread badges, Notifications, Quota counters).
- **Triển khai (Deployment):** Hosted trên **Vercel**.

---

### Khối 2: BACK-END & DATABASE (Application & Data Tier)
- **Back-End Core (`Node.js` + `Express.js`):**
  - Thiết kế theo kiến trúc **Modular Monolith** (16 domain modules độc lập).
  - **JWT / Security:** Xác thực bằng Access Token + Refresh Token Rotation, Google OAuth 2.0, phân quyền RBAC (`parent` | `admin`), Helmet, CORS và Rate Limiting.
  - **Node-Cron:** Chạy các tiến trình ngầm tự động (nhắc lịch Playdate trước 24h & 1h, tự động hoàn thành/hủy Playdate quá hạn lúc 0h, tính lại chuỗi Weekly Streak, mở khóa tài khoản hết hạn đình chỉ mỗi 15 phút).
  - **Pino Logger:** Ghi log cấu trúc (structured JSON logging) hiệu năng cao.
- **Database (`MongoDB Atlas` + `Mongoose ODM`):**
  - Lưu trữ trên **26 Collections** chuẩn hóa với Schema Validation chặt chẽ.
- **Triển khai (Deployment):** Triển khai trên **Render**.

---

### Khối 3: REAL-TIME COMMUNICATION (Event-Driven Layer)
- **Socket.io Engine (WebSockets / Long-Polling fallback):**
  - Kết nối trực tiếp giữa `Socket.io Client` (FE) và `Socket.io Server` (BE) qua cơ chế **Rooms & Broadcast**.
  - Phục vụ 4 luồng thời gian thực:
    1. **Direct Chat & Playdate Group Chat** (tin nhắn, hình ảnh, thu hồi tin, trạng thái đã xem `message_read`, bình chọn `poll`).
    2. **In-App Notifications** cho phụ huynh (lời mời kết bạn, lời mời Playdate, mở khóa huy hiệu, gợi ý AI).
    3. **Admin Real-time Notification Board** (cảnh báo vi phạm mới, thanh toán thành công, Auto-Shield).
---

### Khối 4: THIRD-PARTY & EXTERNAL SERVICES (Tích hợp dịch vụ ngoài)
- **Google Gemini AI (`@google/genai`):** Bộ não cho **AI Family Assistant** (Function Calling lập kế hoạch Playdate) và **Sentinel AI** (kiểm duyệt đa phương thức văn bản + hình ảnh bằng chứng).
- **PayOS Gateway:** Cổng thanh toán tạo mã **VietQR** động và xử lý **Webhook đối soát tự động** cho gói cước Premium.
- **OpenStreetMap (Overpass API & Nominatim)** Đồng bộ địa điểm vui chơi trẻ em theo ô lưới bản đồ (`places_sync_tiles`).
- **Cloudinary & Email/SMS (Nodemailer / Firebase):** Lưu trữ ảnh đại diện, ảnh chat, ảnh bằng chứng báo cáo trên CDN và gửi mã OTP/Email xác thực.

---

### Khối 5: DEVOPS & TOOLS (Quy trình phát triển & Kiểm thử)
- **Git & GitHub:** Quản lý mã nguồn, phân nhánh feature và review Pull Request.
- **Jest & Vitest / Supertest (kèm `mongodb-memory-server`):** Kiểm thử Unit Test và Integration Test tự động trên DB ảo trong bộ nhớ.
- **Postman & ESLint:** Kiểm thử kịch bản API và đảm bảo chuẩn chất lượng code (`--max-warnings 0`).

---

## 3. Luồng Giao tiếp Dữ liệu (Data Flow Arrows trên Sơ đồ)

1. **`Fetch API (HTTP/REST)` & `Response (JSON)` (Mũi tên Xanh dương):** Giao tiếp đồng bộ giữa Front-End và Back-End cho các thao tác CRUD, xác thực, tìm kiếm và thanh toán.
2. **`WebSocket Events` & `Rooms & Broadcast` (Mũi tên Xanh lá nét đứt):** Giao tiếp bất đồng bộ hai chiều thời gian thực qua Socket.IO.
3. **`Query / Response (Mongoose ODM)` (Mũi tên Cam 2 chiều):** Back-End truy vấn và cập nhật dữ liệu xuống MongoDB Atlas.
4. **`SDK / REST APIs` (Mũi tên Tím nét đứt):** Back-End gọi tới các dịch vụ bên thứ 3 (Gemini AI, PayOS, OpenStreetMap, Cloudinary) thông qua lớp Adapter cô lập.

---

## 4. 🎤 Kịch bản Thuyết trình Slide System Architecture (60 giây)

> *"Trên màn hình là Sơ đồ Kiến trúc Tổng thể của hệ thống **BuddyLink**. Nhóm thiết kế hệ thống gồm 5 khối chính:*
>
> *1. **Ở phía Front-End (bên trái):** Ứng dụng được xây dựng bằng **React 18, Vite, Tailwind CSS và Redux Toolkit**, triển khai trên **Vercel**.*
> *2. **Ở phía Back-End (ở giữa):** Sử dụng **Node.js và Express** theo kiến trúc **Modular Monolith**. Back-End tích hợp **Node-Cron** để chạy các tác vụ ngầm như nhắc lịch hẹn và tính chuỗi Streak hàng tuần.*
> *3. **Về Cơ sở dữ liệu (bên phải):** Sử dụng **MongoDB Atlas** với **Mongoose ODM** quản lý **26 Collections**, tận dụng đánh chỉ mục địa lý **2dsphere** để tìm bạn chơi quanh khu vực và **TTL Index** cho các dữ liệu tự hủy.*
> *4. **Về Giao tiếp thời gian thực (phía dưới giữa):** Hệ thống sử dụng **Socket.io** kết nối 2 chiều giữa Front-End và Back-End để xử lý nhắn tin trực tiếp, chat nhóm Playdate, bình chọn khung giờ và đẩy thông báo tức thời.*
> *5. **Về Dịch vụ bên thứ 3 (góc dưới trái):** Hệ thống kết nối với **Google Gemini AI** cho trợ lý ảo và kiểm duyệt an toàn, **PayOS** cho thanh toán mã VietQR, **OpenStreetMap** cho bản đồ khu vui chơi, và **Cloudinary** để lưu trữ hình ảnh."*

