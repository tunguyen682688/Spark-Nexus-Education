# 🏁 Feature Flag Governance

Tài liệu quy định chi tiết quy trình quản lý, đặt tên và thu dọn các cơ chế bật/tắt tính năng từ xa (**Feature Flags**) tại dự án **SparkNestEd** bằng các công cụ LaunchDarkly hoặc GrowthBook.

Việc quản trị Feature Flag chặt chẽ giúp bảo vệ môi trường Production luôn an toàn, cho phép triển khai liên tục (Continuous Deployment) mà không gây rủi ro ảnh hưởng đến người dùng hiện tại.

---

## 🏷️ 1. Quy Chuẩn Đặt Tên Feature Flag

Mọi Feature Flag khi được khai báo trên hệ thống quản lý bắt buộc phải tuân thủ đúng cú pháp định dạng **kebab-case** phân nhóm rõ rệt:

```text
[Mục đích]-[Miền Nghiệp vụ]-[Tên Tính năng cụ thể]
```

*   **Mục đích:**
    *   `feat`: Sử dụng để ẩn/hiện một tính năng mới đang phát triển.
    *   `exp`: Sử dụng cho các chiến dịch thử nghiệm so sánh hiệu quả (A/B Testing).
    *   `ops`: Sử dụng để kiểm soát vận hành kỹ thuật (ví dụ: bật/tắt chế độ bảo trì, giới hạn tài nguyên).
*   **Ví dụ chuẩn xác:**
    *   `feat-vocabulary-sm2-v2`: Flag bọc thuật toán SM2 phiên bản 2 của phân khu Từ vựng.
    *   `exp-quiz-arena-layout`: Thử nghiệm A/B giao diện đấu trường trắc nghiệm mới.
    *   `ops-api-maintenance-mode`: Tắt toàn bộ API để bảo trì hệ thống.

---

## 🔄 2. Vòng Đời 5 Bước Của Một Feature Flag

Mỗi Feature Flag bắt buộc phải trải qua vòng đời tiêu chuẩn dưới đây để tránh hiện tượng tích tụ nợ kỹ thuật (Technical Debt) rác trong mã nguồn:

```text
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  1. Development │ ───▶ │     2. Beta      │ ───▶ │    3. Canary     │
│   (Off/Devs)    │      │  (Internal Team) │      │  (Percent Roll)  │
└─────────────────┘      └──────────────────┘      └──────────────────┘
                                                             │
                                                             ▼
┌─────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   5. Cleanup    │ ───▶ │   4. Released GA │ ◀────┘                  │
│  (SOP Dọn dẹp)  │      │ (100% All Users) │                         │
└─────────────────┘      └──────────────────┘                         │
```

1.  **Development:** Code mới được merge liên tục vào nhánh `develop` nhưng flag thiết lập mặc định là **OFF** đối với người dùng cuối để test nội bộ.
2.  **Beta / Internal Testing:** Bật flag cho nhóm người dùng thử nghiệm nội bộ (nhân viên công ty, QA team).
3.  **Canary Rollout:** Mở flag theo tỷ lệ phần trăm tăng dần (5% ➡️ 25% ➡️ 50%) để theo dõi hiệu năng hệ thống và lỗi phát sinh qua Grafana.
4.  **GA (General Availability):** Bật flag 100% cho toàn bộ người học sau khi tính năng đã chạy ổn định.
5.  **Cleanup (Dọn dẹp):** Tiến hành refactor xóa bỏ hoàn toàn flag khỏi mã nguồn và hệ thống quản trị trong tối đa **30 ngày** kể từ ngày đạt trạng thái GA.

---

## 💻 3. Hướng Dẫn Coding Tích Hợp Feature Flag

### 1. Phía Backend (NestJS Guard / Interceptor)
Sử dụng Feature Flag để bảo vệ hoặc phân luồng API Endpoint ngay tại tầng Presentation:

```typescript
@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(private readonly flagService: FeatureFlagService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Kiểm tra xem user có nằm trong diện được kích hoạt thuật toán SM2 mới không
    const isSm2V2Enabled = await this.flagService.isEnabled(
      'feat-vocabulary-sm2-v2',
      { key: user.id, email: user.email }
    );

    if (!isSm2V2Enabled) {
      throw new FeatureDisabledException('Thuật toán ôn tập mới đang thử nghiệm.');
    }

    return true;
  }
}
```

### 2. Phía Frontend (React Hook / Component)
Bọc giao diện và logic của Component một cách sạch sẽ:

```tsx
import { useFeatureFlag } from '../hooks/use-feature-flag';
import { NewSRSReviewCard } from './NewSRSReviewCard';
import { LegacySRSReviewCard } from './LegacySRSReviewCard';

export function SRSReviewCardContainer() {
  const { isEnabled, isLoading } = useFeatureFlag('feat-vocabulary-sm2-v2');

  if (isLoading) return <LoadingSkeleton />;

  // Phân luồng hiển thị mượt mà dựa trên trạng thái flag từ xa
  return isEnabled ? <NewSRSReviewCard /> : <LegacySRSReviewCard />;
}
```

---

## 🗑️ 4. Quy Trình Dọn Dẹp Tiêu Chuẩn (Cleanup SOP)

> [!WARNING]
> Việc quên dọn dẹp Feature Flag đã cũ sẽ biến mã nguồn thành một bãi rác với hàng chục nhánh rẽ `if-else` tối nghĩa, gây khó khăn cho việc tối ưu hiệu năng và gây nhầm lẫn cực lớn cho kỹ sư mới.

Mỗi khi một tính năng được kích hoạt thành công 100% cho toàn bộ người dùng trên môi trường Production:

1.  **Lập Ticket Kỹ Thuật:** Lập tức tạo một ticket phụ thuộc có tiêu đề `chore(cleanup): xóa feature-flag [tên-flag]` trong sprint làm việc kế tiếp.
2.  **Dọn Sạch Mã Nguồn:**
    *   Xóa bỏ mọi khối lệnh kiểm tra flag (`if-else`, guards, hooks).
    *   Biến luồng tính năng mới thành Happy Path chính thức ngoài cùng của hàm.
    *   Xóa bỏ các component cũ đã lỗi thời không còn sử dụng.
3.  **Viết Test Bổ Sung:** Cập nhật các tệp tin unit test (`*.spec.ts`) để kiểm thử trực tiếp Happy Path mới, xóa các test case cũ liên quan đến luồng logic đã bỏ.
4.  **Xóa Trên Hệ Thống Quản Trị:** Sau khi code dọn dẹp đã được merge lên Production thành công, tiến hành Lưu trữ (Archive) hoặc Xóa hoàn toàn flag đó trên Dashboard của LaunchDarkly/GrowthBook để giữ bảng điều khiển luôn sạch sẽ.
