# Ngữ cảnh dự án dành cho AI Agent và Business Analyst

Tài liệu này cung cấp ngữ cảnh tối thiểu nhưng bắt buộc để:

- AI agent đọc, phân tích, viết code hoặc tạo tài liệu đúng với repository.
- Business Analyst (BA) mô tả yêu cầu bằng ngôn ngữ thống nhất với hệ thống.
- Product, QA và kỹ sư phân biệt rõ chức năng đã có, đang phát triển và mới
  chỉ là định hướng.

Tài liệu này không thay thế tài liệu kiến trúc chi tiết. Khi cần setup hoặc
thông tin runtime, đọc thêm
[Kiến trúc hệ thống và hướng dẫn setup](SYSTEM_ARCHITECTURE_AND_SETUP.md).

## 1. Quy tắc đọc tài liệu

Khi thông tin mâu thuẫn, sử dụng thứ tự ưu tiên sau:

1. Mã nguồn, cấu hình, Prisma schema và migration đang tồn tại.
2. Test tự động đang chạy.
3. Tài liệu này và `SYSTEM_ARCHITECTURE_AND_SETUP.md`.
4. Tài liệu domain nằm cạnh module tương ứng.
5. Tài liệu định hướng trong các thư mục tiêu chuẩn kỹ thuật.

AI agent không được coi ví dụ, mock, placeholder, roadmap hoặc tài liệu định
hướng là bằng chứng cho một chức năng đã hoàn thành.

### Nhãn trạng thái bắt buộc

Mọi tài liệu mô tả tính năng hoặc công nghệ phải dùng một trong các nhãn:

| Nhãn              | Ý nghĩa                                                          |
| ----------------- | ---------------------------------------------------------------- |
| `Đang dùng`       | Có cấu hình hoặc mã nguồn thực tế và đang được tích hợp          |
| `Đang phát triển` | Có mã nguồn một phần nhưng chưa hoàn thiện luồng nghiệp vụ       |
| `Định hướng`      | Là mục tiêu kiến trúc hoặc kế hoạch, chưa được triển khai đầy đủ |
| `Không xác định`  | Chưa có đủ bằng chứng, cần BA/PO/Tech Lead xác nhận              |

Không dùng các từ “hệ thống hỗ trợ”, “đã tích hợp” hoặc “đang vận hành” nếu
không thể chỉ ra bằng chứng trong repository.

## 2. Mô tả sản phẩm

Spark Nexus Ed là nền tảng học tiếng Anh, tập trung vào:

- Quản lý và học bộ từ vựng.
- Theo dõi tiến độ và ôn tập lặp quãng.
- Bài học, luyện tập và đánh giá ngữ pháp.
- Đồng bộ danh tính người dùng qua Auth0.
- Nội dung đọc và tiến độ đọc đang được phát triển.

Hệ thống hiện được triển khai theo mô hình modular monolith trong Nx monorepo,
không phải một hệ thống microservices độc lập.

## 3. Bản đồ trạng thái nghiệp vụ

| Phân vùng            | Trạng thái        | Phạm vi hiện tại                                                      |
| -------------------- | ----------------- | --------------------------------------------------------------------- |
| User                 | `Đang dùng`       | Danh tính Auth0, hồ sơ local, role và permission                      |
| Vocabulary           | `Đang dùng`       | Bộ từ, mục từ, import, favorite, quiz và tiến độ                      |
| Dictionary           | `Đang dùng`       | Entry, sense, example, expression và dữ liệu liên quan                |
| Grammar              | `Đang dùng`       | Bài học, tiến độ, luyện tập, kỳ thi và community                      |
| Reading              | `Đang phát triển` | Article và ReadingProgress có trong schema; module còn ở mức scaffold |
| Writing              | `Định hướng`      | Route placeholder, chưa có domain backend hoàn chỉnh                  |
| Study Plan           | `Định hướng`      | Route placeholder                                                     |
| Assessment tổng quát | `Định hướng`      | Route placeholder; Grammar có assessment riêng                        |
| Games/Leaderboard    | `Định hướng`      | Route placeholder hoặc mô hình dữ liệu chưa đủ luồng                  |

BA phải ghi rõ bounded context chịu trách nhiệm cho yêu cầu. Không tạo một
khái niệm nghiệp vụ chung chung nếu nó đã thuộc một context cụ thể.

## 4. Công nghệ đang sử dụng

### 4.1. Workspace và ngôn ngữ

