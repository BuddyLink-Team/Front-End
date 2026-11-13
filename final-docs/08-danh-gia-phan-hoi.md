# 08. Đánh giá & Phản hồi (Rating & Feedback)

## Mục đích
Sau khi buổi chơi hoàn thành, phụ huynh đã tham gia chấm sao (1–5) và để lại nhận xét. Đánh giá cao sẽ kích hoạt gợi ý **hẹn lại** từ Trợ lý AI.

## Ai dùng

| Vai trò | Được làm gì |
|---|---|
| Phụ huynh đã tham gia (chủ + người đã nhận lời) | Chấm sao + nhận xét, mỗi buổi 1 lần |
| Phụ huynh được mời (kể cả không tham gia) | Xem các đánh giá của buổi |
| Hệ thống | Tự hiện hộp nhắc đánh giá; gửi gợi ý hẹn lại khi đánh giá ≥ 4 sao |

## Chức năng

| Chức năng | Mô tả ngắn | Màn hình | Xử lý |
|---|---|---|---|
| Nhắc đánh giá | Tự hiện hộp thoại cho buổi đã hoàn thành mà mình chưa đánh giá | [RatingPrompt](../src/modules/rating-feedback/components/RatingPrompt.jsx) (gắn ở [MainLayout](../src/layouts/MainLayout.jsx)) | [rating-feedback.service.js](../../Back-End/src/modules/rating-feedback/rating-feedback.service.js) – `getPendingRatings` |
| Gửi đánh giá | Chọn 1–5 sao, nhận xét (tuỳ chọn) | [RatingModal](../src/modules/rating-feedback/components/RatingModal.jsx) | `createRating` |
| Xem đánh giá của buổi | Điểm trung bình, số lượt, danh sách nhận xét, có được đánh giá không | [PlaydateRatingsSection](../src/modules/rating-feedback/components/PlaydateRatingsSection.jsx) | `getPlaydateRatings` |

## Luồng chính
```mermaid
flowchart TD
    A[Buổi chơi chuyển sang Hoàn thành] --> B[Hộp nhắc đánh giá hiện ra]
    B --> C{Người gửi đã tham gia buổi?}
    C -- Không --> X1[Lỗi: chỉ người tham gia được đánh giá]
    C -- Có --> D{Buổi đã hoàn thành?}
    D -- Chưa --> X2[Lỗi: chưa hoàn thành]
    D -- Rồi --> E{Đã đánh giá buổi này?}
    E -- Rồi --> X3[Lỗi: đã đánh giá]
    E -- Chưa --> F[Lưu đánh giá]
    F --> G{Số sao ≥ 4?}
    G -- Có --> H[AI chuẩn bị sẵn kế hoạch buổi tiếp theo<br/>→ Thông báo "Hẹn lại với ... nhé?"]
    G -- Không --> I[Kết thúc]
```

## Quy tắc nghiệp vụ

| Mã | Quy tắc | Ghi chú |
|---|---|---|
| BR-RAT-01 | Chỉ chủ buổi hoặc người **đã nhận lời** được đánh giá | [rating-feedback.rules.js](../../Back-End/src/modules/rating-feedback/rating-feedback.rules.js) |
| BR-RAT-02 | Chỉ đánh giá buổi đã **hoàn thành** | `PLAYDATE_NOT_COMPLETED` |
| BR-RAT-03 | Mỗi phụ huynh đánh giá mỗi buổi đúng 1 lần, không sửa | `RATING_ALREADY_EXISTS` |
| BR-RAT-04 | Số sao là số nguyên 1–5; nhận xét tuỳ chọn | [rating-feedback.validation.js](../../Back-End/src/modules/rating-feedback/rating-feedback.validation.js) |
| BR-RAT-05 | Xem đánh giá: chủ + mọi người được mời; điểm trung bình làm tròn 1 chữ số thập phân | `getPlaydateRatings` |
| BR-RAT-06 | Đánh giá ≥ 4 sao → gợi ý hẹn lại (kèm nhắc giữ chuỗi tuần nếu đang có) | [notification.listener.js](../../Back-End/src/modules/notification/notification.listener.js) – `notifyRebookingSuggestion` |

## Dữ liệu chính

| Trường | Ý nghĩa |
|---|---|
| Buổi chơi, Phụ huynh | Ai đánh giá buổi nào (duy nhất theo cặp) |
| Số sao | 1–5 |
| Nhận xét, Nhãn | Văn bản tự do |

## Liên quan

| Module | Liên quan |
|---|---|
| [07 Playdate](07-buoi-choi-playdate.md) | Chỉ buổi hoàn thành mới được đánh giá |
| [10 Trợ lý AI](10-tro-ly-ai.md) | Tạo sẵn phiên hẹn lại |
| [11 Thông báo](11-thong-bao.md) | Thông báo gợi ý AI |

## File xử lý

| Lớp | File |
|---|---|
| Route | [rating-feedback.route.js](../../Back-End/src/modules/rating-feedback/rating-feedback.route.js) |
| Controller | [rating-feedback.controller.js](../../Back-End/src/modules/rating-feedback/rating-feedback.controller.js) |
| Service | [rating-feedback.service.js](../../Back-End/src/modules/rating-feedback/rating-feedback.service.js) |
| Quy tắc | [rating-feedback.rules.js](../../Back-End/src/modules/rating-feedback/rating-feedback.rules.js) |
| Sự kiện | [rating-feedback.events.js](../../Back-End/src/modules/rating-feedback/rating-feedback.events.js) |
| Model | [rating-feedback.model.js](../../Back-End/src/modules/rating-feedback/rating-feedback.model.js) |
| FE thành phần | [RatingPrompt.jsx](../src/modules/rating-feedback/components/RatingPrompt.jsx), [RatingModal.jsx](../src/modules/rating-feedback/components/RatingModal.jsx), [PlaydateRatingsSection.jsx](../src/modules/rating-feedback/components/PlaydateRatingsSection.jsx) |
