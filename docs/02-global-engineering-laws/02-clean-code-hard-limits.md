# ⚖️ Clean Code Hard Limits

Để bảo vệ mã nguồn khỏi sự suy thoái, ngăn chặn sự xuất hiện của các "God Class" tối nghĩa và giảm thiểu tối đa tải thức nhận thức (**cognitive load**) cho lập trình viên, phòng kỹ thuật áp dụng các **giới hạn cứng** bắt buộc dưới đây. 

> [!WARNING]
> Mọi Pull Request (PR) vi phạm bất kỳ giới hạn cứng nào dưới đây sẽ bị hệ thống phân tích tĩnh **TỰ ĐỘNG REJECT** hoặc bị người duyệt PR từ chối ngay lập tức mà không cần giải thích thêm.

---

## 📋 Bảng Tổng Hợp Các Giới Hạn Cứng

| Chỉ Số Quy Chuẩn | Giới Hạn Tối Đa | Lý Do Kỹ Thuật & Tác Động |
| :--- | :--- | :--- |
| **Độ Dài Hàm / Phương Thức** | **50 dòng** *(Không tính dòng trống & comment)* | Hàm dài hơn 50 dòng là biểu hiện vi phạm nguyên lý SRP (Single Responsibility Principle). |
| **Độ Dài Tệp Tin (File Limit)** | **400 dòng** | File quá dài gây khó khăn cho việc quản lý mã nguồn trên Git, tăng nguy cơ xung đột (Merge Conflict) và tăng cognitive load. |
| **Số Lượng Tham Số Đầu Vào** | **3 tham số** | Nhiều hơn 3 tham số làm hàm khó kiểm thử (Unit Test) và khó tái sử dụng. Bắt buộc đóng gói thành DTO hoặc Parameter Object. |
| **Độ Lồng Nhau (Nesting Depth)** | **3 cấp độ** | Lồng quá nhiều khối `if`, `for`, `while` tạo ra cấu trúc "mũi tên" (Arrow Anti-pattern) gây cực kỳ khó đọc. |
| **Giá Trị Ma Thuật (Magic Values)** | **0 (Tuyệt đối cấm)** | Cấm sử dụng trực tiếp các số hoặc chuỗi trần trụi (ví dụ: `3600`, `active`) không có khai báo hằng số hoặc enum rõ ràng. |
| **Xử Lý Lỗi Rỗng (Empty Catch)** | **0 (Tuyệt đối cấm)** | Không được phép "nuốt" lỗi. Khối `catch(e) {}` không xử lý là nguồn cơn của các bug ẩn nghiêm trọng trên Production. |

---

## 🛠️ Chi Tiết Quy Luật & Ví Dụ So Sánh ĐÚNG / SAI

### 1. Số Lượng Tham Số Hàm (Function Parameters)
Khi số lượng tham số vượt quá 3, bắt buộc phải đóng gói thành một Interface duy nhất (DTO hoặc Parameter Object).

*   ❌ **SAI (PR REJECTED):**
    ```typescript
    // Quá nhiều tham số rời rạc, dễ truyền sai thứ tự
    function registerUser(
      name: string, 
      email: string, 
      role: string, 
      age: number, 
      phone: string, 
      isVerified: boolean
    ) {
      // logic...
    }
    ```
*   ✔️ **ĐÚNG (PR APPROVED):**
    ```typescript
    interface RegisterUserDto {
      name: string;
      email: string;
      role: string;
      age: number;
      phone: string;
      isVerified: boolean;
    }

    function registerUser(dto: RegisterUserDto) {
      // logic sạch sẽ, an toàn, dễ bảo trì
    }
    ```

---

### 2. Độ Lồng Nhau & Luật "Return Early" (Guard Clauses)
Triệt tiêu hoàn toàn cấu trúc lồng nhau phức tạp. Sử dụng các điều kiện biên để trả về kết quả sớm (Return Early), giúp luồng xử lý chính (Happy Path) luôn nằm ở ngoài cùng, thẳng hàng và trực quan.

*   ❌ **SAI (PR REJECTED):**
    ```typescript
    // Cấu trúc lồng nhau kiểu "mũi tên", cực kỳ khó theo dõi luồng happy path
    function processUserLearning(user: User, vocabularySet: Set) {
      if (user.isActive) {
        if (vocabularySet.isPublished) {
          if (user.hasAccess(vocabularySet.id)) {
            const progress = user.getProgress(vocabularySet.id);
            if (progress) {
              return progress.update();
            } else {
              throw new Error("Progress not found");
            }
          } else {
            throw new Error("No access to this set");
          }
        } else {
          throw new Error("Set is not published");
        }
      } else {
        throw new Error("User is inactive");
      }
    }
    ```
