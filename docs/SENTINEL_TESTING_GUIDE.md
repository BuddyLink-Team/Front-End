# HƯỚNG DẪN KIỂM THỬ TÍNH NĂNG BUDDYLINK SENTINEL AI COPILOT

Tài liệu này hướng dẫn chi tiết các bước kiểm thử luồng hoạt động của hệ sinh thái **BuddyLink Sentinel (AI-Powered Child Safety & Autonomous Moderation)** trên giao diện Admin Portal và Back-End API.

---

## 1. CHUẨN BỊ MÔI TRƯỜNG KIỂM THỬ

### 1.1. Back-End

1. Mở terminal tại thư mục `Back-End`:
   ```bash
   cd d:\CN8\WDP301\Back-End
   ```
2. Đảm bảo file `.env` đã được cấu hình Gemini API Key:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=<your_gemini_api_key>
   GEMINI_MODEL=gemini-3.5-flash-lite
   GEMINI_FALLBACK_MODEL=gemini-3.8-flash
   ```
3. Chạy lệnh kiểm tra kết nối AI:
   ```bash
   npm run ai:check
   ```
   _(Kết quả in ra `Ping OK with gemini-3.5-flash-lite...` là đạt)._
4. Khởi động server Back-End:
   ```bash
   npm run dev
   ```
   _(Server chạy trên cổng `http://localhost:5000` và Admin API trên `http://localhost:5000/api/v1/admin`)._

### 1.2. Front-End

1. Mở terminal tại thư mục `Front-End`:
   ```bash
   cd d:\CN8\WDP301\Front-End
   ```
2. Khởi động ứng dụng Front-End:
   ```bash
   npm run dev
   ```
3. Mở trình duyệt truy cập vào Admin Portal:
   - Đường dẫn: `http://localhost:5173/admin/login` (hoặc cổng cấu hình của bạn).
   - Đăng nhập bằng tài khoản Quản trị viên (`ADMIN`).
   - Điều hướng tới trang **Quản lý Báo cáo vi phạm**: `http://localhost:5173/admin/reports`.

---

## 2. CÁC KỊCH BẢN KIỂM THỬ (TEST SCENARIOS)

---

### Kịch bản 1: Kiểm tra Danh sách Báo cáo Thông minh (Smart Queue)

- **Mục tiêu**: Xác nhận giao diện hiển thị đúng các thông tin nhận diện do Sentinel AI phân tích.
- **Các bước thực hiện**:
  1. Truy cập vào trang danh sách báo cáo vi phạm (`/admin/reports`).
  2. Quan sát cột **Mức độ (Severity)** trên bảng dữ liệu:
     - Các báo cáo thông thường: Hiển thị Chip mức độ (`Thấp`, `Trung bình`, `Cao`, `Khẩn cấp`).
     - Các báo cáo **đã được Sentinel AI thẩm định**: Xuất hiện thêm huy hiệu tím nổi bật `[✨ AI: XX%]` (với XX là điểm tin cậy, ví dụ `AI: 95%`).
     - Rê chuột vào huy hiệu AI: Tooltip hiển thị trích đoạn tóm tắt vụ việc.
- **Kết quả mong đợi**:
  - Giao diện bảng hiển thị mượt mà, không bị vỡ layout, phân biệt rõ các báo cáo đã có AI phân tích.

---

### Kịch bản 2: Kích hoạt Thẩm định AI (Sentinel AI Copilot)

- **Mục tiêu**: Kiểm tra khả năng AI đọc bối cảnh tin nhắn, soi ảnh bằng chứng và đối chiếu Khung Chế tài Chuẩn.
- **Các bước thực hiện**:
  1. Nhấp chọn một báo cáo ở trạng thái `PENDING` (Chờ xử lý) hoặc `REVIEWING` (Đang xem xét) chưa có kết quả AI.
  2. Ngăn kéo chi tiết (**Investigation Drawer**) trượt ra từ bên phải màn hình.
  3. Ở đầu ngăn kéo, xuất hiện khung **BuddyLink Sentinel AI** với nút bấm **"Kích hoạt AI Thẩm định"**.
  4. Bấm nút **"Kích hoạt AI Thẩm định"**:
     - Nút hiển thị icon xoay loading.
     - Sau 1–3 giây, khung **Sentinel AI Copilot** chuyển sang giao diện kết quả phân tích đầy đủ.
