# Tài liệu Component Dùng Chung — BuddyLink Frontend

Tài liệu này chuẩn hóa toàn bộ các **Shared Components**, **Layouts**, **UI Primitives** và **Hooks** được trích xuất trực tiếp từ bản thiết kế trên **Stitch (Project: BuddyLink Playmate Platform)** và Design System ([DESIGN.md](./DESIGN.md)).

---

## 🎨 Design System Tokens (Stitch Theme)

- **Font chữ chính**: `Plus Jakarta Sans`
- **Màu sắc chủ đạo**:
  - `Primary` (Soft Matcha Green): `#7BAE7F` (Hover: `#66996a`, Dark: `#396940`)
  - `Secondary` (Soft Cloud Blue): `#92C5DE` / `#B1E4FE`
  - `Tertiary` (Warm Butter Yellow / Stars): `#F6D186` / `#BF9E58`
  - `Canvas Background`: `#FAFBF9` / `#F9F9FF`
  - `Surface (Card)`: `#FFFFFF`
  - `Hairline Border`: `#EDF2F0`
  - `Text Primary (Charcoal)`: `#2D3748` / `#121C2C`
  - `Text Muted (Slate Gray)`: `#718096` / `#717970`
- **Bo góc (Corner Radius)**:
  - Nút bấm & Input: `rounded-xl` (12px–14px)
  - Card & Panels: `rounded-2xl` (16px–20px)
  - Chips & Verification Pills: `rounded-full` (9999px)

---

## 📁 Cấu trúc thư mục `src/components/`

```text
src/components/
├── index.js             # Export tập trung (Barrel export) cho tất cả components
├── ui/                  # Các UI primitive cơ bản
│   ├── Button.jsx       # Nút bấm (Primary, Secondary, Outline, Ghost, Danger)
│   ├── Input.jsx        # Ô nhập liệu có focus ring matcha
│   ├── PasswordInput.jsx# Ô nhập mật khẩu có nút ẩn/hiện mắt
│   ├── Textarea.jsx     # Ô nhập văn bản nhiều dòng
│   ├── Checkbox.jsx     # Ô tích bo tròn nét mảnh kèm nhãn
│   ├── Switch.jsx       # Nút gạt bật/tắt (Toggle) mượt mà
│   ├── Select.jsx       # Menu thả lựa chọn bo tròn mềm mại
│   ├── Avatar.jsx       # Ảnh đại diện (bé, phụ huynh, trạng thái online)
│   └── DataTable.jsx    # Bảng dữ liệu có phân trang, sắp xếp và lọc
├── badges/              # Nhãn trạng thái & định danh
│   ├── VerifiedBadge.jsx# Huy hiệu Phụ huynh đã xác thực (Matcha Shield)
│   ├── StatusChip.jsx   # Chip trạng thái (Đã xác nhận, Chờ duyệt, Hủy...)
│   └── InterestTag.jsx  # Tag sở thích của bé (Lego, Vẽ tranh, Đá bóng...)
├── cards/               # Khung thẻ hiển thị dùng chung
│   ├── Card.jsx         # Card nền trắng, viền #EDF2F0, bo góc 16-20px
│   ├── StatCard.jsx     # Thẻ thống kê số liệu (Admin & Doanh thu)
│   └── EmptyState.jsx   # Trạng thái rỗng kèm minh họa và nút hành động
├── feedback/            # Phản hồi tương tác
│   ├── Modal.jsx        # Dialog popup mờ nền (Backdrop blur)
│   ├── ConfirmDialog.jsx# Hộp thoại xác nhận thao tác nguy hiểm (Hủy, Chặn, Xóa)
│   ├── Skeleton.jsx     # Hiệu ứng shimmer khi đang tải dữ liệu
│   ├── Spinner.jsx      # Biểu tượng xoay loading đồng bộ màu matcha
│   ├── LoadingOverlay.jsx# Lớp phủ tải dữ liệu toàn trang hoặc theo khối
│   ├── AppErrorBoundary.jsx # Bắt lỗi runtime của ứng dụng
│   └── PlaceholderPage.jsx  # Trang giữ chỗ cho các chức năng đang hoàn thiện
├── navigation/          # Điều hướng & menu
│   ├── Navbar.jsx       # Thanh điều hướng trên cùng (Logo, Menu, Thông báo, Avatar)
│   ├── Sidebar.jsx      # Thanh bên (cho Admin Dashboard & Cài đặt, hỗ trợ thu gọn)
│   ├── Tabs.jsx         # Thanh chuyển tab (Pill tabs bo tròn hoặc Line tabs)
│   └── Pagination.jsx   # Phân trang bảng danh sách
└── search/              # Bộ lọc & Tìm kiếm
    ├── SearchBar.jsx    # Thanh tìm kiếm có icon kính lúp
    └── FilterChips.jsx  # Hàng filter chọn nhanh (Độ tuổi, Bán kính km, Giới tính)
```

