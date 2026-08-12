export type ContentType = 'article' | 'book' | 'book_chapter' | 'news' | 'blog';

export type ArticleStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED';

export interface EditorJsBlockData {
  text?: string;
  level?: number;
  items?: string[];
  style?: string;
  caption?: string;
  url?: string;
  file?: {
    url: string;
  };
  original?: string;
  translation?: string;
}

export interface EditorJsBlock {
  id?: string;
  type: string;
  data: EditorJsBlockData;
}

export interface EditorJsOutputData {
  time?: number;
  blocks: EditorJsBlock[];
  version?: string;
}

export interface BookContentPayload {
  chapters: { id: string; title: string; content: EditorJsOutputData | null; isDraft: boolean }[];
  audioUrl: string | null;
  isBilingual: boolean;
}

export interface ArticleContentPayload {
  editorData: EditorJsOutputData | null;
  audioUrl: string | null;
  isBilingual: boolean;
}

export type StudioContentPayload = BookContentPayload | ArticleContentPayload;

export interface StudioFormValues {
  title: string;
  content: EditorJsOutputData | null;
  summary: string;
  contentType: ContentType;
  category: string;
  difficulty: string; // CEFR level: A1–C2
  tags: string[];
  thumbnailUrl: string | null;
  sourceUrl: string | null;
  author: string | null;
  status: ArticleStatus;
  bookId?: string; // For book chapters
  chapterIndex?: number; // For book chapters
  targetLanguage?: string;
  audioUrl?: string | null;
  isBilingual?: boolean;
  publishedAt?: string;
  chapters?: { id: string; title: string; content: EditorJsOutputData | null; isDraft: boolean }[];
  chapterTitle?: string;
  chapterContent?: EditorJsOutputData | null;
  vocabularySetId?: string | null;
}

export interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  contentType: ContentType;
  defaultValues: Partial<StudioFormValues>;
}

export interface ArticleHighlightPayload {
  blockId: string;
  wordIndex: number;
  occurrenceText: string;
  entryId: string;
  customDefinition?: string;
  customExample?: string;
  customExampleTrans?: string;
}

export interface CreateArticlePayload {
  title: string;
  content: StudioContentPayload | EditorJsOutputData | string | null;
  summary?: string;
  category: string;
  contentType?: ContentType;
  difficulty?: string;
  tags?: string[];
  thumbnailUrl?: string;
  sourceUrl?: string;
  author?: string;
  status?: ArticleStatus;
  targetLanguage?: string;
  audioUrl?: string;
  isBilingual?: boolean;
  vocabularySetId?: string;
  highlights?: ArticleHighlightPayload[];
}

export interface UpdateArticlePayload extends Partial<CreateArticlePayload> {
  id: string;
}
