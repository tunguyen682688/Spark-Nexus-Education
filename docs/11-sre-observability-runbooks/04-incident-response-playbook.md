# 📈 Incident Response & Post-Mortem Playbook

Tài liệu quy định quy trình chuẩn hóa phản ứng nhanh, điều phối đội ngũ và viết báo cáo phân tích nguyên nhân gốc rễ (**Post-Mortem**) khi xảy ra các sự cố nghiêm trọng (Outages / Sev-0 / Sev-1) trên môi trường Production của hệ sinh thái **SparkNestEd**.

---

## 📊 1. Ma Trận Quy Trình Phản Ứng Sự Cố (Incident Response Matrix)

Khi hệ thống gặp sự cố nghiêm trọng (ví dụ: sập API, mất kết nối DB chính, rò rỉ dữ liệu), đội ngũ trực chiến (On-call) bắt buộc phải kích hoạt quy trình phản ứng nhanh theo bảng dưới đây:

| Giai Đoạn Xử Lý | Vai trò & Trách nhiệm chính | Hành động kỹ thuật cụ thể |
| :--- | :--- | :--- |
| **Bước 1: DECLARE**<br>*(Tuyên bố khẩn cấp)* | **Incident Commander (IC):** Thường do Tech Lead / SRE đảm nhận. Điều phối tổng thể. | - Lập tức mở kênh tác chiến khẩn cấp (**War Room** trên Slack/Zoom).<br>- Thông báo nội bộ cho các bên liên quan và Comms Lead để chuẩn bị kịch bản hỗ trợ khách hàng. |
| **Bước 2: MITIGATE**<br>*(Khống chế sự cố)* | **On-call Engineers (Dev/SRE):** Thực thi kỹ thuật. | - **Ưu tiên số 1: Đưa hệ thống hoạt động trở lại bằng mọi cách nhanh nhất.**<br>- *Hành động nhanh:* Rollback mã nguồn về phiên bản cũ gần nhất, tăng tài nguyên hạ tầng (Autoscale), bật Feature Flag bảo trì hoặc khởi động lại dịch vụ.<br>- **Cấm:** Tuyệt đối cấm mất thời gian tìm nguyên nhân gốc rễ (RCA) trong giai đoạn này. |
| **Bước 3: ANALYZE**<br>*(Phân tích nguyên nhân)* | **Toàn bộ Dev & SRE Teams** liên quan. | - Sau khi hệ thống đã ổn định 100%, đóng War Room.<br>- Lập lịch họp đánh giá sự cố trong vòng **`24 giờ`** kể từ khi khống chế.<br>- Sử dụng phương pháp **5 Whys** để tìm nguyên nhân gốc rễ. |
| **Bước 4: PREVENT**<br>*(Phòng ngừa & Post-mortem)* | **Incident Commander (IC):** Viết báo cáo. | - Viết báo cáo tổng kết **Post-Mortem** chi tiết.<br>- Tạo các ticket hành động sửa chữa lỗi (Corrective Action Items) trong Jira Sprint tiếp theo. |

---

## 🏛️ 2. Cẩm Nang Phân Tích Nguyên Nhân Gốc Rễ (RCA - 5 Whys Playbook)

Để tránh việc sửa lỗi hời hợt phần ngọn (ví dụ: chỉ khởi động lại server), SRE Team áp dụng phương pháp **5 Whys** để đào sâu tìm ra điểm yếu hệ thống:

*   *Sự cố:* Server API bị tràn bộ nhớ (OOM) và crash liên tục.
    1.  **Tại sao?** Vì luồng import từ vựng ngốn sạch RAM.
    2.  **Tại sao?** Vì người học upload tệp tin chứa 10,000 từ vựng cùng lúc.
    3.  **Tại sao?** Vì ứng dụng backend xử lý tệp tin này bằng cách tải toàn bộ dữ liệu vào RAM và chạy Transaction đồng bộ.
    4.  **Tại sao?** Vì chưa áp dụng giới hạn kích thước tệp upload và chưa chuyển tiến trình sang bất đồng bộ chạy ngầm.
    5.  **Tại sao? (Nguyên nhân gốc):** Thiếu tiêu chuẩn thiết kế kiến trúc xử lý tác vụ nặng (Hybrid Engine) và thiếu rào chắn giới hạn đầu vào (Guardrails). ➡️ *Giải pháp triệt để: Giới hạn file <= 30 từ cho xử lý đồng bộ, nhiều hơn bắt buộc chạy qua hàng đợi BullMQ Worker chia nhỏ chunk.*

---

## 📝 3. Biểu Mẫu Tổng Kết Sự Cố Tiêu Chuẩn (Post-Mortem Template)

Báo cáo Post-Mortem được viết theo nguyên lý **Blameless (Không đổ lỗi cá nhân)**, tập trung vào cải tiến hệ thống:

```markdown
# 📄 POST-MORTEM: [Tên Sự Cố] (Ví dụ: Sự cố sập API ngày 24/05/2026)

## 📌 1. Tóm tắt Sự cố (Executive Summary)
- **Mức độ nghiêm trọng:** Sev-0 (Sập toàn cục) | Sev-1 (Lỗi tính năng lõi)
- **Tổng thời gian ảnh hưởng:** 42 phút (Từ 10:15 UTC đến 10:57 UTC)
- **Tác động kinh doanh (Impact):** Khoảng 15,000 người học bị gián đoạn truy cập, 120 giao dịch mua gói bị chậm phản hồi.

## 🕒 2. Dòng thời gian chi tiết (Incident Timeline)
- **10:15 UTC:** Hệ thống Prometheus bắn cảnh báo HTTP Error Rate > 5% về kênh Slack SRE.
- **10:18 UTC:** Kỹ sư On-call nhận sự cố, mở War Room khẩn cấp.
- **10:25 UTC:** Phát hiện log báo lỗi DB Connection Timeout do nghẽn table lock.
- **10:45 UTC:** Quyết định kích hoạt Rollback code Ingress và Invalidate toàn bộ cache Redis.
- **10:57 UTC:** Hệ thống phục hồi hoàn toàn trạng thái bình thường.

## 🔍 3. Nguyên nhân gốc rễ (Root Cause Analysis - RCA)
[Ghi lại kết quả phân tích 5 Whys chi tiết ở đây]

## 🛠️ 4. Danh sách Hành động phòng ngừa (Action Items)
- [ ] **[Khắc phục]** Triển khai hàng đợi BullMQ cho import từ vựng (Hạn chót: 30/05/2026 - Người nhận: Dev A).
- [ ] **[Ngăn ngừa]** Thiết lập cảnh báo Prometheus khi số lượng connection DB vượt quá 80% (Hạn chót: 26/05/2026 - Người nhận: SRE B).

## 💡 5. Bài học kinh nghiệm (Key Lessons Learned)
- Cần có chốt chặn giới hạn file upload ngay ở tầng Ingress/Nginx.
- Phải chia nhỏ transaction khi thao tác ghi hàng loạt dữ liệu.
```
