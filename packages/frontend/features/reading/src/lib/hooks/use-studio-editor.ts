import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { readingApi } from '../api/reading-api';
import { useDebounceCallback } from 'usehooks-ts';
import type { StudioFormValues, ContentType, ArticleStatus, CreateArticlePayload } from '../types';

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
};

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

  // ── Watch form values for computed properties ──
  const watchedTitle = form.watch('title') || '';
  const watchedContent = form.watch('content') || '';
  const watchedCategory = form.watch('category') || '';
  const watchedDifficulty = form.watch('difficulty') || '';

  // ── Computed values ──
  // Extract text from EditorJS OutputData blocks for accurate word count
  let wordCount = 0;
  if (watchedContent && typeof watchedContent === 'object' && Array.isArray(watchedContent.blocks)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    watchedContent.blocks.forEach((block: any) => {
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
        const orig = (block.data.original || '').replace(/<[^>]*>?/gm, '').trim();
        const trans = (block.data.translation || '').replace(/<[^>]*>?/gm, '').trim();
        if (orig) wordCount += orig.split(/\s+/).length;
        if (trans) wordCount += trans.split(/\s+/).length;
      }
    });
  }
  const estimatedReadTime = wordCount > 0
    ? Math.max(1, Math.ceil(wordCount / AVG_WPM))
    : 0;

  const canPublish =
    watchedTitle.trim().length >= 3 &&
    wordCount >= 50 &&
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
    let cancelled = false;

    const loadArticle = async () => {
      try {
        const article = await readingApi.getArticle(articleId);
        if (cancelled) return;

        form.reset({
          title: article.title,
          content: article.content,
          summary: article.summary ?? '',
          contentType: (article.category as ContentType) || 'article',
          category: article.category,
          difficulty: article.difficulty,
          tags: article.tags ?? [],
          thumbnailUrl: article.thumbnailUrl,
          sourceUrl: article.sourceUrl,
          author: article.author,
          status: article.isPublished ? 'PUBLISHED' : 'DRAFT',
          targetLanguage: 'en',
          audioUrl: null,
          isBilingual: false,
        });
        setIsEditing(true);
        setDraftId(article.id);
      } catch (err) {
        console.error('Failed to load article for editing:', err);
      }
    };

    loadArticle();
    return () => { cancelled = true; };
  }, [articleId, form]);

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: (payload: CreateArticlePayload) => readingApi.createStudioArticle(payload),
    onSuccess: (data) => {
      setDraftId(data.id);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    },
    onError: () => {
      setSaveStatus('error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateArticlePayload> }) =>
      readingApi.updateArticle(id, payload),
    onSuccess: () => {
      setSaveStatus('saved');
      setLastSavedAt(new Date());
    },
    onError: () => {
      setSaveStatus('error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => readingApi.deleteArticle(id),
  });

  // ── Build payload from form ──
  const buildPayload = useCallback(
    (status: ArticleStatus = 'DRAFT'): CreateArticlePayload => {
      const values = form.getValues();
      return {
        title: values.title,
        content: values.content,
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
  const handleSaveDraft = useCallback(async () => {
    setSaveStatus('saving');
    const payload = buildPayload('DRAFT');

    if (draftId) {
      updateMutation.mutate({ id: draftId, payload });
    } else {
      createMutation.mutate(payload);
    }
    dirtyRef.current = false;
  }, [buildPayload, draftId, updateMutation, createMutation]);

  // ── Publish ──
  const handlePublish = useCallback(async () => {
    if (!canPublish) return;

    setSaveStatus('saving');
    const payload = buildPayload('PUBLISHED');

    if (draftId) {
      updateMutation.mutate({ id: draftId, payload: { ...payload, status: 'PUBLISHED' } });
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
    setSaveStatus('idle');
    setLastSavedAt(null);
    dirtyRef.current = false;
  }, [draftId, deleteMutation, form]);

  // ── Start Editing (from empty state) ──
  const handleStartEditing = useCallback(
    (contentType: ContentType = 'article') => {
      form.setValue('contentType', contentType);
      setIsEditing(true);
    },
    [form]
  );

  // ── Apply Template ──
  const handleApplyTemplate = useCallback(
    (template: Partial<StudioFormValues>) => {
      const current = form.getValues();
      form.reset({
        ...current,
        ...template,
      });
      setIsEditing(true);
    },
    [form]
  );

  // ── Auto-save with Debounce ──
  const debouncedSave = useDebounceCallback(() => {
    if (dirtyRef.current && draftId && isEditing) {
      handleSaveDraft();
    }
  }, 3000);

  // ── Track dirty state & trigger debounced save ──
  useEffect(() => {
    const subscription = form.watch(() => {
      dirtyRef.current = true;
      debouncedSave();
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedSave]);

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
  };
}
