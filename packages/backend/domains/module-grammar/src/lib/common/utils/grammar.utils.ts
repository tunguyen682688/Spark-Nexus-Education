/**
 * Chuyển tiếng Việt có dấu thành không dấu và chuẩn hóa thành slug dạng English.
 * @param text - Chuỗi cần chuyển đổi
 * @returns Slug đã được chuẩn hóa
 */
export function slugify(text: string): string {
  if (!text) return '';
  let slug = text.toLowerCase();
  
  // Thay thế ký tự có dấu
  slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a');
  slug = slug.replace(/[éèẻẽẹêếềểễệ]/g, 'e');
  slug = slug.replace(/[íìỉĩị]/g, 'i');
  slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o');
  slug = slug.replace(/[úùủũụưứừửữự]/g, 'u');
  slug = slug.replace(/[ýỳỷỹỵ]/g, 'y');
  slug = slug.replace(/đ/g, 'd');
  
  // Loại bỏ ký tự đặc biệt, thay thế khoảng trắng thành dấu gạch ngang
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.replace(/[\s_]+/g, '-');
  slug = slug.trim().replace(/^-+|-+$/g, '');
  
  return slug;
}

/**
 * Chuẩn hóa, làm sạch và bảo mật cấu trúc của dynamic blocks trước khi lưu vào DB.
 * @param blocks - Mảng các block cần sanitize
 * @returns Mảng các block đã được làm sạch
 */
export function sanitizeBlocks(blocks: any[]): any[] {
  if (!Array.isArray(blocks)) return [];
  
  return blocks.map((block, idx) => {
    const type = block.type || 'text';
    const id = block.id || `block-${type}-${Math.random().toString(36).substring(2, 9)}`;
    const blockLabel = block.blockLabel || `Mục ${idx + 1}: ${type.toUpperCase()}`;
    
    const sanitized: any = {
      id,
      type,
      blockLabel,
    };
    
    if (type === 'text') {
      sanitized.content = block.content || '';
    } else if (type === 'formula') {
      sanitized.elements = Array.isArray(block.elements) ? block.elements : [];
      sanitized.note = block.note || '';
    } else if (type === 'example') {
      sanitized.items = Array.isArray(block.items) 
        ? block.items.map((item: any) => ({
            text: item.text || '',
            explanation: item.explanation || '',
          }))
        : [];
    } else if (type === 'quiz') {
      sanitized.question = block.question || '';
      sanitized.options = Array.isArray(block.options) ? block.options : [];
      sanitized.answer = block.answer || '';
    } else if (type === 'media') {
      sanitized.url = block.url || '';
      sanitized.provider = block.provider || 'youtube';
    } else if (type === 'callout') {
      sanitized.title = block.title || '';
      sanitized.content = block.content || '';
    }
    
    return sanitized;
  });
}
