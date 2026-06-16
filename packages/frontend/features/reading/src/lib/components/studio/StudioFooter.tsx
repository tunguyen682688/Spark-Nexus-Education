import React, { useState } from 'react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { Trash2, Save, Send, AlertCircle, Loader2 } from 'lucide-react';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';

interface StudioFooterProps {
  onDiscard: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  canPublish: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const StudioFooter: React.FC<StudioFooterProps> = ({
  onDiscard,
  onSaveDraft,
  onPublish,
  canPublish,
  saveStatus,
  lastSavedAt,
  isCreating,
  isUpdating,
  isDeleting,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const isWorking = isCreating || isUpdating || saveStatus === 'saving';

  const formatLastSaved = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-20 border-t border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-[#0A0D14]/80 backdrop-blur-xl sticky bottom-0 z-40 px-6 flex items-center justify-between shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)]">
      
      {/* Left: Discard / Delete */}
      <div className="relative">
        {showConfirm ? (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900/50">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-500" />
            <span className="text-sm font-semibold text-red-800 dark:text-red-200">{STUDIO_UI_TEXT.CONFIRM_DISCARD_TITLE}</span>
            <div className="flex gap-2 ml-2">
              <Button size="sm" variant="outline" className="h-7 text-xs bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setShowConfirm(false)}>
                {STUDIO_UI_TEXT.CONFIRM_NO}
              </Button>
              <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={onDiscard} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                {STUDIO_UI_TEXT.CONFIRM_YES}
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2 font-semibold"
            onClick={() => setShowConfirm(true)}
            disabled={isWorking || isDeleting}
          >
            <Trash2 className="w-4 h-4" />
            {STUDIO_UI_TEXT.BTN_CANCEL}
          </Button>
        )}
      </div>

      {/* Right: AutoSave indicator + Actions */}
      <div className="flex items-center gap-4">
        {/* AutoSave Indicator */}
        <div className="flex items-center gap-2 mr-2 text-xs font-medium">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              {STUDIO_UI_TEXT.AUTOSAVE_SAVING}
            </span>
          )}
          {saveStatus === 'saved' && lastSavedAt && (
            <span className="text-slate-400 dark:text-slate-500">
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

        <Button 
          variant="outline" 
          className="bg-white/50 dark:bg-[#121826]/80 hover:bg-white dark:hover:bg-white/5 gap-2 font-semibold border-slate-200/60 dark:border-white/10 shadow-sm transition-all duration-300"
          onClick={onSaveDraft}
          disabled={isWorking}
        >
          <Save className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">{STUDIO_UI_TEXT.BTN_SAVE_DRAFT}</span>
        </Button>

        <Button 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white gap-2 font-semibold shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] px-6 transition-all duration-300 hover:-translate-y-[1px]"
          onClick={onPublish}
          disabled={!canPublish || isWorking}
        >
          {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {STUDIO_UI_TEXT.BTN_PUBLISH}
        </Button>
      </div>

    </div>
  );
};
