# 🧪 SonarQube Quality Gates

Hệ thống đánh giá chất lượng mã nguồn tự động thông qua trọng tài phân tích tĩnh **SonarQube** được tích hợp trực tiếp vào luồng vận hành của đường ống **GitHub Actions / GitLab CI/CD**. 

Bất kỳ mã nguồn nào được đẩy lên hệ thống bắt buộc phải đi qua cánh cổng chất lượng này để bảo vệ dự án khỏi các lỗi bảo mật nguy hiểm và sự suy thoái chất lượng mã nguồn theo thời gian.

---

## 📊 1. Bảng Chỉ Số Bộ Lọc Chất Lượng Cứng (Quality Gate Metrics)

Mọi Pull Request (PR) nhắm vào nhánh chính `develop` hoặc `main` sẽ bị **HỆ THỐNG TỰ ĐỘNG KHÓA MERGE** nếu vi phạm bất kỳ chỉ số chất lượng cứng nào dưới đây:

| Chỉ số Chất lượng (Metric) | Ngưỡng Quy định (Threshold) | Tác động kỹ thuật & Ý nghĩa |
| :--- | :--- | :--- |
| **New Bugs** | **0 (Bắt buộc)** | Tuyệt đối cấm phát sinh các lỗi cú pháp hoặc logic có khả năng gây crash ứng dụng. |
| **New Vulnerabilities** | **0 (Bắt buộc)** | Không được để lộ bất kỳ lỗ hổng bảo mật nào (như SQL Injection, XSS, Hardcoded Credentials). |
| **Security Hotspots Reviewed**| **100% (Bắt buộc)** | Toàn bộ các vùng nhạy cảm về bảo mật do hệ thống quét tĩnh phát hiện ra bắt buộc phải được kỹ sư review và xác thực an toàn. |
| **New Code Coverage** | **>= 80%** | Phần mã nguồn nghiệp vụ viết mới bổ sung phải đạt độ bao phủ kiểm thử tự động (Unit/Integration Test) tối thiểu 80%. |
| **Duplicated Lines** | **< 3%** | Tỷ lệ trùng lặp dòng code mới (copy-paste mã nguồn) cấm vượt quá 3% trên toàn bộ PR. |
| **Maintainability Rating** | **Hạng A** | Tỷ lệ Nợ kỹ thuật (Technical Debt Ratio) của phần code mới phải dưới 5%. |

---

## 🔌 2. Quy Trình Vận Hành Tự Động Tại CI/CD Pipeline

Cánh cổng chất lượng được thực thi tự động qua 4 bước khép kín không thể can thiệp thủ công:

```text
  [1. Developer Push PR]
            │
            ▼
  [2. GitHub Actions CI Runner] ──▶ Chạy lint, test tự động và xuất báo cáo coverage.lcov
            │
            ▼
  [3. SonarScanner Analysis] ────▶ Đẩy mã nguồn & báo cáo kiểm thử lên máy chủ SonarQube.
            │
            ▼
  [4. SonarQube Webhook Gate] ───▶ Đánh giá chỉ số. 
                                    Nếu PASS ➡️ Mở khóa nút Merge PR trên GitHub.
                                    Nếu FAIL ➡️ Khóa cứng nút Merge, gửi thông báo lỗi.
```

---

## 🛠️ 3. Cẩm Nang Tái Cấu Trúc Khẩn Cấp (Refactoring Playbook)

Khi PR của bạn bị SonarQube đánh trượt, hãy bình tĩnh áp dụng cẩm nang dọn dẹp dưới đây:

### 1. Giải quyết Lỗi Trùng Lặp Mã Nguồn (Duplicated Lines >= 3%)
*   **Hiện tượng:** Sao chép nguyên khối lệnh truy vấn DB hoặc cấu trúc component UI.
*   **Cách Refactor:**
    *   *Backend:* Đóng gói khối logic chung thành một hàm Helper hoặc Helper Service dùng chung nằm ở phân khu `shared/libs`.
    *   *Frontend:* Tách cụm giao diện trùng lặp thành một **Pure Component** con độc lập, truyền các tham số tùy biến qua `props`.

### 2. Giải quyết Cảnh báo Mức độ Phức tạp (Cognitive Complexity)
*   **Hiện tượng:** SonarQube báo lỗi hàm có độ phức tạp nhận thức vượt quá giới hạn (ví dụ lồng nhau quá nhiều khối điều kiện).
*   **Cách Refactor:**
    *   Áp dụng ngay nguyên tắc **Guard Clauses (Return Early)** để làm phẳng hoàn toàn cấu trúc hàm (thoát sớm ở đầu hàm).
    *   Tách nhỏ các đoạn xử lý vòng lặp con thành các hàm bổ trợ chuyên biệt tự giải nghĩa.

### 3. Giải quyết Cảnh báo "Code Smell" (Mùi code xấu)
*   **Hiện tượng:** Khai báo biến không sử dụng, gán sai kiểu dữ liệu `any` vô tội vạ, hoặc quên không xóa các comment rác cũ.
*   **Cách Refactor:** 
    *   Xóa sạch mã nguồn comment cũ (đã có Git lưu trữ lịch sử, cấm comment code cũ lại).
    *   Khai báo kiểu dữ liệu rõ ràng, tuyệt đối cấm dùng kiểu `any` lười biếng.
