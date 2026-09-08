import { useState, useMemo } from 'react';
import {
  CheckCircle2, AlertTriangle,
  Settings, Info, XCircle, FileText, Clock,
} from 'lucide-react';
import type { ExamSectionContent, ExamSectionQuestion, ExamContentSettings, SectionValidationIssue } from '../../../types/exam-content-editor.types';
import { validateSections } from '../../../services/exam-content-helpers.service';
import { MediaUpload } from './MediaUpload';

interface AnalysisPanelProps {
  section: ExamSectionContent;
  question: ExamSectionQuestion;
  questionIndex: number;
  totalQuestions: number;
  examSettings?: ExamContentSettings;
  onUpdateSection?: (sectionId: string, updates: Partial<ExamSectionContent>) => void;
  onUpdateSettings?: (updates: Partial<ExamContentSettings>) => void;
}

export function AnalysisPanel({
  section,
  question,
  questionIndex,
  totalQuestions,
  examSettings,
  onUpdateSection,
  onUpdateSettings,
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');

  const correctAnswer = question.options.find((o) => o.isCorrect);

  const sectionIssues = useMemo<SectionValidationIssue[]>(() => validateSections([section]), [section]);

  const errorCount = sectionIssues.filter((i) => i.issueType === 'missing_content' || i.issueType === 'missing_answer' || i.issueType === 'missing_questions').length;
  const warningCount = sectionIssues.filter((i) => i.issueType === 'warning' || i.issueType === 'invalid_format').length;
  const currentIssue = sectionIssues.find((i) => i.questionId === question.id);
  const completedCount = section.questions.length - new Set(sectionIssues.filter((i) => i.questionId).map((i) => i.questionId)).size;

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
              <div className={`p-3 rounded-xl border ${
                currentIssue.issueType === 'missing_content' || currentIssue.issueType === 'missing_answer' || currentIssue.issueType === 'missing_questions'
                  ? 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20'
                  : 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {currentIssue.issueType === 'missing_content' || currentIssue.issueType === 'missing_answer' || currentIssue.issueType === 'missing_questions' ? (
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  <span className="text-[10px] font-bold text-foreground">Câu hiện tại</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{currentIssue.message}</p>
              </div>
            )}

            {/* All Issues */}
            {sectionIssues.length > 0 ? (
              <div className="space-y-1.5">
                {sectionIssues.map((issue, i) => {
                  const isError = issue.issueType === 'missing_content' || issue.issueType === 'missing_answer' || issue.issueType === 'missing_questions';
                  return (
                    <div
                      key={`${issue.questionId || issue.sectionId}-${issue.issueType}-${i}`}
                      className={`flex items-start gap-2 p-2.5 rounded-lg border ${
                        issue.questionId === question.id
                          ? 'border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/20'
                          : 'border-border bg-card'
                      }`}
                    >
                      {isError ? (
                        <XCircle className="w-3 h-3 mt-0.5 shrink-0 text-red-500" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                      )}
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-foreground">
                          {issue.sectionTitle}
                        </div>
                        <div className="text-[9px] text-muted-foreground">{issue.message}</div>
                      </div>
                    </div>
                  );
                })}
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
          <div className="p-4 space-y-5">
            {/* Exam-level settings */}
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Cài đặt bài kiểm tra
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Tên bài kiểm tra</label>
                  <input
                    type="text"
                    value={examSettings?.title || ''}
                    onChange={(e) => onUpdateSettings?.({ title: e.target.value })}
                    className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Mô tả</label>
                  <textarea
                    value={examSettings?.description || ''}
                    onChange={(e) => onUpdateSettings?.({ description: e.target.value })}
                    rows={2}
                    className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Thời gian (phút)</label>
                    <input
                      type="number"
                      value={examSettings?.duration || 0}
                      min={0}
                      onChange={(e) => onUpdateSettings?.({ duration: Number(e.target.value) })}
                      className="w-full text-[13px] font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Điểm tối đa</label>
                    <input
                      type="number"
                      value={examSettings?.maxScore || 0}
                      min={0}
                      onChange={(e) => onUpdateSettings?.({ maxScore: Number(e.target.value) })}
                      className="w-full text-[13px] font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Điểm đậu</label>
                    <input
                      type="number"
                      value={examSettings?.passingScore || 0}
                      min={0}
                      onChange={(e) => onUpdateSettings?.({ passingScore: Number(e.target.value) })}
                      className="w-full text-[13px] font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Loại bài thi</label>
                    <select
                      value={examSettings?.examType || 'FULL_MOCK'}
                      onChange={(e) => onUpdateSettings?.({ examType: e.target.value })}
                      className="w-full text-[13px] font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    >
                      <option value="FULL_MOCK">Full Mock</option>
                      <option value="MINI_TEST">Mini Test</option>
                      <option value="PRACTICE">Practice</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border" />

            {/* Section-level settings */}
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                Cài đặt Section
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Loại section</label>
                  <select
                    value={section.sectionType}
                    onChange={(e) => onUpdateSection?.(section.id, { sectionType: e.target.value as ExamSectionContent['sectionType'] })}
                    className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  >
                    <option value="listening">Listening</option>
                    <option value="reading">Reading</option>
                    <option value="speaking">Speaking</option>
                    <option value="writing">Writing</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Giới hạn thời gian (phút)
                  </label>
                  <input
                    type="number"
                    value={section.durationMinutes}
                    min={0}
                    onChange={(e) => onUpdateSection?.(section.id, { durationMinutes: Number(e.target.value) })}
                    className="w-full text-[13px] font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Tiêu đề section</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => onUpdateSection?.(section.id, { title: e.target.value })}
                    className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Hướng dẫn</label>
                  <textarea
                    value={section.instruction || ''}
                    onChange={(e) => onUpdateSection?.(section.id, { instruction: e.target.value || undefined })}
                    rows={2}
                    placeholder="Nhập hướng dẫn cho section này..."
                    className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
                  />
                </div>
                {section.sectionType === 'listening' && (
                  <MediaUpload
                    type="audio"
                    value={section.audioUrl}
                    onChange={(url) => onUpdateSection?.(section.id, { audioUrl: url })}
                    label="Âm thanh section"
                  />
                )}
                {section.sectionType === 'listening' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> Kịch bản nghe (Script)
                    </label>
                    <textarea
                      value={section.scriptText || ''}
                      onChange={(e) => onUpdateSection?.(section.id, { scriptText: e.target.value || undefined })}
                      rows={4}
                      placeholder="Nhập kịch bản cho phần nghe..."
                      className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