---

## 📊 Bảng tổng hợp trạng thái Triển khai Components

| Phân loại | Component | Đường dẫn | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **UI** | `Button` | `components/ui/Button.jsx` | ✅ Đã code | 5 variants, loading spinner, icons |
| **UI** | `Input` | `components/ui/Input.jsx` | ✅ Đã code | Label, helperText, error, icons |
| **UI** | `PasswordInput` | `components/ui/PasswordInput.jsx` | ✅ Đã code | Tích hợp toggle hiển thị mật khẩu |
| **UI** | `Textarea` | `components/ui/Textarea.jsx` | ✅ Đã code | Multi-line text, auto resize ring |
| **UI** | `Checkbox` | `components/ui/Checkbox.jsx` | ✅ Đã code | Bo góc, hiệu ứng checkmark matcha |
| **UI** | `Switch` | `components/ui/Switch.jsx` | ✅ Đã code | Toggle chuyển động mượt 3 kích thước |
| **UI** | `Select` | `components/ui/Select.jsx` | ✅ Đã code | Custom chevron, hỗ trợ options/children |
| **UI** | `Avatar` | `components/ui/Avatar.jsx` | ✅ Đã code | Kích thước sm/md/lg/xl, online badge |
| **UI** | `DataTable` | `components/ui/DataTable.jsx` | ✅ Đã code | Bảng dữ liệu đa năng |
| **Badges** | `VerifiedBadge` | `components/badges/VerifiedBadge.jsx` | ✅ Đã code | Matcha ShieldCheck icon |
| **Badges** | `StatusChip` | `components/badges/StatusChip.jsx` | ✅ Đã code | pending, confirmed, cancelled, reported, completed |
| **Badges** | `InterestTag` | `components/badges/InterestTag.jsx` | ✅ Đã code | Tag sở thích trẻ em, hỗ trợ click |
| **Cards** | `Card` | `components/cards/Card.jsx` | ✅ Đã code | Padding linh hoạt, hover elevation |
| **Cards** | `StatCard` | `components/cards/StatCard.jsx` | ✅ Đã code | Thống kê KPI, % tăng/giảm |
| **Cards** | `EmptyState` | `components/cards/EmptyState.jsx` | ✅ Đã code | Minh họa rỗng, CTA button |
| **Feedback** | `Modal` | `components/feedback/Modal.jsx` | ✅ Đã code | Backdrop blur, React portal |
| **Feedback** | `ConfirmDialog` | `components/feedback/ConfirmDialog.jsx` | ✅ Đã code | Warning/danger/info actions |
| **Feedback** | `<Toaster />` | `react-hot-toast` (cấu hình tại `App.jsx`) | ✅ Sẵn sàng | Định kiểu sẵn theo theme matcha, dùng qua hook `useToast` |
| **Feedback** | `Skeleton` | `components/feedback/Skeleton.jsx` | ✅ Đã code | Shimmer loading block |
| **Feedback** | `Spinner` | `components/feedback/Spinner.jsx` | ✅ Đã code | Vòng quay tải trang |
| **Feedback** | `LoadingOverlay` | `components/feedback/LoadingOverlay.jsx` | ✅ Đã code | Lớp phủ chờ thao tác |
| **Feedback** | `AppErrorBoundary` | `components/feedback/AppErrorBoundary.jsx` | ✅ Đã code | Bắt lỗi ứng dụng dự phòng |
| **Navigation** | `Navbar` | `components/navigation/Navbar.jsx` | ✅ Đã code | Header sticky với pill navigation |
| **Navigation** | `Sidebar` | `components/navigation/Sidebar.jsx` | ✅ Đã code | Collapsible sidebar cho Admin/Settings |
| **Navigation** | `Tabs` | `components/navigation/Tabs.jsx` | ✅ Đã code | Hỗ trợ kiểu Pill và Line tab |
| **Navigation** | `Pagination` | `components/navigation/Pagination.jsx` | ✅ Đã code | Phân trang kèm dấu chấm lửng (...) |
| **Search** | `SearchBar` | `components/search/SearchBar.jsx` | ✅ Đã code | Ô tìm kiếm có icon và submit trigger |
| **Search** | `FilterChips` | `components/search/FilterChips.jsx` | ✅ Đã code | Bộ chip lọc đơn/đa tiêu chí kèm nút Clear |