- **Kết quả mong đợi**:
  - **Header Copilot**: Có huy hiệu `Độ tự tin: XX%` (màu xanh lá nếu $\ge 90\%$, màu vàng nếu $< 90\%$).
  - **Khung quy chuẩn**: Hiển thị rõ điều khoản vi phạm được trích dẫn (ví dụ: `Rule 2.1: Harassment, bullying...`) kèm số lần vi phạm `Strike 1` hoặc `Strike 2`.
  - **Tóm tắt vụ việc (AI Summary)**: Gồm 3–4 gạch đầu dòng giải thích rõ ai đã làm gì, nói gì trong hội thoại.
  - **Thẩm định bằng chứng (Gemini Vision)**: Nếu báo cáo có ảnh chụp màn hình, hiển thị kết quả phân tích tính hợp lệ của ảnh.
  - **Chế tài đề xuất**: Hiển thị các chip chế tài được khuyến nghị (ví dụ: `[Xóa tin nhắn vi phạm]`, `[Gửi cảnh cáo]`, `[Tạm đình chỉ 7 ngày]`).
  - **Xem trước thông báo (Draft Communications)**: Bấm mở rộng phần dự thảo để xem trước nội dung email gửi người vi phạm và phản hồi người báo cáo.

---

### Kịch bản 3: Phê duyệt & Thi hành 1-Click (One-Click Sentinel Approve)

- **Mục tiêu**: Kiểm tra tính năng tự động hóa tối đa – Admin chỉ bấm 1 nút để thi hành toàn bộ chế tài đề xuất.
- **Các bước thực hiện**:
  1. Trên khung **Sentinel AI Copilot**, kiểm tra các chế tài đề xuất đã hợp lý.
  2. Bấm vào nút màu xanh lá nổi bật:
     **`[ 🟢 Phê duyệt & Thi hành theo đề xuất Sentinel (1-Click) ]`**
  3. Quan sát phản hồi của hệ thống:
     - Nút chuyển trạng thái loading.
     - Hiển thị thông báo Toast thành công: _"Đã tự động thi hành toàn bộ chế tài theo đề xuất của Sentinel AI."_
- **Kết quả mong đợi**:
  - Trạng thái báo cáo tự động chuyển thành **`RESOLVED` (Đã xử lý)** với kết luận `ACTION_TAKEN`.
  - Các chế tài đề xuất (xóa tin nhắn, cảnh cáo, đình chỉ) đã được tự động áp dụng đầy đủ trong mục `actions`.
  - Ghi chú giải quyết tự động điền bản ghi chú do AI soạn thảo.
  - Ngăn kéo chuyển sang trạng thái tổng kết vụ việc (`ReportClosedSummary`).
  - Danh sách ngoài bảng cập nhật trạng thái mới mà không cần F5 lại trang.

---

### Kịch bản 4: Kiểm tra Chốt chặn Chống Cảm tính (Anti-bias Guardrails & Policy Override)

