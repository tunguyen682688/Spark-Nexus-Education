import { GrammarBlock } from '../types';
import { LESSON_TEMPLATES } from '../constants/lesson-templates';

export function loadTemplate(
  type: 'standard' | 'practice' | 'academic'
): { title: string; vietnameseTitle: string; level: string; tags: string[]; blocks: GrammarBlock[] } {
  const template = LESSON_TEMPLATES[type];
  return {
    title: template.title,
    vietnameseTitle: template.vietnameseTitle,
    level: template.level,
    tags: [...template.tags],
    blocks: [...template.blocks],
  };
}

export function duplicateBlock(blocks: GrammarBlock[], blockId: string): GrammarBlock[] {
  const targetBlock = blocks.find((b) => b.id === blockId);
  if (!targetBlock) return blocks;

  const newId = `block-${targetBlock.type}-${Math.random().toString(36).substr(2, 9)}`;
  const duplicated: GrammarBlock = {
    ...JSON.parse(JSON.stringify(targetBlock)),
    id: newId,
    blockLabel: targetBlock.blockLabel ? `${targetBlock.blockLabel} (Copy)` : undefined
  };

  const targetIdx = blocks.findIndex((b) => b.id === blockId);
  const copy = [...blocks];
  copy.splice(targetIdx + 1, 0, duplicated);
  return copy;
}

export function moveBlock(
  blocks: GrammarBlock[],
  index: number,
  direction: 'up' | 'down'
): GrammarBlock[] {
  if (direction === 'up' && index === 0) return blocks;
  if (direction === 'down' && index === blocks.length - 1) return blocks;

  const targetIndex = index + (direction === 'up' ? -1 : 1);
  const copy = [...blocks];
  const temp = copy[index];
  copy[index] = copy[targetIndex];
  copy[targetIndex] = temp;
  return copy;
}

export function createBlock(
  type: 'text' | 'formula' | 'example' | 'quiz' | 'media' | 'callout'
): GrammarBlock {
  const newId = `block-${type}-${Math.random().toString(36).substr(2, 9)}`;

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
      return {
        id: newId,
        type: 'text',
        content:
          '### New Section\n\nNhập nội dung văn bản lý thuyết mới tại đây...',
        blockLabel: typeLabels[type],
      };
    case 'formula':
      return {
        id: newId,
        type: 'formula',
        elements: ['[Subject]', 'verb', '[Object]'],
        note: 'Ghi chú công thức...',
        blockLabel: typeLabels[type],
      };
    case 'example':
      return {
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
    case 'quiz':
      return {
        id: newId,
        type: 'quiz',
        question:
          'Complete the sentence:\n"If she _____ here, she _____ help us."',
        options: ['is / will', 'were / would', 'was / will'],
        answer: 'were / would',
        blockLabel: typeLabels[type],
      };
    case 'media':
      return {
        id: newId,
        type: 'media',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        provider: 'youtube',
        blockLabel: typeLabels[type],
      };
    case 'callout':
      return {
        id: newId,
        type: 'callout',
        title: 'IMPORTANT NOTE',
        content: 'Nhập nội dung lưu ý nổi bật tại đây...',
        blockLabel: typeLabels[type],
      };
  }
}
