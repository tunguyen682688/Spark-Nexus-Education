import { useState, useEffect } from 'react';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import {
  GrammarBlock,
  SaveGrammarLessonDto,
  GrammarLessonDetailResponse,
} from '../types';

export interface OutlineItem {
  id: string;
  label: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}

export interface UseGrammarLessonEditorProps {
  id?: string;
  lessonDetail?: GrammarLessonDetailResponse;
  isSaving: boolean;
  onPublish: (payload: SaveGrammarLessonDto, isDraft: boolean) => Promise<void>;
  onCancel: () => void;
}

export function useGrammarLessonEditor({
  id,
  lessonDetail,
  isSaving,
  onPublish,
  onCancel,
}: UseGrammarLessonEditorProps) {
  // Meta states
  const [title, setTitle] = useState('');
  const [vietnameseTitle, setVietnameseTitle] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [level, setLevel] = useState('A1');
  const [tags, setTags] = useState<string[]>([]);
  const { toast } = useToast();

  // Dirty state tracking & Confirmation Exit
  const [isDirty, setIsDirty] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  // States for Tag adding & Block deleting
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);

  // Outline states (Được tự động sinh từ blocks)
  const [outline, setOutline] = useState<OutlineItem[]>([]);

  // Preview Mode State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');

  // Dynamic blocks state
  const [blocks, setBlocks] = useState<GrammarBlock[]>([]);

  const handleBack = () => {
    if (isDirty) {
      setIsExitConfirmOpen(true);
    } else {
      onCancel();
    }
  };

  const handleScrollToBlock = (blockId: string) => {
    // Scroll in editor
    const element = document.getElementById(blockId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Scroll in preview (if split view is open)
    const previewElement = document.getElementById('preview-' + blockId);
    if (previewElement) {
      previewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const submitAddTag = () => {
    if (newTag && newTag.trim().length > 0) {
      setTags([...tags, newTag.trim().toUpperCase()]);
      setNewTag('');
      setIsAddTagOpen(false);
      setIsDirty(true);
    }
  };

  const submitDeleteBlock = () => {
    if (blockToDelete) {
      setBlocks(blocks.filter((b) => b.id !== blockToDelete));
      setBlockToDelete(null);
      setIsDirty(true);
    }
  };

  // Khởi tạo nhanh các mẫu bài học cấu trúc CEFR đa dạng
  const handleLoadTemplate = (type: 'standard' | 'practice' | 'academic') => {
    if (type === 'standard') {
      setTitle('The Present Perfect Tense');
      setVietnameseTitle('Thì Hiện tại hoàn thành');
      setLevel('B2');
      setTags(['TENSES', 'INTERMEDIATE']);
      setBlocks([
        {
          id: 'block-media-init',
          type: 'media',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          provider: 'youtube',
          blockLabel: 'Video Lecture',
        },
        {
          id: 'block-text-init-1',
          type: 'text',
          content:
            '### Usage & Concept\n\nThe present perfect tense is used to describe an action that happened at an unspecified time in the past, or an action that began in the past and continues to the present.',
          blockLabel: 'Usage & Concept',
        },
        {
          id: 'block-formula-init',
          type: 'formula',
          elements: ['[Subject]', '+', 'have / has', '+', 'Past Participle (V3)'],
          note: 'Structure of Present Perfect',
          blockLabel: 'Structure Formula',
        },
        {
          id: 'block-example-init',
          type: 'example',
          items: [
            {
              text: 'I have lived in Hanoi for five years.',
              explanation:
                'Action started in the past and is still true today (I still live in Hanoi).',
            },
            {
              text: 'She has already finished her homework.',
              explanation:
                'The action is completed in the past, but the time is not specific.',
            },
          ],
          blockLabel: 'Examples in Context',
        },
        {
          id: 'block-quiz-init',
          type: 'quiz',
          question:
            'Complete the sentence:\n"They _____ (know) each other since high school."',
          options: ['knew', 'have known', 'has known'],
          answer: 'have known',
          blockLabel: 'Knowledge Check',
        },
      ]);
    } else if (type === 'practice') {
      setTitle('Present Simple vs Present Continuous');
      setVietnameseTitle('Thì Hiện tại đơn vs Hiện tại tiếp diễn');
      setLevel('A2');
      setTags(['TENSES', 'FOUNDATION', 'PRACTICE']);
      setBlocks([
        {
          id: 'block-text-prac-1',
          type: 'text',
          content:
            '### Action vs State\n\nUse the Present Simple for habits, facts, and permanent situations. Use the Present Continuous for actions happening right now, temporary situations, or trends.',
          blockLabel: 'Concept Comparison',
        },
        {
          id: 'block-example-prac-1',
          type: 'example',
          items: [
            {
              text: 'He usually drinks tea, but today he is drinking coffee.',
              explanation: 'drinks: habit (Present Simple) | is drinking: exception happening today (Present Continuous).',
            },
            {
              text: 'Water boils at 100 degrees Celsius.',
              explanation: 'Scientific fact, always true.',
            },
          ],
          blockLabel: 'Examples in Context',
        },
        {
          id: 'block-quiz-prac-1',
          type: 'quiz',
          question: 'Choose the correct form:\n"Shh! The baby _____ (sleep) right now."',
          options: ['sleeps', 'is sleeping', 'sleeping'],
          answer: 'is sleeping',
          blockLabel: 'Practice Quiz 1',
        },
        {
          id: 'block-quiz-prac-2',
          type: 'quiz',
          question: 'Choose the correct form:\n"Every Sunday, we _____ (visit) our grandparents."',
          options: ['are visiting', 'visit', 'visits'],
          answer: 'visit',
          blockLabel: 'Practice Quiz 2',
        },
      ]);
    } else if (type === 'academic') {
      setTitle('Advanced Subjunctive Mood');
      setVietnameseTitle('Thể giả định nâng cao');
      setLevel('C2');
      setTags(['SUBJUNCTIVE', 'ADVANCED', 'FORMAL']);
      setBlocks([
        {
          id: 'block-media-acad',
          type: 'media',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          provider: 'youtube',
          blockLabel: 'Advanced Lecture',
        },
        {
          id: 'block-text-acad-1',
          type: 'text',
          content:
            '### Definition & Formal Usage\n\nThe subjunctive mood is used to express wishes, proposals, suggestions, or hypothetical situations. In English, it uses the bare form of the verb (infinitive without "to"), even for third person singular subjects.',
          blockLabel: 'Academic Concept',
        },
        {
          id: 'block-formula-acad',
          type: 'formula',
          elements: ['[Subject]', '+', 'demand / suggest / insist', '+', 'that', '+', '[Subject]', '+', 'bare infinitive'],
          note: 'Formula for Mandative Subjunctive',
          blockLabel: 'Subjunctive Formula',
        },
        {
          id: 'block-callout-acad',
          type: 'callout',
          title: 'ACADEMIC INSIGHT: ABSENCE OF "S" AND "SHOULD"',
          content: 'In formal American English, the "should" is omitted and the verb has no third-person "s".\n\nExample: *We insist that he be present.* (NOT *he is present* or *he should be present* in highly formal context).',
          blockLabel: 'Critical Analysis',
        },
        {
          id: 'block-quiz-acad',
          type: 'quiz',
          question: 'Select the highly formal subjunctive sentence:\n"The doctor recommended that she _____ some rest."',
          options: ['takes', 'took', 'take', 'should take'],
          answer: 'take',
          blockLabel: 'Elite Quiz',
        },
      ]);
      setIsDirty(true);
    }
  };

  // Sao chép nhân bản khối (Duplicate block)
  const duplicateBlock = (blockId: string) => {
    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock) return;

    const newId = `block-${targetBlock.type}-${Math.random().toString(36).substr(2, 9)}`;
    const duplicated: GrammarBlock = {
      ...JSON.parse(JSON.stringify(targetBlock)),
      id: newId,
      blockLabel: targetBlock.blockLabel ? `${targetBlock.blockLabel} (Copy)` : undefined
    };

    const targetIdx = blocks.findIndex((b) => b.id === blockId);
    const copy = [...blocks];
    copy.splice(targetIdx + 1, 0, duplicated);
    setBlocks(copy);

    toast({
      title: 'Đã nhân bản khối! 📋',
      description: 'Khối nội dung đã được sao chép thành công ngay phía dưới.',
    });
    setIsDirty(true);
  };

  // Sync dữ liệu từ database khi sửa bài học (Edit Mode)
  useEffect(() => {
    if (id && lessonDetail) {
      setTitle(lessonDetail.title);
      setVietnameseTitle(lessonDetail.vietnameseTitle || '');
      setStatus(lessonDetail.status || 'DRAFT');
      setLevel(lessonDetail.level);
      setTags(lessonDetail.tags || []);
      if (lessonDetail.blocks && lessonDetail.blocks.length > 0) {
        setBlocks(lessonDetail.blocks);
      }
    }
  }, [id, lessonDetail]);

  // ĐỒNG BỘ OUTLINE TỰ ĐỘNG THEO THỜI GIAN THỰC (Real-time Outline Sync)
  useEffect(() => {
    const generatedOutline: OutlineItem[] = blocks.map((block, idx) => ({
      id: block.id,
      label: block.blockLabel || `Mục ${idx + 1}: ${block.type.toUpperCase()}`,
      status: idx === 0 ? 'ACTIVE' : 'PENDING',
    }));
    setOutline(generatedOutline);
  }, [blocks]);

  const handleAddTag = () => {
    setNewTag('');
    setIsAddTagOpen(true);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setIsDirty(true);
  };

  // Cập nhật từng khối block
  const updateBlock = (
    blockId: string,
    updatedFields: Partial<GrammarBlock>
  ) => {
    setBlocks(
      blocks.map((b) => (b.id === blockId ? { ...b, ...updatedFields } : b))
    );
    setIsDirty(true);
  };

  // Xóa từng khối block
  const deleteBlock = (blockId: string) => {
    setBlockToDelete(blockId);
  };

  // Di chuyển thứ tự khối (Move Up / Down)
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

  // Thêm block mới từ Toolbar cố định dưới cùng
  const handleAddBlock = (
    type: 'text' | 'formula' | 'example' | 'quiz' | 'media' | 'callout'
  ) => {
    const newId = `block-${type}-${Math.random().toString(36).substr(2, 9)}`;
    let newBlock: GrammarBlock = {} as GrammarBlock;

    const typeLabels: Record<string, string> = {
      text: 'Theory Section',
      formula: 'Structure Formula',
      example: 'Examples',
      quiz: 'Knowledge Check',
      media: 'Media Lecture',
      callout: 'Important Note',
    };

    switch (type) {
      case 'text':
        newBlock = {
          id: newId,
          type: 'text',
          content:
            '### New Section\n\nNhập nội dung văn bản lý thuyết mới tại đây...',
          blockLabel: typeLabels[type],
        };
        break;
      case 'formula':
        newBlock = {
          id: newId,
          type: 'formula',
          elements: ['[Subject]', 'verb', '[Object]'],
          note: 'Ghi chú công thức...',
          blockLabel: typeLabels[type],
        };
        break;
      case 'example':
        newBlock = {
          id: newId,
          type: 'example',
          items: [
            {
              text: 'If I were you, I would study harder.',
              explanation: 'Reality: I am not you.',
            },
          ],
          blockLabel: typeLabels[type],
        };
        break;
      case 'quiz':
        newBlock = {
          id: newId,
          type: 'quiz',
          question:
            'Complete the sentence:\n"If she _____ here, she _____ help us."',
          options: ['is / will', 'were / would', 'was / will'],
          answer: 'were / would',
          blockLabel: typeLabels[type],
        };
        break;
      case 'media':
        newBlock = {
          id: newId,
          type: 'media',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          provider: 'youtube',
          blockLabel: typeLabels[type],
        };
        break;
      case 'callout':
        newBlock = {
          id: newId,
          type: 'callout',
          title: 'IMPORTANT NOTE',
          content: 'Nhập nội dung lưu ý nổi bật tại đây...',
          blockLabel: typeLabels[type],
        };
        break;
    }

    setBlocks([...blocks, newBlock]);
    setIsDirty(true);

    // Cuộn nhẹ xuống dưới cùng
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  };

  const handlePublish = async (isDraft = false) => {
    if (!title || !title.trim()) {
      toast({
        title: 'Thiếu tiêu đề ⚠',
        description: 'Vui lòng nhập tiêu đề bài học trước khi lưu!',
        variant: 'destructive',
      });
      return;
    }
    const currentStatus = isDraft ? 'DRAFT' : 'PUBLISHED';
    const payload: SaveGrammarLessonDto = {
      title,
      vietnameseTitle: vietnameseTitle || null,
      level,
      status: currentStatus,
      tags,
      outline: outline.map((item) => ({
        id: item.id,
        label: item.label,
        status: item.status,
      })),
      blocks,
      theoryText: '', // Trường tương thích ngược
      formulaElements: [], // Trường tương thích ngược
      formulaNote: '', // Trường tương thích ngược
    };

    await onPublish(payload, isDraft);
  };

  return {
    title,
    setTitle,
    vietnameseTitle,
    setVietnameseTitle,
    status,
    setStatus,
    level,
    setLevel,
    tags,
    setTags,
    isDirty,
    setIsDirty,
    isExitConfirmOpen,
    setIsExitConfirmOpen,
    isAddTagOpen,
    setIsAddTagOpen,
    newTag,
    setNewTag,
    blockToDelete,
    setBlockToDelete,
    outline,
    isPreviewOpen,
    setIsPreviewOpen,
    viewMode,
    setViewMode,
    blocks,
    setBlocks,
    handleBack,
    handleScrollToBlock,
    submitAddTag,
    submitDeleteBlock,
    handleLoadTemplate,
    duplicateBlock,
    handleAddTag,
    handleRemoveTag,
    updateBlock,
    deleteBlock,
    moveBlock,
    handleAddBlock,
    handlePublish,
  };
}