| Công nghệ      | Trạng thái  | Vai trò            | Quy tắc sử dụng                                  |
| -------------- | ----------- | ------------------ | ------------------------------------------------ |
| TypeScript 5.9 | `Đang dùng` | Ngôn ngữ chính     | Bật strict mode; không lạm dụng `any`            |
| Nx 22          | `Đang dùng` | Điều phối monorepo | Chạy qua `npx nx`; không yêu cầu Nx global       |
| npm workspaces | `Đang dùng` | Quản lý package    | Cài sạch bằng `npm ci`; thay dependency bằng npm |
| ESLint 9       | `Đang dùng` | Static analysis    | Không tắt rule nếu chưa có lý do kỹ thuật        |
| Prettier 2     | `Đang dùng` | Format             | Dùng cấu hình repository, ưu tiên single quote   |

Mọi package phải có public API qua `src/index.ts`. Không deep-import vào file
nội bộ của package khác.

### 4.2. Backend

| Công nghệ       | Trạng thái  | Vai trò                             | Quy tắc sử dụng                                                 |
| --------------- | ----------- | ----------------------------------- | --------------------------------------------------------------- |
| NestJS 11       | `Đang dùng` | API backend và dependency injection | App chỉ composition; business rule nằm trong domain/application |
| NestJS CQRS     | `Đang dùng` | Command, Query và handler           | Command thay đổi trạng thái; Query chỉ đọc                      |
| class-validator | `Đang dùng` | Validate request DTO                | Không tin dữ liệu từ client                                     |
| Swagger         | `Đang dùng` | API docs development                | Cập nhật decorator khi contract API đổi                         |
| Prisma 6        | `Đang dùng` | PostgreSQL ORM                      | Chỉ infrastructure truy cập Prisma trực tiếp                    |
| PostgreSQL      | `Đang dùng` | Dữ liệu bền vững                    | Migration phải đi cùng thay đổi schema                          |
| BullMQ          | `Đang dùng` | Background job                      | Job phải có retry strategy và tránh xử lý trùng                 |
| Redis 7         | `Đang dùng` | Queue và cache                      | BullMQ yêu cầu policy `noeviction`                              |

### 4.3. Frontend

| Công nghệ               | Trạng thái  | Vai trò                   | Quy tắc sử dụng                                            |
| ----------------------- | ----------- | ------------------------- | ---------------------------------------------------------- |
| React 19                | `Đang dùng` | UI                        | Component ưu tiên thuần, không chứa business rule phức tạp |
| Vite 7                  | `Đang dùng` | Dev server và build       | Biến client bắt đầu bằng `VITE_`                           |
| React Router 6          | `Đang dùng` | Routing và route guards   | Feature route phải lazy-load khi phù hợp                   |
| TanStack Query 5        | `Đang dùng` | Server state              | Không sao chép server state sang Redux/local state vô lý   |
| Axios                   | `Đang dùng` | HTTP client               | Dùng client chung để có token, retry và xử lý lỗi          |
| Auth0 SPA SDK           | `Đang dùng` | Phiên đăng nhập           | Không tự lưu access token bằng cơ chế khác                 |
| Redux Toolkit           | `Đang dùng` | Global client state       | Chỉ dùng cho state thực sự xuyên feature                   |
| React Hook Form + Zod   | `Đang dùng` | Form và validation client | Validation client không thay thế backend validation        |
| Tailwind CSS + Radix UI | `Đang dùng` | Styling và UI primitive   | Tái sử dụng shared components và design tokens             |

### 4.4. Kiểm thử và CI

| Công nghệ       | Trạng thái  | Vai trò                       |
| --------------- | ----------- | ----------------------------- |
| Jest            | `Đang dùng` | Backend unit/integration test |
| Vitest          | `Đang dùng` | Frontend unit/component test  |
| Testing Library | `Đang dùng` | Kiểm thử hành vi UI           |
| Playwright      | `Đang dùng` | Frontend E2E                  |
| GitHub Actions  | `Đang dùng` | CI với Node.js 20             |
| Nx Cloud        | `Đang dùng` | Cache và hỗ trợ CI            |

Quality gate chuẩn:

```bash
npx nx sync:check
npx nx affected -t lint typecheck test build
npx nx format:check
```

## 5. Công nghệ chỉ là định hướng

Các công nghệ hoặc mô hình dưới đây xuất hiện trong tài liệu cũ nhưng không
được mặc định là đã triển khai hoàn chỉnh:

