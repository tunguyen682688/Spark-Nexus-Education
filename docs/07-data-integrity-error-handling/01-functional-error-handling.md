# 🛡️ Functional Error Handling Laws

Cơ chế quản lý lỗi tin cậy, nhất quán và tường minh đóng vai trò cực kỳ quan trọng tại **SparkNestEd**. Chúng tôi áp dụng nguyên tắc **Lập trình chức năng (Functional Error Handling)** để biến lỗi thành các giá trị trả về có kiểu dữ liệu mạnh (**strongly-typed**), ép buộc lập trình viên phải xử lý lỗi tường minh và giảm thiểu tối đa các bug crash ứng dụng bất ngờ.

---

## ⚖️ 1. Luật Bối Cảnh Lỗi: Cấm Tuyệt Đối Nuốt Lỗi

> [!CAUTION]
> **Thảm họa nuốt lỗi (Error Swallowing):** Việc viết khối `catch(e) {}` rỗng mà không xử lý hoặc chỉ sử dụng `console.log` đơn giản sẽ làm biến mất hoàn toàn dấu vết của các sự cố nghiêm trọng (ví dụ: DB connection pool bị cạn kiệt, API của đối tác bị từ chối truy cập), khiến hệ thống chạy sai nghiệp vụ âm thầm cực kỳ nguy hiểm.

Mọi lỗi bắt được bắt buộc phải được xử lý có trách nhiệm: ghi log phân cấp kèm ngữ cảnh thông qua Logger chuyên dụng, rollback trạng thái dữ liệu (nếu có transaction), và thông báo thân thiện cho client.

---

## 🏛️ 2. Áp Dụng Result Object Pattern Tiêu Chuẩn

Đối với các Use Cases nghiệp vụ phức tạp ở tầng Application và Domain, chúng tôi cấm sử dụng cơ chế ném lỗi tùy tiện (`throw new Error`). Bắt buộc sử dụng cấu trúc **Result Object Pattern** để cách ly luồng happy-path và luồng lỗi:

### 📋 Khai báo Lớp Result strongly-typed:

```typescript
// packages/shared/libs/src/lib/domain/result.ts

export class Result<T, E = Error> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, value?: T, error?: E) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._value = value;
    this._error = error;
  }

  public static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  public static fail<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  public getValue(): T {
    if (this.isFailure) {
      throw new Error('Không thể lấy giá trị từ một kết quả thất bại.');
    }
    return this._value!;
  }

  public getError(): E {
    if (this.isSuccess) {
      throw new Error('Không thể lấy lỗi từ một kết quả thành công.');
    }
    return this._error!;
  }
}
```

### 📋 So Sánh Ví Dụ ĐÚNG / SAI:

*   ❌ **SAI (PR REJECTED):** Sử dụng `throw` bừa bãi làm mất tính strongly-typed của kiểu trả về.
    ```typescript
    // Khó nhận biết hàm này có thể ném ra những lỗi gì nếu ko đọc sâu vào code
    async reviewCard(cardId: string, quality: number): Promise<Card> {
      const card = await this.repo.findById(cardId);
      if (!card) throw new Error("Card not found"); // Ném lỗi trần trụi
      
      card.applySM2(quality);
      return this.repo.save(card);
    }
    ```

*   ✔️ **ĐÚNG (PR APPROVED):** Sử dụng `Result` tường minh ở chữ ký hàm.
    ```typescript
    import { Result } from '@spark-nest-ed/shared-libs';

    async reviewCard(
      cardId: string, 
      quality: number
    ): Promise<Result<Card, CardNotFoundException | InvalidQualityException>> {
      const card = await this.repo.findById(cardId);
      if (!card) {
        return Result.fail(new CardNotFoundException(cardId));
      }

      try {
        card.applySM2(quality);
        const savedCard = await this.repo.save(card);
        return Result.ok(savedCard);
      } catch (error) {
        return Result.fail(new InvalidQualityException(quality, error));
      }
    }
    ```

---

## 🔌 3. NestJS Exception Filter & Interceptor Pipeline

Tại tầng Presentation (Controller), để chuyển đổi mượt mà giữa kiểu trả về `Result` nghiệp vụ và các mã phản hồi HTTP JSON:API tiêu chuẩn, hệ thống sử dụng một **Global Exception Interceptor**:

```typescript
// packages/backend/infrastructure/filters/functional-error.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result } from '@spark-nest-ed/shared-libs';

@Injectable()
export class FunctionalErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(result => {
        // Nếu kết quả trả về là một thực thể Result thất bại
        if (result instanceof Result && result.isFailure) {
          const error = result.getError();
          
          // Tự động chuyển đổi thành HTTP Exception tương ứng dựa trên loại lỗi
          if (error instanceof DomainNotFoundException) {
            throw new NotFoundException(error.message);
          }
          
          throw new BadRequestException({
            errors: [{
              status: "400",
              title: "Bad Request",
              detail: error.message
            }]
          });
        }
        
        // Nếu thành công, trả về giá trị bên trong Result
        return result instanceof Result ? result.getValue() : result;
      })
    );
  }
}
```
