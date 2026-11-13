# BUD-50 — Sentinel AI & Khung kỷ luật quy chuẩn

Tài liệu mô tả nghiệp vụ kiểm duyệt báo cáo vi phạm sau BUD-50: AI Sentinel phân tích báo cáo, khi nào AI được tự xử lý, khi nào bắt buộc Admin quyết định, và các luật giữ cho đề xuất, trạng thái, kết luận luôn khớp nhau.

> **Nguyên tắc:** AI phân tích và gợi ý; chỉ tự phạt khi **có vi phạm rõ ràng, nhẹ, được nhiều phụ huynh xác nhận**. Mọi trường hợp khác do Admin quyết định trong drawer chi tiết báo cáo.

---

## 1. Kết quả phân tích của AI: 3 phần

Mỗi báo cáo đã phân tích có `sentinelAssessment` gồm 3 phần, xử lý khác nhau:

| Phần | Nội dung | Khi nào thay đổi |
| :--- | :--- | :--- |
| **Phần AI viết** | `verdict`, tóm tắt, độ tự tin, đánh giá bằng chứng, mức độ AI đề xuất, bản nháp ghi chú / thông báo | Chỉ khi chạy lại phân tích (nút **Phân tích lại**) |
| **Phần tính theo luật** | chế tài AI đề xuất, lần vi phạm, điều khoản, xác thực chéo, mật độ báo cáo, độ tin cậy người báo cáo, đủ điều kiện tự xử lý | **Tính lại mỗi lần mở chi tiết** một báo cáo đang mở, và được lưu lại sau mỗi thay đổi (báo cáo mới, đổi mức độ, áp chế tài, đóng, mở lại) |
| **Việc đã xảy ra** | đã tự xử lý (`autoResolved`), đã kích hoạt phòng thủ tự động, đã hạn chế nhắn tin | Không bao giờ tính lại (kể cả khi Phân tích lại) |

Báo cáo **đã đóng** giữ nguyên toàn bộ số liệu lúc ra quyết định. Khi có báo cáo mới về cùng người, drawer đang mở tự tải lại (qua socket thông báo admin) và thẻ AI ghi *"Có N báo cáo mới kể từ lần AI phân tích"*.

### 1.1. Kết luận của AI (`verdict`)

| `verdict` | Ý nghĩa | Chế tài AI đề xuất | Tự xử lý | Hạn chế nhắn tin tự động |
| :--- | :--- | :--- | :---: | :---: |
| `violation` | Có vi phạm | Theo khung kỷ luật (mục 3) | Có thể (mục 2.2) | Theo luật mục 2.3 |
| `no_violation` | Hiểu nhầm, báo cáo sai, báo thù | **Không có**; gợi ý bác bỏ, lý do của AI được điền sẵn vào hộp thoại bác bỏ | Không | Không |
| `unclear` | Chưa đủ căn cứ (kể cả AI lỗi, trả lời không hợp lệ, hoặc bản phân tích cũ chưa có `verdict`) | **Không có** | Không | Theo luật mục 2.3 |

- Bản nháp của AI phải khớp `verdict` (prompt cấm thông báo phạt khi không vi phạm).
- **"Hình phạt đề xuất" trên thẻ AI** đi theo `verdict`. **"Chế tài đúng quy định" trong khung kỷ luật** luôn lấy từ bảng chế tài (`policyGuidance`), không phụ thuộc AI, để Admin vẫn tự phạt được khi không đồng ý với AI.

---

## 2. Tự động hóa khi có báo cáo mới

Chỉ luồng **tạo báo cáo** (`createReport`) được tự thi hành, và chỉ ở **lần phân tích đầu tiên**. Admin bấm Phân tích lại, Quét hàng loạt không bao giờ tự phạt.

### 2.1. Các yếu tố đo lường (`enforcement-metrics.rules.js`)

| Yếu tố | Cách tính |
| :--- | :--- |
| **Mật độ báo cáo** | Số người báo cáo khác nhau trong `createdAt ± 30 phút`: ≥ 3 → rủi ro cao, 2 → trung bình, 1 → thấp |
| **Độ tin cậy người báo cáo** | `low` khi có ≥ 2 báo cáo bị bác bỏ và nhiều hơn số được xác nhận; `normal` với tài khoản < 7 ngày hoặc chưa có báo cáo được xác nhận; còn lại `high` |
| **Báo cáo phối hợp (brigading)** | ≥ 3 người báo cáo trong 30 phút nhưng không có tin nhắn, buổi hẹn hay ảnh làm bằng chứng |
| **Xác thực chéo** | Số phụ huynh **khác nhau** báo cáo **cùng loại vi phạm**, có bằng chứng, trong **± 7 ngày** quanh báo cáo; người có độ tin cậy `low` không được tính. Cần **3** người (`MIN_CORROBORATING_REPORTERS`, `CORROBORATION_WINDOW_DAYS`) |

