# 📈 Metrics - Prometheus & Grafana Runbook

Tài liệu hướng dẫn cấu hình, thu thập chỉ số hiệu năng hoạt động của hệ thống (**Metrics**) và trực quan hóa dashboard giám sát, thiết lập các ngưỡng cảnh báo tự động chủ động của đội ngũ kỹ sư vận hành (**SRE Team**) tại **SparkNestEd**.

---

## 📊 1. Bản Đồ Truy Vấn 4 Tín Hiệu Vàng Giám Sát (PromQL Queries)

Hệ thống Prometheus Server liên tục cào (scrape) các metrics được expose ra từ endpoint `/metrics` của NestJS Backend. Để theo dõi chính xác **4 Tín Hiệu Vàng**, SRE team sử dụng các câu lệnh truy vấn **PromQL** tiêu chuẩn sau:

| Tín hiệu vàng | Mô tả kỹ thuật | Chỉ số Metric gốc | Câu lệnh truy vấn PromQL tiêu chuẩn |
| :--- | :--- | :--- | :--- |
| **`Latency`**<br>*(Độ trễ)* | Thời gian trung bình để xử lý xong một HTTP request (giây). | `http_request_duration_seconds` | `sum(rate(http_request_duration_seconds_sum[5m])) / sum(rate(http_request_duration_seconds_count[5m]))` |
| **`Traffic`**<br>*(Lưu lượng)* | Số lượng yêu cầu HTTP đi vào hệ thống trong 1 giây (RPS). | `http_requests_total` | `sum(rate(http_requests_total[5m]))` |
| **`Errors`**<br>*(Tỷ lệ lỗi)* | Tỷ lệ phần trăm các request bị lỗi hệ thống 5xx. | `http_requests_total{status=~"5.."}` | `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100` |
| **`Saturation`**<br>*(Bão hòa)* | Đo tải tiêu thụ tài nguyên phần cứng Container. | `container_cpu_usage_seconds_total`, `node_memory_Active_bytes` | `sum(rate(container_cpu_usage_seconds_total{container="api-sne"}[5m])) / sum(container_spec_cpu_quota{container="api-sne"}) * 100` |

---

## 🏛️ 2. Bố Cục Thiết Kế Dashboard Grafana (Grafana Blueprint)

Dashboard giám sát trung tâm của SparkNestEd được bố trí một cách khoa học để hỗ trợ việc nhận diện sự cố chỉ trong **`3 giây`** quan sát mắt thường:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                   STATUS OVERVIEW (Màu xanh: OK - Màu Đỏ: Alert)          │
│ 🟩 API Gateway: UP  │  🟩 Core Vocab: UP   │  🟩 Redis: OK  │  🟩 DB Conn: 12/20 │
├──────────────────────────────────────────────────────────────────────────┤
│ [1. Latency - Biểu đồ vùng]              │ [2. Throughput / Traffic - Cột]       │
│ Thể hiện p95 và p99 Latency (mốc 500ms). │ Số lượng RPS đang đi vào hệ thống.     │
├──────────────────────────────────────────────────────────────────────────┤
│ [3. Error Rate % - Biểu đồ tròn/dòng]     │ [4. Saturation - Đồng hồ CPU/RAM]     │
│ Hiển thị tỷ lệ lỗi 5xx trên tổng số.     │ Tải tiêu thụ phần cứng của từng pod.  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🚨 3. Quy Quy Chuẩn Cảnh Báo Chủ Động (Alerting Runbook)

Hệ thống cảnh báo (**Prometheus Alertmanager**) được cấu hình các ngưỡng kích hoạt cứng thực tế để tự động bắn thông báo khẩn cấp về Slack/Discord hoặc gọi điện trực tiếp qua PagerDuty cho kỹ sư trực chiến (On-call):

### 1. Cảnh báo Lỗi API Nghiêm Trọng (High Error Rate Alert)
*   **Ngưỡng kích hoạt:** Tỷ lệ lỗi API 5xx vượt quá **`2%`** liên tục trong vòng **`3 phút`**.
*   **Hành động SRE:** Lập tức kiểm tra log tập trung qua Trace ID, xác định xem DB có bị nghẽn (Lock) hay một API của bên thứ ba đang bị timeout làm sập luồng.

### 2. Cảnh báo Cạn Kiệt Kết Nối Database (DB Connection Exhaustion)
*   **Ngưỡng kích hoạt:** Số lượng kết nối đang sử dụng trong Prisma Connection Pool vượt quá **`85%`** dung lượng cấu hình tối đa liên tục trong **`5 phút`**.
*   **Hành động SRE:** Tăng số lượng max connections hoặc thực thi mở rộng tài nguyên (Scaling) các Read Replicas để phân tải.

### 3. Cảnh báo Trầm Cảm Tài Nguyên Pod (CPU/RAM Exhaustion)
*   **Ngưỡng kích hoạt:** CPU Usage vượt quá **`90%`** hoặc RAM Memory Usage vượt quá **`85%`** trong **`10 phút`**.
*   **Hành động SRE:** Kích hoạt tự động mở rộng pod (Horizontal Pod Autoscaler - HPA) để nâng số lượng container gánh tải.