| Công nghệ/mô hình                  | Trạng thái hiện tại                                          |
| ---------------------------------- | ------------------------------------------------------------ |
| Webpack Module Federation          | `Định hướng`; frontend hiện build bằng Vite                  |
| Micro-frontends triển khai độc lập | `Định hướng`                                                 |
| Microservices độc lập              | `Định hướng`; hiện là modular monolith                       |
| gRPC nội bộ                        | `Định hướng`                                                 |
| RabbitMQ/Kafka                     | `Định hướng`; job hiện dùng BullMQ/Redis                     |
| Prometheus/Grafana                 | `Định hướng` hoặc chưa đủ bằng chứng runtime                 |
| Jaeger distributed tracing         | `Định hướng` hoặc chưa đủ bằng chứng runtime                 |
| Kubernetes/ArgoCD                  | `Định hướng`; không có manifest triển khai đầy đủ trong repo |
| LaunchDarkly/GrowthBook            | `Định hướng`                                                 |

AI agent phải hỏi hoặc ghi `Không xác định` trước khi thiết kế yêu cầu phụ
thuộc vào những công nghệ này.

## 6. Quy tắc kiến trúc backend

### 6.1. Bốn lớp chuẩn

```text
presentation -> application -> domain
                      |
                      v
               infrastructure
```

- `presentation`: HTTP controller, guard, request/response mapping.
- `application`: use case, command/query, handler, DTO và orchestration.
- `domain`: entity, aggregate, value object, invariant và repository contract.
- `infrastructure`: Prisma repository, Redis, BullMQ và external adapter.

### 6.2. Quy tắc bắt buộc

1. Controller không chứa business rule và không gọi Prisma trực tiếp.
2. Domain không import NestJS, Prisma, Redis, BullMQ hoặc HTTP concepts.
3. Write operation đi qua Command/Handler khi module đang dùng CQRS.
4. Read operation đi qua Query/Handler khi module đang dùng CQRS.
5. Repository interface thuộc domain/application; implementation thuộc
   infrastructure.
6. Entity bảo vệ invariant bằng method có tên nghiệp vụ, không cho sửa state
   tùy tiện.
7. Giao dịch nhiều bước liên quan phải xem xét Prisma transaction.
8. Background job phải idempotent hoặc có cơ chế chống xử lý lặp.
9. API trả DTO, không trả trực tiếp Prisma model hoặc domain entity.
10. Thay đổi public API, env hoặc schema phải cập nhật tài liệu.

Không ép một module scaffold dùng đầy đủ CQRS nếu phạm vi chưa cần, nhưng mọi
ngoại lệ phải được giải thích bằng complexity và ownership rõ ràng.

## 7. Quy tắc kiến trúc frontend

Luồng phụ thuộc chuẩn:

```text
app shell -> feature -> core/shared
```

Một feature có thể gồm:

```text
api -> hooks -> container/controller -> component -> page
```

Quy tắc:

1. Page chủ yếu composition, không chứa logic nghiệp vụ dài.
2. Hook quản lý server state và side effect liên quan React.
3. Service chứa calculation thuần hoặc business helper phía client.
4. Component nhận dữ liệu qua props và phát callback qua `on...`.
5. HTTP call phải dùng API client chung.
6. Auth dùng route loader/guard hiện có; không tự tạo cơ chế login song song.
7. Mọi màn hình dữ liệu phải xét loading, error, empty và success state.
8. Không hardcode URL, text lặp, timeout hoặc business threshold.
9. Không coi validation frontend là bảo vệ dữ liệu cuối cùng.
10. Feature chỉ export thành phần cần dùng qua `src/index.ts`.

## 8. Quy tắc dữ liệu và bảo mật

- Dữ liệu từ client luôn không đáng tin cậy và phải validate ở backend.
- Endpoint thay đổi dữ liệu phải xác định authentication và authorization.
- Kiểm tra ownership, không chỉ kiểm tra người dùng đã đăng nhập.
- Không đưa secret, token, password, connection string thật vào tài liệu.
- Không log access token, refresh token hoặc dữ liệu PII chưa được masking.
- Thời gian lưu ở UTC; frontend chịu trách nhiệm định dạng theo locale.
- Xóa dữ liệu phải nêu rõ soft delete, hard delete và tác động cascade.
- Thay đổi Prisma schema phải mô tả migration và khả năng tương thích.
- Cache không phải nguồn dữ liệu chuẩn; PostgreSQL là source of truth.
- Retry không được làm lặp giao dịch nghiệp vụ ngoài ý muốn.

