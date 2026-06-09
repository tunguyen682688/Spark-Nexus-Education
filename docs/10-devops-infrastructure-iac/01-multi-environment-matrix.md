# ☁️ Multi-Environment Matrix

Tài liệu quy định cấu trúc thiết lập, cấu hình tài nguyên và các chính sách quản trị nhất quán giữa 4 môi trường chạy phần mềm tại hệ sinh thái **SparkNestEd**: **Development (Local/Dev) ➡️ Staging ➡️ UAT (User Acceptance Testing) ➡️ Production**.

---

## 📊 1. Ma Trận So Sánh Chỉ Số Các Môi Trường

Để đảm bảo tối ưu hóa chi phí hạ tầng đồng thời giữ vững hiệu năng tối đa cho môi trường thật, tài nguyên hệ thống được phân bổ khoa học theo bảng sau:

| Đặc Tính Hạ Tầng | 💻 Development | 🧪 Staging | 📈 UAT | 🚀 Production |
| :--- | :--- | :--- | :--- | :--- |
| **CPU / RAM Sizing** | 0.5 Core / 512MB | 1 Core / 2GB | 2 Core / 4GB | **4 Core / 8GB (Autoscale)** |
| **Database Specs** | PostgreSQL Local | Single Node Cloud | Single Node Cloud | **Primary-Replica Splitting** |
| **Redis Cache Sizing**| 256MB Local | 1GB Cloud | 2GB Cloud | **4GB Cluster (High Avail)** |
| **Logging Level** | `DEBUG`, `TRACE` | `INFO`, `DEBUG` | `INFO` | `WARN`, `ERROR`, `FATAL` |
| **Rate Limiting (IP)**| 1000 reqs/phút | 300 reqs/phút | 200 reqs/phút | **100 reqs/phút (Strict)** |
| **CORS Policy** | `*` (Cho phép hết) | `*.dev.sparknested` | `*.uat.sparknested` | **`*.sparknested.com`** |

---

## 🛡️ 2. Quy Trình Quản Lý Secrets Cực Kỳ Bảo Mật (Secrets Workflow)

> [!CAUTION]
> **Cấm Tuyệt Đối Commit File `.env` Chứa Secrets:** Việc vô tình push tệp tin chứa database passwords, private keys, API keys của đối tác lên Git công khai sẽ tạo ra thảm họa hổng an toàn thông tin, khiến hệ thống lập tức bị khai thác trục lợi và chịu phạt pháp lý nghiêm trọng.

Hệ thống áp dụng luồng tiêm Secrets bảo mật tự động thông qua các nhà cung cấp chuyên nghiệp (**Doppler** hoặc **AWS Secrets Manager**):

```text
  [1. Khai báo Secrets tập trung tại Doppler Dashboard]
                          │
                          ▼
  [2. GitHub Actions CI/CD Pipeline khi Trigger deploy]
  - Tự động gọi Doppler API thông qua JWT Service Token bảo mật.
  - Tải toàn bộ cấu hình môi trường tương ứng dưới dạng biến k8s Secret.
                          │
                          ▼
  [3. Container Runtime Injection]
  - Kubernetes tiêm (inject) các biến Secret này trực tiếp vào Ram bộ nhớ 
    của Runtime Container dưới dạng Biến Môi Trường (Environment Variables).
  - Cấm ghi secrets ra ổ cứng dưới dạng tệp vật lý để tránh bị đánh cắp.
```

---

## 🏛️ 3. Chiến Lược Cách Ly Hạ Tầng Mạng (Network Isolation Blueprint)

Để chặn đứng nguy cơ lỗi dây chuyền từ môi trường thử nghiệm phá hoại dữ liệu môi trường thật, hệ thống Production được cô lập mạng hoàn toàn:

*   **Phân rã VPC (Virtual Private Cloud Isolation):** Môi trường Production nằm trong một VPC riêng biệt, không có kết nối Peering đến các VPC của Dev/Staging.
*   **Mô hình Vách ngăn Subnet (Public vs Private):**
    *   **Public Subnet:** Chỉ chứa các bộ cân bằng tải công khai (Load Balancer/Ingress Controller) có nhiệm vụ tiếp nhận HTTPS từ Client.
    *   **Private Subnet (Cô lập hoàn toàn):** Chứa các Pod chạy API NestJS, hàng đợi BullMQ Workers. Chỉ cho phép nhận kết nối từ Load Balancer nội bộ.
    *   **Database Subnet (Siêu cô lập):** Các cơ sở dữ liệu PostgreSQL và Redis Cluster nằm trong phân khu mạng an toàn sâu nhất, tuyệt đối cấm truy cập từ internet ngoài. Chỉ cho phép các Pod API NestJS trong cùng VPC kết nối qua cổng bảo mật PostgreSQL `5432` / Redis `6379`.
