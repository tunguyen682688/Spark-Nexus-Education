import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

export const CertificationAnalyticsPage = () => {
  const navigate = useNavigate();
  const text = CERTIFICATION_UI_TEXT.placeholderPages.analytics;
  const bc = CERTIFICATION_UI_TEXT.breadcrumbs;

  return (
    <div className="w-full space-y-6 pb-20">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <button onClick={() => navigate('/certification/creator-dashboard')} className="hover:text-foreground transition-colors cursor-pointer">
          {bc.creatorDashboard}
        </button>
        <span>&gt;</span>
        <span className="text-foreground font-bold">{bc.analytics}</span>
      </div>

      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-blue-600" />
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
};
