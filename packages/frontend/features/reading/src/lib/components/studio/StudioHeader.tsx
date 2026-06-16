import React from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { useNavigate } from 'react-router-dom';
import { STUDIO_UI_TEXT } from '../../constants/studio-ui-text';

interface StudioHeaderProps {
  status: 'DRAFT' | 'REVIEW' | 'PUBLISHED';
  onPreview: () => void;
  canPreview: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({ status, onPreview, canPreview }) => {
  const navigate = useNavigate();

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
              <span className={status === 'DRAFT' ? 'text-blue-600' : ''}>
                {status === 'DRAFT' && <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />}
                {STUDIO_UI_TEXT.BREADCRUMB_DRAFT}
              </span>
              <span>›</span>
              <span className={status === 'REVIEW' ? 'text-amber-600' : ''}>
                {status === 'REVIEW' && <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-600" />}
                {STUDIO_UI_TEXT.BREADCRUMB_REVIEW}
              </span>
              <span>›</span>
              <span className={status === 'PUBLISHED' ? 'text-emerald-600' : ''}>
                {status === 'PUBLISHED' && <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                {STUDIO_UI_TEXT.BREADCRUMB_PUBLISH}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-white/50 dark:bg-[#121826]/80 font-medium border-slate-200/60 dark:border-white/10 hover:dark:bg-white/5 transition-all duration-300"
          onClick={onPreview}
          disabled={!canPreview}
        >
          <Eye className="w-4 h-4 text-blue-500" />
          {STUDIO_UI_TEXT.PREVIEW}
        </Button>
      </div>
    </div>
  );
};
