import { Award, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import type { CertificationUIText } from '../../constants/certification.constants';

interface CompletedCollectionsSidebarProps {
  certificatesList: Array<{
    id: string;
    title: string;
    issuedDate: string;
    score: string;
  }>;
  onViewCertificate: (id: string) => void;
  onExploreMoreExams: () => void;
  text: CertificationUIText['completedCollections'];
}

export const CompletedCollectionsSidebar = ({
  certificatesList,
  onViewCertificate,
  onExploreMoreExams,
  text,
}: CompletedCollectionsSidebarProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold">
            {text.widgets.certificatesTitle} ({certificatesList.length})
          </CardTitle>
          <button onClick={onExploreMoreExams} className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer">
            {text.widgets.viewAllBtn}
          </button>
        </CardHeader>
        <CardContent className="space-y-3">
          {certificatesList.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
              Chưa có chứng chỉ được cấp. Hãy hoàn thành bài thi để nhận chứng chỉ!
            </div>
          ) : (
            certificatesList.slice(0, 3).map((cert) => (
              <div
                key={cert.id}
                onClick={() => onViewCertificate(cert.id)}
                className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 flex items-center justify-between cursor-pointer hover:border-purple-400 transition-all shadow-sm group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Award className="w-5 h-5 text-purple-600 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-xs text-purple-950 dark:text-purple-200 truncate">
                      {cert.title}
                    </h5>
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-mono">
                      {cert.issuedDate} • {cert.score}
                    </span>
                  </div>
                </div>
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-bold flex-shrink-0">
                  PDF
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-900/40 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h5 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
              {text.widgets.readyTitle}
            </h5>
          </div>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            {text.widgets.readyDesc}
          </p>
          <Button
            onClick={onExploreMoreExams}
            className="w-full text-xs font-bold py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer"
          >
            {text.widgets.exploreBtn}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};