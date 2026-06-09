import type { FC } from 'react';
import type { ExamQuestion } from '../types';

interface QuestionEditorProps {
  idx: number;
  question: Partial<ExamQuestion>;
  handleUpdateQuestion: (idx: number, fields: Partial<ExamQuestion>) => void;
}

interface MultipleChoiceProps extends QuestionEditorProps {
  handleUpdateOption: (qIdx: number, optIdx: number, val: string) => void;
}

export const MultipleChoiceQuestionEditor: FC<MultipleChoiceProps> = ({
  idx,
  question,
  handleUpdateQuestion,
  handleUpdateOption,
}) => {
  return (
    <>
      <div className="space-y-1 md:col-span-3">
        <label className="text-[9px] font-black text-slate-500 uppercase block">
          Nội dung câu hỏi trắc nghiệm
        </label>
        <input
          type="text"
          value={question.text || ''}
          onChange={(e) =>
            handleUpdateQuestion(idx, { text: e.target.value })
          }
          placeholder="Ví dụ: By the time they arrive, we _____ our dinner."
          className="w-full bg-[#0c1020]/50 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
          required
        />
      </div>

      {question.options && (
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/20 border border-slate-900 p-4 rounded-xl">
          <span className="text-[9px] font-black text-slate-500 block uppercase md:col-span-2">
            CÁC PHƯƠNG ÁN LỰA CHỌN
          </span>
          {question.options.map((opt, oIdx) => (
            <div key={oIdx} className="space-y-1">
              <label className="text-[8px] font-bold text-slate-500 uppercase block">
                Phương án {String.fromCharCode(65 + oIdx)}
              </label>
              <input
                type="text"
                value={opt}
                onChange={(e) =>
                  handleUpdateOption(idx, oIdx, e.target.value)
                }
                className="w-full bg-[#0c1020]/50 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                required
              />
            </div>
          ))}
          <div className="space-y-1 md:col-span-2 pt-2">
            <label className="text-[8px] font-bold uppercase block text-emerald-400">
              Đáp án chính xác (Copy chính xác text của option đúng)
            </label>
            <input
              type="text"
              value={question.answer || ''}
              onChange={(e) =>
                handleUpdateQuestion(idx, {
                  answer: e.target.value,
                })
              }
              placeholder="Ví dụ: will have finished"
              className="w-full bg-[#0c1020]/50 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>
        </div>
      )}
    </>
  );
};

export const SentenceBuilderQuestionEditor: FC<QuestionEditorProps> = ({
  idx,
  question,
  handleUpdateQuestion,
}) => {
  return (
    <>
      <div className="space-y-1 md:col-span-3">
        <label className="text-[9px] font-black text-slate-500 uppercase block">
          Hướng dẫn sắp xếp câu
        </label>
        <input
          type="text"
          value={question.text || ''}
          onChange={(e) =>
            handleUpdateQuestion(idx, { text: e.target.value })
          }
          placeholder="Ví dụ: Hãy click chọn các từ để sắp xếp thành câu hoàn chỉnh..."
          className="w-full bg-[#0c1020]/50 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
          required
        />
      </div>

      <div className="space-y-1 md:col-span-3 bg-slate-950/20 border border-slate-900 p-4 rounded-xl">
        <label className="text-[8px] font-black text-slate-500 uppercase block">
          Danh sách từ xáo trộn (Ngăn cách các từ bằng dấu phẩy)
        </label>
        <input
          type="text"
          value={question.words?.join(', ') || ''}
          onChange={(e) => {
            const val = e.target.value;
            const splitWords = val
              .split(',')
              .map((w) => w.trim());
            handleUpdateQuestion(idx, { words: splitWords });
          }}
          placeholder="Ví dụ: If, I, were, rich, I, would, buy, a, car."
          className="w-full bg-[#0c1020]/50 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
          required
        />
        <div className="space-y-1 pt-3">
          <label className="text-[8px] font-bold uppercase block text-emerald-400">
            Đáp án câu hoàn chỉnh chính xác
          </label>
          <input
            type="text"
            value={question.answer || ''}
            onChange={(e) =>
              handleUpdateQuestion(idx, {
                answer: e.target.value,
              })
            }
            placeholder="Ví dụ: If I were rich, I would buy a car."
            className="w-full bg-[#0c1020]/50 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
            required
          />
        </div>
      </div>
    </>
  );
};

export const ErrorSpotlightQuestionEditor: FC<QuestionEditorProps> = ({
  idx,
  question,
  handleUpdateQuestion,
}) => {
  return (
    <>
      <div className="space-y-1 md:col-span-3">
        <label className="text-[9px] font-black text-slate-500 uppercase block">
          Hướng dẫn sửa lỗi sai
        </label>
        <input
          type="text"
          value={question.text || ''}
          onChange={(e) =>
            handleUpdateQuestion(idx, { text: e.target.value })
          }
          placeholder="Ví dụ: Click chọn từ viết sai ngữ pháp trong câu và nhập từ sửa lại đúng..."
          className="w-full bg-[#0c1020]/50 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50"
          required
        />
      </div>

      <div className="md:col-span-3 bg-slate-950/20 border border-slate-900 p-4 rounded-xl space-y-3">
        <div className="space-y-1">
          <label className="text-[8px] font-black text-slate-500 uppercase block">
            Câu văn đầy đủ chứa lỗi viết sai
          </label>
          <input
            type="text"
            value={question.sentence || ''}
            onChange={(e) =>
              handleUpdateQuestion(idx, {
                sentence: e.target.value,
              })
            }
            placeholder="Ví dụ: He has been studying English since five years."
            className="w-full bg-[#0c1020]/50 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-[8px] font-bold text-slate-500 uppercase block text-rose-455">
              Từ bị viết sai trong câu
            </label>
            <input
              type="text"
              value={question.incorrectWord || ''}
              onChange={(e) =>
                handleUpdateQuestion(idx, {
                  incorrectWord: e.target.value,
                })
              }
              placeholder="Ví dụ: since"
              className="w-full bg-[#0c1020]/50 border border-rose-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-bold text-slate-500 uppercase block text-emerald-455">
              Từ viết lại sửa đúng
            </label>
            <input
              type="text"
              value={question.correctWord || ''}
              onChange={(e) => {
                const val = e.target.value;
                handleUpdateQuestion(idx, {
                  correctWord: val,
                  answer: val,
                });
              }}
              placeholder="Ví dụ: for"
              className="w-full bg-[#0c1020]/50 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>
        </div>
      </div>
    </>
  );
};