*   ✔️ **ĐÚNG (PR APPROVED):**
    ```typescript
    // Sử dụng Guard Clauses: Kiểm tra điều kiện biên và thoát sớm. Luồng chính cực kỳ thẳng hàng.
    function processUserLearning(user: User, vocabularySet: Set) {
      if (!user.isActive) {
        throw new UserInactiveException(user.id);
      }
      if (!vocabularySet.isPublished) {
        throw new SetNotPublishedException(vocabularySet.id);
      }
      if (!user.hasAccess(vocabularySet.id)) {
        throw new AccessDeniedException(user.id, vocabularySet.id);
      }

      const progress = user.getProgress(vocabularySet.id);
      if (!progress) {
        throw new ProgressNotFoundException(user.id, vocabularySet.id);
      }

      return progress.update();
    }
    ```

---

### 3. Cấm Tuyệt Đối Giá Trị Ma Thuật (Magic Values)
Tất cả các giá trị cấu hình, trạng thái, thời gian chờ hoặc ngưỡng nghiệp vụ bắt buộc phải được định nghĩa dưới dạng Hằng số (`readonly`, `const`) hoặc `enum`.

*   ❌ **SAI (PR REJECTED):**
    ```typescript
    // Chuỗi 'ACTIVE' và số 86400 là các magic values mơ hồ
    if (user.status === 'ACTIVE') {
      redis.set(user.id, JSON.stringify(user), 'EX', 86400);
    }
    ```
*   ✔️ **ĐÚNG (PR APPROVED):**
    ```typescript
    // Khai báo rõ ràng trong file constants hoặc enums của domain/app
    export enum UserStatus {
      ACTIVE = 'ACTIVE',
      INACTIVE = 'INACTIVE'
    }
    
    export const CACHE_TTL = {
      ONE_DAY_IN_SECONDS: 86400,
      ONE_HOUR_IN_SECONDS: 3600
    } as const;

    // Sử dụng
    if (user.status === UserStatus.ACTIVE) {
      redis.set(
        user.id, 
        JSON.stringify(user), 
        'EX', 
        CACHE_TTL.ONE_DAY_IN_SECONDS
      );
    }
    ```

---

### 4. Xử Lý Lỗi Nghiêm Ngặt (Strict Error Handling)
Không bao giờ được bỏ qua lỗi. Khi bắt được ngoại lệ (Exception), bắt buộc phải xử lý tiếp bằng cách ghi log có ngữ cảnh, chuyển đổi lỗi hoặc ném ra Custom Exception có cấu trúc để các tầng ngoài (như NestJS Global Filter) bắt được và trả mã HTTP Code chính xác.

*   ❌ **SAI (PR REJECTED):**
    ```typescript
    // Lỗi bị nuốt trọn, không ai biết chuyện gì đã xảy ra
    try {
      await this.prisma.user.update({ where: { id }, data });
    } catch (e) {
      // Cấm tuyệt đối khối catch rỗng
    }
    ```
*   ✔️ **ĐÚNG (PR APPROVED):**
    ```typescript
    try {
      await this.prisma.user.update({ where: { id }, data });
    } catch (error) {
      this.logger.error(`Failed to update user profile for ID: ${id}`, {
        error: error.message,
        userId: id,
        stack: error.stack
      });
      
      // Chuyển đổi thành lỗi nghiệp vụ chuyên biệt
      throw new UserProfileUpdateException(id, error);
    }
    ```

---

## 🛡️ Ngoại Lệ Được Chấp Nhận (Exceptions)

Trong một số trường hợp đặc biệt kỹ thuật, các giới hạn cứng trên có thể được châm chước nếu có giải trình rõ ràng và được kiến trúc sư trưởng (Architect) phê duyệt thủ công:
1.  **Các tệp tin cấu hình tự động (Auto-generated files):** Chẳng hạn như file Prisma Client generated, file Schema GraphQL, các bản ghi di chuyển Database (Prisma Migrations).
2.  **Các cấu trúc dữ liệu tĩnh:** File chứa danh sách tỉnh thành, mã ngôn ngữ quốc tế hoặc cấu hình tĩnh khổng lồ có thể vượt quá 400 dòng.
3.  **Tập tin kiểm thử (Test files - *.spec.ts):** File kiểm thử tích hợp lớn có thể dài quá 400 dòng do chứa nhiều kịch bản test cụ thể, nhưng cấu trúc test case bắt buộc phải phân rã thành các khối `describe` rõ ràng để kiểm soát cognitive load.