Thứ tự ưu tiên khi có trade-off:

```text
Security & Privacy
  > Architectural Purity
  > Observability
  > Data Integrity
```

Đây là thứ tự được quy định trong bộ tài liệu engineering hiện tại. Nếu một
quyết định thực tế cần thứ tự khác, phải ghi nhận bằng ADR hoặc được Tech Lead
xác nhận, không tự thay đổi trong feature spec.

## 9. Ngôn ngữ nghiệp vụ cốt lõi

| Thuật ngữ              | Ý nghĩa dùng trong dự án                                  |
| ---------------------- | --------------------------------------------------------- |
| User                   | Người dùng được Auth0 định danh và có hồ sơ local         |
| VocabularySet          | Bộ từ vựng do người dùng hoặc hệ thống quản lý            |
| VocabularySetItem      | Một mục được thêm vào VocabularySet                       |
| Entry                  | Mục từ gốc trong từ điển                                  |
| Sense                  | Một nghĩa cụ thể của Entry                                |
| UserVocabularyProgress | Tiến độ ôn tập của user đối với một item                  |
| Mastery                | Mức thành thạo; phải nêu rõ thang đo trong từng feature   |
| QuizSession            | Một phiên làm bài có trạng thái và kết quả                |
| GrammarLesson          | Bài học ngữ pháp theo level và nội dung                   |
| UserGrammarProgress    | Tiến độ của user đối với GrammarLesson                    |
| GrammarExamSet         | Bộ đề ngữ pháp hoặc chứng chỉ                             |
| Article                | Nội dung đọc                                              |
| ReadingProgress        | Tiến độ đọc Article của một user                          |
| CEFR Level             | Trình độ A1, A2, B1, B2, C1 hoặc C2                       |
| SRS                    | Cơ chế ôn tập lặp quãng                                   |
| Published              | Nội dung có thể được đối tượng được phép truy cập sử dụng |
| Draft                  | Nội dung chưa được phát hành                              |

Nếu BA cần thuật ngữ mới:

1. Định nghĩa nghĩa tiếng Việt và tên tiếng Anh chuẩn.
2. Chỉ ra bounded context sở hữu.
3. Phân biệt với thuật ngữ gần giống.
4. Nêu state lifecycle và invariant.
5. Cập nhật glossary trước hoặc cùng lúc với feature spec.

## 10. Cách BA viết yêu cầu

Một yêu cầu không nên bắt đầu bằng tên bảng, endpoint hoặc framework. Bắt đầu
bằng vấn đề người dùng và kết quả nghiệp vụ.

### 10.1. Mẫu feature specification

```markdown
# [Mã] Tên tính năng

## Trạng thái

Proposed | Approved | In Development | Released | Deprecated

## Bối cảnh và vấn đề

Ai đang gặp vấn đề gì? Tác động nghiệp vụ là gì?

## Mục tiêu

Kết quả đo được sau khi tính năng hoàn thành.

## Ngoài phạm vi

Những nội dung cố ý không giải quyết.

## Actors và quyền

Actor nào thực hiện? Cần role/permission/ownership nào?

## Luồng chính

1. ...
2. ...

## Luồng thay thế và lỗi

- Khi ...
- Nếu ...

## Business rules

- BR-01: ...
- BR-02: ...

## Dữ liệu

Thông tin đầu vào, đầu ra, bắt buộc, giới hạn và dữ liệu nhạy cảm.

## Trạng thái

State machine hoặc danh sách chuyển trạng thái hợp lệ.

## Acceptance criteria

- AC-01: Given ... When ... Then ...

## Non-functional requirements

Security, audit, performance, accessibility, retention và observability.

## Phụ thuộc và tác động

Domain, API, migration, background job và màn hình liên quan.

## Câu hỏi mở

Những quyết định chưa được PO/Tech Lead xác nhận.
```

### 10.2. Business rule tốt

Business rule phải:

- Có mã ổn định như `BR-GRAM-001`.
- Dùng thuật ngữ trong glossary.
- Có điều kiện, hành vi và kết quả rõ ràng.
- Không gắn vào chi tiết UI nếu đó là quy tắc nghiệp vụ.
- Nêu rõ lỗi hoặc trạng thái khi điều kiện không đạt.

