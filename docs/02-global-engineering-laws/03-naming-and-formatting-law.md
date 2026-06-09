# ⚖️ Naming & Formatting Law

Cách đặt tên và định dạng mã nguồn là biểu hiện rõ nét nhất của tư duy kỹ thuật sạch. Chúng ta đặt tên để giao tiếp mục đích nghiệp vụ rõ ràng cho con người đọc hiểu lâu dài, không phải để viết tắt tiết kiệm ký tự cho máy tính.

Tại **SparkNestEd**, tính đồng nhất tuyệt đối về phong cách viết code (Coding Style) giúp hàng chục kỹ sư có thể làm việc trên cùng một Monorepo mà không gặp bất kỳ rào cản nhận thức nào.

---

## 🏷️ Quy Chuẩn Đặt Tên Biến & Hàm (Naming Rules)

### 1. Quy Tắc Cơ Bản
*   **camelCase:** Dành cho tên biến thường, thuộc tính đối tượng, tham số đầu vào và tên hàm/phương thức.
    *   *Ví dụ:* `vocabularySetId`, `calculateSpacedInterval()`, `userEmail`.
*   **PascalCase:** Dành cho tên Class, Interface, Enum, Type và Component React.
    *   *Ví dụ:* `VocabularySetEntity`, `SetTypeVO`, `UserStatus`, `LearningCardComponent`.
*   **UPPER_CASE:** Dành cho hằng số toàn cục (`const`), biến môi trường tĩnh không thay đổi trong suốt vòng đời ứng dụng.
    *   *Ví dụ:* `MIN_WORDS_TO_PUBLISH`, `API_TIMEOUT_MS`, `JWT_SECRET_KEY`.

### 2. Luật Đặt Tên Biến Boolean
Mọi biến hoặc thuộc tính mang kiểu dữ liệu Boolean **bắt buộc** phải bắt đầu bằng một động từ nghi vấn hoặc tiền tố thể hiện trạng thái chân trị (`true/false`).

> [!IMPORTANT]
> Cấm tuyệt đối đặt tên biến Boolean bằng một danh từ hoặc tính từ trần trụi.

*   ❌ **SAI (PR REJECTED):** `active`, `permission`, `publish`, `edit`, `completed`.
*   ✔️ **ĐÚNG (PR APPROVED):** `isActive`, `hasPermission`, `isPublished`, `canEdit`, `isCompleted`.

### 3. Quy Tắc Cấm Viết Tắt Mơ Hồ
*   **Cấm tuyệt đối:** Sử dụng viết tắt tùy tiện hoặc viết tắt cụt lủn gây mất ngữ cảnh nghiệp vụ.
*   **Tra cứu nhanh thay thế viết tắt:**

| Tên Viết Tắt (CẤM) | Tên Đầy Đủ Chuẩn (BẮT BUỘC) |
| :--- | :--- |
| `usrReq` | `userRequest` |
| `vocId` | `vocabularySetId` |
| `tmpData` | `temporaryData` |
| `curSet` | `currentVocabularySet` |
| `err` | `error` |
| `cb` | `callback` |
| `idx` | `index` |

---

## 📁 Quy Tắc Đặt Tên Tệp Tin & Thư Mục (File & Folder Naming)

Toàn bộ Monorepo áp dụng quy chuẩn đặt tên tệp tin và thư mục theo định dạng **kebab-case** (chữ thường nối với nhau bằng dấu gạch ngang) kết hợp hậu tố thể hiện rõ chức năng kỹ thuật (**suffixing**).

### 1. Quy tắc hậu tố tệp tin (File Suffixing)
*   **Controller:** `*.controller.ts` (ví dụ: `vocabulary-set.controller.ts`)
*   **Service/Handler:** `*.service.ts` hoặc `*.handler.ts` (ví dụ: `create-set.handler.ts`)
*   **Entity/Model:** `*.entity.ts` hoặc `*.model.ts` (ví dụ: `vocabulary-entry.entity.ts`)
*   **Value Object:** `*.vo.ts` (ví dụ: `spaced-interval.vo.ts`)
*   **Data Transfer Object:** `*.dto.ts` (ví dụ: `create-vocabulary-set.dto.ts`)
*   **Tệp kiểm thử:** `*.spec.ts` hoặc `*.test.ts` (ví dụ: `user-access.spec.ts`)

