import type { ArticleTemplate } from '../types';

/**
 * Hardcoded article templates for the Studio "Choose from template" feature.
 * Converted to EditorJS OutputData format.
 */
export const STUDIO_TEMPLATES: ArticleTemplate[] = [
  {
    id: 'news-report',
    name: 'Tin tức Thời sự',
    description: 'Mẫu bài viết tin tức với cấu trúc 5W1H (What, Who, When, Where, Why, How).',
    icon: '📰',
    contentType: 'news',
    defaultValues: {
      contentType: 'news',
      category: 'education',
      difficulty: 'B1',
      title: '',
      content: {
        time: 1718553600000,
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: '<b>[Đoạn mở đầu — Tóm tắt sự kiện chính]</b>'
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Ai liên quan? — Chi tiết về nhân vật / tổ chức]'
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Khi nào & ở đâu? — Bối cảnh thời gian và địa điểm]'
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Tại sao quan trọng? — Phân tích tác động]'
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Phản ứng & trích dẫn — Ý kiến từ chuyên gia hoặc người liên quan]'
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Kết luận — Dự đoán hoặc triển vọng tương lai]'
            }
          }
        ],
        version: '2.30.0'
      },
      summary: '',
    },
  },
  {
    id: 'blog-opinion',
    name: 'Blog Quan điểm',
    description: 'Mẫu blog cá nhân chia sẻ quan điểm, trải nghiệm hoặc đánh giá.',
    icon: '✍️',
    contentType: 'blog',
    defaultValues: {
      contentType: 'blog',
      category: 'education',
      difficulty: 'B2',
      title: '',
      content: {
        time: 1718553600000,
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Giới thiệu',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Đặt vấn đề hoặc câu hỏi thu hút người đọc]'
            }
          },
          {
            type: 'header',
            data: {
              text: 'Bối cảnh',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Cung cấp thông tin nền tảng cần thiết]'
            }
          },
          {
            type: 'header',
            data: {
              text: 'Quan điểm của tôi',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Trình bày luận điểm chính, có dẫn chứng]'
            }
          },
          {
            type: 'header',
            data: {
              text: 'Phản biện',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Xem xét các ý kiến trái chiều]'
            }
          },
          {
            type: 'header',
            data: {
              text: 'Kết luận',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Tóm tắt và kêu gọi hành động]'
            }
          }
        ],
        version: '2.30.0'
      },
      summary: '',
    },
  },
  {
    id: 'book-chapter',
    name: 'Chương Sách',
    description: 'Cấu trúc một chương sách học thuật với mục tiêu, nội dung và câu hỏi ôn tập.',
    icon: '📖',
    contentType: 'book_chapter',
    defaultValues: {
      contentType: 'book_chapter',
      category: 'education',
      difficulty: 'C1',
      title: '',
      content: {
        time: 1718553600000,
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Mục tiêu chương',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: 'Sau khi đọc chương này, bạn sẽ:'
            }
          },
          {
            type: 'list',
            data: {
              style: 'unordered',
              items: [
                '[Mục tiêu 1]',
                '[Mục tiêu 2]',
                '[Mục tiêu 3]'
              ]
            }
          },
          {
            type: 'header',
            data: {
              text: 'Nội dung chính',
              level: 2
            }
          },
          {
            type: 'header',
            data: {
              text: '1. [Phần 1]',
              level: 3
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Nội dung phần 1]'
            }
          },
          {
            type: 'header',
            data: {
              text: '2. [Phần 2]',
              level: 3
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Nội dung phần 2]'
            }
          },
          {
            type: 'header',
            data: {
              text: '3. [Phần 3]',
              level: 3
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Nội dung phần 3]'
            }
          },
          {
            type: 'header',
            data: {
              text: 'Tóm tắt chương',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Những điểm chính cần nhớ]'
            }
          },
          {
            type: 'header',
            data: {
              text: 'Câu hỏi ôn tập',
              level: 2
            }
          },
          {
            type: 'list',
            data: {
              style: 'ordered',
              items: [
                '[Câu hỏi 1]',
                '[Câu hỏi 2]',
                '[Câu hỏi 3]'
              ]
            }
          }
        ],
        version: '2.30.0'
      },
      summary: '',
    },
  },
  {
    id: 'academic-article',
    name: 'Bài báo Học thuật',
    description: 'Mẫu bài báo nghiên cứu với cấu trúc IMRaD (Giới thiệu, Phương pháp, Kết quả, Thảo luận).',
    icon: '🎓',
    contentType: 'article',
    defaultValues: {
      contentType: 'article',
      category: 'science',
      difficulty: 'C2',
      title: '',
      content: {
        time: 1718553600000,
        blocks: [
          {
            type: 'header',
            data: {
              text: 'Abstract',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Tóm tắt ngắn gọn về mục đích, phương pháp, kết quả và kết luận]'
            }
          },
          {
            type: 'header',
            data: {
              text: '1. Introduction',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Giới thiệu vấn đề nghiên cứu, tổng quan tài liệu, mục tiêu]'
            }
          },
          {
            type: 'header',
            data: {
              text: '2. Methodology',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Mô tả phương pháp nghiên cứu, dữ liệu, công cụ]'
            }
          },
          {
            type: 'header',
            data: {
              text: '3. Results',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Trình bày kết quả chính]'
            }
          },
          {
            type: 'header',
            data: {
              text: '4. Discussion',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Phân tích, so sánh với nghiên cứu trước, hạn chế]'
            }
          },
          {
            type: 'header',
            data: {
              text: '5. Conclusion',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Kết luận và đề xuất hướng nghiên cứu tiếp theo]'
            }
          },
          {
            type: 'header',
            data: {
              text: 'References',
              level: 2
            }
          },
          {
            type: 'paragraph',
            data: {
              text: '[Danh sách tài liệu tham khảo]'
            }
          }
        ],
        version: '2.30.0'
      },
      summary: '',
    },
  },
];