- **Mục tiêu**: Đảm bảo Admin không thể tự ý áp dụng chế tài vượt khung quy định nếu không có lý do giải trình.
- **Các bước thực hiện**:
  1. Mở một báo cáo vi phạm mức độ nhẹ (ví dụ danh mục `SPAM` hoặc `NO_SHOW` lần đầu).
  2. Theo Khung Chế tài Chuẩn (`moderation-policy.rules.js`), mức phạt quy định chỉ là `Cảnh cáo` (`warn`).
  3. Tại bảng điều khiển thi hành chế tài thủ công, nếu Admin cố tình chọn mức phạt nặng hơn (như `Khóa vĩnh viễn` hoặc `Đình chỉ tài khoản`):
     - Hệ thống Backend sẽ từ chối với mã lỗi `POLICY_OVERRIDE_REQUIRED`.
     - Admin bắt buộc phải tích chọn **"Ngoại lệ chính sách"** và **nhập lý do giải trình tối thiểu 10 ký tự**.
  4. Sau khi thi hành, mở phần **Nhật ký kiểm duyệt (Audit Log)** ở đáy ngăn kéo:
     - Kiểm tra sự kiện `POLICY_OVERRIDDEN` được ghi nhận vĩnh viễn kèm tên Admin và lý do giải trình.
- **Kết quả mong đợi**:
  - Ngăn chặn hoàn toàn việc xử phạt cảm tính, bất công giữa các Admin. Mọi trường hợp ngoại lệ đều có dấu vết kiểm toán rõ ràng.

---

### Kịch bản 5: Chạy lại Phân tích (Re-assess)

- **Mục tiêu**: Kiểm tra tính năng cập nhật phân tích khi có thêm thông tin mới hoặc muốn AI đánh giá lại.
- **Các bước thực hiện**:
  1. Mở một báo cáo đã có kết quả Sentinel.
  2. Bấm vào nút **"Phân tích lại"** (icon làm mới) ở góc trên bên phải của Sentinel Card.
  3. Quan sát icon xoay tròn và kết quả thẩm định được làm mới lại sau 1–2 giây.
- **Kết quả mong đợi**:
  - Toàn bộ tóm tắt và điểm tin cậy được Gemini cập nhật lại theo thời gian thực.

---

### Kịch bản 5: Mở khóa Khung Kỷ Luật Quy Chuẩn & Ngoại lệ Chính sách (Policy Override)

- **Mục tiêu**: Kiểm chứng quy tắc bắt buộc chạy AI Thẩm định trước khi mở khóa khung kỷ luật, và bắt buộc giải trình tối thiểu 20 ký tự khi muốn phạt nặng hơn hoặc nhẹ hơn mức quy chuẩn.
- **Các bước thực hiện**:
  1. Mở một báo cáo chưa thẩm định: Kéo xuống mục **"Khung kỷ luật & Thi hành chế tài"** -> Thấy trạng thái đang khóa (**"Khung kỷ luật đang khóa — Cần chạy AI Thẩm định trước"**).
  2. Bấm **"Kích hoạt AI Thẩm định ngay"** -> Khung Kỷ Luật Quy Chuẩn mở ra, hiển thị số lần vi phạm (`Strike X/3`), điều khoản áp dụng (`Rule ...`), các nút gắn nhãn **`Chuẩn`** (được phép bấm) và các nút gắn nhãn **`🔒 Ngoại lệ`** (đang bị khóa).
  3. Tích chọn ô **`☑️ Áp dụng ngoại lệ chính sách (Policy Override)`** -> Nhập lý do giải trình đủ **tối thiểu 20 ký tự**.
  4. Các nút **`🔒 Ngoại lệ`** lập tức mở khóa. Sau khi bấm thi hành, kéo xuống mục **Nhật ký kiểm toán (`ReportAuditLog`)** để thấy nhãn cảnh báo vàng cam **`Ngoại lệ chính sách (Policy Override)`** kèm nguyên văn lý do giải trình phục vụ Super Admin hậu kiểm.

---

### Kịch bản 6: Trung tâm Tự hành Hàng loạt (Khung xanh Bot hoạt ảnh) & Auto-Shield

