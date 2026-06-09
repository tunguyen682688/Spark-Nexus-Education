# 🛡️ Concurrency & Data Race Governance

Khi hệ thống **SparkNestEd** phục vụ hàng vạn học viên hoạt động cùng lúc, sẽ xuất hiện các tình huống nhiều yêu cầu xử lý ghi (Write Requests) đồng thời tác động lên cùng một hàng dữ liệu. 

Tài liệu này quy định các tiêu chuẩn kiểm soát tương đồng (**Concurrency Control**) nghiêm ngặt để triệt tiêu hoàn toàn hiện tượng ghi đè dữ liệu (Lost Update) và các xung đột trạng thái dữ liệu (Data Race).

---

## 📊 1. So Sánh Hai Cơ Chế Khóa: Lạc Quan vs Bi Quan

Dựa trên tần suất xung đột dữ liệu và yêu cầu hiệu năng nghiệp vụ, kỹ sư bắt buộc phải chọn đúng giải pháp khóa phù hợp:

| Chỉ số So Sánh | 🔑 Khóa Lạc Quan (Optimistic Locking) | 🔒 Khóa Bi Quan (Pessimistic Locking) |
| :--- | :--- | :--- |
| **Bản chất hoạt động** | Giả định **xung đột hiếm khi xảy ra**. Kiểm tra tính đúng đắn của dữ liệu bằng số phiên bản (`version`) lúc ghi. | Giả định **xung đột luôn xảy ra**. Sử dụng cơ chế khóa vật lý của DB để chặn đứng các giao dịch khác. |
| **Hiệu năng & Throughput** | 🚀 **Rất cao**. Không chặn giữ kết nối cơ sở dữ liệu, không gây nghẽn hàng đợi DB. | ⚠️ **Thấp hơn**. Giữ kết nối DB lâu, dễ gây nghẽn (DB bottleneck) và deadlock. |
| **Nguy cơ Deadlock** | Không bao giờ xảy ra. | Rất cao nếu các giao dịch lồng nhau không thiết lập đúng thứ tự khóa. |
| **Trường hợp áp dụng** | Thay đổi gói từ vựng, cập nhật thông tin profile cá nhân, lưu tiến trình học tập. | Các tài nguyên cực kỳ nhạy cảm liên quan đến tài chính, điểm thưởng, giao dịch ví tiền học. |

---

## 🔑 2. Cài Đặt Khóa Lạc Quan (Optimistic Locking) & Retry Loop

Khóa lạc quan hoạt động bằng cách kiểm tra số phiên bản `version` tăng dần. Chúng tôi triển khai cơ chế này trong Prisma kết hợp với vòng lặp thử lại tự động (**Retry Loop**) để nâng cao trải nghiệm người dùng khi có xung đột nhỏ:

```typescript
// packages/backend/domains/module-vocabulary/src/lib/application/commands/update-srs.handler.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/shared-infrastructure';

@Injectable()
export class UpdateSRSService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProgressWithRetry(progressId: string, easeFactor: number, attempts = 3): Promise<void> {
    for (let i = 0; i < attempts; i++) {
      try {
        // 1. Tải bản ghi kèm số version hiện tại
        const progress = await this.prisma.userVocabularyProgress.findUnique({
          where: { id: progressId }
        });

        if (!progress) throw new Error('Progress not found');

        // 2. Cập nhật dữ liệu và kiểm tra version khớp chính xác
        // Tự động tăng version lên 1 đơn vị
        await this.prisma.userVocabularyProgress.update({
          where: {
            id: progressId,
            version: progress.version // Ràng buộc version bắt buộc phải khớp
          },
          data: {
            easeFactor: easeFactor,
            version: progress.version + 1n // Tăng phiên bản (BigInt)
          }
        });

        return; // Thành công ➡️ Thoát hàm
      } catch (error) {
        // Nếu lỗi xảy ra do lệch version (P2025 trong Prisma)
        const isVersionConflict = error.code === 'P2025';
        if (isVersionConflict && i < attempts - 1) {
          // Xung đột phiên bản: ngủ ngắn vài ms ngẫu nhiên và thử lại
          await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
          continue;
        }
        
        // Thử lại quá số lần quy định hoặc lỗi khác ➡️ Ném lỗi ra ngoài
        throw new ConcurrencyException('Hệ thống đang quá tải, vui lòng thử lại sau.', error);
      }
    }
  }
}
```

---

## 🔒 3. Cài Đặt Khóa Bi Quan (Pessimistic Locking)

Đối với các luồng thay đổi số dư ví tiền học hoặc giao dịch nhạy cảm có tính đồng thời cực kỳ cao, bắt buộc phải sử dụng câu lệnh khóa vật lý **`SELECT FOR UPDATE`** của PostgreSQL thông qua Prisma Raw Query bên trong một khối Transaction:

```typescript
// packages/backend/infrastructure/database/wallet-transaction.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/shared-infrastructure';

@Injectable()
export class WalletTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async deductBalance(userId: string, amount: number): Promise<void> {
    // Chạy trong 1 database transaction duy nhất
    await this.prisma.$transaction(async (tx) => {
      // 1. Khóa cứng dòng dữ liệu của ví user sử dụng SELECT FOR UPDATE
      // Chặn đứng toàn bộ các transaction khác cố tình đọc/ghi dòng này
      const wallets: any[] = await tx.$queryRaw`
        SELECT * FROM "user_wallets" 
        WHERE "user_id" = ${userId} 
        FOR UPDATE
      `;

      const wallet = wallets[0];
      if (!wallet) throw new Error('Wallet not found');
      if (wallet.balance < amount) {
        throw new InsufficientBalanceException(userId);
      }

      // 2. Thực thi cập nhật trừ tiền an toàn tuyệt đối
      await tx.userWallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance - amount }
      });
    });
  }
}
```
