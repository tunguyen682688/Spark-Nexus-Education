# 🏛️ Architecture Invariants

Tài liệu quy định các **Luật bất biến kiến trúc (Architecture Invariants)** và **Luật bất biến nghiệp vụ (Business Invariants)** trong toàn bộ hệ thống **SparkNestEd**. 

Mục tiêu tối thượng là bảo toàn tính toàn vẹn của dữ liệu và duy trì sự thuần khiết tuyệt đối của tầng nghiệp vụ (Domain Layer) trước các tác động từ hạ tầng kỹ thuật hay thay đổi nghiệp vụ bên ngoài.

---

## ⚖️ 1. Các Luật Bất Biến Nghiệp Vụ Cốt Lõi (Core Business Invariants)

Mọi dòng code được triển khai tại Domain Layer bắt buộc phải tự động kiểm soát và ngăn chặn việc phá vỡ các luật bất biến dưới đây:

### 1. Luật Bất biến ôn tập lặp quãng (SRS Invariants)
*   **Hệ số dễ (Ease Factor - EF):** Giá trị $EF$ có thể tăng hoặc giảm dựa trên chất lượng phản hồi, nhưng **tuyệt đối cấm** rơi xuống dưới ngưỡng tối thiểu **`1.3`**. Nếu công thức SM-2 tính toán ra giá trị nhỏ hơn `1.3`, Aggregate Root phải tự động gán giá trị bằng đúng `1.3`.
*   **Số lần đúng liên tiếp (Repetitions - R):** Luôn là một số nguyên không âm ($R \ge 0$).
*   **Thời gian ôn tập (NextReviewAt):** Mọi mốc thời gian lưu trữ trong DB và tính toán chu kỳ phải được chuẩn hóa về **múi giờ UTC toàn cầu** (múi giờ `Z`). Múi giờ Local chỉ được xử lý ở Client.

### 2. Luật Bất biến Gói từ vựng (Vocabulary Invariants)
*   **Trạng thái xuất bản (IsPublished):** Một `VocabularySet` chỉ được phép chuyển trạng thái `isPublished` từ `false` sang `true` (xuất bản ra cộng đồng) khi và chỉ khi danh sách từ vựng bên trong nó chứa **tối thiểu 1 từ vựng hợp lệ**. Cấm xuất bản các gói từ vựng rỗng.
*   **Quyền sở hữu:** Một gói từ vựng của cá nhân thì chỉ có chính `userId` sở hữu mới được phép sửa đổi thông tin hoặc xóa bỏ. Người dùng khác chỉ có quyền xem (Read-only) nếu gói đó được chuyển sang chế độ công khai.

---

## 🏛️ 2. Quy Tắc Ranh Giới Aggregate Root (Aggregate Boundary Rules)

Để tránh hiện tượng dữ liệu bị sửa đổi không kiểm soát thông qua các mối quan hệ lồng nhau sâu, toàn bộMonorepo áp dụng 2 luật ranh giới thép:

### Luật 1: Chỉ Aggregate Root mới được phép có Repository
*   **Chi tiết:** Các thực thể con cấp dưới (như `VocabularySetItem` nằm trong `VocabularySet`, `Sense` nằm trong `Entry`) tuyệt đối **cấm** có Repository riêng để lưu trữ trực tiếp.
*   **Hành vi đúng:** Mọi hành động Create, Update, Delete của thực thể con bắt buộc phải thực thi thông qua các phương thức nghiệp vụ của Aggregate Root tương ứng, sau đó lưu lại toàn bộ cụm Aggregate Root qua Repository của nó.

### Luật 2: Liên kết giữa các Aggregate Root bằng ID trần (Reference by ID only)
*   **Chi tiết:** Để tránh bộ nhớ bị phình to và tạo liên kết cứng, các Aggregate Root khác nhau tuyệt đối cấm chứa trực tiếp đối tượng (object reference) của nhau. Chúng chỉ được phép lưu trữ **mã định danh ID dạng chuỗi** để liên kết.
*   *Ví dụ:* `VocabularySet` chỉ chứa thuộc tính `userId: string` của Aggregate `User`, không chứa thuộc tính `user: UserEntity` trực tiếp.

---

## 💻 3. Ví Dụ Thực Tế Kiểm Soát Bất Biến Trong TypeScript

Dưới đây là cách cài đặt thực tế để tự động bảo vệ luật bất biến ngay tại Aggregate Root:

```typescript
// packages/backend/domains/module-vocabulary/src/lib/domain/aggregates/vocabulary-set.aggregate.ts

export class VocabularySetAggregate extends AggregateRoot {
  private id: string;
  private title: string;
  private isPublished: boolean;
  private items: VocabularySetItemEntity[] = [];
  private ownerId: string;

  // 1. Bảo vệ bất biến ngay tại constructor
  constructor(id: string, title: string, ownerId: string) {
    super();
    if (!id) throw new InvalidDomainException('ID của tập từ vựng bắt buộc phải có.');
    if (!title || title.trim().length === 0) {
      throw new InvalidDomainException('Tiêu đề tập từ vựng không được để trống.');
    }
    if (!ownerId) throw new InvalidDomainException('Mã người sở hữu bắt buộc phải có.');
    
    this.id = id;
    this.title = title;
    this.ownerId = ownerId;
    this.isPublished = false;
  }

  // 2. Kiểm soát luật bất biến khi xuất bản
  public publish(): void {
    // Luật bất biến: Gói từ vựng phải có ít nhất 1 từ mới được public
    if (this.items.length === 0) {
      throw new VocabularySetEmptyPublishException(this.id);
    }
    
    this.isPublished = true;
    
    // Phát sự kiện nghiệp vụ ra ngoài hệ thống
    this.apply(new VocabularySetPublishedEvent(this.id, this.title));
  }

  // 3. Thực thể con chỉ được thêm qua Aggregate Root
  public addVocabularyItem(word: string, definition: string): void {
    const isExist = this.items.some(item => item.getWord() === word);
    if (isExist) {
      throw new VocabularyItemDuplicateException(word);
    }

    const newItem = new VocabularySetItemEntity(uuid(), this.id, word, definition);
    this.items.push(newItem);
  }
}
```