Ví dụ:

```text
BR-GRAM-001:
Một User chỉ có một UserGrammarProgress cho mỗi GrammarLesson.
Khi ghi nhận lại tiến độ, hệ thống cập nhật bản ghi hiện có thay vì tạo bản
ghi trùng.
```

### 10.3. Acceptance criterion tốt

```text
AC-GRAM-001
Given User đã đăng nhập và có quyền truy cập GrammarLesson
And chưa có tiến độ cho bài học đó
When User hoàn thành 40% nội dung
Then hệ thống tạo UserGrammarProgress với proficiency = 40
And status = IN_PROGRESS
```

Không dùng tiêu chí mơ hồ như “giao diện đẹp”, “API nhanh” hoặc “hoạt động
đúng”. Phải có cách kiểm chứng.

## 11. Ánh xạ BA sang kỹ thuật

| Nội dung BA         | Artifact kỹ thuật thường liên quan                |
| ------------------- | ------------------------------------------------- |
| Actor và quyền      | Auth guard, permission, ownership check           |
| Business rule       | Domain entity/aggregate, application handler      |
| Input/output        | DTO, API contract, frontend types                 |
| State lifecycle     | Enum/constants, entity methods, persistence       |
| Dữ liệu mới         | Prisma schema và migration                        |
| Xử lý lâu           | BullMQ job và progress status                     |
| Màn hình dữ liệu    | Query hook, container, loading/error/empty states |
| Acceptance criteria | Unit, integration hoặc E2E tests                  |
| Audit/trace         | Structured logging và event metadata              |

BA không cần chỉ định class hoặc thư mục, nhưng phải mô tả đủ để kỹ sư xác
định artifact bị tác động.

## 12. Hợp đồng làm việc dành cho AI agent

Trước khi viết tài liệu hoặc code, AI agent phải:

1. Đọc file liên quan và `git status`.
2. Xác định bounded context và trạng thái tính năng.
3. Tìm implementation, test, schema và cấu hình làm bằng chứng.
4. Phân biệt hiện trạng với định hướng.
5. Liệt kê giả định khi thiếu dữ liệu.
6. Không sửa hoặc xóa thay đổi chưa commit không thuộc nhiệm vụ.

Khi viết tài liệu, AI agent phải:

- Viết tiếng Việt rõ ràng, giữ thuật ngữ kỹ thuật tiếng Anh khi cần.
- Dùng cùng một thuật ngữ cho code, API, database và tài liệu.
- Ghi đường dẫn hoặc tên artifact khi mô tả hiện trạng kỹ thuật.
- Không sao chép bí mật từ `.env`.
- Không tạo số liệu coverage, SLA, timeout hoặc giới hạn nghiệp vụ giả.
- Không khẳng định một route placeholder là tính năng đã hoàn thành.
- Không mô tả công nghệ định hướng là đang chạy.
- Ghi ngày đối chiếu nếu tài liệu phụ thuộc mạnh vào hiện trạng repository.
- Thêm mục “Khoảng trống/Câu hỏi mở” nếu còn điều chưa xác nhận.

Khi viết code, AI agent phải:

- Theo pattern gần nhất trong cùng bounded context.
- Giữ thay đổi trong phạm vi nhỏ nhất đáp ứng yêu cầu.
- Thêm hoặc cập nhật test theo mức rủi ro.
- Không bypass public API của package khác.
- Không đưa business logic vào controller hoặc React page.
- Không tạo abstraction mới nếu pattern hiện có đã giải quyết được.
- Chạy quality gate phù hợp và báo rõ phần chưa thể kiểm tra.

## 13. Quy tắc viết tài liệu

Mỗi tài liệu feature hoặc module nên trả lời:

1. Tại sao nội dung này tồn tại?
2. Ai sử dụng?
3. Phạm vi và ngoài phạm vi là gì?
4. Thuật ngữ và business rules nào áp dụng?
5. Luồng chính, luồng lỗi và trạng thái là gì?
6. Dữ liệu và quyền truy cập nào liên quan?
7. Công nghệ nào thực sự đang được dùng?
8. Kiểm thử và acceptance criteria là gì?
9. Hạn chế, khoảng trống và quyết định mở là gì?

Comment trong code giải thích “tại sao”, không kể lại “code đang làm gì”.
Public API và business logic phức tạp có thể dùng TSDoc; implementation hiển
nhiên không cần comment dài.

