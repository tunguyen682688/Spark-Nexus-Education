import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { readingApi } from '../api/reading-api';
import type {
  StudioFormValues,
  ContentType,
  CreateArticlePayload,
  EditorJsOutputData,
} from '../types';
import { useNavigate } from 'react-router-dom';
import { STUDIO_UI_TEXT } from '../constants/studio-ui-text';
import {
  DEFAULT_FORM_VALUES,
  AVG_WPM,
  parseArticleContent,
  injectHighlightsToEditorData,
  countWordsFromBlocks,
  cleanEditorDataAndExtractHighlights,
} from './studio-helpers';
import { useStudioAutosave } from './use-studio-autosave';
import { useStudioBlocks } from './use-studio-blocks';
import { useStudioPublish } from './use-studio-publish';
import { useStudioMutations } from './use-studio-mutations';

export function useStudioEditor(articleId?: string) {
  const form = useForm<StudioFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(articleId ?? null);
  const dirtyRef = useRef(false);
  const loadedIdRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const watchedContent = form.watch('content') || '';
  const watchedContentType = form.watch('contentType');
  const watchedChapterContent = form.watch('chapterContent');

  const wordCount = useMemo(() => {
    const content =
      watchedContentType === 'book' ? watchedChapterContent : watchedContent;
    if (
      content &&
      typeof content === 'object' &&
      Array.isArray(content.blocks)
    ) {
      return countWordsFromBlocks(content.blocks);
    }
    return 0;
  }, [watchedContent, watchedChapterContent, watchedContentType]);

  const estimatedReadTime =
    wordCount > 0 ? Math.max(1, Math.ceil(wordCount / AVG_WPM)) : 0;

  const autosave = useStudioAutosave({
    form,
    dirtyRef,
    draftId,
    isEditing,
    onSave: () => publishSaveRef.current(),
  });

  const mutations = useStudioMutations({
    setDraftId,
    setSaveStatus: autosave.setSaveStatus,
    setLastSavedAt: autosave.setLastSavedAt,
    isManualSaveRef: autosave.isManualSaveRef,
  });

  const publishSaveRef = useRef<() => void>(() => {});

  const blocks = useStudioBlocks(form);

  const buildPayload = useCallback(
    (status: 'DRAFT' | 'REVIEW' | 'PUBLISHED' = 'DRAFT'): CreateArticlePayload => {
      const values = form.getValues();
      let payloadContent = null;
      const allHighlights: import('../types').ArticleHighlightPayload[] = [];

      if (values.contentType === 'book') {
        const cleanedChapters = (values.chapters || []).map((ch) => {
          const { cleanData, highlights } = cleanEditorDataAndExtractHighlights(ch.content);
          allHighlights.push(...highlights);
          return { ...ch, content: cleanData };
        });
        payloadContent = {
          chapters: cleanedChapters,
          audioUrl: values.audioUrl || null,
          isBilingual: values.isBilingual || false,
        };
      } else {
        const { cleanData, highlights } = cleanEditorDataAndExtractHighlights(values.content);
        allHighlights.push(...highlights);
        payloadContent = {
          editorData: cleanData,
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
        vocabularySetId: values.vocabularySetId || undefined,
        highlights: allHighlights,
      };
    },
    [form]
  );

  const publish = useStudioPublish({
    form,
    dirtyRef,
    draftId,
    setDraftId,
    setSaveStatus: autosave.setSaveStatus,
    setLastSavedAt: autosave.setLastSavedAt,
    isManualSaveRef: autosave.isManualSaveRef,
    createMutation: mutations.createMutation,
    updateMutation: mutations.updateMutation,
    deleteMutation: mutations.deleteMutation,
    buildPayload,
    wordCount,
  });

  publishSaveRef.current = () => publish.handleSaveDraft(false);

  useEffect(() => {
    if (!articleId) return;
    if (loadedIdRef.current === articleId) return;
    let cancelled = false;

    const loadArticle = async () => {
      try {
        const article = await readingApi.getArticle(articleId);
        if (cancelled) return;

        const contentType = (article.contentType as ContentType) || 'article';
        const { editorContent, chaptersList, audioUrl, isBilingual } =
          parseArticleContent(article.content);
        const highlights = article.vocabularyHighlights || [];
        const editorInjected = injectHighlightsToEditorData(editorContent, highlights);
        const chaptersInjected = chaptersList.map((ch) => ({
          ...ch,
          content: injectHighlightsToEditorData(ch.content, highlights),
        }));

        form.reset({
          title: article.title,
          content: contentType === 'book' ? null : editorInjected,
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
          audioUrl,
          isBilingual,
          chapters: contentType === 'book' ? chaptersInjected : [],
          chapterTitle: '',
          chapterContent: null,
          vocabularySetId: article.vocabularySetId || null,
        });
        setIsEditing(true);
        setDraftId(article.id);
        loadedIdRef.current = article.id;
      } catch (err) {
        console.error('Failed to load article for editing:', err);
      }
    };

    loadArticle();
    return () => { cancelled = true; };
  }, [articleId, form]);

  const handleStartEditing = useCallback(
    async (contentType: ContentType = 'article') => {
      autosave.isManualSaveRef.current = false;
      form.setValue('contentType', contentType);
      autosave.setSaveStatus('saving');

      try {
        const initialContent =
          contentType === 'book'
            ? {
                chapters: [
                  {
                    id: '1',
                    title: STUDIO_UI_TEXT.DEFAULT_CHAPTER_1_TITLE,
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
              ? STUDIO_UI_TEXT.UNTITLED_BOOK
              : STUDIO_UI_TEXT.UNTITLED_ARTICLE,
          content: initialContent,
          category: STUDIO_UI_TEXT.UNCLASSIFIED_CATEGORY,
          contentType,
          status: 'DRAFT',
        };

        const data = await mutations.createMutation.mutateAsync(payload);
        setDraftId(data.id);
        loadedIdRef.current = data.id;

        const { editorContent, chaptersList, audioUrl, isBilingual } =
          parseArticleContent(payload.content);

        form.reset({
          ...DEFAULT_FORM_VALUES,
          title: payload.title,
          content: contentType === 'book' ? null : editorContent,
          contentType: payload.contentType,
          category: payload.category,
          audioUrl,
          isBilingual,
          chapters: contentType === 'book' ? chaptersList : [],
        });

        setIsEditing(true);
        autosave.setSaveStatus('saved');
        autosave.setLastSavedAt(new Date());
        navigate(`/reading/studio/${data.id}`, { replace: true });
      } catch (error) {
        console.error('Failed to create initial draft', error);
        autosave.setSaveStatus('error');
        setIsEditing(true);
      }
    },
    [form, mutations.createMutation, navigate, autosave]
  );

  const handleApplyTemplate = useCallback(
    (template: Partial<StudioFormValues>) => {
      const current = form.getValues();
      form.reset({ ...current, ...template });
      setIsEditing(true);
      dirtyRef.current = true;
      autosave.setSaveStatus('saving');
      autosave.debouncedSave();
    },
    [form, autosave]
  );

  return {
    form,
    isEditing,
    draftId,
    saveStatus: autosave.saveStatus,
    lastSavedAt: autosave.lastSavedAt,
    wordCount,
    estimatedReadTime,
    canPublish: publish.canPublish,
    checklist: publish.checklist,
    isCreating: publish.isCreating,
    isUpdating: publish.isUpdating,
    isDeleting: publish.isDeleting,
    handleStartEditing,
    handleApplyTemplate,
    handleSaveDraft: publish.handleSaveDraft,
    handlePublish: publish.handlePublish,
    handleDiscard: publish.handleDiscard,
    activeChapterId: blocks.activeChapterId,
    isOverviewActive: blocks.isOverviewActive,
    chapters: blocks.chapters,
    handleAddChapter: blocks.handleAddChapter,
    handleSelectChapter: blocks.handleSelectChapter,
    handleSelectOverview: blocks.handleSelectOverview,
  };
}
