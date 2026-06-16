import React, { useEffect, useRef, useCallback } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import ImageTool from '@editorjs/image';
import VocabularyTool from './VocabularyTool';
import BilingualBlock from './BilingualBlock';

interface BlockEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any; // OutputData object or null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  placeholder?: string;
}

// Helper: safely convert value to OutputData
function toOutputData(value: unknown): OutputData | undefined {
  if (!value) return undefined;

  // Already an OutputData object
  if (typeof value === 'object' && value !== null && 'blocks' in value) {
    return value as OutputData;
  }

  // String — try JSON parse
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && Array.isArray(parsed.blocks)) {
        return parsed as OutputData;
      }
    } catch {
      // Plain text fallback
      if (value.trim()) {
        return {
          time: Date.now(),
          blocks: [{ type: 'paragraph', data: { text: value } }],
        };
      }
    }
  }

  return undefined;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const editorRef = useRef<EditorJS | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isReady = useRef(false);
  const onChangeRef = useRef(onChange);
  const isInternalChange = useRef(false);
  const lastValueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Build EditorJS tool config (stable reference)
  const getToolConfig = useCallback(() => ({
    header: {
      class: Header,
      inlineToolbar: true,
      config: {
        placeholder: 'Nhập tiêu đề',
        levels: [2, 3, 4],
        defaultLevel: 2,
      },
    },
    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
    },
    list: {
      class: List,
      inlineToolbar: true,
    },
    quote: {
      class: Quote,
      inlineToolbar: true,
    },
    image: {
      class: ImageTool,
      config: {
        endpoints: {
          byFile: '/api/v1/upload/image',
          byUrl: '/api/v1/upload/fetch',
        },
      },
    },
    delimiter: Delimiter,
    marker: Marker,
    inlineCode: InlineCode,
    vocabulary: VocabularyTool,
    bilingualBlock: BilingualBlock,
  }), []);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const initialData = toOutputData(value);

    const editor = new EditorJS({
      holder: containerRef.current,
      placeholder: placeholder || 'Bắt đầu viết nội dung ở đây...',
      data: initialData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: getToolConfig() as any,
      onChange: async (api) => {
        isInternalChange.current = true;
        try {
          const data = await api.saver.save();
          lastValueRef.current = data;
          onChangeRef.current(data);
        } finally {
          // Reset flag after a tick so external effect doesn't re-render
          setTimeout(() => { isInternalChange.current = false; }, 50);
        }
      },
      onReady: () => {
        isReady.current = true;
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && isReady.current) {
        editorRef.current.destroy();
        editorRef.current = null;
        isReady.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle external value changes (e.g. chapter switch in Book mode)
  useEffect(() => {
    if (!editorRef.current || !isReady.current) return;
    if (isInternalChange.current) return;

    // Check if value actually changed (avoid loops)
    const newData = toOutputData(value);
    const lastData = toOutputData(lastValueRef.current);

    // Simple check: compare block count and first block text
    const newBlocks = newData?.blocks || [];
    const lastBlocks = lastData?.blocks || [];

    if (newBlocks.length === lastBlocks.length && newBlocks.length > 0) {
      const sameFirst = JSON.stringify(newBlocks[0]) === JSON.stringify(lastBlocks[0]);
      const sameLast = JSON.stringify(newBlocks[newBlocks.length - 1]) === JSON.stringify(lastBlocks[lastBlocks.length - 1]);
      if (sameFirst && sameLast) return;
    }

    // Value truly changed from outside — reload editor
    lastValueRef.current = value;
    editorRef.current.render(newData || { time: Date.now(), blocks: [] });
  }, [value]);

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none w-full">
      <div
        ref={containerRef}
        id="editorjs-container"
        className="min-h-[300px] text-lg"
      />
    </div>
  );
};
