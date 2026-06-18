import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { readingApi } from '../api/reading-api';
import { useDebounceCallback } from 'usehooks-ts';
import type {
  StudioFormValues,
  ContentType,
  ArticleStatus,
  CreateArticlePayload,
  EditorJsOutputData,
  EditorJsBlock,
  StudioContentPayload,
} from '../types';
import { useNavigate } from 'react-router-dom';
import { STUDIO_UI_TEXT } from '../constants/studio-ui-text';
import { useToast } from '@spark-nest-ed/frontend-shared-components';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DEFAULT_FORM_VALUES: StudioFormValues = {
  title: '',
  content: null,
  summary: '',
  contentType: 'article',
  category: '',
  difficulty: '',
  tags: [],
  thumbnailUrl: null,
  sourceUrl: null,
  author: null,
  status: 'DRAFT',
  targetLanguage: 'en',
  audioUrl: null,
  isBilingual: false,
  chapters: [],
  chapterTitle: '',
  chapterContent: null,
};

interface ContentPayloadWrapper {
  editorData?: EditorJsOutputData | null;
  chapters?: {
    id: string;
    title: string;
    content: EditorJsOutputData | null;
    isDraft: boolean;
  }[];
  audioUrl?: string | null;
  isBilingual?: boolean;
}

function parseContent(
  content: string | EditorJsOutputData | StudioContentPayload | null | undefined
): EditorJsOutputData | StudioContentPayload {
  if (!content) return { time: Date.now(), blocks: [], version: '2.28.2' };
  if (typeof content === 'object') return content;
  try {
    return JSON.parse(content) as EditorJsOutputData | StudioContentPayload;
  } catch {
    // Fallback for plain text or malformed JSON
    return {
      time: Date.now(),
      blocks: [{ type: 'paragraph', data: { text: String(content) } }],
      version: '2.28.2',
    };
  }
}

const AVG_WPM = 200; // average reading speed for time estimation

/**
 * Custom hook managing all Content Studio editor logic.
 * Inspired by the Vocabulary feature's `useEditorController`.
 */
