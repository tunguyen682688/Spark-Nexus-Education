import React, { useState } from 'react';
import {
  ClipboardList, Clock, Layers, Type, Link2, Zap, Home, ChevronRight
} from 'lucide-react';
import type { TestQuestionType, TestSessionConfig } from '../../../types';

export interface TestDashboardProps {
  title: string;
  statsDashboard: {
    total: number;
    mastered: number;
    learning: number;
    newCount: number;
  };
  onStartTest: (config: TestSessionConfig) => void;
  onGoHome: () => void;
}

const QUESTION_TYPE_OPTIONS: { key: TestQuestionType; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    key: 'mcq',
    label: 'Trắc nghiệm',
    description: 'Chọn đúng nghĩa trong 4 đáp án',
    icon: <ClipboardList className="w-5 h-5" />,
    color: 'from-blue-600/20 to-blue-500/10 border-blue-500/30 text-blue-400',
  },
  {
    key: 'fill-blank',
    label: 'Điền từ',
    description: 'Gõ từ vựng tiếng Anh theo nghĩa',
    icon: <Type className="w-5 h-5" />,
    color: 'from-purple-600/20 to-purple-500/10 border-purple-500/30 text-purple-400',
  },
  {
    key: 'matching',
    label: 'Ghép cặp',
    description: 'Nối từ với định nghĩa tương ứng',
    icon: <Link2 className="w-5 h-5" />,
    color: 'from-emerald-600/20 to-emerald-500/10 border-emerald-500/30 text-emerald-400',
  },
];

const QUESTION_COUNT_OPTIONS = [10, 20, 30, 50];
const TIME_LIMIT_OPTIONS = [
  { value: null, label: 'Không giới hạn' },
  { value: 300, label: '5 phút' },
  { value: 600, label: '10 phút' },
  { value: 900, label: '15 phút' },
  { value: 1800, label: '30 phút' },
];

export const TestDashboard: React.FC<TestDashboardProps> = ({
  title,
  statsDashboard,
  onStartTest,
  onGoHome,
}) => {
  const [selectedTypes, setSelectedTypes] = useState<TestQuestionType[]>(['mcq', 'fill-blank']);
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  const toggleType = (type: TestQuestionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.length === 1 ? prev // cannot deselect last
          : prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleStart = () => {
    if (selectedTypes.length === 0) return;
    onStartTest({
      questionCount,
      types: selectedTypes,
      timeLimitSeconds: timeLimit,
    });
  };

  const canStart = statsDashboard.total >= 4;

  return (
    <div className="w-full flex flex-col gap-8 text-white bg-[#070b15] p-6 sm:p-10 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-1/3 w-96 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between z-10 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/20">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-widest">
              Kiểm Tra Nâng Cao
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Thiết lập bài kiểm tra
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-md">
            {title} — Tùy chỉnh loại câu hỏi, số lượng và thời gian giới hạn theo mục tiêu luyện tập của bạn.
          </p>
        </div>
        <button
          onClick={onGoHome}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer shrink-0"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 z-10">
        {[
          { label: 'Tổng từ', value: statsDashboard.total, color: 'text-slate-200' },
          { label: 'Thành thạo', value: statsDashboard.mastered, color: 'text-emerald-400' },
          { label: 'Đang học', value: statsDashboard.learning, color: 'text-blue-400' },
          { label: 'Từ mới', value: statsDashboard.newCount, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col p-4 bg-slate-900/50 border border-slate-800/60 rounded-xl">
            <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 z-10">
        {/* Left: Config Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Question Types */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              Loại câu hỏi <span className="text-slate-600 normal-case font-normal">(chọn một hoặc nhiều)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {QUESTION_TYPE_OPTIONS.map((opt) => {
                const isSelected = selectedTypes.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    onClick={() => toggleType(opt.key)}
                    className={`flex flex-col gap-2 p-4 rounded-xl border bg-gradient-to-br transition-all duration-200 cursor-pointer text-left group ${
                      isSelected
                        ? opt.color + ' shadow-lg scale-[1.01]'
                        : 'from-slate-900/50 to-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/10' : 'bg-slate-800'}`}>
                        {opt.icon}
                      </div>
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-current bg-current' : 'border-slate-700'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#070b15]" />}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-bold block">{opt.label}</span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">{opt.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              Số lượng câu hỏi
            </span>
            <div className="flex flex-wrap gap-2">
              {QUESTION_COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
                    questionCount === n
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {n} câu
                </button>
              ))}
              <span className="flex items-center text-[10px] text-slate-600 pl-2 font-bold uppercase tracking-wider">
                (tối đa {statsDashboard.total} từ)
              </span>
            </div>
          </div>

          {/* Time Limit */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" /> Giới hạn thời gian
            </span>
            <div className="flex flex-wrap gap-2">
              {TIME_LIMIT_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setTimeLimit(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${
                    timeLimit === opt.value
                      ? 'bg-amber-600/80 text-white border border-amber-500/50 shadow-lg'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary + Start */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 p-5 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            <span className="text-sm font-extrabold text-slate-200 tracking-wide">Tóm tắt bài kiểm tra</span>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Loại câu hỏi</span>
                <span className="text-slate-200 font-bold text-right max-w-[150px]">
                  {selectedTypes
                    .map((t) => QUESTION_TYPE_OPTIONS.find((o) => o.key === t)?.label)
                    .join(', ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Số câu</span>
                <span className="text-slate-200 font-bold">{questionCount} câu</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Thời gian</span>
                <span className="text-slate-200 font-bold">
                  {timeLimit ? TIME_LIMIT_OPTIONS.find((o) => o.value === timeLimit)?.label : 'Không giới hạn'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Chế độ</span>
                <span className="text-blue-400 font-bold text-xs bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  EXAM MODE
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Chế độ thi: kết quả đúng/sai sẽ chỉ được hiển thị sau khi hoàn thành toàn bộ bài kiểm tra.
              </p>
            </div>
          </div>

          {!canStart && (
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-400 font-semibold">
              ⚠️ Cần ít nhất 4 từ vựng để tạo bài kiểm tra.
            </div>
          )}

          <button
            disabled={!canStart || selectedTypes.length === 0}
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-extrabold text-base transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed
              bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-600/25 hover:shadow-blue-500/30 hover:-translate-y-[1px]"
          >
            <Layers className="w-5 h-5" />
            Bắt Đầu Kiểm Tra
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