---

## 🧩 Danh mục Shared Components chi tiết (Theo màn hình Stitch)

### 1. Nhóm UI Primitives (`components/ui/`)

#### 🔘 `Button.jsx`
- **Mục đích**: Nút bấm dùng trên toàn bộ hệ thống (Landing page, Đăng ký, Đặt hẹn, Chat, Admin).
- **Variants**:
  - `primary`: Nền `#7BAE7F`, chữ trắng, bo tròn 14px hoặc `rounded-full`, hiệu ứng hover nhẹ `scale-[1.01]`.
  - `secondary`: Nền `#EBF4EE`, chữ matcha đậm `#396940`.
  - `outline`: Nền trong suốt, viền 1px `#7BAE7F`, chữ `#396940`.
  - `ghost`: Nền trong suốt, chữ `#2D3748`, hover nền `#F0F4F2`.
  - `danger`: Nền đỏ nhạt, viền đỏ `#BA1A1A` dùng cho nút Báo cáo/Chặn tài khoản.
- **Props**: `variant`, `size` (`sm`, `md`, `lg`), `isLoading`, `leftIcon`, `rightIcon`, `children`, `onClick`.

#### 📝 `Input.jsx` & `PasswordInput.jsx`
- **Mục đích**: Dùng cho form Đăng ký, Đăng nhập, Onboarding hồ sơ bé, Tìm kiếm.
- **Quy chuẩn**: Nền trắng, viền `#EDF2F0`, bo góc 12px. Khi `:focus` có ring viền matcha `rgba(123, 174, 127, 0.25)`.
- **Props**: `label`, `error`, `helperText`, `leftIcon`, `rightIcon`, `placeholder`, `disabled`.

#### 📜 `Textarea.jsx`
- **Mục đích**: Dùng cho việc nhập ghi chú cho bé, mô tả hồ sơ, tin nhắn phản hồi, lý do báo cáo vi phạm.
- **Quy chuẩn**: Nền trắng, viền `#EDF2F0`, bo góc 12px, có auto-focus ring matcha khi gõ.
- **Props**: `label`, `error`, `helperText`, `rows`, `placeholder`, `disabled`.

#### ☑️ `Checkbox.jsx`
- **Mục đích**: Dùng để đồng ý điều khoản an toàn khi đăng ký, lọc nhiều tiêu chí cùng lúc.
- **Quy chuẩn**: Ô tích bo mềm `rounded-md`, màu xanh primary khi checked, hỗ trợ cả `label` và `description` phụ.

#### 🔀 `Switch.jsx`
- **Mục đích**: Bật/tắt thông báo đẩy, chia sẻ vị trí realtime, chế độ nhận lời mời kết bạn.
- **Quy chuẩn**: Nút gạt bo tròn tròn trịa, hiệu ứng trượt mượt mà, hỗ trợ 3 kích cỡ `sm`, `md`, `lg`.

#### 🔽 `Select.jsx`
- **Mục đích**: Chọn khoảng cách bán kính tìm kiếm (3km, 5km, 10km), chọn nhóm tuổi, giới tính của bé.
- **Quy chuẩn**: Dropdown bo góc 12px, có icon chevron tinh gọn, tương thích chuẩn form validation.

#### 🖼️ `Avatar.jsx`
- **Mục đích**: Hiển thị ảnh đại diện phụ huynh, avatar bé, hoặc chatbot AI.
- **Quy chuẩn**: Bo tròn tuyệt đối (`rounded-full`), có viền trắng 2px và chấm xanh báo trạng thái online/offline.

---

### 2. Nhóm Badges & Chips (`components/badges/`)

