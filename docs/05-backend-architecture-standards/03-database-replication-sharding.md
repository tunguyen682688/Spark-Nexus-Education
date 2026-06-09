# 🔌 Database Replication & Sharding Standards

Toàn bộ hệ thống quản lý cơ sở dữ liệu quan hệ **PostgreSQL** thông qua **Prisma ORM** bắt buộc phải tuân thủ nghiêm ngặt các quy chuẩn tối ưu hóa hiệu năng, tách luồng I/O và đảm bảo an toàn di cư dưới đây để tránh thảm họa treo DB hoặc rớt kết nối trên Production.

---

## 🗂️ 1. Cấu Hình Tách Luồng Đọc / Ghi (Read-Write Splitting) Trong Prisma

Để giải phóng áp lực tải trên Master Database, hệ thống Production bắt buộc phải phân tách luồng: thao tác Ghi (INSERT, UPDATE, DELETE) vào **Master**; thao tác Đọc (SELECT) phân tải đều ra các bản sao **Read Replicas**.

Chúng tôi cấu hình việc này trong NestJS bằng cách bọc Prisma Client qua lớp Wrapper quản lý kết nối động hoặc sử dụng Prisma Extension mở rộng:

```typescript
// packages/backend/infrastructure/database/prisma-read-write.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private writeClient: PrismaClient;
  private readClient: PrismaClient;

  constructor() {
    super();
    // 1. Client ghi kết nối trực tiếp vào Master Node
    this.writeClient = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });

    // 2. Client đọc kết nối trực tiếp vào Load Balancer Replicas
    this.readClient = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_REPLICA_URL } },
    });
  }

  async onModuleInit() {
    await this.writeClient.$connect();
    await this.readClient.$connect();
  }

  // Wrapper định tuyến thông minh:
  // Tự động phân tách các lời gọi dựa trên phương thức
  public get write() {
    return this.writeClient;
  }

  public get read() {
    return this.readClient;
  }
}
```

---

## 🛡️ 2. Quy Quy Chuẩn Di Cư Database Trực Tuyến An Toàn (Safe Online Migrations)

> [!CAUTION]
> **Thảm họa khóa bảng (Table Lock):** Việc trực tiếp chạy lệnh di cư thêm cột `NOT NULL` hoặc thay đổi kiểu dữ liệu của một cột trên bảng chứa hàng triệu dòng sẽ khóa cứng bảng đó trong nhiều phút, làm treo toàn bộ ứng dụng trên Production.

Mọi thay đổi cấu trúc bảng bắt buộc phải tuân thủ quy trình **Expand and Contract (Mở rộng và Thu hẹp)** gồm 3 bước an toàn:

```text
  [BƯỚC 1: EXPAND (Mở rộng)]
  - Thêm cột mới dưới dạng NULLABLE (cho phép NULL).
  - Deploy code: Ghi dữ liệu song song vào cả cột cũ và cột mới.
        │
        ▼
  [BƯỚC 2: BACKFILL (Điền dữ liệu)]
  - Chạy script ngầm (Background Worker/Migration Script) để sao chép dữ liệu từ cột cũ sang cột mới.
        │
        ▼
  [BƯỚC 3: CONTRACT (Thu hẹp)]
  - Đổi code sử dụng hoàn toàn cột mới.
  - Tiến hành khóa an toàn: chuyển cột mới thành NOT NULL (nếu cần).
  - Xóa bỏ cột cũ lỗi thời bằng một migration độc lập.
```

### Tiêu chuẩn viết migration file:
*   Mọi tệp migration SQL phải được kiểm duyệt thủ công bằng công cụ `prisma migrate diff` trước khi merge.
*   Cấm chạy các lệnh cấu hình nguy hiểm như `ALTER TABLE ... ALTER COLUMN TYPE ...` trực tiếp. Bắt buộc phải tạo cột mới, map dữ liệu rồi xóa cột cũ.

---

## ⚡ 3. Chiến Lược Tối Ưu Chỉ Mục & Phân Vùng PostgreSQL

### 1. Quy tắc Thiết lập Chỉ mục (Index Rules)
*   **Unique Index:** Mọi liên kết junction-table (ví dụ: `vocabulary_set_items` nối `vocabularySetId` và `entryId`) bắt buộc phải có `@@unique([vocabularySetId, entryId])` để chặn trùng lặp và tăng tốc độ query.
*   **B-Tree Index:** Bắt buộc thiết lập chỉ mục B-Tree cho các trường lọc chính: `@@index([userId, status, nextReviewAt])` của bảng tiến trình học tập SRS để tối ưu hóa truy vấn thẻ ôn tập hàng ngày.
*   **GIN Index (Tìm kiếm nhanh):** Đối với các trường tìm kiếm văn bản (như từ vựng gốc `word` trong bảng `entries`), bắt buộc sử dụng chỉ mục **GIN** kết hợp tính năng **Full-Text Search** của PostgreSQL thay thế cho toán tử `LIKE '%pattern%'` chậm chạp.

### 2. Chiến lược Phân vùng Bảng (Table Partitioning)
Đối với các bảng ghi chép sự kiện khổng lồ hoặc tiến trình học tập lịch sử dự kiến vượt quá 20 triệu dòng, bắt buộc phải áp dụng **Range Partitioning** theo thời gian (ví dụ: chia bảng `user_learning_logs` thành các phân vùng theo từng tháng) để giữ cho tốc độ truy vấn chỉ mục luôn ở mức hằng số $O(\log N)$ cực nhanh.
