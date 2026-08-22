import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Check, HelpCircle, FileText, Users, MessageSquare,
} from 'lucide-react';
import type { ExamSectionContent, ExamSectionQuestion } from '../../../types/exam-content-editor.types';
import { QuestionTypePicker } from './QuestionTypePicker';
import { PART_TITLES } from './part-titles.constants';
import { MediaUpload } from './MediaUpload';

interface TOEICQuestionEditorProps {
  section: ExamSectionContent;
  question: ExamSectionQuestion;
  questionIndex: number;
  totalQuestions: number;
  onUpdate: (updates: Partial<ExamSectionQuestion>) => void;
  onUpdateGroupPassage: (passageText: string) => void;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
}

function generateTempId(): string {
  return `opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Part-specific configuration ─────────────────────────────────────────────
const PART_CONFIG: Record<number, {
  minOptions: number;
  maxOptions: number;
  questionPlaceholder: string;
  optionPlaceholder: string;
  guidance: string;
  showImage: boolean;
  showAudio: boolean;
  showPassage: boolean;
}> = {
  1: {
    minOptions: 4, maxOptions: 4,
    questionPlaceholder: '(Trống — thường không cần đề bài cho Part 1, chỉ cần ảnh)',
    optionPlaceholder: 'Mô tả bức ảnh',
    guidance: 'Nghe mô tả và chọn câu đúng nhất cho bức ảnh. Mỗi câu là một lời nhận xét về ảnh.',
    showImage: true, showAudio: true, showPassage: false,
  },
  2: {
    minOptions: 3, maxOptions: 3,
    questionPlaceholder: 'Nghe câu hỏi và chọn câu trả lời phù hợp nhất.',
    optionPlaceholder: 'Câu trả lời',
    guidance: 'Nghe câu hỏi, chọn (A), (B) hoặc (C) là câu trả lời phù hợp nhất.',
    showImage: false, showAudio: true, showPassage: false,
  },
  3: {
    minOptions: 4, maxOptions: 4,
    questionPlaceholder: 'Nghe hội thoại, chọn đáp án đúng cho câu hỏi.',
    optionPlaceholder: 'Lựa chọn',
    guidance: 'Nghe hội thoại ngắn (2 người), mỗi hội thoại có 3 câu hỏi. Mỗi câu 4 đáp án A/B/C/D.',
    showImage: false, showAudio: true, showPassage: true,
  },
  4: {
    minOptions: 4, maxOptions: 4,
    questionPlaceholder: 'Nghe bài nói ngắn, chọn đáp án đúng cho câu hỏi.',
    optionPlaceholder: 'Lựa chọn',
    guidance: 'Nghe bài nói ngắn (1 người), mỗi bài có 3 câu hỏi. Mỗi câu 4 đáp án A/B/C/D.',
    showImage: false, showAudio: true, showPassage: true,
  },
  5: {
    minOptions: 4, maxOptions: 4,
    questionPlaceholder: 'The new software system has significantly improved the efficiency of our workflow, ______ the initial training period was quite time-consuming.',
    optionPlaceholder: 'Từ/cụm từ hoàn thành câu',
    guidance: 'Chọn từ hoặc cụm từ phù hợp nhất để hoàn thành câu. Chỉ 1 đáp án đúng.',
    showImage: false, showAudio: false, showPassage: false,
  },
  6: {
    minOptions: 4, maxOptions: 4,
    questionPlaceholder: 'Nội dung điền vào blank',
    optionPlaceholder: 'Lựa chọn',
    guidance: 'Đọc đoạn văn, chọn đáp án đúng cho mỗi chỗ trống. Mỗi đoạn có 4 blank.',
    showImage: false, showAudio: false, showPassage: true,
  },
  7: {
    minOptions: 4, maxOptions: 4,
    questionPlaceholder: 'Đọc đoạn văn và chọn đáp án đúng cho câu hỏi.',
    optionPlaceholder: 'Lựa chọn',
    guidance: 'Đọc đoạn văn (đơn hoặc kép), trả lời các câu hỏi trắc nghiệm. Mỗi câu 4 đáp án A/B/C/D.',
    showImage: false, showAudio: false, showPassage: true,
  },
};

export function TOEICQuestionEditor({
  section,
  question,
  questionIndex,
  totalQuestions,
  onUpdate,
  onUpdateGroupPassage,
  onNavigatePrev,
  onNavigateNext,
}: TOEICQuestionEditorProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const partTitle = PART_TITLES[section.order] || '';
  const partConfig = PART_CONFIG[section.order] || PART_CONFIG[5];
  const isListeningPart = section.order >= 1 && section.order <= 4;
  const isTriple = question.questionType === 'reading_comprehension_triple';
  const isDouble = question.questionType === 'reading_comprehension_double';

  // Get group questions (questions that share the same passage)
  const groupQuestions = useMemo(() => {
    const gid = question.passageGroupId;
    if (!gid) return [question];
    return section.questions.filter((q) => q.passageGroupId === gid);
  }, [section.questions, question]);

  const isGrouped = groupQuestions.length > 1;
  const groupIndex = groupQuestions.findIndex((q) => q.id === question.id);
  const groupPassage = question.passageText || '';

  const hasAnswer = question.options.some((o) => o.isCorrect);
  const isComplete = question.questionText.trim() && hasAnswer;

  const handleOptionUpdate = (optionId: string, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, [field]: value } : opt,
    );
    onUpdate({ options: newOptions });
  };

  const handleSetCorrect = (optionId: string) => {
    const newOptions = question.options.map((opt) => ({
      ...opt,
      isCorrect: opt.id === optionId,
    }));
    onUpdate({ options: newOptions });
  };

  // Update passage for all questions in the group
  const handlePassageUpdate = (passageText: string) => {
    if (isGrouped && question.passageGroupId) {
      onUpdateGroupPassage(passageText);
    } else {
      onUpdate({ passageText });
    }
  };

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-[14px] font-bold text-foreground">
            Câu {question.order || questionIndex + 1}
          </h2>
          {isGrouped && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
              <Users className="w-2.5 h-2.5" />
              Nhóm {groupIndex + 1}/{groupQuestions.length}
            </span>
          )}
          {isComplete ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
              <Check className="w-2.5 h-2.5" />
              Đã hoàn thành
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
              Chưa hoàn thành
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigatePrev}
            disabled={questionIndex <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-border hover:bg-muted/60 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Câu trước
          </button>
          <button
            onClick={onNavigateNext}
            disabled={questionIndex >= totalQuestions - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-border hover:bg-muted/60 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-all"
          >
            Câu tiếp
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs - simplified to content only */}
      <div className="flex items-center gap-0 px-5 border-b border-border shrink-0">
        <div className="px-4 py-2.5 text-[11px] font-semibold text-indigo-600">
          Nội dung câu hỏi
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            {/* Part Badge + Question Type */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/30">
                <FileText className="w-3 h-3" />
                Part {section.order} — {partTitle}
              </span>
              <QuestionTypePicker value={question.questionType} onChange={(val) => onUpdate({ questionType: val })} />
            </div>

            {/* Guidance Box */}
            <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  {partConfig.guidance}
                </p>
              </div>
            </div>

            {/* Audio (for listening parts) */}
            {partConfig.showAudio && (
              <MediaUpload
                type="audio"
                value={question.audioUrl}
                onChange={(url) => onUpdate({ audioUrl: url })}
                label={`Âm thanh câu hỏi ${isListeningPart ? '(bắt buộc cho phần nghe)' : ''}`}
                required={isListeningPart}
              />
            )}

            {/* Passage/Script (for grouped questions: Parts 3, 4, 6, 7) */}
            {partConfig.showPassage && (
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wide">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  {section.order === 3 || section.order === 4
                    ? 'Kịch bản nghe (Script)'
                    : isTriple
                      ? 'Ba đoạn văn liên quan (Triple Passages)'
                      : isDouble
                        ? 'Hai đoạn văn liên quan (Double Passages)'
                        : 'Đoạn văn (Passage)'}
                  {isGrouped && (
                    <span className="text-[9px] font-normal text-muted-foreground normal-case">
                      (chia sẻ cho {groupQuestions.length} câu hỏi)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <textarea
                    value={groupPassage}
                    onChange={(e) => handlePassageUpdate(e.target.value)}
                    rows={section.order === 6 ? 4 : 6}
                    placeholder={section.order === 3
                      ? 'Man/woman: Good morning. I\'d like to check in, please.\nWoman: Of course. Do you have a reservation?'
                      : section.order === 4
                        ? 'Good evening, everyone. This is your captain speaking...'
                        : section.order === 6
                          ? 'Dear Valued Customer,\n\nWe are writing to inform you that our company will be moving to a new location starting March 1st. The new office will be located in _____'
                          : isTriple
                            ? 'Nhập 3 đoạn văn liên quan (email, tin nhắn, thông báo...).\nĐoạn 1:\n\nĐoạn 2:\n\nĐoạn 3:'
                            : isDouble
                              ? 'Nhập 2 đoạn văn liên quan (email, tin nhắn, thông báo...).\nĐoạn 1:\n\nĐoạn 2:'
                              : 'Nhập đoạn văn cho Reading Comprehension...'}
                    className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 leading-relaxed resize-none transition-all"
                  />
                  <div className="absolute bottom-3 right-3 text-[9px] text-muted-foreground font-medium">
                    {groupPassage.split(/\s+/).filter(Boolean).length} từ
                  </div>
                </div>
              </div>
            )}

            {/* Blank Number (for Part 6) */}
            {section.order === 6 && (
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wide">
                  Số thứ tự blank trong đoạn văn
                </label>
                <input
                  type="number"
                  value={question.blankIndex || questionIndex + 1}
                  onChange={(e) => onUpdate({ blankIndex: Number(e.target.value) })}
                  min={1}
                  max={4}
                  className="w-28 text-[13px] font-semibold text-foreground bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
              </div>
            )}

            {/* Group navigation (for grouped questions) */}
            {isGrouped && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  Câu hỏi {groupIndex + 1} trong nhóm {groupQuestions.length} câu
                </span>
                <div className="flex-1" />
                <div className="flex gap-1">
                  {groupQuestions.map((gq, i) => (
                    <div
                      key={gq.id}
                      className={`w-2.5 h-2.5 rounded-full ${
                        gq.id === question.id
                          ? 'bg-blue-600'
                          : gq.questionText?.trim()
                            ? 'bg-blue-300 dark:bg-blue-700'
                            : 'bg-blue-200 dark:bg-blue-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Question Text */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wide">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                {section.order === 6 ? 'Nội dung điền vào blank' : 'Đề bài (Question)'}
              </label>
              <div className="relative">
                <textarea
                  value={question.questionText}
                  onChange={(e) => onUpdate({ questionText: e.target.value })}
                  rows={3}
                  placeholder={partConfig.questionPlaceholder}
                  className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 leading-relaxed resize-none transition-all"
                />
                <div className="absolute bottom-3 right-3 text-[9px] text-muted-foreground font-medium">
                  {question.questionText.length}/500
                </div>
              </div>
            </div>

            {/* Image (for Part 1) */}
            {partConfig.showImage && (
              <MediaUpload
                type="image"
                value={question.imageUrl}
                onChange={(url) => onUpdate({ imageUrl: url })}
                label="Hình ảnh câu hỏi (bắt buộc cho Part 1)"
                required={section.order === 1}
              />
            )}

            {/* Options */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-foreground uppercase tracking-wide">
                  Dap an lua chon ({question.options.length}/{partConfig.maxOptions})
                </label>
              </div>
              <div className="space-y-2">
                {question.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      opt.isCorrect
                        ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/30 shadow-sm'
                        : 'border-border bg-card hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-sm'
                    }`}
                  >
                    <button
                      onClick={() => handleSetCorrect(opt.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                        opt.isCorrect
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                      }`}
                    >
                      {opt.isCorrect ? <Check className="w-4 h-4" /> : opt.label}
                    </button>
                    <input
                      value={opt.text}
                      onChange={(e) => handleOptionUpdate(opt.id, 'text', e.target.value)}
                      placeholder={partConfig.optionPlaceholder}
                      className="flex-1 text-[13px] text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation (collapsible) */}
            <div className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-foreground hover:bg-muted/40 cursor-pointer transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                Giải thích
                {question.explanation?.trim() && (
                  <span className="ml-1 px-1.5 py-0.5 text-[8px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                    Đã có
                  </span>
                )}
                <div className="flex-1" />
                {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showExplanation && (
                <div className="px-4 pb-4">
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => onUpdate({ explanation: e.target.value })}
                    rows={4}
                    placeholder="Giải thích: ngữ pháp, từ vựng, mẹo làm bài..."
                    className="w-full text-[13px] text-foreground bg-background border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 leading-relaxed resize-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* Difficulty + Points */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Độ khó</label>
                <select
                  value={question.difficulty}
                  onChange={(e) => onUpdate({ difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                  className="w-full text-[13px] font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                >
                  <option value="Easy">Dễ</option>
                  <option value="Medium">Trung bình</option>
                  <option value="Hard">Khó</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Điểm</label>
                <input
                  type="number"
                  value={question.points}
                  min={1}
                  max={10}
                  onChange={(e) => onUpdate({ points: Number(e.target.value) })}
                  className="w-full text-[13px] font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Thời gian (giây)</label>
                <input
                  type="number"
                  value={question.estimatedTime || 10}
                  min={5}
                  max={120}
                  onChange={(e) => onUpdate({ estimatedTime: Number(e.target.value) })}
                  className="w-full text-[13px] font-semibold text-foreground bg-background border border-border rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
