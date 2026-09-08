import { useState, useRef } from 'react';
import { Clock, HelpCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { CERTIFICATE_TYPE_TEMPLATES } from '../../constants/certification.constants';

interface AddExamFormProps {
  selectedCertType: string;
  existingExamCount: number;
  onSubmit: (config: {
    title: string;
    certificationType: string;
    examType: string;
    duration: number;
    totalQuestions: number;
    maxScore: number;
    passScore: number;
    sections: Array<{ title: string; sectionType: string; instruction?: string; durationMinutes?: number; questionCount?: number }>;
  }) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const AddExamForm = ({ selectedCertType, existingExamCount, onSubmit, onBack, isSubmitting = false }: AddExamFormProps) => {
  const template = CERTIFICATE_TYPE_TEMPLATES[selectedCertType];
  const [examTitle, setExamTitle] = useState(() => {
    const tmpl = CERTIFICATE_TYPE_TEMPLATES[selectedCertType];
    const num = existingExamCount + 1;
    return `${tmpl.label} Practice Test ${num}`;
  });
  const isConfirmingRef = useRef(false);

  if (!template) return null;

  const handleConfirm = () => {
    if (isConfirmingRef.current) return;
    isConfirmingRef.current = true;
    onSubmit({
      title: examTitle || template.label + ' Practice Test',
      certificationType: template.id,
      examType: 'FULL_MOCK',
      duration: template.defaultDuration,
      totalQuestions: template.defaultTotalQuestions,
      maxScore: template.defaultMaxScore,
      passScore: template.defaultPassScore,
      sections: template.sections.map((s) => ({
        title: s.title,
        sectionType: s.sectionType,
        instruction: s.instruction,
        durationMinutes: s.durationMinutes,
        questionCount: s.questionCount,
      })),
    });
    isConfirmingRef.current = false;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Tên bài kiểm tra
        </label>
        <input
          value={examTitle}
          onChange={(e) => setExamTitle(e.target.value)}
          className="w-full text-sm font-bold text-foreground bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={template.label + ' Practice Test'}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 bg-secondary/50 rounded-lg text-center">
          <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
          <div className="text-xs font-extrabold text-foreground">{template.defaultDuration} min</div>
          <div className="text-[10px] text-muted-foreground">Thời gian</div>
        </div>
        <div className="p-2.5 bg-secondary/50 rounded-lg text-center">
          <HelpCircle className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <div className="text-xs font-extrabold text-foreground">{template.defaultTotalQuestions}</div>
          <div className="text-[10px] text-muted-foreground">Câu hỏi</div>
        </div>
        <div className="p-2.5 bg-secondary/50 rounded-lg text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
          <div className="text-xs font-extrabold text-foreground">{template.defaultPassScore}</div>
          <div className="text-[10px] text-muted-foreground">{template.passScoreLabel}</div>
        </div>
        <div className="p-2.5 bg-secondary/50 rounded-lg text-center">
          <FileText className="w-4 h-4 text-amber-600 mx-auto mb-1" />
          <div className="text-xs font-extrabold text-foreground">{template.sections.length} phần</div>
          <div className="text-[10px] text-muted-foreground">Sections</div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Cấu trúc sections
        </label>
        {template.sections.map((sec, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50"
          >
            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black flex items-center justify-center flex-shrink-0">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-foreground">{sec.title}</div>
              <div className="text-[10px] text-muted-foreground truncate">{sec.instruction}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] font-bold text-foreground">{sec.durationMinutes} min</div>
              <div className="text-[10px] text-muted-foreground">{sec.questionCount} câu</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
      >
        ← Chọn loại chứng chỉ khác
      </button>

      <div className="flex justify-end">
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 h-9 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {isSubmitting ? 'Đang tạo...' : 'Tạo bài kiểm tra'}
        </button>
      </div>
    </div>
  );
};
