import { useState } from 'react';
import { X, FileText, Clock, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import {
  CERTIFICATE_TYPE_TEMPLATES,
  CERTIFICATE_TYPE_OPTIONS,
} from '../../constants/certification.constants';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: {
    title: string;
    certificationType: string;
    examType: string;
    duration: number;
    totalQuestions: number;
    maxScore: number;
    passScore: number;
    sections: Array<{ title: string; sectionType: string; instruction?: string; durationMinutes?: number }>;
  }) => void;
  chapterTitle?: string;
  existingExamCount?: number;
}

export const AddExamModal = ({ isOpen, onClose, onConfirm, chapterTitle, existingExamCount = 0 }: AddExamModalProps) => {
  const [selectedCertType, setSelectedCertType] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const template = selectedCertType ? CERTIFICATE_TYPE_TEMPLATES[selectedCertType] : null;

  if (!isOpen) return null;

  const handleSelectCertType = (certType: string) => {
    setSelectedCertType(certType);
    const tmpl = CERTIFICATE_TYPE_TEMPLATES[certType];
    const num = existingExamCount + 1;
    setExamTitle(`${tmpl.label} Practice Test ${num}`);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!template) return;
    onConfirm({
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
      })),
    });
    handleClose();
  };

  const handleClose = () => {
    setSelectedCertType(null);
    setExamTitle('');
    setStep('select');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">
              {step === 'select' ? 'Thêm bài kiểm tra mới' : `Xác nhận: ${template?.label}`}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step === 'select'
                ? `Chọn loại chứng chỉ cho "${chapterTitle || 'chapter'}"`
                : template?.description}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {step === 'select' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CERTIFICATE_TYPE_OPTIONS.map((cert) => {
                const tmpl = CERTIFICATE_TYPE_TEMPLATES[cert.id];
                return (
                  <button
                    key={cert.id}
                    onClick={() => handleSelectCertType(cert.id)}
                    className="p-4 border-2 border-border rounded-xl text-left hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
                        {cert.label}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cert.description}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {tmpl.defaultDuration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> {tmpl.defaultTotalQuestions} câu
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {tmpl.sections.length} phần
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 'confirm' && template && (
            <div className="space-y-4">
              {/* Title input */}
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

              {/* Stats grid */}
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

              {/* Sections preview */}
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

              {/* Back button */}
              <button
                onClick={() => setStep('select')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                ← Chọn loại chứng chỉ khác
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
          <Button
            onClick={handleClose}
            variant="outline"
            className="text-xs font-bold py-2 px-4 h-9 rounded-xl cursor-pointer"
          >
            Hủy
          </Button>
          {step === 'confirm' && (
            <Button
              onClick={handleConfirm}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 h-9 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Tạo bài kiểm tra
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
