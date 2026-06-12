import { Injectable } from '@nestjs/common';
import { ITranslationService } from '../../domain/services/translation.service.interface';

@Injectable()
export class TranslationService implements ITranslationService {
  /**
   * Translate a word based on the context sentence.
   */
  translateWordInContext(word: string, sentence: string): { translation: string; explanation: string } {
    const cleanWord = word.toLowerCase().trim();
    const cleanSentence = sentence.toLowerCase();

    // Contextual translation rules for common polysemous words
    if (cleanWord === 'run') {
      if (cleanSentence.includes('business') || cleanSentence.includes('company') || cleanSentence.includes('operation')) {
        return {
          translation: 'Quản lý / Vận hành',
          explanation: `Trong ngữ cảnh kinh doanh/vận hành, động từ "run" có nghĩa là điều hành hoặc quản lý, thay vị nghĩa vật lý là "chạy".`
        };
      }
      return {
        translation: 'Chạy',
        explanation: `Nghĩa vật lý thông thường: di chuyển nhanh bằng chân hoặc hoạt động của máy móc.`
      };
    }

    if (cleanWord === 'charge') {
      if (cleanSentence.includes('battery') || cleanSentence.includes('phone') || cleanSentence.includes('power')) {
        return {
          translation: 'Sạc điện',
          explanation: `Trong ngữ cảnh thiết bị điện tử, "charge" nghĩa là nạp năng lượng/sạc pin.`
        };
      }
      if (cleanSentence.includes('police') || cleanSentence.includes('court') || cleanSentence.includes('murder') || cleanSentence.includes('theft')) {
        return {
          translation: 'Cáo buộc / Buộc tội',
          explanation: `Trong ngữ cảnh pháp lý, "charge" có nghĩa là buộc tội chính thức.`
        };
      }
      if (cleanSentence.includes('money') || cleanSentence.includes('fee') || cleanSentence.includes('price') || cleanSentence.includes('cost')) {
        return {
          translation: 'Tính phí / Đòi giá',
          explanation: `Trong ngữ cảnh giao dịch tài chính, "charge" nghĩa là yêu cầu thanh toán một mức giá.`
        };
      }
      return {
        translation: 'Chịu trách nhiệm / Tấn công',
        explanation: `Có thể mang nghĩa chỉ huy ("in charge of") hoặc lao tới tấn công.`
      };
    }

    if (cleanWord === 'bank') {
      if (cleanSentence.includes('river') || cleanSentence.includes('lake') || cleanSentence.includes('water')) {
        return {
          translation: 'Bờ sông / Bờ hồ',
          explanation: `Trong ngữ cảnh địa lý/sông nước, "bank" có nghĩa là bờ đất ven sông.`
        };
      }
      return {
        translation: 'Ngân hàng',
        explanation: `Nghĩa thông dụng nhất: tổ chức tài chính nhận tiền gửi và cho vay.`
      };
    }

    // Default lookup simulation for other vocabulary entries
    const dictionary: Record<string, { translation: string; explanation: string }> = {
      'getting': { translation: 'Bắt đầu / Tiếp cận', explanation: 'Đang bắt đầu một trạng thái hoặc quá trình mới.' },
      'learning': { translation: 'Việc học / Học tập', explanation: 'Quá trình tích lũy kiến thức hoặc kỹ năng mới.' },
      'journey': { translation: 'Hành trình / Chặng đường', explanation: 'Quá trình phát triển dài hạn hoặc một chuyến đi.' },
      'advanced': { translation: 'Nâng cao / Cao cấp', explanation: 'Trình độ cao, phức tạp hơn mức cơ bản.' },
      'building': { translation: 'Xây dựng / Củng cố', explanation: 'Hành động phát triển hoặc củng cố dần một cái gì đó.' },
      'techniques': { translation: 'Phương pháp / Kỹ thuật', explanation: 'Các cách thức cụ thể để thực hiện công việc hiệu quả.' },
      'essentials': { translation: 'Kiến thức thiết yếu', explanation: 'Những thứ vô cùng quan trọng, không thể thiếu.' },
      'expand': { translation: 'Mở rộng / Gia tăng', explanation: 'Làm cho lớn hơn về kích thước hoặc số lượng.' },
      'mnemonics': { translation: 'Mẹo ghi nhớ / Thuật nhớ', explanation: 'Các công cụ/mẹo giúp bộ não liên tưởng để nhớ thông tin nhanh hơn.' },
      'repetition': { translation: 'Sự lặp lại', explanation: 'Hành động nói hoặc làm lại điều gì đó nhiều lần.' },
      'etiquette': { translation: 'Nghi thức / Phép lịch sự', explanation: 'Quy tắc ứng xử lịch sự giữa người với người trong xã hội hoặc công sở.' },
      'opportunities': { translation: 'Cơ hội / Thời cơ', explanation: 'Các hoàn cảnh thuận lợi để làm việc gì đó.' },
      'crucial': { translation: 'Cốt lõi / Vô cùng quan trọng', explanation: 'Mang tính quyết định hoặc cực kỳ cần thiết cho sự thành công.' }
    };

    const match = dictionary[cleanWord];
    if (match) {
      return match;
    }

    // Fallback translation
    return {
      translation: `Dịch từ "${word}"`,
      explanation: `Hệ thống giải nghĩa từ "${word}" dựa trên ngữ cảnh: "${sentence}".`
    };
  }
}