### 2.2. Tự xử lý (auto-resolve)

AI chỉ tự thi hành khi **tất cả** điều kiện đúng:

1. `verdict = violation`, không phải bản fallback, độ tự tin ≥ 80%;
2. người báo cáo không thuộc nhóm độ tin cậy thấp, không nghi báo cáo phối hợp;
3. **đủ xác thực chéo** (3 phụ huynh / 7 ngày): một báo cáo đơn lẻ không bao giờ tự phạt;
4. có bằng chứng cứng (tin nhắn hoặc buổi hẹn bị báo cáo, hoặc ảnh đính kèm);
5. không phải an toàn trẻ em hay mức nghiêm trọng (`critical`);
6. chế tài chuẩn không có khóa vĩnh viễn và không đình chỉ quá 7 ngày.

Cách thi hành (`sentinel.service.js` → `_executeAutoResolve`):

- **Kiểm tra trước, rồi mới thi hành** (`sanctionExecutorService.planSanctions`): nếu một chế tài không chạy được (ví dụ tài khoản bị báo cáo không còn) thì **không thi hành chế tài nào**, báo cáo chuyển Admin (`action_failed`).
- **Không áp dụng ≠ lỗi:** hủy một buổi hẹn không còn mở (đã diễn ra, đã hoàn thành, đã hủy) được bỏ qua và ghi vào `notApplicable`.
- Chế tài áp **một lần** lên báo cáo vừa đủ điều kiện; các báo cáo xác thực chéo còn mở (chưa có Admin nhận, chưa có chế tài) được **đóng chung**, nhận bản sao chế tài (`propagatedFrom`), **không tính thêm lần vi phạm**.

### 2.3. Phòng thủ tự động (hạn chế nhắn tin 72 giờ)

Khi không tự xử lý được, AI tạm hạn chế nhắn tin (`users.messagingRestrictedUntil`, gửi tin trả `403 MESSAGING_RESTRICTED`) nếu: không phải bản fallback, `verdict ≠ no_violation`, không nghi báo cáo phối hợp, và (mật độ cao **hoặc** vi phạm nghiêm trọng / an toàn trẻ em với độ tự tin ≥ 80%).

- Với **an toàn trẻ em**: thêm xóa tin nhắn và **tạm khóa 7 ngày**. Các chế tài này là **tạm thời** (`isProvisional: true`): không tính lần vi phạm, không được coi là quyết định chính thức.
- Hạn chế được gỡ khi báo cáo cuối cùng còn bị hạn chế của người đó được đóng.

---

## 3. Khung kỷ luật quy chuẩn (`moderation-policy.rules.js`)

Chế tài chuẩn theo loại vi phạm và **lần vi phạm** của người bị báo cáo:

| Loại vi phạm | Điều khoản | Lần 1 | Lần 2 | Lần 3+ |
| :--- | :--- | :--- | :--- | :--- |
| An toàn trẻ em (`child_safety`) | Điều 1.1 | Xóa tin nhắn + Khóa vĩnh viễn | như lần 1 | như lần 1 |
| Quấy rối (`harassment`) | Điều 2.1 | Xóa tin nhắn + Cảnh cáo | Xóa tin nhắn + Đình chỉ 7 ngày | Xóa tin nhắn + Khóa vĩnh viễn |
| Nội dung phản cảm (`inappropriate_content`) | Điều 3.1 | Xóa tin nhắn + Cảnh cáo | Xóa tin nhắn + Đình chỉ 14 ngày | Xóa tin nhắn + Khóa vĩnh viễn |
| Hồ sơ giả mạo (`fake_profile`) | Điều 4.1 | Cảnh cáo | Đình chỉ 7 ngày | Khóa vĩnh viễn |
| Tin rác (`spam`) | Điều 5.1 | Xóa tin nhắn + Cảnh cáo | Xóa tin nhắn + Cảnh cáo | Xóa tin nhắn + Đình chỉ 3 ngày |
| Bùng hẹn (`no_show`) | Điều 6.1 | Cảnh cáo + Hủy buổi hẹn | Cảnh cáo + Hủy buổi hẹn | Đình chỉ 3 ngày + Hủy buổi hẹn |
| Vi phạm khác (`other`) | Điều 7.1 | Cảnh cáo | Đình chỉ 7 ngày | Đình chỉ 30 ngày |

