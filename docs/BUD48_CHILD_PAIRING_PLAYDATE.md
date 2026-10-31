# BUD-48 — Ghép cặp bé & lên kế hoạch Playdate

Tài liệu mô tả **cách BuddyLink hoạt động** sau BUD-48, theo góc nhìn nghiệp vụ: phụ huynh làm gì, hệ thống quyết định thế nào, người dùng thấy gì. Chi tiết kỹ thuật xem trong code và `Back-End/docs/DATABASE_SCHEMA.md`.

> **Tóm tắt:** kết nối vẫn là giữa **hai phụ huynh**, nhưng hệ thống giờ nhớ **bé nào hợp với bé nào**. Mọi buổi hẹn bắt đầu từ **bé**: hệ thống gợi ý bạn chơi, giờ, địa điểm, hoạt động, báo trùng lịch ngay khi chọn và nhắc lịch trước buổi hẹn.

---

## 1. Tìm bạn cho từng bé (Discovery)

- Phụ huynh có nhiều bé chọn bé đang tìm bạn ở mục **"Đang tìm bạn cho…"**. Phụ huynh chỉ có 1 bé thì hệ thống tự chọn bé đó.
- Bé bị khoá do vượt giới hạn gói Free thì không dùng để tìm bạn được, và cũng không hiện cho gia đình khác.
- Mỗi lượt **Thích / Bỏ qua** được ghi cho **bé đang chọn** và tốn 1 lượt Khám phá:
  - Có thể Thích cùng một bé cho từng con của mình (ví dụ Bé Na hợp với cả Bin lẫn Bông).
  - Thẻ đã vuốt cho Bin vẫn hiện khi tìm bạn cho Bông.
  - Các lượt vuốt cũ (trước BUD-48) không gắn với bé nào, nên được tính là đã vuốt cho mọi bé.
- **Thích một bé = gửi lời mời kết nối** tới phụ huynh của bé đó (như trước), kèm thông tin **cặp bé**.

## 2. Kết nối và các cặp bé

```mermaid
flowchart LR
    A["Mẹ An tìm bạn cho Bin<br/>và Thích bé Bông"] --> B{"Hai gia đình<br/>đã kết nối?"}
    B -- "chưa" --> C["Gửi lời mời kết nối<br/>+ ghi cặp Bin ↔ Bông"]
    B -- "gia đình kia đã mời trước" --> D["Kết nối luôn<br/>+ ghi cặp"]
    B -- "đang chờ / đã kết nối" --> E["Chỉ ghi thêm cặp"]
    C --> F["Bố Bông nhận thông báo:<br/>Mẹ An muốn kết nối: Bin ↔ bé Bông của bạn"]
    G["Buổi hẹn hoàn thành"] --> H["Ghi cặp: bé chủ trì ↔<br/>từng bé đã tham gia"]
```

- Một kết nối có thể có **nhiều cặp bé**. Một cặp chỉ được ghi một lần, dù Thích lại hay hai bên cùng Thích nhau.
- Cặp có hai nguồn: **ghép từ Khám phá** (Thích) và **đã chơi cùng** (đã đi chung một buổi hẹn hoàn thành).
- Thẻ kết nối hiện **"Bông (5 tuổi) ↔ Bin"**; lời mời đến thì hiện **"Muốn kết nối: Bông (5 tuổi) ↔ bé Bin của bạn"**. Chỉ hiện tuổi, không bao giờ hiện ngày sinh.
- Khung **"Hồ sơ xem nhanh"** liệt kê các cặp bé kèm nguồn của từng cặp.
- Chỉ **tạo kết nối mới** mới tốn lượt kết nối của gói Free. Ghi thêm cặp, hoặc kết nối luôn vì gia đình kia đã mời trước, thì không tốn lượt này.
- Với gia đình đã kết nối, nút **"Mời bé hẹn chơi"** nằm trong khung **"Hồ sơ xem nhanh"**. Nút này mở form tạo buổi hẹn, chọn sẵn bé của mình đã ghép đôi với gia đình đó (chưa có cặp thì chọn bé đầu tiên) và bé phù hợp nhất của gia đình đó.

## 3. Mức độ phù hợp

Hệ thống chấm điểm 0–100 cho mỗi cặp bé:

| Tiêu chí | Điểm tối đa | Ý nghĩa |
| --- | --- | --- |
| Tuổi | 30 | Bé kia nằm trong độ tuổi phụ huynh mong muốn; lệch khỏi khoảng này mỗi tuổi trừ 10 điểm |
| Sở thích chung | 35 | Hai bé có cùng sở thích, hoạt động yêu thích |
| Khoảng cách | 20 | Hai nhà càng gần càng cao, về 0 ở bán kính đang tìm (mặc định 15 km; danh sách bạn chơi luôn dùng 15 km) |
| Lịch & địa điểm ưa thích | 15 | Hai phụ huynh hợp ngày, khung giờ, loại địa điểm |

