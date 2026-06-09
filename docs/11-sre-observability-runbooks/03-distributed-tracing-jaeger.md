# 📈 Distributed Tracing (Jaeger) Runbook

Tài liệu quy định cấu trúc thiết lập, truy vết các luồng giao dịch phân tán (**Distributed Tracing**) đi qua nhiều ranh giới Microservices/Domains khác nhau trong hệ sinh thái **SparkNestEd** sử dụng bộ tiêu chuẩn **OpenTelemetry (OTel)** và trực quan hóa qua **Jaeger**.

---

## 📊 1. Sơ Đồ Lan Truyền Mã Định Danh (Context Propagation Diagram)

Để theo dõi một luồng nghiệp vụ hoàn chỉnh đi qua nhiều máy chủ và hàng đợi bất đồng bộ khác nhau, hệ thống bắt buộc phải lan truyền mã định danh (**Trace ID**) trên các HTTP Headers (`traceparent` theo tiêu chuẩn W3C):

```text
  [1. CLIENT VIEW (React 19)]
  - Sinh Trace ID ban đầu (ví dụ: `1a2b3c...`)
  - Đính kèm vào HTTP Header: `traceparent: 00-1a2b3c...-01`
        │
        ▼ (Giao tiếp HTTP REST)
  [2. API GATEWAY / PRESENTATION (NestJS)]
  - Tiếp nhận Request, trích xuất Trace ID.
  - Tạo Span con `http-request-handler`.
        │
        ▼ (Giao tiếp gRPC nội bộ)
  [3. CORE VOCABULARY SERVICE]
  - Trích xuất Trace ID từ gRPC Metadata.
  - Tạo Span con `db-query-prisma`.
        │
        ▼ (Đẩy job bất đồng bộ vào Redis)
  [4. BULLMQ REDIS QUEUE]
  - Đóng gói Trace ID vào Metadata của Job.
        │
        ▼ (Worker ngầm xử lý)
  [5. BACKGROUND WORKER PROCESSOR]
  - Phục hồi Trace ID từ Job Metadata, ghi log thô kèm Trace ID.
```

---

## 💻 2. Cấu Hình Tích Hợp OpenTelemetry (OTel) Trong TypeScript

Mọi Microservice khi khởi chạy bắt buộc phải đăng ký bộ SDK OpenTelemetry để tự động thu thập và đẩy các spans về Jaeger Collector:

```typescript
// packages/backend/infrastructure/tracing/otel-sdk.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// 1. Cấu hình địa chỉ exporter gửi dữ liệu về Jaeger Collector
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://jaeger-collector:4318/v1/traces',
});

// 2. Khởi tạo SDK Node với tên dịch vụ tương ứng
export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'api-sne-service',
  }),
  traceExporter: traceExporter,
  // Tự động đo đạc (instrument) các thư viện quen thuộc như Prisma, HTTP, NestJS, Winston
  instrumentations: [getNodeAutoInstrumentations()],
});

// Kích hoạt SDK
otelSDK.start();
```

---

## 👁️ 3. Quy Trình Tìm Lỗi Nút Thắt Cổ Chai (Latency Bottlenecks) Bằng Jaeger

Khi nhận được báo cáo từ hệ thống giám sát hoặc feedback của người học về việc *"API load quá chậm, mất hơn 3 giây để lưu bài"*:

1.  **Trích xuất Trace ID:** Tìm kiếm trong Structured JSON logs của Kibana/Loki dòng log lỗi tương ứng để lấy mã định danh `traceId` (Ví dụ: `req-98213-abc`).
2.  **Truy vết trên Jaeger UI:**
    *   Truy cập Dashboard Jaeger ➡️ Dán `Trace ID` vào thanh tìm kiếm ➡️ Nhấn **Search**.
    *   Hệ thống sẽ hiển thị **Biểu đồ thác nước (Waterfall Chart)** ghi nhận dòng thời gian thực thi của toàn bộ luồng request:
3.  **Nhận diện thủ phạm (RCA):**
    *   **Lỗi N+1 Query:** Nếu thấy hàng trăm Span con của Prisma SQL (`prisma:client:operation`) xếp nối đuôi nhau thực hiện các truy vấn SELECT nhỏ, đó là lỗi N+1 Query. Giải pháp: Refactor code dùng `$transaction` hoặc `include` của Prisma.
    *   **API Ngoài bị nghẽn:** Nếu thấy Span của API ngoài (ví dụ gọi Oxford Dictionary API) kéo dài hơn 2 giây, đó là nguyên nhân. Giải pháp: Bọc Circuit Breaker hoặc chuyển cuộc gọi thành bất đồng bộ nền.
    *   **Database Lock:** Nếu thấy Span DB chiếm 90% tổng thời gian và bị block. Giải pháp: Kiểm tra các giao dịch lồng nhau gây khóa bảng.
