# 17. Sơ đồ gói Front-End & Back-End (Package Diagrams) — Giải thích & Kịch bản Thuyết trình

> **File sơ đồ gốc:**
> - Back-End: [`Doc/diagram/backend_package_diagram.drawio`](../../Doc/diagram/backend_package_diagram.drawio)
> - Front-End: [`Doc/diagram/frontend_package_diagram.drawio`](../../Doc/diagram/frontend_package_diagram.drawio)

---

## PHẦN A: BACK-END PACKAGE DIAGRAM (`«subsystem» Back-End`)

### 1. Nguyên lý Thiết kế: Modular Monolith 4 Tầng
Back-End được tổ chức theo kiến trúc **Modular Monolith kết hợp Layered Architecture**, chia thành **4 tầng (Layers)** rõ ràng với chiều phụ thuộc một chiều từ trên xuống dưới (không có phụ thuộc vòng):

| Tầng (Layer) | Màu trên sơ đồ | Các Packages bên trong | Vai trò & Trách nhiệm chính |
| :--- | :---: | :--- | :--- |
| **1. Transport & Entry Layer** | Xanh ngọc (Teal) | `middlewares`, `sockets`, `jobs` | Cổng tiếp nhận mọi giao tiếp vào hệ thống:<br>• **`middlewares`**: Xác thực JWT, RBAC (`parent`/`admin`), kiểm tra trạng thái đình chỉ/khóa tài khoản, bắt lỗi tập trung, giới hạn tần suất (Rate Limit).<br>• **`sockets`**: Quản lý kết nối Socket.IO, xác thực handshake, chia phòng (`conversationId`, `userId`, `admin`).<br>• **`jobs`**: Các cronjob định kỳ (nhắc lịch Playdate 24h/1h, tự hoàn thành/hủy buổi hẹn lúc 0h, tính lại Weekly Streak, gỡ đình chỉ tài khoản hết hạn). |
| **2. Business Domain Layer (`modules`)** | Xanh dương (Blue) | **16 Domain Packages:**<br>`admin`, `ai-assistant`, `auth`, `chat`, `child`, `connection`, `discovery`, `gamification`, `notification`, `parent`, `places`, `playdate`, `rating-feedback`, `safety`, `subscription`, `user` | Trái tim nghiệp vụ của hệ thống. Mỗi module tự đóng gói theo chuẩn **Controller → Service → Repository → Model (Mongoose) + DTO + Rules + Validator**. Các module giao tiếp với nhau qua lớp `Service` thay vì truy cập chéo `Model` của nhau. |
| **3. External Integrations Layer (`integrations`)** | Vàng cam (Amber) | **10 Adapter Packages:**<br>`ai`, `firebase`, `google`, `mail`, `maps`, `payos`, `search`, `sms`, `storage`, `weather` | Đóng vai trò **Adapter / Anti-Corruption Layer** bọc các SDK và API bên thứ 3 (Gemini AI, Firebase, Google OAuth, Nodemailer, OpenStreetMap Overpass/Nominatim, PayOS VietQR, Tavily Search, SMS OTP, Cloudinary, Weather). Nếu đổi nhà cung cấp bên thứ 3, chỉ cần sửa tại tầng này mà không ảnh hưởng tới `modules`. |
| **4. Shared & Config Layer (`shared & config`)** | Tím (Purple) | **6 Packages:**<br>`config`, `exceptions`, `response`, `events`, `helpers`, `logger & constants` | Hạ tầng dùng chung toàn cục: biến môi trường (`config`), lớp lỗi chuẩn `AppError` (`exceptions`), chuẩn hóa JSON trả về (`response`), Event Bus nội bộ (`events`), hàm tiện ích (`helpers`), và `Pino logger` + hằng số hệ thống. |

### 2. Giải thích các Mũi tên Quan hệ UML (Back-End)
- `modules` **`«use»`** `middlewares` & `sockets`: Các route của module gắn middleware bảo vệ và phát sự kiện real-time qua socket.
- `jobs` **`«access»`** `modules`: Các tiến trình nền gọi vào `Service` của các module (`playdate`, `gamification`, `subscription`, `user`) để thực thi tác vụ định kỳ.
- `modules` **`«access»`** `integrations`: Các module nghiệp vụ gọi qua lớp tích hợp ngoài (ví dụ: `ai-assistant` và `safety` gọi `integrations/ai`; `subscription` gọi `integrations/payos`; `places` gọi `integrations/maps` và `integrations/search`).
- `Transport`, `modules`, `integrations` **`«import»`** `shared & config`: Mọi tầng đều sử dụng chung cấu hình, chuẩn phản hồi, xử lý lỗi và logger.

---

## PHẦN B: FRONT-END PACKAGE DIAGRAM (`«subsystem» Front-End`)

### 1. Nguyên lý Thiết kế: Feature-Sliced / Modular UI 3 Tầng
Front-End (React + Vite + Redux Toolkit) được thiết kế đồng bộ **1-1 với các domain nghiệp vụ của Back-End**, chia thành **3 tầng (Layers)** từ trên xuống dưới:

| Tầng (Layer) | Màu trên sơ đồ | Các Packages bên trong | Vai trò & Trách nhiệm chính |
| :--- | :---: | :--- | :--- |
| **1. Presentation Layer** | Xanh dương (Blue) | `app`, `routes`, `layouts`, `components` | Tầng khởi tạo và khung giao diện chung:<br>• **`app`**: Khởi tạo Redux Store, Providers, Theme, Socket Context.<br>• **`routes`**: Định tuyến URL, Protected Routes (`ParentRoute`, `AdminRoute`).<br>• **`layouts`**: Khung bố cục trang (`MainLayout`, `AuthLayout`, `AdminLayout`, Sidebar/Navbar).<br>• **`components`**: Thư viện UI tái sử dụng (Buttons, Modals, Badges, Inputs, Skeletons). |
| **2. Feature Modules Layer (`modules`)** | Xanh lá (Green) | **15 Feature Packages:**<br>`admin`, `ai-assistant`, `auth`, `chat`, `child`, `connection`, `discovery`, `gamification`, `notification`, `parent`, `playdate`, `rating-feedback`, `safety`, `subscription`, `user` | Mỗi phân hệ nghiệp vụ đóng gói đầy đủ các trang (Pages), thành phần con đặc thù (Feature Components), Redux Slice và logic xử lý giao diện riêng của phân hệ đó. |
| **3. Infrastructure & Shared Layer** | Tím (Purple) | **6 Packages:**<br>`services`, `hooks`, `utils`, `constants`, `styles`, `assets` | Tầng hạ tầng kỹ thuật phía Client:<br>• **`services`**: Axios HTTP Client (kèm Interceptor tự động gắn JWT và làm mới Refresh Token), Socket.IO client.<br>• **`hooks`**: Custom React Hooks (`useAuth`, `useSocket`, `useDebounce`...).<br>• **`utils` & `constants`**: Hàm định dạng ngày giờ, khoảng cách, hằng số enum.<br>• **`styles` & `assets`**: Cấu hình Tailwind CSS, fonts, icons và hình ảnh tĩnh. |

### 2. Giải thích các Mũi tên Quan hệ UML (Front-End)
- **Trong tầng Presentation:** `app` `«import»` `routes` $\rightarrow$ `routes` `«use»` `layouts` $\rightarrow$ `layouts` `«use»` `components`.
- **Giữa Presentation và `modules`:** `app`, `routes`, `layouts` nạp các trang từ `modules`; ngược lại các `modules` tái sử dụng các UI chung từ `components` (`«use»`).
- **Từ `modules` xuống Infrastructure:** Các feature modules truy cập `services` (`«access»`) để gọi API/Socket, và sử dụng `hooks`, `utils`, `constants`, `styles`, `assets` (`«use»` / `«import»`).

---

## 3. 🎤 Kịch bản Thuyết trình Slide Package Diagrams (60 giây)

### Khi chiếu Slide Back-End Package Diagram:
> *"Về tổ chức mã nguồn Back-End, nhóm áp dụng kiến trúc **Modular Monolith chia làm 4 tầng**:*
> *- **Tầng trên cùng (Transport & Entry):** Gồm `middlewares` kiểm soát xác thực/phân quyền, `sockets` quản lý kết nối thời gian thực, và `jobs` chạy các cronjob ngầm.*
> *- **Tầng thứ hai (`modules`):** Gồm **16 packages nghiệp vụ độc lập** như `discovery`, `playdate`, `chat`, `ai-assistant`, `safety`, `subscription`... Mỗi module đều tuân thủ cấu trúc Controller – Service – Repository – Model.*
> *- **Tầng thứ ba (`integrations`):** Gồm **10 adapter packages** bọc toàn bộ các dịch vụ bên ngoài như Gemini AI, PayOS, OpenStreetMap, Cloudinary. Cách tách này giúp nghiệp vụ lõi không bị phụ thuộc cứng vào bên thứ 3.*
> *- **Tầng dưới cùng (`shared & config`):** Chứa các tiện ích dùng chung như cấu hình, xử lý lỗi tập trung `AppError` và `Pino Logger`."*

### Khi chiếu Slide Front-End Package Diagram:
> *"Tương ứng với Back-End, kiến trúc gói của Front-End được chia làm **3 tầng** theo hướng **Feature-Based Modular**:*
> *- **Tầng Presentation (màu xanh dương):** Quản lý khởi tạo ứng dụng (`app`), định tuyến phân quyền (`routes`), khung bố cục (`layouts`) và các `components` UI dùng chung.*
> *- **Tầng `modules` (màu xanh lá):** Gồm **15 feature packages** ánh xạ đồng nhất với các module của Back-End, giúp việc phát triển và bảo trì theo từng tính năng rất độc lập.*
> *- **Tầng Infrastructure & Shared (màu tím):** Cung cấp Axios client có sẵn cơ chế tự động làm mới token (`services`), các custom `hooks`, `utils` và cấu hình giao diện dùng chung cho toàn bộ ứng dụng."*

