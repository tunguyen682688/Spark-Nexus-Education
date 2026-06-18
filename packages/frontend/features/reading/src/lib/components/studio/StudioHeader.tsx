import React, { useState } from 'react';
import { ArrowLeft, Eye, Trash2, Save, Send, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { useNavigate } from 'react-router-dom';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface StudioHeaderProps {
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED';
  onPreview: () => void;
  canPreview: boolean;
  
  onDiscard?: () => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  canPublish?: boolean;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: Date | null;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  isEditing?: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({ 
  status, 
  onPreview, 
  canPreview,
  onDiscard,
  onSaveDraft,
  onPublish,
  canPublish,
  saveStatus,
  lastSavedAt,
  isCreating,
  isUpdating,
  isDeleting,
  isEditing,
}) => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const isWorking = isCreating || isUpdating || saveStatus === 'saving';

  const formatLastSaved = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-16 border-b border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-[#0A0D14]/80 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-tight">
            {STUDIO_UI_TEXT.TITLE}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span className={cn(status === 'DRAFT' && 'text-blue-600')}>
                {status === 'DRAFT' && <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />}
                {STUDIO_UI_TEXT.BREADCRUMB_DRAFT}
              </span>
              <span>›</span>
              <span className={cn(status === 'REVIEW' && 'text-amber-600')}>
                {status === 'REVIEW' && <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-600" />}
                {STUDIO_UI_TEXT.BREADCRUMB_REVIEW}
              </span>
              <span>›</span>
              <span className={cn(status === 'PUBLISHED' && 'text-emerald-600')}>
                {status === 'PUBLISHED' && <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                {STUDIO_UI_TEXT.BREADCRUMB_PUBLISH}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isEditing && (
          <>
            {/* AutoSave Indicator */}
            <div className="flex items-center gap-2 mr-2 text-xs font-medium">
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {STUDIO_UI_TEXT.AUTOSAVE_SAVING}
                </span>
              )}
              {saveStatus === 'saved' && lastSavedAt && (
                <span className="text-slate-400 dark:text-slate-500 hidden md:block">
                  {STUDIO_UI_TEXT.AUTOSAVE_SAVED} lúc {formatLastSaved(lastSavedAt)}
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {STUDIO_UI_TEXT.AUTOSAVE_ERROR}
                </span>
              )}
            </div>

            {/* Discard Action */}
            <div className="relative flex items-center">
              {showConfirm ? (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/50 mr-2 animate-in fade-in zoom-in-95 duration-200">
                  <span className="text-xs font-semibold text-red-800 dark:text-red-200 hidden xl:block">{STUDIO_UI_TEXT.CONFIRM_DISCARD_TITLE}</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2 bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50 text-slate-600 dark:text-slate-300" onClick={() => setShowConfirm(false)}>
                    {STUDIO_UI_TEXT.CONFIRM_NO}
                  </Button>
                  <Button size="sm" className="h-7 text-xs px-2 bg-red-600 hover:bg-red-700 text-white" onClick={onDiscard} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                    {STUDIO_UI_TEXT.CONFIRM_YES}
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold h-8 px-2 mr-2"
                  onClick={() => setShowConfirm(true)}
                  disabled={isWorking || isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/50 dark:bg-[#121826]/80 hover:bg-white dark:hover:bg-white/5 gap-2 font-semibold border-slate-200/60 dark:border-white/10 shadow-sm transition-all duration-300"
              onClick={onSaveDraft}
              disabled={isWorking}
            >
              <Save className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 hidden lg:inline">{STUDIO_UI_TEXT.BTN_SAVE_DRAFT}</span>
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-white/50 dark:bg-[#121826]/80 font-medium border-slate-200/60 dark:border-white/10 hover:dark:bg-white/5 transition-all duration-300"
          onClick={onPreview}
          disabled={!canPreview}
        >
          <Eye className="w-4 h-4 text-blue-500" />
          <span className="hidden lg:inline">{STUDIO_UI_TEXT.PREVIEW}</span>
        </Button>

        {isEditing && (
          <Button 
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white gap-2 font-semibold shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all duration-300 hover:-translate-y-[1px] ml-1"
            onClick={onPublish}
            disabled={!canPublish || isWorking}
          >
            {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">{STUDIO_UI_TEXT.BTN_PUBLISH}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
