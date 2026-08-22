import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction, Upload } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

type PlaceholderType = 'createExam' | 'importQuestions';

interface PlaceholderContentProps {
  type: PlaceholderType;
}

const ICONS: Record<PlaceholderType, typeof Construction> = {
  createExam: Construction,
  importQuestions: Upload,
};

const BG_COLORS: Record<PlaceholderType, string> = {
  createExam: 'bg-indigo-100 dark:bg-indigo-950/60',
  importQuestions: 'bg-emerald-100 dark:bg-emerald-950/60',
};

const ICON_COLORS: Record<PlaceholderType, string> = {
  createExam: 'text-indigo-600',
  importQuestions: 'text-emerald-600',
};

export function PlaceholderContent({ type }: PlaceholderContentProps) {
  const navigate = useNavigate();
  const text = CERTIFICATION_UI_TEXT.placeholderPages[type];
  const bc = CERTIFICATION_UI_TEXT.breadcrumbs;
  const Icon = ICONS[type];

  return (
    <div className="w-full space-y-6 pb-20">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <button onClick={() => navigate('/certification/creator-dashboard')} className="hover:text-foreground transition-colors cursor-pointer">
          {bc.creatorDashboard}
        </button>
        <span>&gt;</span>
        <span className="text-foreground font-bold">{bc[type === 'createExam' ? 'createExam' : 'importQuestions']}</span>
      </div>

      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className={`w-16 h-16 rounded-2xl ${BG_COLORS[type]} flex items-center justify-center`}>
          <Icon className={`w-8 h-8 ${ICON_COLORS[type]}`} />
        </div>
        <h1 className="text-2xl font-black text-foreground">{text.title}</h1>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {text.description}
        </p>
        <Button
          onClick={() => navigate('/certification/creator-dashboard')}
          variant="outline"
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {text.backBtn}
        </Button>
      </div>
    </div>
  );
}