## 14. Quy tắc đặt tên

- Biến, function và property: `camelCase`.
- Class, type, interface, enum, React component: `PascalCase`.
- Constant dùng chung: `UPPER_SNAKE_CASE`.
- File và folder: `kebab-case`, trừ component theo convention hiện có.
- Boolean bắt đầu bằng `is`, `has`, `can`, `should` hoặc động từ tương đương.
- Event handler nội bộ: `handle...`.
- Callback prop: `on...`.
- Test: `should [behavior] when [condition]`.

Tên phải thể hiện nghiệp vụ. Tránh `data`, `item`, `temp`, `process`, `manager`
hoặc viết tắt mơ hồ nếu có tên cụ thể hơn.

## 15. Giới hạn code được quy định

Bộ tài liệu engineering hiện tại đặt các giới hạn:

| Chỉ số              | Giới hạn                                                        |
| ------------------- | --------------------------------------------------------------- |
| Function/method     | Không quá 50 dòng, trừ trường hợp có lý do rõ ràng              |
| File                | Không quá 400 dòng, trừ generated data, migration hoặc test lớn |
| Function parameters | Không quá 3; dùng parameter object/DTO nếu nhiều hơn            |
| Nesting depth       | Không quá 3 cấp; ưu tiên guard clause                           |
| Magic values        | Không dùng; chuyển thành constant, enum hoặc config             |
| Empty catch         | Không được phép                                                 |

Đây là policy bắt buộc khi viết mới hoặc refactor. Tuy nhiên, AI agent không
được tuyên bố CI đã tự động cưỡng chế toàn bộ giới hạn nếu chưa kiểm tra rule
hoặc script tương ứng trong repository.

## 16. Definition of Ready

Một feature đủ điều kiện để kỹ sư hoặc AI agent triển khai khi:

- Bounded context và owner đã rõ.
- Actor, permission và ownership đã rõ.
- Business rules có mã và không mâu thuẫn.
- Luồng chính, lỗi và state transition đã rõ.
- Dữ liệu nhạy cảm và retention đã được xác định.
- Acceptance criteria có thể kiểm thử.
- Ngoài phạm vi được ghi rõ.
- Câu hỏi có ảnh hưởng lớn đã được giải quyết.

## 17. Definition of Done

Một feature chỉ được xem là hoàn thành khi:

- Code đúng boundary và build thành công.
- Business rules có test phù hợp.
- API/schema/public export được cập nhật nhất quán.
- Loading, error, empty và permission states được xử lý nếu có UI.
- Migration và rollback/compatibility đã được xem xét nếu đổi dữ liệu.
- Không lộ secret hoặc PII trong log/tài liệu.
- Tài liệu và acceptance criteria phản ánh implementation cuối.
- Các khoảng trống còn lại được ghi rõ, không bị che bằng placeholder.

## 18. Prompt khởi tạo cho AI agent

Có thể dùng đoạn sau khi giao nhiệm vụ tài liệu hoặc phân tích:

```text
Hãy làm việc theo docs/AI_AGENT_AND_BA_PROJECT_CONTEXT.md.
Trước khi kết luận, đối chiếu mã nguồn, test, Prisma schema và cấu hình.
Phân biệt rõ Đang dùng, Đang phát triển và Định hướng.
Không đọc hoặc xuất giá trị secret trong .env.
Khi thiếu business rule, ghi câu hỏi mở thay vì tự suy đoán.
Kết quả phải dùng thuật ngữ trong glossary, nêu bounded context, phạm vi,
business rules, acceptance criteria và các artifact kỹ thuật bị tác động.
```

## 19. Tài liệu liên quan

- [Kiến trúc hệ thống và setup](SYSTEM_ARCHITECTURE_AND_SETUP.md)
- [Ubiquitous Language Glossary](04-domain-business-architecture/01-ubiquitous-language-glossary.md)
- [Bounded Contexts Mapping](04-domain-business-architecture/02-bounded-contexts-mapping.md)
- [Architecture Invariants](04-domain-business-architecture/04-architecture-invariants.md)
- [Backend Layered Architecture](05-backend-architecture-standards/01-layered-architecture-di.md)
- [Frontend Application Shell](06-frontend-architecture-standards/01-application-shell-routing.md)
- [Testing Strategy](09-testing-quality-gates/01-testing-pyramid-strategy.md)
- [Contribution Guide](CONTRIBUTING.md)
