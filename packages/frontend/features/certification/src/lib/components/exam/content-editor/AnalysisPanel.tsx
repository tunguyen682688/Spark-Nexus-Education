import { useState, useMemo } from 'react';
import {
  CheckCircle2, AlertTriangle,
  Settings, Info, XCircle, FileText, Clock,
} from 'lucide-react';
import type { ExamSectionContent, ExamSectionQuestion } from '../../../types/exam-content-editor.types';
import { MediaUpload } from './MediaUpload';

interface AnalysisPanelProps {
  section: ExamSectionContent;
  question: ExamSectionQuestion;
  questionIndex: number;
  totalQuestions: number;
  onUpdateSection?: (sectionId: string, updates: Partial<ExamSectionContent>) => void;
}

type ValidationIssue = {
  questionId: string;
  questionOrder: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
};

export function AnalysisPanel({
  section,
  question,
  questionIndex,
  totalQuestions,
  onUpdateSection,
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');

  const correctAnswer = question.options.find((o) => o.isCorrect);

  const validationIssues = useMemo<ValidationIssue[]>(() => {
    const issues: ValidationIssue[] = [];
    for (let idx = 0; idx < section.questions.length; idx++) {
      const q = section.questions[idx];
      const qNum = q.order || idx + 1;
      if (!q.questionText?.trim()) {
        issues.push({ questionId: q.id, questionOrder: qNum, field: 'questionText', message: 'Thieu noi dung cau hoi', severity: 'error' });
      }
      if (q.options.length > 0) {
        if (q.options.length < 2) {
          issues.push({ questionId: q.id, questionOrder: qNum, field: 'options', message: 'It nhat 2 dap an', severity: 'error' });
        }
        if (!q.options.some((o) => o.isCorrect)) {
          issues.push({ questionId: q.id, questionOrder: qNum, field: 'correctAnswer', message: 'Chua chon dap an dung', severity: 'error' });
        }
        if (q.options.some((o) => !o.text?.trim())) {
          issues.push({ questionId: q.id, questionOrder: qNum, field: 'optionText', message: 'Co dap an chua nhap noi dung', severity: 'warning' });
        }
      }
      if (!q.explanation?.trim()) {
        issues.push({ questionId: q.id, questionOrder: qNum, field: 'explanation', message: 'Thieu giai thich', severity: 'warning' });
      }
      if (q.passageGroupId && !q.passageText?.trim()) {
        issues.push({ questionId: q.id, questionOrder: qNum, field: 'passageText', message: 'Thieu noi dung passage/script', severity: 'error' });
      }
    }
    return issues;
  }, [section.questions]);

  const errorCount = validationIssues.filter((i) => i.severity === 'error').length;
  const warningCount = validationIssues.filter((i) => i.severity === 'warning').length;
  const currentIssue = validationIssues.find((i) => i.questionId === question.id);
  const completedCount = section.questions.length - new Set(validationIssues.filter((i) => i.severity === 'error').map((i) => i.questionId)).size;

  return (
    <div className="w-80 h-full flex flex-col bg-card border-l border-border">
      {/* Tabs */}
      <div className="flex items-center border-b border-border shrink-0">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-[11px] font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'info'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          THONG TIN
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-[11px] font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          CAI DAT
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'info' ? (
          <div className="p-4 space-y-4">
            {/* Validation Summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <div className="flex-1 text-center">
                <div className="text-[20px] font-black text-emerald-600">{completedCount}</div>
                <div className="text-[9px] text-muted-foreground">Hoan thanh</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex-1 text-center">
                <div className="text-[20px] font-black text-red-600">{errorCount}</div>
                <div className="text-[9px] text-muted-foreground">Loi</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex-1 text-center">
                <div className="text-[20px] font-black text-amber-600">{warningCount}</div>
                <div className="text-[9px] text-muted-foreground">Canh bao</div>
              </div>
            </div>

            {/* Current Question Issue */}
            {currentIssue && (
              <div className={`p-3 rounded-xl border ${currentIssue.severity === 'error' ? 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20' : 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {currentIssue.severity === 'error' ? (
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span className="text-[10px] font-bold text-foreground">Cau hien tai</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{currentIssue.message}</p>
              </div>
            )}

            {/* All Issues */}
            {validationIssues.length > 0 ? (
              <div className="space-y-1.5">
                {validationIssues.map((issue, i) => (
                  <div
                    key={`${issue.questionId}-${issue.field}-${i}`}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border ${
                      issue.questionId === question.id
                        ? 'border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/20'
                        : 'border-border bg-card'
                    }`}
                  >
                    {issue.severity === 'error' ? (
                      <XCircle className="w-3 h-3 mt-0.5 shrink-0 text-red-500" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold text-foreground">
                        Cau {issue.questionOrder}
                      </div>
                      <div className="text-[9px] text-muted-foreground">{issue.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Tat ca cau hoi hop le!</div>
              </div>
            )}

            {/* Question Info */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Thong tin cau hoi
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {[
                  { label: 'Part', value: `Part ${section.order} - ${section.title}` },
                  { label: 'So thu tu', value: question.order || questionIndex + 1 },
                  { label: 'Do kho', value: question.difficulty },
                  { label: 'Ky nang', value: section.sectionType },
                  { label: 'Dap an dung', value: correctAnswer ? `${correctAnswer.label}. ${correctAnswer.text}` : 'Chua chon' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.label}</span>
                    <span className="text-[10px] font-semibold text-foreground text-right max-w-[160px] truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completion Checklist */}
            <div className="p-4 rounded-xl border border-border bg-card">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Tien do hoan thanh
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Noi dung cau hoi', done: !!question.questionText?.trim() },
                  { label: 'Dap an', done: question.options.some((o) => o.isCorrect) },
                  { label: 'Giai thich', done: !!question.explanation?.trim() },
                  ...(question.passageGroupId ? [{ label: 'Passage/Script', done: !!question.passageText?.trim() }] : []),
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 text-[10px]">
                    <CheckCircle2
                      className={`w-4 h-4 ${item.done ? 'text-emerald-500' : 'text-muted-foreground/20'}`}
                    />
                    <span className={item.done ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Settings Tab */
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Loai section</label>
              <select
                value={section.sectionType}
                onChange={(e) => onUpdateSection?.(section.id, { sectionType: e.target.value as ExamSectionContent['sectionType'] })}
                className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              >
                <option value="listening">Listening</option>
                <option value="reading">Reading</option>
                <option value="speaking">Speaking</option>
                <option value="writing">Writing</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Gioi han thoi gian (phut)
              </label>
              <input
                type="number"
                value={section.durationMinutes}
                min={0}
                onChange={(e) => onUpdateSection?.(section.id, { durationMinutes: Number(e.target.value) })}
                className="w-full text-[13px] font-semibold text-foreground bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tieu de section</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => onUpdateSection?.(section.id, { title: e.target.value })}
                className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Huong dan</label>
              <textarea
                value={section.instruction || ''}
                onChange={(e) => onUpdateSection?.(section.id, { instruction: e.target.value || undefined })}
                rows={2}
                placeholder="Nhap huong dan cho section nay..."
                className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
              />
            </div>
            {section.sectionType === 'listening' && (
              <MediaUpload
                type="audio"
                value={section.audioUrl}
                onChange={(url) => onUpdateSection?.(section.id, { audioUrl: url })}
                label="Am thanh section"
              />
            )}
            {section.sectionType === 'listening' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> Kich ban nghe (Script)
                </label>
                <textarea
                  value={section.scriptText || ''}
                  onChange={(e) => onUpdateSection?.(section.id, { scriptText: e.target.value || undefined })}
                  rows={4}
                  placeholder="Nhap kich ban cho phan nghe..."
                  className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
