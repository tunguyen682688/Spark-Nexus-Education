import { useState, useEffect } from 'react';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import {
  GrammarBlock,
  SaveGrammarLessonDto,
  GrammarLessonDetailResponse,
} from '../types';
import { loadTemplate, duplicateBlock as duplicateBlockHelper, moveBlock as moveBlockHelper, createBlock } from './lesson-editor-blocks';

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
    const element = document.getElementById(blockId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
    const template = loadTemplate(type);
    setTitle(template.title);
    setVietnameseTitle(template.vietnameseTitle);
    setLevel(template.level);
    setTags(template.tags);
    setBlocks(template.blocks);
    if (type === 'academic') setIsDirty(true);
  };

  // Sao chép nhân bản khối (Duplicate block)
  const duplicateBlock = (blockId: string) => {
    const updated = duplicateBlockHelper(blocks, blockId);
    if (updated === blocks) return;
    setBlocks(updated);

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
    const updated = moveBlockHelper(blocks, index, direction);
    if (updated === blocks) return;
    setBlocks(updated);
    setIsDirty(true);
  };

  // Thêm block mới từ Toolbar cố định dưới cùng
  const handleAddBlock = (
    type: 'text' | 'formula' | 'example' | 'quiz' | 'media' | 'callout'
  ) => {
    const newBlock = createBlock(type);
    setBlocks([...blocks, newBlock]);
    setIsDirty(true);

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
      theoryText: '',
      formulaElements: [],
      formulaNote: '',
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
