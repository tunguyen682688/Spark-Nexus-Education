# 🎯 Ubiquitous Language Glossary

Từ điển ngôn ngữ nghiệp vụ thống nhất (Ubiquitous Language) giữa đội ngũ phát triển sản phẩm (Product Owners / Business Analysts) và đội ngũ kỹ thuật phát triển phần mềm (Software Engineers) tại dự án **SparkNestEd**.

Việc đồng nhất ngôn ngữ này giúp triệt tiêu hoàn toàn sự mơ hồ trong giao tiếp và đảm bảo tên biến, tên Class, tên DB Table trong code phản ánh chính xác 100% nghiệp vụ thực tế.

---

## 🗂️ 1. Phân Vùng Từ Vựng (Vocabulary Domain)

| Thuật ngữ Tiếng Anh | Thuật ngữ Tiếng Việt | Định nghĩa chuyên môn | Ví dụ trong ngữ cảnh nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **`VocabularySet`** | Gói Từ Vựng / Tập Từ Vựng | Aggregate Root đại diện cho một bộ sưu tập từ vựng chủ đề, có thuộc tính tiêu đề, ngôn ngữ, độ khó và trạng thái công khai. | *"Người dùng vừa tạo một **VocabularySet** mới có tên 'IELTS Academic Writing'."* |
| **`VocabularySetItem`** | Thành phần Gói Từ | Thực thể biểu diễn một từ vựng cụ thể được đính kèm vào Gói từ vựng. Chứa định nghĩa và ví dụ đã được cá nhân hóa. | *"Khi xóa một **VocabularySetItem**, chúng ta chỉ xóa liên kết, không xóa từ vựng gốc trong từ điển."* |
| **`Mnemonic`** | Mẹo Nhớ / Từ Gợi Nhớ | Hình ảnh, câu chuyện hoặc liên tưởng âm thanh tương tự giúp người học ghi nhớ từ vựng dễ dàng hơn. | *"Tập từ vựng 'Toeic 900' có hỗ trợ **Mnemonic** bằng hình ảnh vui nhộn."* |
| **`StudyProgress`** | Tiến Trình Học Tập | Chỉ số phần trăm (%) hoàn thành việc học của một người dùng đối với một gói từ cụ thể. | *"Học viên đạt **StudyProgress** 100% khi toàn bộ thẻ từ chuyển sang trạng thái Mastered."* |

---

## 🗂️ 2. Phân Vùng Từ Điển Hệ Thống (Dictionary Domain)

| Thuật ngữ Tiếng Anh | Thuật ngữ Tiếng Việt | Định nghĩa chuyên môn | Ví dụ trong ngữ cảnh nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **`Entry`** | Từ Điển Từ Điểm / Từ Gốc | Bản ghi từ vựng gốc trong hệ cơ sở dữ liệu từ điển trung tâm. Có thể ở trạng thái Draft (Nháp) hoặc Published. | *"Từ 'Aesthetic' có một bản ghi **Entry** duy nhất trong hệ thống từ điển."* |
| **`Sense`** | Nghĩa Của Từ / Phân Nghĩa | Một lớp nghĩa cụ thể của từ gốc (một từ có thể có nhiều Sense tùy theo ngữ cảnh). | *"Từ 'Run' có các **Sense** khác nhau: 'chạy bộ' (động từ) và 'vận hành máy móc' (động từ)."* |
| **`Part of Speech (POS)`** | Từ Loại | Phân loại ngữ pháp của từ (Noun, Verb, Adjective, Adverb, Preposition...). | *"**POS** của từ 'Beautiful' được định nghĩa là Adjective."* |
| **`Pronunciation`** | Phiên Âm / Phát Âm | Ký tự phiên âm quốc tế (IPA) kèm theo tệp tin âm thanh giọng đọc chuẩn (UK/US). | *"API trả về **Pronunciation** dạng IPA `/esˈθet.ɪk/` cho từ 'Aesthetic'."* |

---

## 🗂️ 3. Phân Vùng Học Tập Lặp Quãng (SRS Domain)

| Thuật ngữ Tiếng Anh | Thuật ngữ Tiếng Việt | Định nghĩa chuyên môn | Ví dụ trong ngữ cảnh nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **`UserLearningProgress`** | Tiến Trình Ôn Tập Cá Nhân | Aggregate Root quản lý các tham số và trạng thái học tập lặp quãng của một người dùng đối với một từ vựng cụ thể. | *"Bản ghi **UserLearningProgress** lưu trữ lịch sử ôn tập và lịch ôn tập tiếp theo của user."* |
| **`EaseFactor (EF)`** | Hệ Số Dễ | Chỉ số đo độ dễ của từ đối với bộ não người học (mặc định ban đầu là `2.5`, tối thiểu là `1.3`). | *"Do trả lời sai nhiều lần, **EaseFactor** của thẻ từ này đã giảm xuống mức tối thiểu `1.3`."* |
| **`Repetitions (R)`** | Số Lần Đúng Liên Tiếp | Số lần người học đánh giá nhớ thẻ từ liên tục ở mức chất lượng cao ($quality \ge 3$). | *"Học viên đạt **Repetitions** bằng 3, chu kỳ ôn tập tiếp theo sẽ kéo dài ra."* |
| **`Interval (I)`** | Chu Kỳ Ôn Tập | Khoảng cách số ngày chờ cho đến phiên ôn tập kế tiếp (tính bằng ngày). | *"Thuật toán SM-2 tính toán **Interval** là 6 ngày cho thẻ từ này."* |
| **`Mastery Level (ML)`** | Mức Độ Thành Thạo | Chỉ số từ `0.0` đến `1.0` thể hiện mức độ ghi nhớ sâu đậm của từ vựng trong não bộ người học. | *"Thẻ từ vựng đạt **MasteryLevel** `1.0` (100% thành thạo) và chuyển trạng thái sang `MASTERED`."* |
| **`Due Date / NextReviewAt`** | Thời Điểm Đến Hạn | Thời gian (mốc UTC) cụ thể mà thẻ từ vựng cần phải được hiển thị lại cho học viên ôn tập. | *"Thẻ từ 'Aesthetic' có **nextReviewAt** là `2026-05-30T08:00:00Z`."* |

---

## 🗂️ 4. Phân Vùng Đấu Trường & Đánh Giá (Quiz Domain)

| Thuật ngữ Tiếng Anh | Thuật ngữ Tiếng Việt | Định nghĩa chuyên môn | Ví dụ trong ngữ cảnh nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **`QuizSession`** | Phiên Làm Bài Trắc Nghiệm | Phiên làm bài thi/kiểm tra có giới hạn thời gian gồm danh sách các câu hỏi được sinh ra ngẫu nhiên. | *"Học viên vừa hoàn thành **QuizSession** chủ đề 'Vocabulary IELTS'."* |
| **`QuestionPool`** | Ngân Hàng Câu Hỏi | Kho lưu trữ các câu hỏi trắc nghiệm, ghép từ, nghe âm thanh được hệ thống sinh tự động từ các Sense. | *"Hệ thống tự động quét **QuestionPool** để sinh đề trắc nghiệm."* |
| **`Challenge`** | Đấu Trường / Thách Đấu | Tính năng đấu vựng thời gian thực (Real-time Multiplayer) giữa các người học để giành điểm xếp hạng. | *"Người dùng tham gia **Challenge** thi đấu từ vựng 1vs1."* |