export function useStudioEditor(articleId?: string) {
  const form = useForm<StudioFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
  });

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(articleId ?? null);
  const dirtyRef = useRef(false);
  const loadedIdRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isManualSaveRef = useRef(false);

  // ── Watch form values for computed properties ──
  const watchedTitle = form.watch('title') || '';
  const watchedContent = form.watch('content') || '';
  const watchedCategory = form.watch('category') || '';
  const watchedDifficulty = form.watch('difficulty') || '';
  const watchedContentType = form.watch('contentType');
  const watchedChapterContent = form.watch('chapterContent');

  // ── Computed values ──
  // Extract text from EditorJS OutputData blocks for accurate word count
  let wordCount = 0;
  const contentToCount =
    watchedContentType === 'book' ? watchedChapterContent : watchedContent;
  if (
    contentToCount &&
    typeof contentToCount === 'object' &&
    Array.isArray(contentToCount.blocks)
  ) {
    (contentToCount.blocks as EditorJsBlock[]).forEach(
      (block: EditorJsBlock) => {
        if (block.data?.text) {
          // Strip HTML tags and count words
          const plainText = block.data.text.replace(/<[^>]*>?/gm, '').trim();
          if (plainText) wordCount += plainText.split(/\s+/).length;
        }
        // Handle list items
        if (block.type === 'list' && Array.isArray(block.data?.items)) {
          block.data.items.forEach((item: string) => {
            const plain = item.replace(/<[^>]*>?/gm, '').trim();
            if (plain) wordCount += plain.split(/\s+/).length;
          });
        }
        // Handle bilingual blocks
        if (block.type === 'bilingualBlock' && block.data) {
          const orig = (block.data.original || '')
            .replace(/<[^>]*>?/gm, '')
            .trim();
          const trans = (block.data.translation || '')
            .replace(/<[^>]*>?/gm, '')
            .trim();
          if (orig) wordCount += orig.split(/\s+/).length;
          if (trans) wordCount += trans.split(/\s+/).length;
        }
      }
    );
  }
  const estimatedReadTime =
    wordCount > 0 ? Math.max(1, Math.ceil(wordCount / AVG_WPM)) : 0;

  const canPublish =
    watchedTitle.trim().length >= 3 &&
    (watchedContentType === 'book' || wordCount >= 50) &&
    watchedCategory.length > 0 &&
    watchedDifficulty.length > 0;

  // ── Checklist items ──
  const checklist = {
    hasTitle: watchedTitle.trim().length >= 3,
    hasContent: wordCount >= 50,
    hasCategory: watchedCategory.length > 0,
    hasDifficulty: watchedDifficulty.length > 0,
  };

  // ── Load existing article for editing ──
  useEffect(() => {
    if (!articleId) return;
    if (loadedIdRef.current === articleId) return;
    let cancelled = false;

    const loadArticle = async () => {
      try {
        const article = await readingApi.getArticle(articleId);
        if (cancelled) return;

        const parsedContent = parseContent(
          article.content
        ) as EditorJsOutputData & ContentPayloadWrapper;
        const contentType = (article.contentType as ContentType) || 'article';

        // Check if content was saved with our metadata wrapper
        const hasWrapper =
          parsedContent &&
          (parsedContent.editorData !== undefined ||
            parsedContent.chapters !== undefined);
        const editorContent = hasWrapper
          ? parsedContent.editorData
          : parsedContent;
        const chaptersList = hasWrapper ? parsedContent.chapters || [] : [];
        const audioUrl = hasWrapper ? parsedContent.audioUrl || null : null;
        const isBilingual = hasWrapper
          ? parsedContent.isBilingual || false
          : false;

        form.reset({
          title: article.title,
          content: contentType === 'book' ? null : editorContent,
          summary: article.summary ?? '',
          contentType,
          category: article.category,
          difficulty: article.difficulty,
          tags: article.tags ?? [],
          thumbnailUrl: article.thumbnailUrl,
          sourceUrl: article.sourceUrl,
          author: article.author,
          status: article.isPublished ? 'PUBLISHED' : 'DRAFT',
          targetLanguage: 'en',
          audioUrl: audioUrl,
          isBilingual: isBilingual,
          chapters: contentType === 'book' ? chaptersList : [],
          chapterTitle: '',
          chapterContent: null,
        });
        setIsEditing(true);
        setDraftId(article.id);
        loadedIdRef.current = article.id;
      } catch (err) {
        console.error('Failed to load article for editing:', err);
      }
    };

    loadArticle();
    return () => {
      cancelled = true;
    };
  }, [articleId, form]);

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (payload: CreateArticlePayload) =>
      readingApi.createStudioArticle(payload),
    onSuccess: (data) => {
      setDraftId(data.id);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      if (isManualSaveRef.current) {
        toast({
          title: STUDIO_UI_TEXT.TOAST_TITLE_SUCCESS,
          description: STUDIO_UI_TEXT.TOAST_DRAFT_SAVED,
          variant: 'default',
        });
      }
    },
    onError: () => {
      setSaveStatus('error');
      toast({
        title: STUDIO_UI_TEXT.TOAST_TITLE_ERROR,
        description: STUDIO_UI_TEXT.TOAST_ERROR,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateArticlePayload>;
    }) => readingApi.updateArticle(id, payload),
    onSuccess: () => {
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      if (isManualSaveRef.current) {
        toast({
          title: STUDIO_UI_TEXT.TOAST_TITLE_SUCCESS,
          description: STUDIO_UI_TEXT.TOAST_DRAFT_SAVED,
          variant: 'default',
        });
      }
    },
    onError: () => {
      setSaveStatus('error');
      toast({
        title: STUDIO_UI_TEXT.TOAST_TITLE_ERROR,
        description: STUDIO_UI_TEXT.TOAST_ERROR,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => readingApi.deleteArticle(id),
  });

  // ── Build payload from form ──
  const buildPayload = useCallback(
    (status: ArticleStatus = 'DRAFT'): CreateArticlePayload => {
      const values = form.getValues();
      let payloadContent = null;

      if (values.contentType === 'book') {
        payloadContent = {
          chapters: values.chapters || [],
          audioUrl: values.audioUrl || null,
          isBilingual: values.isBilingual || false,
        };
      } else {
        payloadContent = {
          editorData: values.content,
          audioUrl: values.audioUrl || null,
          isBilingual: values.isBilingual || false,
        };
      }

      return {
        title: values.title,
        content: payloadContent,
        summary: values.summary || undefined,
        category: values.category,
        contentType: values.contentType,
        difficulty: values.difficulty || undefined,
        tags: values.tags.length > 0 ? values.tags : undefined,
        thumbnailUrl: values.thumbnailUrl || undefined,
        sourceUrl: values.sourceUrl || undefined,
        author: values.author || undefined,
        status,
        targetLanguage: values.targetLanguage,
        audioUrl: values.audioUrl || undefined,
        isBilingual: values.isBilingual,
      };
    },
    [form]
  );

  // ── Save Draft ──
  const handleSaveDraft = useCallback(
    async (isManual = false) => {
      isManualSaveRef.current = isManual;
      setSaveStatus('saving');
      const payload = buildPayload('DRAFT');

      if (draftId) {
        updateMutation.mutate({ id: draftId, payload });
      } else {
        createMutation.mutate(payload);
      }
      dirtyRef.current = false;
    },
    [buildPayload, draftId, updateMutation, createMutation]
  );

  // ── Publish ──
  const handlePublish = useCallback(async () => {
    if (!canPublish) return;

    setSaveStatus('saving');
    const payload = buildPayload('PUBLISHED');

    if (draftId) {
      updateMutation.mutate({
        id: draftId,
        payload: { ...payload, status: 'PUBLISHED' },
      });
    } else {
      createMutation.mutate({ ...payload, status: 'PUBLISHED' });
    }
    dirtyRef.current = false;
  }, [canPublish, buildPayload, draftId, updateMutation, createMutation]);

  // ── Discard ──
  const handleDiscard = useCallback(async () => {
    if (draftId) {
      deleteMutation.mutate(draftId);
    }
    form.reset(DEFAULT_FORM_VALUES);
    setIsEditing(false);
    setDraftId(null);
    loadedIdRef.current = null;
    setSaveStatus('idle');
    setLastSavedAt(null);
    dirtyRef.current = false;
  }, [draftId, deleteMutation, form]);

  // ── Start Editing (from empty state) ──
  const handleStartEditing = useCallback(
    async (contentType: ContentType = 'article') => {
      isManualSaveRef.current = false;
      form.setValue('contentType', contentType);
      setSaveStatus('saving');

      try {
        const initialContent =
          contentType === 'book'
            ? {
                chapters: [
                  {
                    id: '1',
                    title: 'Chương 1: Khởi đầu',
                    content: null,
                    isDraft: true,
                  },
                ],
                audioUrl: null,
                isBilingual: false,
              }
            : {
                editorData: { time: Date.now(), blocks: [], version: '2.28.2' },
                audioUrl: null,
                isBilingual: false,
              };

        const payload: CreateArticlePayload = {
          title:
            contentType === 'book'
              ? 'Sách chưa đặt tên'
              : 'Bài viết chưa đặt tên',
          content: initialContent,
          category: 'Chưa phân loại',
          contentType,
          status: 'DRAFT',
        };

        const data = await createMutation.mutateAsync(payload);

        setDraftId(data.id);
        loadedIdRef.current = data.id;

        const parsedContent = parseContent(
          payload.content
        ) as EditorJsOutputData & ContentPayloadWrapper;
        const hasWrapper =
          parsedContent &&
          (parsedContent.editorData !== undefined ||
            parsedContent.chapters !== undefined);
        const editorContent = hasWrapper
          ? parsedContent.editorData
          : parsedContent;
        const chaptersList = hasWrapper ? parsedContent.chapters || [] : [];
        const audioUrl = hasWrapper ? parsedContent.audioUrl || null : null;
        const isBilingual = hasWrapper
          ? parsedContent.isBilingual || false
          : false;

        form.reset({
          ...DEFAULT_FORM_VALUES,
          title: payload.title,
          content: contentType === 'book' ? null : editorContent,
          contentType: payload.contentType,
          category: payload.category,
          audioUrl: audioUrl,
          isBilingual: isBilingual,
          chapters: contentType === 'book' ? chaptersList : [],
        });

        setIsEditing(true);
        setSaveStatus('saved');
        setLastSavedAt(new Date());

        // Update URL so React Router knows and if user reloads, they are back to editing this draft
        navigate(`/reading/studio/${data.id}`, { replace: true });
      } catch (error) {
        console.error('Failed to create initial draft', error);
        setSaveStatus('error');
        // Fallback: still open editor, but user must manually save first
        setIsEditing(true);
      }
    },
    [form, createMutation, navigate]
  );

  // ── Auto-save with Debounce ──
  const debouncedSave = useDebounceCallback(() => {
    if (dirtyRef.current && draftId && isEditing) {
      handleSaveDraft(false);
    }
  }, 3000);

  // ── Apply Template ──
  const handleApplyTemplate = useCallback(
    (template: Partial<StudioFormValues>) => {
      const current = form.getValues();
      form.reset({
        ...current,
        ...template,
      });
      setIsEditing(true);
      dirtyRef.current = true;
      setSaveStatus('saving');
      debouncedSave();
    },
    [form, debouncedSave]
  );

  // ── Track dirty state & trigger debounced save ──
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name) {
        dirtyRef.current = true;
        setSaveStatus('saving');
        debouncedSave();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedSave]);

  // Book/Chapter state management logic
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [isOverviewActive, setIsOverviewActive] = useState(true);

  const chapters = form.watch('chapters') || [];
  const watchedChapterTitle = form.watch('chapterTitle');

  useEffect(() => {
    if (activeChapterId && !isOverviewActive) {
      const currentChapters = form.getValues('chapters') || [];
      const updated = currentChapters.map((ch) =>
        ch.id === activeChapterId
          ? {
              ...ch,
              title:
                watchedChapterTitle || STUDIO_UI_TEXT.DEFAULT_CHAPTER_TITLE,
              content: watchedChapterContent ?? null,
            }
          : ch
      );
      form.setValue('chapters', updated, { shouldDirty: true });
    }
  }, [
    watchedChapterTitle,
    watchedChapterContent,
    activeChapterId,
    isOverviewActive,
    form,
  ]);

  const handleAddChapter = useCallback(() => {
    const newId = Date.now().toString();
    const currentChapters = form.getValues('chapters') || [];

    const newChapter = {
      id: newId,
      title: STUDIO_UI_TEXT.DEFAULT_CHAPTER_TITLE,
      content: null,
      isDraft: true,
    };
    const updated = [...currentChapters, newChapter];

    form.setValue('chapters', updated, { shouldDirty: true });
    setActiveChapterId(newId);
    setIsOverviewActive(false);

    form.setValue('chapterTitle', STUDIO_UI_TEXT.DEFAULT_CHAPTER_TITLE, {
      shouldDirty: true,
    });
    form.setValue('chapterContent', null, { shouldDirty: true });
  }, [form]);

  const handleSelectChapter = useCallback(
    (id: string) => {
      const currentChapters = form.getValues('chapters') || [];
      const target = currentChapters.find((c) => c.id === id);
      if (target) {
        setActiveChapterId(id);
        setIsOverviewActive(false);

        form.setValue('chapterTitle', target.title || '', {
          shouldDirty: true,
        });
        form.setValue('chapterContent', target.content || null, {
          shouldDirty: true,
        });
      }
    },
    [form]
  );

  const handleSelectOverview = useCallback(() => {
    setIsOverviewActive(true);
    setActiveChapterId(null);
  }, []);

  return {
    form,
    isEditing,
    draftId,
    saveStatus,
    lastSavedAt,
    wordCount,
    estimatedReadTime,
    canPublish,
    checklist,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleStartEditing,
    handleApplyTemplate,
    handleSaveDraft,
    handlePublish,
    handleDiscard,
    activeChapterId,
    isOverviewActive,
    chapters,
    handleAddChapter,
    handleSelectChapter,
    handleSelectOverview,
  };
}
