# 🔌 Distributed Caching Standards (Redis)

Bộ nhớ đệm phân tán **Redis** là thành phần cốt lõi để nâng cao hiệu năng chịu tải (high availability) và giảm độ trễ (latency) của hệ thống **SparkNestEd**. Việc sử dụng Cache không đúng cách có thể gây ra hiện tượng lệch dữ liệu (stale data) hoặc sập toàn bộ hệ thống. Tài liệu này quy định các tiêu chuẩn áp dụng thống nhất cho toàn bộ Monorepo.

---

## 🧭 1. Thiết Lập Mẫu Cache-Aside Tiêu Chuẩn Trong NestJS

Chiến lược nạp bộ đệm Cache-Aside là mô hình tiêu chuẩn được áp dụng. Để tránh lặp code, chúng tôi đóng gói logic này thành một Helper Service có kiểu dữ liệu mạnh (strongly-typed):

```typescript
// packages/backend/infrastructure/cache/redis-cache.service.ts
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis(process.env.REDIS_URL);
  }

  /**
   * Thực thi cơ chế Cache-Aside (Lazy Loading) an toàn.
   * 
   * @param key Khóa cache định danh duy nhất.
   * @param ttlSeconds Thời gian sống của cache (tính bằng giây).
   * @param dbQuery Callback truy vấn database nếu cache miss.
   */
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    dbQuery: () => Promise<T>
  ): Promise<T> {
    try {
      // 1. Kiểm tra cache hit
      const cachedValue = await this.redisClient.get(key);
      if (cachedValue) {
        this.logger.debug(`Cache Hit for key: ${key}`);
        return JSON.parse(cachedValue) as T;
      }

      // 2. Cache Miss: Gọi DB truy vấn
      this.logger.debug(`Cache Miss for key: ${key}. Fetching from Database...`);
      const freshData = await dbQuery();

      if (freshData !== undefined && freshData !== null) {
        // 3. Nạp lại vào Cache kèm thời gian sống (TTL)
        await this.redisClient.set(
          key,
          JSON.stringify(freshData),
          'EX',
          ttlSeconds
        );
      }

      return freshData;
    } catch (error) {
      // Cơ chế Fallback an toàn: Nếu Redis sập, gọi trực tiếp DB để hệ thống ko bị chết
      this.logger.error(`Redis Error. Falling back to DB for key: ${key}`, error);
      return dbQuery();
    }
  }

  async invalidate(key: string): Promise<void> {
    await this.redisClient.del(key);
    this.logger.log(`Cache Invalidated for key: ${key}`);
  }
}
```

---

## 🏷️ 2. Quy Chuẩn Đặt Tên Khóa Cache (Key Naming Schema)

Mọi khóa cache trong Redis bắt buộc phải được đặt tên có cấu trúc rõ ràng phân cấp bằng dấu hai chấm `:` để dễ dàng quản trị, tìm kiếm và thu dọn:

```text
[Tên-Hệ-Thống]:[Bounded-Context]:[Thực-Thể-Nghiệp-Vụ]:[ID-Định-Danh]
```

*   **Quy tắc:**
    *   Phải bắt đầu bằng tên dự án viết thường: `sparknested`.
    *   Viết bằng chữ thường nối với nhau bằng dấu gạch ngang (kebab-case).
*   **Ví dụ chuẩn:**
    *   Cache thông tin gói từ vựng: `sparknested:vocabulary:set:550e8400-e29b-41d4-a716-446655440000`
    *   Cache từ gốc của từ điển: `sparknested:dictionary:entry:aesthetic`

---

## 🛡️ 3. Chiến Lược Hủy Bộ Đệm (Cache Invalidation)

Để đảm bảo tính nhất quán dữ liệu ở mức cao nhất, khi thực hiện bất kỳ thao tác thay đổi dữ liệu nào (UPDATE, DELETE, PATCH), bắt buộc phải giải phóng bộ nhớ đệm (Cache Invalidation) của thực thể đó.

```typescript
// Sử dụng trong tầng Application Handler
async update(command: UpdateVocabularySetCommand) {
  // 1. Cập nhật dữ liệu thật trong cơ sở dữ liệu PostgreSQL
  const updatedSet = await this.repository.update(command.id, command.data);

  // 2. Lập tức hủy khóa cache cũ để đảm bảo client tiếp theo nhận dữ liệu mới
  const cacheKey = `sparknested:vocabulary:set:${command.id}`;
  await this.cacheService.invalidate(cacheKey);

  return updatedSet;
}
```

---

## 🚨 4. Giải Pháp Phòng Thủ Ba Thảm Họa Cache Kinh Điển

| Thảm Họa Hệ Thống | Mô Tả Hiện Tượng | 🛡️ Giải Pháp Phòng Thủ Bắt Buộc |
| :--- | :--- | :--- |
| **Cache Avalanche**<br>*(Tuyết lở Cache)* | Hàng loạt khóa cache quan trọng cùng hết hạn (Expired) tại một thời điểm, khiến hàng vạn request tràn thẳng xuống đánh sập Database. | 👉 **Randomized TTL (Cộng số ngẫu nhiên):** Luôn cộng thêm một giá trị giây ngẫu nhiên (ví dụ: `TTL = BASE_TTL + Math.random() * 300`) để phân tán thời điểm hết hạn của các khóa. |
| **Cache Stampede**<br>*(Kẹt xe / Hotkey)* | Một khóa cache cực kỳ nóng (Hotkey - ví dụ trang chủ) bị hết hạn. Hàng ngàn request đồng thời thấy Cache Miss và cùng chạy truy vấn DB đắt đỏ để nạp lại cache. | 👉 **Single-Flight / Locking:** Áp dụng cơ chế khóa mutex (như `redlock`) hoặc gom nhóm các request truy vấn trùng lặp (Single Flight) để chỉ cho phép **1 request duy nhất** xuống DB nạp cache, các request khác xếp hàng chờ kết quả. |
| **Cache Penetration**<br>*(Xuyên thủng Cache)* | Kẻ tấn công liên tục gửi các yêu cầu truy vấn tài nguyên không hề tồn tại (ví dụ ID ngẫu nhiên) làm hệ thống luôn bị Cache Miss và phải quét DB liên tục. | 👉 **Cache Null Values (Lưu kết quả trống):** Nếu DB trả về rỗng (null/undefined), vẫn lưu giá trị rỗng đó vào Redis kèm TTL ngắn (`TTL = 300` giây) để chặn đứng các request phá hoại tiếp theo. |