- **Mục tiêu**: Giải quyết bài toán hàng trăm báo cáo cùng lúc.
- **Các bước thực hiện**:
  1. Tại trang `/admin/reports`, quan sát **Khung xanh Matcha BuddyLink Sentinel AI** (có chú Bot hoạt ảnh chuyển động bồng bềnh và vòng sóng radar) ngay dưới 4 ô thống kê.
  2. **Quét AI hàng loạt**: Bấm nút **`🔍 Quét AI hàng loạt`** -> Bot tự động thẩm định các báo cáo đang mở chưa có kết quả AI.
  3. **Thi hành & Đóng hàng loạt**: Chọn ngưỡng độ tự tin (ví dụ `≥ 80%`) và bấm **`⚡ Thi hành & Đóng hàng loạt`** -> Hệ thống tự động tiếp nhận (`Claim`), thi hành chế tài đúng khung quy chuẩn, đóng gộp các báo cáo trùng người bị tố cáo và chuyển sang `Đã giải quyết`.
  4. **Cơ chế Auto-Shield khi Phụ huynh vừa gửi báo cáo**:
     - Báo cáo thông thường: Giữ ở trạng thái `Chờ xử lý` (`pending`) nhưng được AI chạy ngầm gắn sẵn nhãn `✨ AI: XX%`.
     - Báo cáo nguy cấp (`An toàn trẻ em` / `Critical` với độ tự tin AI `≥ 85%`): Hệ thống tự động kích hoạt **`🛡️ Auto-Shield`**, tự động chuyển trạng thái từ `Chờ xử lý` sang **`Đang xem xét` (`reviewing`)**, tự động gỡ bỏ tin nhắn độc hại và tạm khóa khẩn cấp tài khoản bị tố cáo 7 ngày để bảo vệ trẻ em ngay lập tức!

---

## 3. KIỂM THỬ TRỰC TIẾP QUA API (STANDALONE / POSTMAN)

Nếu muốn test nhanh các endpoint Back-End qua Postman hoặc cURL (kèm Header `Authorization: Bearer <ADMIN_ACCESS_TOKEN>`):

### 3.1. Thẩm định Sentinel AI

- **Endpoint**: `POST /api/v1/admin/reports/:id/sentinel-assess`
- **Body (JSON)**:
  ```json
  {
    "forceRefresh": true
  }
  ```
- **Response**: Trả về chi tiết báo cáo kèm object `sentinelAssessment` chứa đầy đủ phân tích và đề xuất chế tài.

### 3.2. Thi hành 1-Click Sentinel

- **Endpoint**: `POST /api/v1/admin/reports/:id/sentinel-apply`
- **Body**: `{}`
- **Response**: Báo cáo được chuyển sang `RESOLVED`, áp dụng các chế tài chuẩn và lưu audit log.

---

## 4. DANH SÁCH FILE LIÊN QUAN ĐÃ TÍCH HỢP

| Thành phần                      | Vị trí file                                                                 |
| :------------------------------ | :-------------------------------------------------------------------------- |
| **Ma trận Chế tài Chuẩn**       | `Back-End/src/modules/safety/moderation-policy.rules.js`                    |
| **Dịch vụ AI Sentinel**         | `Back-End/src/modules/safety/sentinel.service.js`                           |
| **Model Báo cáo cập nhật**      | `Back-End/src/modules/safety/report.model.js`                               |
| **Admin Route & Controller**    | `Back-End/src/modules/admin/admin.route.js` & `admin.controller.js`         |
| **Admin Service xử lý 1-Click** | `Back-End/src/modules/admin/admin.service.js`                               |
| **Sentinel Copilot UI Card**    | `Front-End/src/modules/admin/components/reports/SentinelCopilotCard.jsx`    |
| **Ngăn kéo Thẩm định Admin**    | `Front-End/src/modules/admin/components/AdminReportInvestigationDrawer.jsx` |
| **Trang Danh sách Báo cáo**     | `Front-End/src/modules/admin/pages/AdminReportsPage.jsx`                    |
| **Admin API & Redux Store**     | `Front-End/src/modules/admin/api/adminApi.js` & `adminSlice.js`             |
