# 🔐 Role & Attribute Based Access Control

Hệ thống quản lý và phân quyền truy cập tại **SparkNestEd** được cấu trúc dưới dạng một mô hình phân tầng lai, kết hợp chặt chẽ giữa **Phân quyền dựa trên vai trò (RBAC - Role-Based Access Control)** cho các phân cấp cơ bản và **Phân quyền dựa trên thuộc tính (ABAC - Attribute-Based Access Control)** cho các kiểm soát hạt mịn (fine-grained) liên quan đến quyền sở hữu và trạng thái tài nguyên.

---

## 📊 1. Bảng Ma Trận Phân Quyền Vai Trò (RBAC Matrix)

Dưới đây là ma trận phân quyền các vai trò cơ bản đối với các APIs nghiệp vụ của hệ thống:

| Endpoint API / Chức Năng | 👤 Khách (Guest) | 🧑‍🎓 Học Viên (USER) | 🧑‍🏫 Điều Phối (MODERATOR) | 👑 Quản Trị (ADMIN) |
| :--- | :--- | :--- | :--- | :--- |
| **`GET /api/v1/entries`** *(Xem từ điển)* | ✔️ Cho phép | ✔️ Cho phép | ✔️ Cho phép | ✔️ Cho phép |
| **`POST /api/v1/vocabulary-sets`** *(Tạo set)* | ❌ Bị cấm | ✔️ Cho phép | ✔️ Cho phép | ✔️ Cho phép |
| **`PATCH /api/v1/entries`** *(Sửa từ điển)* | ❌ Bị cấm | ❌ Bị cấm | ✔️ Cho phép | ✔️ Cho phép |
| **`DELETE /api/v1/vocabulary-sets/:id`** *(Xóa)* | ❌ Bị cấm | 🛑 **Cần ABAC** | 🛑 **Cần ABAC** | ✔️ Cho phép |
| **`GET /api/v1/admin/dashboard`** *(Thống kê)* | ❌ Bị cấm | ❌ Bị cấm | ❌ Bị cấm | ✔️ Cho phép |

---

## 🏛️ 2. Cài Đặt Phân Quyền Hạt Mịn (ABAC Policy Engine via CASL)

Đối với các hành động can thiệp sâu vào tài nguyên cá nhân (như chỉnh sửa, xóa gói từ vựng), việc kiểm tra Role là không đủ (vai trò USER không được phép sửa set của USER khác). Bắt buộc phải áp dụng **ABAC** thông qua thư viện **CASL** để kiểm tra thuộc tính động:

```typescript
// packages/backend/infrastructure/auth/abilities.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@spark-nest-ed/shared-infrastructure';

// Định nghĩa các Hành động nghiệp vụ
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Lấy từ JwtAuthGuard đã chạy trước
    
    // Đọc tham số ID tài nguyên trên URL
    const vocabularySetId = request.params.vocabularySetId;
    if (!vocabularySetId) return true; // Endpoint ko yêu cầu ID ➡️ Bỏ qua

    // 1. Tải tài nguyên thực tế từ DB để kiểm tra thuộc tính (ABAC)
    const vocabularySet = await this.prisma.vocabularySet.findUnique({
      where: { id: vocabularySetId }
    });

    if (!vocabularySet) return false;

    // 2. THỰC THI LUẬT ABAC:
    // - Admin được toàn quyền.
    // - Người dùng thường chỉ được sửa đổi nếu là CHỦ SỞ HỮU thực tế (owner check).
    // - Người dùng thường được xem nếu gói từ vựng ở chế độ CÔNG KHAI (isPublic check).
    const isAdmin = user.role === 'ADMIN';
    const isOwner = vocabularySet.userId === user.id;
    const isPublic = vocabularySet.isPublic === true;

    // Phân luồng kiểm tra hành động:
    const method = request.method; // GET, PATCH, DELETE
    
    if (method === 'GET' && (isOwner || isPublic || isAdmin)) {
      return true;
    }

    if ((method === 'PATCH' || method === 'DELETE') && (isOwner || isAdmin)) {
      return true;
    }

    // Vi phạm luật ABAC ➡️ Ném lỗi bảo mật
    throw new ForbiddenException({
      errors: [{
        status: "403",
        code: "AUTH-003",
        title: "Access Denied",
        detail: "Bạn không sở hữu tài nguyên này để thực hiện thay đổi dữ liệu."
      }]
    });
  }
}
```

---

## 💻 3. Bọc Kết Hợp RBAC & ABAC Trên Endpoint REST

Để bảo vệ an toàn tối đa cho API, các Endpoint nhạy cảm bắt buộc phải được bọc bởi cả hai lớp bảo vệ: **Xác thực JWT ➡️ Kiểm tra vai trò RBAC ➡️ Kiểm tra thuộc tính ABAC**:

```typescript
// packages/backend/domains/module-vocabulary/src/lib/presentation/vocabulary-set.controller.ts
import { Controller, Patch, Param, UseGuards } from '@nestjs/common';
import { AbilitiesGuard } from '@spark-nest-ed/shared-infrastructure';

@Controller('vocabulary-sets')
export class VocabularySetController {
  
  @Patch('/:vocabularySetId')
  // Thứ tự chạy Guards cực kỳ quan trọng:
  // 1. JwtAuthGuard: Xác định danh tính người dùng (User Context).
  // 2. RolesGuard: Kiểm tra phân cấp RBAC cơ bản (Ví dụ: USER/MODERATOR/ADMIN).
  // 3. AbilitiesGuard: Thực thi kiểm tra thuộc tính nghiệp vụ chi tiết (ABAC).
  @UseGuards(JwtAuthGuard, RolesGuard, AbilitiesGuard)
  async update(@Param('vocabularySetId') vocabularySetId: string) {
    // Logic cập nhật an toàn tuyệt đối...
  }
}
```