#### 🛡️ `VerifiedBadge.jsx` (Dấu ấn đặc trưng BuddyLink)
- **Mục đích**: Hiển thị huy hiệu "Phụ huynh đã xác thực danh tính" xuất hiện trên Card ghép đôi, Hồ sơ công khai, Khung chat.
- **Giao diện**: Chip nền matcha nhạt `#EAF3EC`, chữ `#3D6841`, icon khiên bảo vệ (ShieldCheck).

#### 🏷️ `StatusChip.jsx`
- **Mục đích**: Hiển thị trạng thái cuộc hẹn chơi (Playdate), trạng thái thanh toán, báo cáo vi phạm.
- **Variants**:
  - `pending` (Chờ phản hồi): Nền vàng kem `#FEF7E6`, chữ nâu cam `#755A1B`.
  - `confirmed` (Đã xác nhận): Nền matcha `#EAF3EC`, chữ `#3D6841`.
  - `cancelled` (Đã hủy): Nền xám nhạt `#EDF2F0`, chữ `#718096`.
  - `reported` (Vi phạm): Nền đỏ pastel `#FFDAD6`, chữ `#BA1A1A`.
  - `completed` (Đã hoàn thành): Nền mây xanh `#E7EEFF`, chữ `#30647B`.

#### 🎨 `InterestTag.jsx`
- **Mục đích**: Hiển thị các nhãn sở thích của bé (Lego, Đọc sách, Bơi lội, Vẽ...) và độ tuổi (`4-6 tuổi`).
- **Giao diện**: Bo tròn `rounded-full`, nền pastel nhẹ (`#F0F3FF` hoặc `#FAF4E8`), kích thước nhỏ gọn (`label-sm`).

---

### 3. Nhóm Cards & Containers (`components/cards/`)

#### 🎴 `Card.jsx`
- **Mục đích**: Khung thẻ cơ bản nhất của giao diện (Level 0 Resting Surface).
- **Quy chuẩn**: Nền trắng `#FFFFFF`, viền hairline 1px `#EDF2F0`, bo góc `rounded-2xl` (16px–20px), padding rộng rãi `1.25rem`–`1.5rem`. Không đổ bóng đậm để giữ nét thanh lịch phẳng.

#### 📊 `StatCard.jsx`
- **Mục đích**: Hiển thị thẻ chỉ số trên màn hình Dashboard Quản trị & Doanh thu (Tổng phụ huynh, Lịch hẹn thành công, Doanh thu PayOS).
- **Props**: `title`, `value`, `changePercentage`, `icon`, `trend` (`up` | `down`).

#### 📭 `EmptyState.jsx`
- **Mục đích**: Hiển thị khi không tìm thấy bạn chơi lân cận, hòm thư chat trống, hoặc chưa có lịch hẹn nào.
- **Giao diện**: Icon minh họa nét mảnh Lucide, tiêu đề thân thiện, mô tả ngắn và một nút bấm hành động (ví dụ: *"Tìm bạn ngay"*).

---

### 4. Nhóm Phản hồi & Tương tác (`components/feedback/`)

#### 💬 `Modal.jsx` / `BottomSheet.jsx`
- **Mục đích**: Dùng cho Modal Đặt lịch hẹn chơi, Modal Báo cáo an toàn, Modal Gợi ý AI, Chi tiết giao dịch.
- **Quy chuẩn**:
  - Lớp nền mờ: `backdrop-filter: blur(8px); background-color: rgba(45, 55, 72, 0.25);`
  - Hộp nội dung: Bo góc 24px (`rounded-3xl`), bóng đổ mịn `0 16px 40px -8px rgba(45, 55, 72, 0.08)`.

#### ⚠️ `ConfirmDialog.jsx`
- **Mục đích**: Xác nhận nhanh các thao tác quan trọng (Hủy cuộc hẹn, Chặn phụ huynh khác, Đăng xuất).

#### 🍞 Toast Notification (`react-hot-toast` & `useToast`)
- **Mục đích**: Thông báo nhanh kết quả hành động (lưu thành công, gửi lời mời hẹn chơi, phát sinh lỗi).
- **Cách dùng**: Được cấu hình trực tiếp tại `<Toaster />` trong [`App.jsx`](../src/App.jsx) theo đúng bảng màu Design System (nền trắng bo tròn 16px, viền hairline `#EDF2F0`, icon xanh matcha `#7BAE7F` hoặc đỏ lỗi `#BA1A1A`). Trong component chỉ cần gọi hook `useToast()`:
  ```jsx
  import { useToast } from '../../hooks/useToast';
  const { success, error } = useToast();
  success('Đã gửi lời mời ghép đôi thành công!');
  ```