- Mức độ `critical` (không phải an toàn trẻ em) chuyển sang **Điều 0.1** (xóa tin nhắn + khóa vĩnh viễn).
- Chế tài gắn với một đối tượng bị lọc theo loại báo cáo: xóa tin nhắn chỉ cho báo cáo tin nhắn, hủy buổi hẹn chỉ cho báo cáo buổi hẹn.
- Hạn xử lý (SLA): `critical` 2 giờ, các mức khác 24 giờ.

### 3.1. Đếm lần vi phạm

`safetyService.countUserPriorSanctions` đếm **số sự việc** đã bị xử lý, không phải số báo cáo:

- chỉ báo cáo `resolved` có chế tài **riêng** (không `propagatedFrom`, không `isProvisional`);
- nhiều báo cáo về **cùng một buổi hẹn / tin nhắn** là một sự việc (`incidentKeyOf`);
- sự việc của báo cáo đang xét không tính là "lần vi phạm trước" của chính nó.

### 3.2. Ngoại lệ chính sách

Khi báo cáo đã có phân tích AI, chế tài ngoài khung (kể cả số ngày đình chỉ khác chuẩn) mang nhãn **Ngoại lệ** và cần tích *"Áp dụng ngoại lệ chính sách"* kèm lý do ≥ 20 ký tự; nếu thiếu, backend trả `400 POLICY_OVERRIDE_REQUIRED` / `400 OVERRIDE_REASON_REQUIRED`. Chưa có phân tích AI thì Admin phạt thủ công tự do.

---

## 4. Hàng đợi theo vụ việc và quyết định một bước

### 4.1. Vụ việc

Một **vụ việc** là các báo cáo về **cùng nội dung bị báo cáo** (`caseKeyOf`, `enforcement-metrics.rules.js`):

| Loại báo cáo | Cùng vụ việc khi |
| :--- | :--- |
| Tin nhắn | cùng tin nhắn |
| Cuộc hẹn | cùng cuộc hẹn |
| Hồ sơ | cùng phụ huynh bị báo cáo **và** cùng loại vi phạm |

- `GET /reports` trả **mỗi dòng một vụ việc**, kèm `reportCount`, `reporterCount`, `reporterNames`, `firstReportedAt`; mức độ của vụ là mức cao nhất trong các báo cáo. `view=reports` trả mỗi dòng một báo cáo (dùng cho xuất Excel).
- Vụ việc đã đóng giữ nguyên nhóm lúc quyết định qua `closedCaseId`, nên vẫn là một dòng: áp dụng cho hộp thoại quyết định, Sentinel tự xử lý và xử lý cụm. Báo cáo đóng trước khi có trường này là mỗi báo cáo một dòng.
- **Khóa tài khoản:** khi đăng nhập bị chặn, `403 ACCOUNT_DISABLED` trả `details: { lockType: 'suspended'|'banned'|'locked', suspensionUntil, reason }`; `reason` là loại vi phạm của báo cáo mới nhất đã đình chỉ hoặc khóa tài khoản, dạng câu chung như trong thông báo phạt (`account-lock.service.js`, chỉ tra khi đăng nhập bị chặn, không lưu thêm trường nào), không bao giờ là ghi chú nội bộ của admin. Khóa tay từ trang người dùng không có lý do.
- **Mở khóa sớm:** trang người dùng hiện án đang áp dụng (`lockSource`: loại khóa, hạn, loại vi phạm, ngày xử lý; không có ID báo cáo). Mở khóa một tài khoản đang chịu án từ báo cáo là chấm dứt hình phạt sớm: hộp xác nhận cảnh báo và bắt buộc lý do ≥ 10 ký tự (`400 UNLOCK_REASON_REQUIRED` nếu thiếu), rồi báo cáo gốc nhận sự kiện `sanction_lifted` trong nhật ký (người mở, hạn cũ, lý do). Khóa tay và hết hạn tự mở không cần lý do, không ghi gì. Trang đăng nhập hiển thị thời hạn, lý do và địa chỉ hỗ trợ.
- Thống kê (`/reports/stats`) đếm theo vụ việc. Không còn trạng thái *Đang xem xét* và không còn bước nhận việc (`assignedTo` đã bỏ); `reviewing` chỉ còn trong dữ liệu cũ và được coi như *Chờ xử lý* (`npm run migrate:report-cases` chuyển dữ liệu cũ, chạy thử trước khi thêm `--apply`).

### 4.2. Drawer chi tiết vụ việc

