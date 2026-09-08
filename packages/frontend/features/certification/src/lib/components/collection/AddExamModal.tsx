import { useState } from 'react';
import { X, FileText, Clock, HelpCircle, ChevronRight, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, Badge } from '@spark-nest-ed/frontend-shared-components';
import {
  CERTIFICATE_TYPE_TEMPLATES,
  CERTIFICATE_TYPE_OPTIONS,
} from '../../constants/certification.constants';
import { AddExamForm } from './AddExamForm';
import type { ExamCreationStatus, InitProgress } from '../../hooks/editor/use-exam-handlers';

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
  onNavigateToExam?: (examId: string) => void;
  onResetStatus?: () => void;
  onRetryInitialization?: (examId: string) => void;
  creationStatus?: ExamCreationStatus;
  createdExamId?: string | null;
  failedExamId?: string | null;
  initProgress?: InitProgress | null;
  chapterTitle?: string;
  existingExamCount?: number;
}

export const AddExamModal = ({
  isOpen,
  onClose,
  onConfirm,
  onNavigateToExam,
  onResetStatus,
  onRetryInitialization,
  creationStatus = 'idle',
  createdExamId,
  failedExamId,
  initProgress,
  chapterTitle,
  existingExamCount = 0,
}: AddExamModalProps) => {
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
    onResetStatus?.();
    onClose();
  };

  const handleFormSubmit = (config: Parameters<typeof onConfirm>[0]) => {
    onConfirm(config);
    // Don't close — stay open to show progress
  };

  const handleGoToExam = () => {
    if (createdExamId) {
      onNavigateToExam?.(createdExamId);
    }
  };

  const isCreating = creationStatus === 'creating';
  const isInitializing = creationStatus === 'initializing';
  const isLoading = isCreating || isInitializing;
  const isCompleted = creationStatus === 'completed';
  const isError = creationStatus === 'error';

  // Determine header info based on current state
  const headerTitle = isCreating
    ? 'Đang tạo bài kiểm tra...'
    : isInitializing
      ? 'Đang khởi tạo câu hỏi...'
      : isCompleted
        ? 'Tạo bài kiểm tra thành công!'
        : isError
          ? 'Tạo bài kiểm tra thất bại'
          : step === 'select'
            ? 'Thêm bài kiểm tra mới'
            : `Xác nhận: ${template?.label}`;

  const headerSubtitle = isCreating
    ? 'Hệ thống đang tạo bài kiểm tra. Vui lòng không đóng cửa sổ.'
    : isInitializing
      ? 'Bài kiểm tra đã được tạo. Hệ thống đang khởi tạo câu hỏi trong nền...'
      : isCompleted
        ? `Bài kiểm tra "${template?.label}" đã sẵn sàng với ${template?.defaultTotalQuestions} câu hỏi.`
        : isError
          ? 'Đã có lỗi xảy ra. Vui lòng thử lại.'
          : step === 'select'
            ? `Chọn loại chứng chỉ cho "${chapterTitle || 'chapter'}"`
            : template?.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={isLoading ? undefined : handleClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            {isLoading && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
            )}
            {isCompleted && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            )}
            {isError && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-extrabold text-foreground">{headerTitle}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{headerSubtitle}</p>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {/* Step: Select certificate type */}
          {step === 'select' && !isLoading && !isCompleted && !isError && (
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

          {/* Step: Confirm form */}
          {step === 'confirm' && selectedCertType && !isLoading && !isCompleted && !isError && (
            <AddExamForm
              selectedCertType={selectedCertType}
              existingExamCount={existingExamCount}
              onSubmit={handleFormSubmit}
              onBack={() => setStep('select')}
              isSubmitting={isLoading}
            />
          )}

          {/* Step: Creating/Initializing progress */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                </div>
                {isInitializing && (
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 animate-spin" />
                )}
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-foreground">
                  {isInitializing ? 'Đang khởi tạo câu hỏi...' : 'Đang tạo bài kiểm tra'}
                </p>
                {isInitializing && initProgress ? (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold">
                      {initProgress.phaseLabel || 'Đang xử lý...'}
                    </p>
                    {initProgress.phase !== 'preparing' && (
                      <p className="text-[10px] text-muted-foreground">
                        {initProgress.questionsCreated}/{initProgress.totalQuestions} câu hỏi
                        {initProgress.currentSection && initProgress.currentSection !== 'Done' && initProgress.currentSection !== '' && (
                          <span> — {initProgress.currentSection}</span>
                        )}
                      </p>
                    )}
                  </div>
                ) : isInitializing ? (
                  <p className="text-xs text-muted-foreground">Hệ thống đang chuẩn bị câu hỏi...</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {template?.defaultTotalQuestions || 200} câu hỏi đang được tạo...
                  </p>
                )}
              </div>
              {isInitializing && initProgress && initProgress.phase !== 'preparing' && (
                <div className="w-full max-w-sm space-y-2">
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${initProgress?.percentage ?? 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{initProgress?.percentage ?? 0}%</span>
                    <span>{initProgress?.questionsCreated ?? 0}/{initProgress?.totalQuestions ?? '...'} câu hỏi</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step: Completed */}
          {isCompleted && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-foreground">Bài kiểm tra đã sẵn sàng!</p>
                <p className="text-xs text-muted-foreground">
                  {template?.defaultTotalQuestions || 200} câu hỏi đã được khởi tạo thành công.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {template?.defaultDuration} phút
                </span>
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> {template?.defaultTotalQuestions} câu
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" /> {template?.sections.length} phần
                </span>
              </div>
              <Button
                onClick={handleGoToExam}
                className="flex items-center gap-2 font-bold text-sm px-6 py-3 h-11 rounded-xl cursor-pointer"
              >
                Vào chỉnh sửa bài kiểm tra
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step: Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
                <X className="w-10 h-10 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-foreground">Khởi tạo câu hỏi thất bại</p>
                <p className="text-xs text-muted-foreground">
                  {failedExamId
                    ? 'Bài kiểm tra đã được tạo nhưng câu hỏi chưa hoàn tất. Nhấn "Thử lại" để khởi tạo lại.'
                    : 'Đã xảy ra lỗi trong quá trình tạo. Vui lòng thử lại.'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {failedExamId && onRetryInitialization && (
                  <Button
                    onClick={() => onRetryInitialization(failedExamId)}
                    className="font-bold text-sm px-6 py-3 h-11 rounded-xl cursor-pointer"
                  >
                    <Loader2 className="w-4 h-4 mr-2" />
                    Thử lại
                  </Button>
                )}
                <Button
                  onClick={() => onResetStatus?.()}
                  variant="outline"
                  className="font-bold text-sm px-6 py-3 h-11 rounded-xl cursor-pointer"
                >
                  Tạo mới
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
          {!isLoading && (
            <Button
              onClick={handleClose}
              variant="outline"
              className="text-xs font-bold py-2 px-4 h-9 rounded-xl cursor-pointer"
            >
              {isCompleted ? 'Đóng' : 'Hủy'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
