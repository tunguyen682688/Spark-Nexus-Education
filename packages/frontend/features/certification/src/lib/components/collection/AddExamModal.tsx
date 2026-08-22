import { useState } from 'react';
import { X, FileText, Clock, HelpCircle, ChevronRight } from 'lucide-react';
import { Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import {
  CERTIFICATE_TYPE_TEMPLATES,
  CERTIFICATE_TYPE_OPTIONS,
} from '../../constants/certification.constants';
import { AddExamForm } from './AddExamForm';

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
    sections: Array<{ title: string; sectionType: string; instruction?: string; durationMinutes?: number; questionCount?: number }>;
  }) => void;
  chapterTitle?: string;
  existingExamCount?: number;
}

export const AddExamModal = ({ isOpen, onClose, onConfirm, chapterTitle, existingExamCount = 0 }: AddExamModalProps) => {
  const [selectedCertType, setSelectedCertType] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const template = selectedCertType ? CERTIFICATE_TYPE_TEMPLATES[selectedCertType] : null;

  if (!isOpen) return null;

  const handleSelectCertType = (certType: string) => {
    setSelectedCertType(certType);
    setStep('confirm');
  };

  const handleClose = () => {
    setSelectedCertType(null);
    setStep('select');
    onClose();
  };

  const handleFormSubmit = (config: Parameters<typeof onConfirm>[0]) => {
    onConfirm(config);
    handleClose();
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

          {step === 'confirm' && selectedCertType && (
            <AddExamForm
              selectedCertType={selectedCertType}
              existingExamCount={existingExamCount}
              onSubmit={handleFormSubmit}
              onBack={() => setStep('select')}
            />
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
        </div>
      </div>
    </div>
  );
};
