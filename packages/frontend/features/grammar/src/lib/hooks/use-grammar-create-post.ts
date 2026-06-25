import { useState, useEffect, FormEvent } from 'react';
import { useCreateCommunityPost } from './use-grammar-community';
import { toast } from 'sonner';
import { GrammarBlock, CommunityPost } from '../types';
import { POST_TEMPLATES } from '../constants';

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
  const templates = POST_TEMPLATES;

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