Thứ tự đọc: header (trạng thái, mức độ có thể đổi, số người báo cáo) → kết luận (khi đã đóng) → **Nội dung bị báo cáo** → **Các báo cáo** (lý do, mô tả, ảnh của từng người) → **Người bị báo cáo** (trạng thái tài khoản, *Đã vi phạm N lần* theo cách đếm của khung kỷ luật, số vụ khác đang mở, lịch sử thu gọn) → **Gợi ý của AI** (kết luận, tóm tắt, hình phạt đề xuất; số liệu chi tiết trong *Xem chi tiết phân tích*) → nhật ký (thu gọn).

Footer: *Không vi phạm — bác bỏ* và *Có vi phạm — xử lý* khi vụ đang mở, *Mở lại vụ việc* khi đã đóng (mở lại đưa vụ về *Chờ xử lý*).

### 4.3. Quyết định: `POST /reports/:id/decide`

Một hộp thoại (chiều cao cố định, chỉ phần thân cuộn), một lần gọi: `{ outcome, sanctions, notes, isPolicyOverride, overrideReason, alsoCloseReportIds, reportedUserNotice, reporterNotice }`.

- **Có vi phạm:** chọn **một** hình thức (`sanctions` tối đa 1 phần tử) hoặc *Không áp dụng hình phạt* (= có vi phạm nhưng không kỷ luật). Hình thức được chọn sẵn là hình thức nặng nhất trong đề xuất của AI khi AI kết luận vi phạm, ngược lại trong khung kỷ luật. Hình thức không còn áp dụng được (tin nhắn đã xóa, tài khoản đã khóa…) bị khóa kèm lý do.
- **Thông báo:** các bên nhận đúng nội dung hiển thị trong hộp thoại. Khi quyết định trùng kết luận của AI, ô *Gửi người bị báo cáo* và *Gửi người báo cáo* được điền sẵn bản AI soạn (`draftNotes`); ngược lại là câu mặc định. Có nội dung cho người bị báo cáo thì chỉ gửi một thông báo đó thay cho thông báo riêng của hình phạt; để trống thì gửi thông báo mặc định của hình phạt. Khi Sentinel tự xử lý hoặc admin bấm xử lý cụm, bản AI soạn cũng được dùng.
- Hình phạt chạy **một lần** trên báo cáo được mở; các báo cáo khác của vụ đóng cùng (bản sao cảnh cáo / đình chỉ / khóa qua `propagatedFrom`, không tính thêm lần vi phạm).
- **Đóng kèm vụ khác của cùng người** (`alsoCloseReportIds`, một báo cáo mỗi vụ): dùng khi là cùng một chuyện; vụ đóng kèm không bị phạt thêm và vẫn là một dòng riêng. Vụ của người khác → `400 CLUSTER_MIXED_USERS`.
- Mọi hình phạt được kiểm tra trước khi chạy: chế tài ngoài khung (khi đã có phân tích AI) cần lý do ngoại lệ ≥ 20 ký tự; tài khoản đã khóa / không còn → không chạy gì cả.
- **Không vi phạm:** bác bỏ mọi báo cáo của vụ; bị chặn khi vụ đã có chế tài chính thức (`400 RESOLUTION_CONFLICTS_WITH_ACTIONS`). Chế tài tạm thời của Auto-Shield không tính.
- Ghi chú bắt buộc (≥ 10 ký tự). Bản nháp AI được điền vào hộp thoại **bác bỏ** khi `verdict = no_violation`, vào hộp thoại **xử lý** trong các trường hợp khác. Mỗi người báo cáo nhận thông báo kết quả.

---

## 5. Thao tác hàng loạt (modal tổng quan)

| Route | Việc | Giới hạn |
| :--- | :--- | :--- |
| `POST /reports/sentinel-batch-scan` | Phân tích tối đa 20 báo cáo mở (3 báo cáo / lượt), **không phạt, không đổi trạng thái** | 10 / 15 phút |
| `POST /reports/sentinel-batch-apply` | Áp dụng và đóng **từng** báo cáo đủ `autoResolveEligible` (tính lại tại thời điểm bấm); không đóng kèm báo cáo liên quan | 10 / 15 phút |
| `POST /reports/sentinel-cluster-resolve` | Nút **Xác nhận xử lý & đóng cụm** (mục 5.1) | 60 / 15 phút |
| `POST /reports/:id/sentinel-assess` | Phân tích một báo cáo (chế tài được chọn trong hộp thoại quyết định) | 60 / 15 phút |

### 5.1. Xác nhận xử lý & đóng cụm

Một cụm là các báo cáo đang mở về **một** phụ huynh (khác người → `400 CLUSTER_MIXED_USERS`). Hộp xác nhận nói trước kết quả (`planSentinelCluster`), backend thi hành cùng luật:

| Báo cáo trong cụm | Xử lý |
| :--- | :--- |
| `verdict = violation` | Áp chế tài AI đề xuất **một lần** lên báo cáo nghiêm trọng nhất rồi đóng; các báo cáo vi phạm khác đóng chung (bản sao cảnh cáo / đình chỉ / khóa, không tính thêm lần vi phạm) |
| `verdict = no_violation` | Bác bỏ (trừ khi đã có chế tài) |
| Chưa phân tích, `unclear`, an toàn trẻ em, `critical`, đề xuất khóa hoặc đình chỉ > 7 ngày, chế tài lỗi, báo cáo đã có chế tài riêng | **Giữ lại** để Admin xử lý trong chi tiết |

Ghi chú để trống thì dùng bản nháp AI của từng báo cáo. Sau khi xử lý, modal chỉ còn hiện các báo cáo vẫn mở.

---

## 6. An toàn khi gọi AI

- Nội dung người dùng được bọc trong `<user_content>...</user_content>`, cắt tối đa 1000 ký tự và loại bỏ thẻ đóng; prompt cấm làm theo chỉ dẫn trong vùng này.
- Gemini trả JSON (`responseMimeType: 'application/json'`), hạn chờ 8 giây.
- AI lỗi, quá hạn hoặc JSON hỏng → bản **fallback**: độ tự tin 0, `verdict = unclear`, không bao giờ tự phạt hay hạn chế.
- **Key riêng `SENTINEL_GEMINI_API_KEY`**, không dùng chung, không fallback sang `GEMINI_API_KEY`; thiếu key → `503 SENTINEL_API_KEY_REQUIRED`. Cần đặt key ở **cả API phụ huynh** (thẩm định báo cáo mới) **và API admin** (các nút Sentinel), xem `Back-End/docs/DEPLOYMENT.md`.

---

## 7. Nhật ký kiểm duyệt

- Thao tác của Sentinel ghi `actorType: 'system'`, `by: null`; giao diện hiển thị *"Hệ thống / Sentinel AI"*.
- Các sự kiện riêng: `sentinel_assessed`, `auto_shielded`, `policy_overridden`, `action_failed`.
- Ghi chú trong nhật ký dùng nhãn tiếng Việt (chế tài, mức rủi ro, điều khoản).

---

## 8. Tập tin chính

| Tập tin | Trách nhiệm |
| :--- | :--- |
| `Back-End/src/modules/safety/sentinel.service.js` | Gọi AI, `_loadRuleContext` / `_evaluateRules` (một chỗ tính luật), `buildRuleSnapshot` (tính lại không gọi AI), `refreshRuleSnapshots`, tự xử lý, phòng thủ tự động |
| `Back-End/src/modules/safety/enforcement-metrics.rules.js` | Hàm thuần: mật độ, độ tin cậy, báo cáo phối hợp, xác thực chéo, `incidentKeyOf` |
| `Back-End/src/modules/safety/moderation-policy.rules.js` | Bảng chế tài, lần vi phạm, kiểm tra ngoại lệ |
| `Back-End/src/modules/safety/sanction-executor.service.js` | Thi hành chế tài (dùng chung tự động / thủ công), `planSanctions`, `isPlaydateCancellable` |
| `Back-End/src/modules/admin/admin-report.service.js` | Chi tiết (tính lại phần luật), áp chế tài, kết luận (ràng buộc), áp dụng đề xuất, hàng loạt, xử lý cụm |
| `Front-End/src/modules/admin/components/reports/SentinelCopilotCard.jsx` | Thẻ AI trong drawer: kết luận, số liệu, hình phạt đề xuất theo `verdict` |
| `Front-End/src/modules/admin/components/reports/ReportDecisionDialog.jsx` | Hộp thoại quyết định: hình phạt (khung kỷ luật, ngoại lệ), đóng kèm vụ khác, ghi chú |
| `Front-End/src/modules/admin/components/reports/CaseReportsList.jsx` | Các báo cáo của một vụ việc |
| `Front-End/src/modules/admin/components/reports/ReportDrawerFooter.jsx` | Hai nút quyết định, mở lại |
| `Front-End/src/modules/admin/utils/sentinelView.js` | Nội dung phân tích AI dùng chung cho drawer và modal quét |
| `Front-End/src/modules/admin/components/reports/SentinelBatchCommandBar.jsx`, `SentinelBatchOverviewModal.jsx`, `SentinelClusterCard.jsx` | Quét hàng loạt, modal tổng quan, xử lý cụm |
| `Front-End/src/modules/admin/hooks/useSentinelOverview.js` | Gom báo cáo theo người bị báo cáo |