Thiếu dữ liệu thì tiêu chí đó nhận điểm trung lập thay vì 0 (riêng sở thích nhận 30% số điểm, các tiêu chí còn lại nhận 50%).

Điểm này dùng để xếp hạng thẻ ở Khám phá và danh sách bạn chơi khi tạo buổi hẹn.

## 4. Tạo buổi hẹn — 3 bước

```mermaid
flowchart LR
    S1["1. Bé & bạn chơi<br/>chọn bé → mời bạn chơi"] --> S2["2. Thời gian & địa điểm<br/>gợi ý giờ, kiểm tra lịch bận,<br/>gợi ý địa điểm"]
    S2 --> S3["3. Hoạt động & ghi chú<br/>gợi ý hoạt động, thời lượng"]
    S3 --> T["Tạo buổi hẹn<br/>→ gửi lời mời + mở nhóm chat"]
```

Mỗi gợi ý hiện 4 mục đầu, còn lại trong "Xem thêm". Gói Free giới hạn số buổi hẹn được tạo mỗi tháng; form hiện giới hạn này ở cột bên phải. Trợ lý AI cũng lên kế hoạch được buổi hẹn và dùng chung các gợi ý dưới đây.

**Bước 1 — Bé & bạn chơi**

- Chọn bé của mình trước; mọi gợi ý bên dưới đều tính theo bé này. Bé bị khoá do gói Free không hiện để chọn.
- Mời bạn chơi là tuỳ chọn: tạo buổi hẹn chưa mời ai vẫn được, rồi mời sau ở trang chi tiết.
- Danh sách bạn chơi chỉ gồm bé của các gia đình đã kết nối, tìm được theo tên phụ huynh. Danh sách chia 2 nhóm, mỗi nhóm xếp theo điểm phù hợp:
  - **Bạn chơi của bé**: các bé đã được ghép đôi với bé đang chọn.
  - **Các bé khác trong gia đình bạn bè.**
- Mời được **nhiều bé trong cùng một gia đình**. Phụ huynh trả lời chung một lần cho tất cả các bé của nhà mình được mời, và chỉ tốn một lượt tham gia. Gói Free khoá các bé từ bé thứ hai trở đi, nên chỉ gia đình Premium mới được mời từ hai bé trở lên.
- Hai bé lệch **hơn 3 tuổi** thì hiện nhắc nhở màu vàng, nhưng vẫn mời được.

**Bước 2 — Thời gian & địa điểm**

- **Gợi ý giờ:** các khung sáng 9:00, chiều 15:00, tối 18:00 trong 7 ngày, tính từ ngày mai.
  - Khung hợp với ngày và giờ ưa thích của nhiều gia đình nhất xếp trước; cùng mức thì khung sớm hơn xếp trước.
  - Không gợi ý giờ đã qua, hay giờ mà một trong các bé đã có hẹn khác.
  - Nếu không khung nào hợp với lịch ưa thích của ai thì ưu tiên sáng cuối tuần.