### 2. Quy tắc đặt tên thư mục
*   Thư mục chứa mã nguồn bắt buộc viết bằng **kebab-case**.
    *   *Ví dụ:* `libs/vocabulary-domain/`, `apps/api-sne/`.
*   Cấm tuyệt đối viết hoa thư mục hoặc đặt tên chứa khoảng trắng.

---

## 🎨 Quy Tắc Đặt Tên Event Handlers & Callbacks (Frontend)

Đối với phát triển Frontend (React/TypeScript), để phân biệt rõ ràng giữa thuộc tính nhận vào (Props) và hàm xử lý sự kiện nội bộ:

*   **Hàm xử lý sự kiện nội bộ (Event Handlers):** Đặt tên có tiền tố `handle` + `Tên Hành Động` + `Tên Element`.
    *   *Ví dụ:* `handleSaveButtonClick`, `handleEmailInputChange`, `handleModalClose`.
*   **Thuộc tính Props nhận vào (Callback Props):** Đặt tên có tiền tố `on` + `Tên Sự Kiện`.
    *   *Ví dụ:* `<CardComponent onSelect={handleCardSelect} onDoubleTap={handleDoubleTap} />`.

---

## 🧪 Quy Tắc Đặt Tên Bài Kiểm Thử (Unit Tests)

Tên của các ca kiểm thử (Test Cases) bắt buộc phải là một câu khẳng định nghiệp vụ hoàn chỉnh thể hiện rõ: **Hành vi kỳ vọng + Bối cảnh xảy ra kịch bản**. Sử dụng cấu trúc: `should [expected action] when [scenario]`.

*   ❌ **SAI (PR REJECTED):**
    ```typescript
    it('test user', () => {});
    it('should error', () => {});
    ```
*   ✔️ **ĐÚNG (PR APPROVED):**
    ```typescript
    it('should throw AccessDeniedException when user is inactive', () => {});
    it('should update interval using SM-2 algorithm when user reviews card successfully', () => {});
    ```

---

## 📐 Luật Định Dạng & Sắp Xếp Imports (Formatting & Import Law)

Dự án áp dụng cấu hình tự động thông qua **ESLint** và **Prettier**. Tuy nhiên, về mặt cấu trúc tệp tin, toàn bộ kỹ sư phải tuân thủ nghiêm ngặt **Quy tắc sắp xếp Import** phân nhóm rõ rệt để tăng tính mạch lạc.

Mỗi nhóm Import cách nhau bằng **đúng 1 dòng trống**:

```typescript
// 1. Nhóm thư viện lõi hệ thống & Thư viện bên ngoài (External Libraries)
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'rxjs';

// 2. Nhóm thư viện nội bộ dùng chung của Monorepo (Shared Libs / Core Domain)
import { Result } from '@spark-nest-ed/shared-domain';
import { LoggerService } from '@spark-nest-ed/shared-infrastructure';

// 3. Nhóm import các thành phần nghiệp vụ cục bộ (Local Imports - Cấp tương đối)
import { VocabularySetEntity } from './entities/vocabulary-set.entity';
import { SpacedIntervalVO } from './value-objects/spaced-interval.vo';
```

---

## 📊 Bảng So Sánh Tra Cứu ĐÚNG / SAI Theo Từng Tầng

| Tầng Hệ Thống | ❌ SAI (PR REJECTED) | ✔️ ĐÚNG (PR APPROVED) |
| :--- | :--- | :--- |
| **Domain Layer** | `class VocSet {}`<br>`entity.id = 1;`<br>`entity.update(d);` | `class VocabularySetAggregate {}`<br>`entity.vocabularySetId = 'uuid';`<br>`entity.updateLearningProgress(progress);` |
| **Backend Layer** | `async function get() {}`<br>`@Get('/:id') getVoc()` | `async function getVocabularySetById() {}`<br>`@Get('/:vocabularySetId') getVocabularySet()` |
| **Frontend Layer** | `const [val, setVal] = useState()` | `const [searchTerm, setSearchTerm] = useState()` |