#### ⏳ `Skeleton.jsx` & `Spinner.jsx`
- **Mục đích**: Giữ khung layout với hiệu ứng animation shimmer xám nhạt hoặc spinner xoay màu xanh matcha trong lúc chờ nạp dữ liệu.

---

### 5. Nhóm Điều hướng (`components/navigation/`)

#### 🧭 `Navbar.jsx`
- **Mục đích**: Header chính của ứng dụng phụ huynh:
  - Bên trái: Logo BuddyLink SVG.
  - Ở giữa: Menu chuyển nhanh (*Khám phá*, *Cuộc hẹn*, *Bạn bè*, *Trò chuyện*, *Trợ lý AI*).
  - Bên phải: Chuông thông báo (kèm badge đỏ số tin chưa đọc) và User Menu Dropdown.

#### 📑 `Tabs.jsx`
- **Mục đích**: Chuyển đổi tab trên màn hình Quản lý Cuộc hẹn (*Sắp tới*, *Đã hoàn thành*, *Đã hủy*) hoặc Quản trị (*Người dùng*, *Báo cáo*, *Hội viên*).
- **Giao diện**: Hỗ trợ 2 kiểu: Dạng Pill Tab mềm mại bo tròn hoặc dạng Line Tab gạch chân.

#### 🗂️ `Sidebar.jsx`
- **Mục đích**: Thanh điều hướng bên sườn cho trang Quản trị viên (Admin Dashboard) hoặc Cài đặt tài khoản. Hỗ trợ thu gọn/mở rộng mượt mà và hiển thị badge đếm số lượng việc cần xử lý.

#### 🔢 `Pagination.jsx`
- **Mục đích**: Phân trang danh sách lịch hẹn, danh sách người dùng quản trị, lịch sử giao dịch.

---

### 6. Nhóm Tìm kiếm & Lọc (`components/search/`)

#### 🔍 `SearchBar.jsx`
- **Mục đích**: Tìm kiếm theo tên phụ huynh, tên bé, khu vực hoặc trường học.
- **Props**: `value`, `onChange`, `onSearch`, `placeholder`.

#### 🎛️ `FilterChips.jsx`
- **Mục đích**: Hàng chip lọc nhanh phía trên màn hình Khám phá ghép đôi (VD: `Gần nhất (<5km)`, `Bé 3-5 tuổi`, `Có cùng sở thích`). Hỗ trợ chọn đơn hoặc đa tiêu chí và nút Clear nhanh.

---

## 🪝 Danh sách Custom Hooks Dùng Chung (`src/hooks/`)

| Hook | Chức năng | Trạng thái |
| :--- | :--- | :--- |
| `useDebounce` | Hoãn tìm kiếm khi người dùng gõ vào SearchBar để giảm tải API | ✅ Đã code |
| `useClickOutside` | Tự động đóng Dropdown menu hoặc Modal khi click ra ngoài | ✅ Đã code |
| `useSocketEvent` | Lắng nghe sự kiện realtime (tin nhắn mới, thông báo mới) từ Socket.io | ✅ Đã code |
| `useToast` | Kích hoạt toast thông báo thành công / lỗi nhanh gọn | ✅ Đã code |
| `useMediaQuery` | Nhận diện kích thước màn hình Mobile (`<768px`) hay Desktop | ✅ Đã code |
| `usePagination` | Tính toán trang hiện tại, trang trước/sau và dấu ba chấm trang | ✅ Đã code |
| `useSidebar` | Quản trị trạng thái đóng/mở thanh Sidebar và lưu vào LocalStorage | ✅ Đã code |
| `useDropdownToggle` | Quản trị mở/đóng các popup menu | ✅ Đã code |
| `useTableSort` | Sắp xếp dữ liệu bảng theo cột tăng/giảm | ✅ Đã code |
| `useSearch` | Bộ lọc tìm kiếm client-side nhanh theo từ khóa | ✅ Đã code |