- **Chọn tay:** nhập ngày, giờ hoặc bấm nhanh các mốc 08:00, 09:00, 15:00, 16:30.
- **Kiểm tra lịch bận:** xem [mục 5](#5-trùng-lịch).
- **Thời lượng:** 30 phút đến 4 giờ (mặc định 2 giờ); hệ thống tự tính giờ kết thúc.
- **Gợi ý địa điểm:**
  - Tìm quanh **điểm giữa các nhà** trong bán kính 5–20 km, ưu tiên loại địa điểm mà mọi phụ huynh cùng thích (ví dụ công viên), rồi tới nơi gần điểm giữa nhất.
  - Bỏ các nơi chưa hợp tuổi bé nhỏ nhất (trung tâm thể thao, workshop cần từ 4 tuổi).
  - Mỗi địa điểm ghi khoảng cách tới từng nhà, ví dụ "Cách Nhà bạn 1,2 km · Mẹ Lan 2,4 km"; có nút **Chi tiết** và **Google Maps**.
  - Vẫn có thể tìm địa điểm khác trên bản đồ hoặc nhập tay.
  - Dữ liệu địa điểm lấy từ OpenStreetMap.

**Bước 3 — Hoạt động & ghi chú**

- Ô hoạt động: chọn trong danh sách toàn bộ hoạt động (hoạt động bé yêu thích lên đầu) hoặc tự gõ tên.
- **Gợi ý hoạt động** theo sở thích chung của các bé và chỉ gồm hoạt động hợp tuổi mọi bé, kèm lý do:
  - "Cả hai bé đều thích xếp hình lego";
  - "Na và Bin thích âm nhạc & ca hát".
  - Không có sở thích chung thì gợi ý hoạt động phổ biến, ghi "Phù hợp với độ tuổi của các bé".
- Chọn một gợi ý thì **thời lượng tự đổi** theo thời lượng thường gặp của hoạt động, rút ngắn cho bé nhỏ (dưới 3 tuổi tối đa 1,5 giờ, dưới 5 tuổi tối đa 2 giờ). Nếu phụ huynh đã tự chọn thời lượng thì hệ thống chỉ hiện link dùng thời lượng gợi ý, không tự đổi.

**Sau khi tạo:** các gia đình được mời nhận thông báo. Nhóm chat bắt đầu với người tổ chức; ai nhận lời thì được vào nhóm. Nhận lời cũng tính vào giới hạn số buổi tham gia mỗi tháng của gói Free.

## 5. Trùng lịch

Nguyên tắc: **một bé không thể ở hai buổi hẹn cùng lúc.** Hai buổi nối tiếp nhau thì không tính là trùng (ví dụ 10:00–12:00 rồi 12:00–14:00).

Bé chỉ bị tính là bận khi là bé chủ trì hoặc đã nhận lời một buổi sắp tới. Lời mời chưa trả lời không tính là bận.

Hệ thống báo ngay khi phụ huynh chọn ngày và giờ, **không đợi tới lúc bấm gửi**:

| Tình huống | Người dùng thấy | Có tiếp tục được không |
| --- | --- | --- |
| Chọn ngày | "Lịch bận trong ngày: Bé Bin 09:00–11:00 · Bé Sóc 15:00–17:00", hoặc "Ngày này các bé chưa có hẹn nào khác" | — |
| Giờ chọn trùng lịch **bé của mình** (tạo hẹn, đổi lịch) | Thông báo đỏ + nút **"Chọn 11:00 (giờ trống gần nhất)"**; không còn giờ trống trước 21:00 thì nhắc chọn ngày khác | Không, phải đổi giờ |
| Giờ chọn trùng lịch **bé được mời** | Nhắc vàng: phụ huynh của bé sẽ chưa nhận lời được | Có, vẫn gửi lời mời |
| Được mời nhưng một trong các bé của mình đã bận giờ đó | "Bé Sóc đã có hẹn khác 16:00–18:00, trùng giờ này"; nút **Chấp nhận tham gia** bị khoá | Chỉ có thể từ chối |
| Có đề xuất đổi lịch sang giờ bé của mình đang bận | Như trên; nút **Đồng ý lịch mới** bị khoá | Chỉ có thể từ chối lịch mới |

Với bé của gia đình khác, hệ thống chỉ cho biết **giờ bận**, không cho biết bé bận với ai hay buổi hẹn nào.

## 6. Nhắc lịch

| Thời điểm | Nội dung |
| --- | --- |
| Trước 24 giờ | "Nhắc lịch Playdate — "Thả diều" diễn ra lúc 07:00 ngày 11/03 tại Công viên Biển Đông." |
| Trước 1 giờ | "Playdate sắp bắt đầu — … Chuẩn bị lên đường nhé!" |

- **Người nhận:** người tổ chức và các gia đình **đã nhận lời**.
- Mỗi lời nhắc chỉ gửi **một lần**. Hệ thống kiểm tra 15 phút một lần nên lời nhắc có thể đến sớm tối đa 15 phút.
- Buổi hẹn tạo khi còn dưới 24 giờ thì chỉ có nhắc 1 giờ.
- Khi lịch mới được áp dụng, lời nhắc được tính lại theo giờ mới.

## 7. Danh sách buổi hẹn

- **Các tab:** Tất cả, Sắp tới, Lịch sử đã chơi, Chờ phản hồi, Đã huỷ. Mỗi tab có số lượng; danh sách phân trang 10 buổi một trang.
- **Tìm kiếm** theo hoạt động hoặc địa điểm.
- **Hai dạng xem:** danh sách và lịch theo tháng.
- **Thứ tự:** cùng một quy tắc ở mọi tab:
  - Các buổi **sắp tới** đứng trước, buổi gần nhất ở trên cùng.
  - Sau đó tới các buổi **đã qua** (đã chơi, đã huỷ), buổi mới nhất ở trên.
  - Thứ tự tính theo **cả ngày lẫn giờ bắt đầu**: hai buổi sắp tới cùng ngày thì buổi sớm hơn đứng trước.

## 8. Trang chi tiết buổi hẹn

Trang chi tiết hiển thị **giống form tạo**, cùng 3 bước nhưng chỉ để xem:

1. Người tổ chức và các gia đình tham gia, kèm trạng thái.
   - Người tổ chức thấy mọi gia đình được mời: đã tham gia / chờ phản hồi / đã từ chối.
   - Khách mời chỉ thấy các gia đình đã tham gia và chính mình, cùng số gia đình khác đang được mời.
2. Ngày, giờ, thời lượng, địa điểm (có link Google Maps).
3. Hoạt động và lời nhắn của người tổ chức.

**Phía trên trang:**
- Lời mời đang chờ trả lời.
- Đề xuất đổi lịch, kèm nút bỏ phiếu.
- Kết quả đổi lịch.
- Thông báo buổi hẹn đã huỷ.

**Bên phải:** các nút tuỳ quyền:
- **Hoàn thành** (người tổ chức, từ lúc đến giờ hẹn).
- **Nhóm chat** (người tổ chức và các gia đình đã nhận lời).
- **Đổi lịch**, **Huỷ hẹn** (người tổ chức, khi buổi hẹn còn sắp tới).
- **Rời buổi hẹn** (gia đình đã tham gia, khi họ đã chặn người tổ chức hoặc một gia đình đã tham gia khác). Trang không nêu tên người bị chặn; lượt tham gia đã dùng không được hoàn lại.
- **Báo cáo buổi hẹn** (khách mời).

**Mời thêm bạn:** trước giờ hẹn, người tổ chức mời thêm được bé của các gia đình đã kết nối, một hoặc nhiều bé mỗi gia đình. Gia đình đang được mời hoặc đã tham gia thì không mời thêm bé được nữa. Gia đình đã từ chối có thể được mời lại, và danh sách bé trong lần mời lại sẽ thay danh sách cũ. Việc mời thêm không tốn lượt tạo buổi hẹn. Khi chưa có ai tham gia, trang nhắc người tổ chức mời thêm hoặc huỷ buổi hẹn.

**Đổi lịch:**
- Người tổ chức đề xuất ngày, giờ, thời lượng mới, có thể kèm địa điểm và lý do.
- Lịch mới chỉ áp dụng khi **mọi gia đình đã tham gia** đồng ý; một gia đình từ chối thì giữ lịch cũ.
- Chưa có gia đình nào tham gia thì lịch mới áp dụng ngay.
- Đề xuất mới sẽ thay đề xuất đang chờ.

**Kết thúc buổi hẹn:** nếu người tổ chức không bấm hoàn thành, 0:00 ngày hôm sau hệ thống tự đóng buổi hẹn: có gia đình đã tham gia thì thành **đã chơi**, không có thì thành **đã huỷ**. Buổi đã chơi hiện thêm phần đánh giá của các phụ huynh.

## 9. Vị trí và khoảng cách

- Vị trí lưu của mỗi gia đình là **tâm phường/xã** họ khai báo, **không phải địa chỉ nhà**. Khoảng cách ở Khám phá và ở gợi ý địa điểm đều tính từ điểm này.
- Dùng **đơn vị phường mới sau sáp nhập 07/2025** (ví dụ Phường Hội An Đông, Phường Hải Châu). Phụ huynh còn ghi tên phường cũ thì hệ thống tự quy về phường mới (ví dụ Phước Mỹ → An Hải). Phường cũ bị tách thành nhiều phường mới thì được quy về một phường.
- Không tìm được phường thì hệ thống dùng tâm thành phố, khi đó khoảng cách chỉ là ước lượng.
- Ngày 24/10/2026 đã cập nhật lại vị trí của toàn bộ 52 phụ huynh trên dữ liệu dev. Có 4 người trước đó bị đặt nhầm ở tâm thành phố (lệch tới 26 km).

---

### Phụ lục cho dev

| Việc | Ở đâu |
| --- | --- |
| Quy tắc chấm điểm | `Back-End/src/modules/discovery/matching.rules.js` |
| Quy tắc gợi ý giờ, địa điểm, hoạt động | `Back-End/src/modules/playdate/playdate-suggestion.rules.js`, danh mục hoạt động `playdate.activities.js` |
| Trùng lịch, nhắc lịch | `playdate.service.js` (`getBusyIntervals`, `sendDueReminders`), job `jobs/playdate-reminder.job.js` |
| Geocode phường | `Back-End/src/integrations/maps/geocoding.adapter.js` |
| Trang tạo / chi tiết | `Front-End/src/modules/playdate/pages/PlaydateFormPage.jsx` |
| API mới | `GET /playdates/suggestions/{time-slots,places,activities}`, `GET /playdates/busy-times` |
| Script (đã chạy trên dev 24/10/2026) | `npm run migrate:bud48 -- --apply` (tạo 28 cặp bé từ dữ liệu cũ), `npm run geocode:parents -- --apply` |
| Postman | `Back-End/test/postman/BuddyLink-BUD48-Child-Pairing-Planning.postman_collection.json` |
