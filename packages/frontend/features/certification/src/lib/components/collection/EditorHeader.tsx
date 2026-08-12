import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Save,
  Send,
  MoreVertical,
} from 'lucide-react';
import { Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { EditorLogicState } from '../../types/container-collection-editor.types';

const bc = CERTIFICATION_UI_TEXT.breadcrumbs;
const text = CERTIFICATION_UI_TEXT.collectionEditor;

type Props = Pick<EditorLogicState, 'isEditMode' | 'details' | 'isOnline' | 'syncStatus' | 'autosavedText' | 'isDirty' | 'isSaving' | 'handlePreviewCollection' | 'handleSaveDraft' | 'handlePublishCollection' | 'handleBackToDashboard' | 'handleRetrySync'>;

export function EditorHeader(props: Props) {
  const { isEditMode, details, isOnline, syncStatus, autosavedText, isDirty, isSaving, handlePreviewCollection, handleSaveDraft, handlePublishCollection, handleBackToDashboard, handleRetrySync } = props;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <button onClick={handleBackToDashboard} className="hover:text-foreground transition-colors cursor-pointer">{bc.creatorDashboard}</button>
        <span>&gt;</span>
        <button onClick={handleBackToDashboard} className="hover:text-foreground transition-colors cursor-pointer">{bc.collections}</button>
        {isEditMode && (
          <>
            <span>&gt;</span>
            <span className="text-foreground font-bold">{details.title || 'Untitled'}</span>
            <span>&gt;</span>
            <span className="text-indigo-600 font-extrabold">{bc.edit}</span>
          </>
        )}
        {!isEditMode && (
          <>
            <span>&gt;</span>
            <span className="text-indigo-600 font-extrabold">{bc.createCollection}</span>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{isEditMode ? text.title : 'Create New Collection'}</h1>
            <Badge className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full border-none">{isEditMode ? text.badgeDraft : 'New'}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">{isEditMode ? text.subtitle : 'Set up your collection structure and add exams'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isOnline && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Offline</span>
            </div>
          )}

          <div className={`flex items-center gap-1 text-xs font-bold mr-2 ${syncStatus === 'error' ? 'text-rose-600' : syncStatus === 'syncing' || syncStatus === 'retrying' ? 'text-amber-600' : 'text-emerald-600'}`}>
            {syncStatus === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : syncStatus === 'syncing' || syncStatus === 'retrying' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{autosavedText}</span>
            {isDirty && syncStatus === 'synced' && <span className="text-amber-500 ml-1">(chưa lưu)</span>}
            {syncStatus === 'error' && (
              <button onClick={handleRetrySync} className="ml-1 text-rose-600 hover:text-rose-700 underline cursor-pointer font-extrabold">Thử lại</button>
            )}
          </div>

          <Button onClick={handlePreviewCollection} variant="outline" className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-1.5 cursor-pointer shadow-sm">
            <Eye className="w-4 h-4" />
            <span>{text.previewBtn}</span>
          </Button>

          <Button onClick={handleSaveDraft} variant="outline" disabled={isSaving} className="text-xs font-bold py-2 px-3.5 h-9 rounded-xl border-border hover:bg-secondary flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50">
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : text.saveDraftBtn}</span>
          </Button>

          <Button onClick={handlePublishCollection} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 h-9 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50">
            <Send className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : text.publishBtn}</span>
          </Button>

          <button className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm cursor-pointer">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
