import { useState, useEffect, FormEvent } from 'react';
import { useCreateCommunityPost } from './use-grammar-community';
import { toast } from 'sonner';
import { GrammarBlock, CommunityPost } from '../types';

interface UseGrammarCreatePostProps {
  onBackToCommunity: () => void;
}

export function useGrammarCreatePost({ onBackToCommunity }: UseGrammarCreatePostProps) {
  // Post meta states
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'SPLIT' | 'EDITOR' | 'PREVIEW'>('SPLIT');
  
  // Dynamic blocks state
  const [blocks, setBlocks] = useState<GrammarBlock[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Dialog & state controls
  const [newTag, setNewTag] = useState('');
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  const createPostMutation = useCreateCommunityPost();

  // Upgraded templates to block-based structures
  const templates = [
    {
      name: 'Câu Điều Kiện Loại 3 vs Loại 2',
      title: 'Phân biệt nhanh "Conditional Type 2" và "Type 3" cực dễ nhớ',
      tags: ['Conditionals', 'GrammarTips', 'CEFR_B2'],
      blocks: [
        {
          id: 'block-text-cond-1',
          type: 'text' as const,
          content: '### Phân biệt câu điều kiện loại 2 & loại 3\n\nChào mọi người, hôm nay mình chia sẻ một mẹo nhỏ để phân biệt câu điều kiện loại 2 (giả định ở hiện tại) và loại 3 (giả định ở quá khứ).\n\n- **Loại 2**: Giả định điều không có thật ở hiện tại/tương lai.\n  *Ví dụ: If I were rich now, I would buy a sports car.*\n- **Loại 3**: Giả định điều không có thật trong quá khứ.\n  *Ví dụ: If I had studied harder last night, I would have passed the exam today.*',
          blockLabel: 'Lý thuyết cơ bản'
        },
        {
          id: 'block-formula-cond-1',
          type: 'formula' as const,
          elements: ['[If]', '+', 'S', '+', 'had + V3/ed', ',', 'S', '+', 'would have + V3/ed'],
          note: 'Công thức câu điều kiện loại 3',
          blockLabel: 'Công thức câu'
        },
        {
          id: 'block-example-cond-1',
          type: 'example' as const,
          items: [
            {
              text: 'If I had not missed the bus, I would not have been late.',
              explanation: 'Sự thật trong quá khứ: Tôi đã bỏ lỡ xe bus và đã bị muộn.'
            }
          ],
          blockLabel: 'Ví dụ minh họa'
        },
        {
          id: 'block-quiz-cond-1',
          type: 'quiz' as const,
          quizType: 'SENTENCE_BUILDER',
          question: 'Sắp xếp các từ thành câu điều kiện loại 3 chuẩn xác:',
          words: ['If', 'I', 'had', 'not', 'missed', 'the', 'bus', 'I', 'would', 'not', 'have', 'been', 'late'],
          answer: 'If I had not missed the bus I would not have been late',
          explanation: 'Cấu trúc câu điều kiện loại 3 dạng phủ định: If + S + had not + V3, S + would not have + V3. Ý nghĩa: "Nếu tôi đã không bỏ lỡ chuyến xe bus, tôi đã không bị muộn."',
          blockLabel: 'Bài tập sắp xếp'
        }
      ]
    },
    {
      name: 'Bẫy Đảo Ngữ Ngữ Pháp TOEIC',
      title: 'Tuyệt chiêu xử lý nhanh Đảo Ngữ với các Trạng từ Phủ định',
      tags: ['Inversion', 'TOEIC', 'IELTS'],
      blocks: [
        {
          id: 'block-text-inv-1',
          type: 'text' as const,
          content: '### Đảo ngữ với Trạng từ phủ định\n\nĐảo ngữ (Inversion) là một chủ đề siêu hot và thường xuất hiện làm bẫy trong kỳ thi TOEIC / IELTS.\n\nKhi các cụm từ phủ định (Never, Seldom, Rarely, Hardly, Under no circumstances) đứng đầu câu, chúng ta phải **ĐẢO TRỢ ĐỘNG TỪ** lên trước chủ ngữ.',
          blockLabel: 'Quy tắc đảo ngữ'
        },
        {
          id: 'block-formula-inv-1',
          type: 'formula' as const,
          elements: ['Trạng từ phủ định', '+', 'Trợ động từ', '+', 'S', '+', 'V-chính'],
          note: 'Cấu trúc tổng quát',
          blockLabel: 'Cấu trúc công thức'
        },
        {
          id: 'block-callout-inv-1',
          type: 'callout' as const,
          title: 'ACADEMIC INSIGHT: ĐẢO NGỮ QUÁ KHỨ HOÀN THÀNH',
          content: 'Cấu trúc: Hardly / Scarcely + had + S + V3 + when + S + V2/ed.\nVí dụ: Hardly had we entered the house when it started to rain.',
          blockLabel: 'Mẹo nâng cao'
        },
        {
          id: 'block-quiz-inv-1',
          type: 'quiz' as const,
          quizType: 'MULTIPLE_CHOICE',
          question: 'Chọn phương án đúng hoàn thành câu sau: "Rarely _______ such a brilliant performance."',
          options: ['we saw', 'did we see', 'we did see', 'have we saw'],
          answer: 'did we see',
          explanation: 'Vì trạng từ phủ định "Rarely" đứng đầu câu, ta bắt buộc phải đảo trợ động từ lên trước chủ ngữ. Phương án đúng đảo trợ động từ quá khứ đơn "did we see". Các phương án còn lại đều sai cấu trúc đảo ngữ.',
          blockLabel: 'Câu hỏi trắc nghiệm'
        }
      ]
    },
    {
      name: 'Lỗi Sai Phổ Biến "Since vs For"',
      title: 'Sửa lỗi sai kinh điển giữa "Since" và "For" trong Thì Hoành Thành',
      tags: ['Tenses', 'CommonMistakes', 'CEFR_A2'],
      blocks: [
        {
          id: 'block-text-since-1',
          type: 'text' as const,
          content: '### Khi nào dùng Since & For?\n\nChắc hẳn rất nhiều bạn vẫn còn nhầm lẫn khi dùng "Since" và "For" đối với thì Hiện tại hoàn thành (Present Perfect).\n\nQuy tắc cực đơn giản:\n- **Since** + Mốc thời gian (như 2010, Monday, last night, I was a child).\n- **For** + Khoảng thời gian (như 5 years, a long time, 2 hours).',
          blockLabel: 'Mẹo phân biệt'
        },
        {
          id: 'block-example-since-1',
          type: 'example' as const,
          items: [
            {
              text: 'I have studied here since 2020.',
              explanation: '2020 là mốc thời gian cụ thể.'
            },
            {
              text: 'I have studied here for 6 years.',
              explanation: '6 years là khoảng thời gian.'
            }
          ],
          blockLabel: 'Ví dụ phân biệt'
        },
        {
          id: 'block-quiz-since-1',
          type: 'quiz' as const,
          quizType: 'ERROR_SPOTLIGHT',
          question: 'Tìm từ viết sai giới từ trong câu dưới đây và gõ từ sửa lại đúng:',
          sentence: 'She has been learning the piano since five years now.',
          incorrectWord: 'since',
          correctWord: 'for',
          answer: 'for',
          explanation: '"five years" là một khoảng thời gian, do đó ta bắt buộc phải sử dụng giới từ "for" thay vì "since". Cấu trúc sửa đổi: since -> for.',
          blockLabel: 'Tìm lỗi sai ngữ pháp'
        }
      ]
    }
  ];

  const sessionKey = 'sne_grammar_post_draft';

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(sessionKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (parsed.title) setTitle(parsed.title);
          if (parsed.tags) setTags(parsed.tags);
          if (parsed.blocks) setBlocks(parsed.blocks);
          setIsDirty(true);
          toast.success('Đã khôi phục bản nháp bài viết của bạn! 📝');
        }
      } catch (err) {
        console.error('Lỗi khôi phục bản nháp bài đăng:', err);
      }
    }
  }, []);

  // Save draft on edit
  useEffect(() => {
    if (isDirty) {
      localStorage.setItem(
        sessionKey,
        JSON.stringify({ title, tags, blocks })
      );
    }
  }, [title, tags, blocks, isDirty]);

  const clearDraft = () => {
    localStorage.removeItem(sessionKey);
    setIsDirty(false);
  };

  const handleBack = () => {
    if (isDirty) {
      setIsExitConfirmOpen(true);
    } else {
      onBackToCommunity();
    }
  };

  const handleConfirmExit = () => {
    clearDraft();
    setIsExitConfirmOpen(false);
    onBackToCommunity();
  };

  const applyTemplate = (tpl: typeof templates[0]) => {
    setTitle(tpl.title);
    setTags(tpl.tags);
    setBlocks(JSON.parse(JSON.stringify(tpl.blocks)));
    setIsDirty(true);
    toast.success(`Đã áp dụng bài mẫu: ${tpl.name} ⚡`);
  };

  const handleAddTag = () => {
    if (newTag && newTag.trim().length > 0) {
      const cleanTag = newTag.trim().replace(/#/g, '');
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setNewTag('');
      setIsDirty(true);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
    setIsDirty(true);
  };

  const handleAddBlock = (type: 'text' | 'formula' | 'example' | 'quiz' | 'media' | 'callout') => {
    const newId = `block-${type}-${Math.random().toString(36).substr(2, 9)}`;
    let newBlock: GrammarBlock = {} as GrammarBlock;

    const typeLabels: Record<string, string> = {
      text: 'Lý thuyết cơ bản',
      formula: 'Cấu trúc công thức',
      example: 'Ví dụ minh họa',
      quiz: 'Thử thách tương tác',
      media: 'Video bài giảng',
      callout: 'Lưu ý nổi bật',
    };

    switch (type) {
      case 'text':
        newBlock = { id: newId, type: 'text', content: '### Mục mới\n\nNhập nội dung lý thuyết bằng Markdown tại đây...', blockLabel: typeLabels[type] };
        break;
      case 'formula':
        newBlock = { id: newId, type: 'formula', elements: ['[Subject]', '+', 'verb', '+', '[Object]'], note: 'Ghi chú công thức...', blockLabel: typeLabels[type] };
        break;
      case 'example':
        newBlock = { id: newId, type: 'example', items: [{ text: 'If I were you, I would study harder.', explanation: 'Giải nghĩa ví dụ thực tế.' }], blockLabel: typeLabels[type] };
        break;
      case 'quiz':
        newBlock = { id: newId, type: 'quiz', quizType: 'MULTIPLE_CHOICE', question: 'Chọn đáp án chính xác điền vào chỗ trống:', options: ['', '', '', ''], answer: '', explanation: 'Giải thích lý thuyết...', blockLabel: typeLabels[type] };
        break;
      case 'media':
        newBlock = { id: newId, type: 'media', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', provider: 'youtube', blockLabel: typeLabels[type] };
        break;
      case 'callout':
        newBlock = { id: newId, type: 'callout', title: 'LƯU Ý QUAN TRỌNG', content: 'Nhập nội dung lưu ý nổi bật tại đây...', blockLabel: typeLabels[type] };
        break;
    }

    setBlocks([...blocks, newBlock]);
    setIsDirty(true);
    toast.success(`Đã thêm khối ${typeLabels[type]} ➕`);

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 120);
  };

  const updateBlock = (blockId: string, updatedFields: Partial<GrammarBlock>) => {
    setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, ...updatedFields } : b)));
    setIsDirty(true);
  };

  const duplicateBlock = (blockId: string) => {
    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock) return;
    const newId = `block-${targetBlock.type}-${Math.random().toString(36).substr(2, 9)}`;
    const duplicated: GrammarBlock = {
      ...JSON.parse(JSON.stringify(targetBlock)),
      id: newId,
      blockLabel: targetBlock.blockLabel ? `${targetBlock.blockLabel} (Bản sao)` : undefined
    };
    const targetIdx = blocks.findIndex((b) => b.id === blockId);
    const copy = [...blocks];
    copy.splice(targetIdx + 1, 0, duplicated);
    setBlocks(copy);
    toast.success('Đã nhân bản khối nội dung! 📋');
    setIsDirty(true);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const targetIndex = index + (direction === 'up' ? -1 : 1);
    const copy = [...blocks];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setBlocks(copy);
    setIsDirty(true);
  };

  const submitDeleteBlock = () => {
    if (blockToDelete) {
      setBlocks(blocks.filter((b) => b.id !== blockToDelete));
      setBlockToDelete(null);
      setIsDirty(true);
      toast.success('Đã xóa khối thành công!');
    }
  };

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề bài viết!'); return; }
    if (blocks.length === 0) { toast.error('Vui lòng tạo ít nhất một khối nội dung!'); return; }

    for (const b of blocks) {
      if (b.type === 'quiz') {
        if (!b.question?.trim()) { toast.error('Có khối thử thách chưa nhập câu hỏi định hướng!'); return; }
        if (b.quizType === 'MULTIPLE_CHOICE') {
          const opts = b.options?.map((o: string) => o.trim()).filter(Boolean) || [];
          if (opts.length < 2) { toast.error('Vui lòng điền ít nhất 2 đáp án cho thử thách trắc nghiệm!'); return; }
          if (!b.answer?.trim()) { toast.error('Vui lòng chọn đáp án đúng cho thử thách trắc nghiệm!'); return; }
        } else if (b.quizType === 'SENTENCE_BUILDER') {
          if (!b.words || b.words.length < 2) { toast.error('Vui lòng nhập danh sách từ xáo trộn cho thử thách sắp xếp câu!'); return; }
          if (!b.answer?.trim()) { toast.error('Vui lòng nhập câu đáp án chính xác cho thử thách sắp xếp!'); return; }
        } else if (b.quizType === 'ERROR_SPOTLIGHT') {
          if (!b.sentence?.trim()) { toast.error('Vui lòng nhập câu chứa lỗi sai ngữ pháp!'); return; }
          if (!b.incorrectWord?.trim() || !b.correctWord?.trim()) { toast.error('Vui lòng chỉ rõ từ sai và từ sửa lại tương ứng!'); return; }
        }
      }
    }

    const firstQuizBlock = blocks.find(b => b.type === 'quiz');
    const hasQuiz = !!firstQuizBlock;
    let quizType: CommunityPost['quizType'] = undefined;
    let quizData: CommunityPost['quizData'] = undefined;

    if (firstQuizBlock) {
      quizType = (firstQuizBlock.quizType as CommunityPost['quizType']) || 'MULTIPLE_CHOICE';
      if (quizType === 'MULTIPLE_CHOICE') {
        quizData = { text: firstQuizBlock.question, options: (firstQuizBlock.options || []).map((o: string) => o.trim()).filter(Boolean), answer: firstQuizBlock.answer, explanation: firstQuizBlock.explanation || '' };
      } else if (quizType === 'SENTENCE_BUILDER') {
        quizData = { text: firstQuizBlock.question, words: firstQuizBlock.words, answer: firstQuizBlock.answer, explanation: firstQuizBlock.explanation || '' };
      } else if (quizType === 'ERROR_SPOTLIGHT') {
        quizData = { text: firstQuizBlock.question, sentence: firstQuizBlock.sentence, incorrectWord: firstQuizBlock.incorrectWord, correctWord: firstQuizBlock.correctWord, answer: firstQuizBlock.correctWord, explanation: firstQuizBlock.explanation || '' };
      }
    }

    const contentPayload = JSON.stringify(blocks);

    createPostMutation.mutate({
      title: title.trim(),
      content: contentPayload,
      tags,
      hasQuiz,
      quizType,
      quizData,
    }, {
      onSuccess: () => {
        toast.success('Đăng bài viết modular kèm thử thách thành công! 🚀');
        clearDraft();
        onBackToCommunity();
      },
      onError: (err) => {
        toast.error('Đã xảy ra lỗi khi xuất bản bài viết. Vui lòng thử lại!');
        console.error(err);
      }
    });
  };

  return {
    title,
    setTitle,
    tags,
    setTags,
    viewMode,
    setViewMode,
    blocks,
    setBlocks,
    isDirty,
    newTag,
    setNewTag,
    blockToDelete,
    setBlockToDelete,
    isExitConfirmOpen,
    setIsExitConfirmOpen,
    createPostMutation,
    templates,
    handleBack,
    handleConfirmExit,
    applyTemplate,
    handleAddTag,
    handleRemoveTag,
    handleAddBlock,
    updateBlock,
    duplicateBlock,
    moveBlock,
    submitDeleteBlock,
    handlePublish,
  };
}
