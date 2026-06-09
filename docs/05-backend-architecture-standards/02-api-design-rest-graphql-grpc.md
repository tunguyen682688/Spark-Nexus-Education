# 🔌 API Design Standards

Tất cả các giao thức truyền tải dữ liệu kết nối ra/vào hệ thống **SparkNestEd** bắt buộc phải tuân thủ nghiêm ngặt các quy chuẩn thiết kế tại tài liệu này để đảm bảo tính đồng nhất, khả năng tự mô tả (self-descriptive) và hiệu năng truyền tải tối đa.

---

## 🌐 1. Chuẩn Hóa RESTful & JSON:API Format (API Công Khai)

Chúng tôi áp dụng đặc tả thiết kế **JSON:API (v1.1)** làm tiêu chuẩn bắt buộc cho toàn bộ các API công khai phục vụ Web và Mobile Client.

### 1. Định dạng Phản hồi Thành Công (Success Response)
Mọi response trả về thành công bắt buộc phải bọc dữ liệu trong trường `data`, tách biệt rõ thông tin định danh và thuộc tính tài nguyên:

*   **Tài nguyên đơn lẻ (Single Resource):**
    ```json
    {
      "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "type": "vocabulary-set",
        "attributes": {
          "title": "Business English IELTS",
          "language": "en",
          "difficulty": "ADVANCED",
          "createdAt": "2026-05-24T06:00:00Z"
        }
      }
    }
    ```

*   **Danh sách tài nguyên kèm Phân trang (Collection & Pagination):**
    Phân trang bắt buộc sử dụng cấu trúc query: `page[number]` và `page[size]`. Trả về dữ liệu phân trang trong trường `meta` và `links`:
    ```json
    {
      "data": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "type": "vocabulary-set",
          "attributes": { "title": "Business English" }
        }
      ],
      "meta": {
        "page": {
          "currentPage": 1,
          "pageSize": 10,
          "totalPages": 5,
          "totalItems": 47
        }
      },
      "links": {
        "self": "/api/v1/vocabulary-sets?page[number]=1&page[size]=10",
        "next": "/api/v1/vocabulary-sets?page[number]=2&page[size]=10",
        "last": "/api/v1/vocabulary-sets?page[number]=5&page[size]=10"
      }
    }
    ```

*   **Quy chuẩn sắp xếp (Sorting query):**
    Sử dụng query `sort` để chỉ định thứ tự. Mặc định là tăng dần, thêm tiền tố dấu trừ `-` để sắp xếp giảm dần.
    *   *Ví dụ:* `GET /api/v1/vocabulary-sets?sort=-createdAt,title` (Sắp xếp theo ngày tạo mới nhất, sau đó theo tiêu đề tăng dần).

### 2. Định dạng Phản hồi Lỗi (Error Response Spec)
Tuyệt đối cấm trả về lỗi dạng chuỗi ký tự trần trụi. Lỗi bắt buộc phải được bọc trong trường `errors` là một mảng đối tượng cấu trúc:

```json
{
  "errors": [
    {
      "status": "422",
      "code": "VAL-001",
      "title": "Unprocessable Entity",
      "detail": "Tiêu đề gói từ vựng không được để trống.",
      "source": { "pointer": "/data/attributes/title" }
    }
  ]
}
```

---

## 🔌 2. Giao Tiếp Nội Bộ Qua gRPC (Microservices)

Đối với các cuộc gọi giao tiếp trực tiếp (Synchronous Service-to-Service) giữa các Microservices nội bộ trong cụm Kubernetes, chúng tôi cấm sử dụng REST HTTP/JSON để tránh overhead về chuyển đổi chuỗi văn bản (serialization/deserialization) và giảm thiểu latency. Bắt buộc sử dụng giao thức **gRPC** chạy trên nền **HTTP/2**.

```text
  [api-sne Gateway]
         │
         │ (HTTP/2 gRPC Call - Chuyển đổi nhị phân Protocol Buffers cực nhanh)
         ▼
  [module-vocabulary Service]
```

### Quy chuẩn tệp tin `.proto` (Schema Definition):
*   Tên dịch vụ phải có hậu tố `Service` (ví dụ: `VocabularyGrpcService`).
*   Tên các message phải viết theo kiểu PascalCase, tên các trường viết theo kiểu snake_case:
    ```protobuf
    syntax = "proto3";

    package sparknested.vocabulary.v1;

    service VocabularyGrpcService {
      rpc GetVocabularySetDetails (GetVocabularySetDetailsRequest) returns (GetVocabularySetDetailsResponse);
    }

    message GetVocabularySetDetailsRequest {
      string vocabulary_set_id = 1;
      string user_id = 2;
    }

    message GetVocabularySetDetailsResponse {
      string id = 1;
      string title = 2;
      int32 word_count = 3;
    }
    ```

---

## 🏛️ 3. Chiến Lược Phiên Bản Hóa API (API Versioning)

Để đảm bảo tính tương thích ngược lâu dài (backward compatibility) và tránh làm đổ vỡ các client đang vận hành (Mobile app chưa kịp update):

1.  **Sử dụng URI Versioning làm mặc định:** Mọi endpoint API bắt buộc phải bắt đầu bằng mã phiên bản dạng `/api/v[X]/`.
    *   *ĐÚNG:* `https://api.sparknested.com/api/v1/vocabulary-sets`
    *   *SAI:* `https://api.sparknested.com/vocabulary-sets`
2.  **Chính sách nâng cấp:**
    *   **V1 (Hiện tại):** Đảm bảo duy trì và không bao giờ sửa đổi cấu trúc trả về làm gãy ứng dụng cũ.
    *   **V2 (Khi có breaking changes lớn):** Phát triển song song endpoint v2 mà không xóa endpoint v1 cũ. Lập lịch thông báo runtime deprecation cho các client sử dụng v1 trong thời hạn 3 tháng trước khi xóa hẳn.
