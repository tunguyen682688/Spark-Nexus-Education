import { Tag, Plus, X, ArrowUp, ArrowDown, Copy, Trash2, HelpCircle, Binary, FileText, Video, AlertCircle } from 'lucide-react';
import { GrammarBlock } from '../../../types';
import TextBlockEditor from '../../TextBlockEditor';
import FormulaBlockEditor from '../../FormulaBlockEditor';
import ExampleBlockEditor from '../../ExampleBlockEditor';
import MediaBlockEditor from '../../MediaBlockEditor';
import CalloutBlockEditor from '../../CalloutBlockEditor';
// (Assuming a generic QuizBlockEditor exists or we inline it. Since it was inline before, we can keep it inline or assume QuizBlockEditor component was created, wait, looking at imports in original file there was NO QuizBlockEditor, it was inline)

interface PostEditorFormProps {
  title: string;
  setTitle: (t: string) => void;
  tags: string[];
  newTag: string;
  setNewTag: (t: string) => void;
  handleAddTag: () => void;
  handleRemoveTag: (t: string) => void;
  blocks: GrammarBlock[];
  handleAddBlock: (type: 'text' | 'formula' | 'example' | 'quiz' | 'media' | 'callout') => void;
  updateBlock: (id: string, updates: Partial<GrammarBlock>) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (idx: number, dir: 'up' | 'down') => void;
  setBlockToDelete: (id: string | null) => void;
}

export function PostEditorForm({
  title, setTitle, tags, newTag, setNewTag, handleAddTag, handleRemoveTag,
  blocks, handleAddBlock, updateBlock, duplicateBlock, moveBlock, setBlockToDelete
}: PostEditorFormProps) {
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 pb-24">
      {/* Title & Tags */}
      <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-2xl space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiêu Đề Bài Viết</label>
          <input
            type="text"
            placeholder="Ví dụ: Mẹo phân biệt Câu điều kiện loại 2 & 3..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-lg font-bold text-slate-100 placeholder-slate-600 transition"
          />
        </div>
        
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Gắn Thẻ Chủ Đề
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="bg-indigo-900/40 border border-indigo-800 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                #{tag}
                <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400 transition ml-1"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 relative">
            <input
              type="text"
              placeholder="Thêm tag (VD: GrammarTips)"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-sm text-slate-200 transition w-64"
            />
            <button onClick={handleAddTag} className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-xl transition">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="group relative bg-slate-900/40 border border-slate-850 hover:border-slate-700 rounded-2xl p-5 transition-all">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-850">
              <span className="text-xs font-bold text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded-md uppercase tracking-wider">
                {index + 1}. {block.blockLabel || 'Khối nội dung'}
              </span>
              <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded-md hover:bg-slate-800"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1.5 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded-md hover:bg-slate-800"><ArrowDown className="h-4 w-4" /></button>
                <div className="w-px h-4 bg-slate-700 mx-1" />
                <button onClick={() => duplicateBlock(block.id)} className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-md hover:bg-slate-800" title="Nhân bản"><Copy className="h-4 w-4" /></button>
                <button onClick={() => setBlockToDelete(block.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-800" title="Xóa"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>

            {block.type === 'text' && <TextBlockEditor content={block.content || ''} onChange={(content) => updateBlock(block.id, { content })} />}
            {block.type === 'formula' && <FormulaBlockEditor elements={block.elements || []} note={block.note || ''} onChange={(updates) => updateBlock(block.id, updates)} />}
            {block.type === 'example' && <ExampleBlockEditor items={block.items || []} onChange={(items) => updateBlock(block.id, { items })} />}
            {block.type === 'media' && <MediaBlockEditor url={block.url || ''} provider={block.provider || 'youtube'} onChange={(updates) => updateBlock(block.id, updates)} />}
            {block.type === 'callout' && <CalloutBlockEditor title={block.title || ''} content={block.content || ''} onChange={(updates) => updateBlock(block.id, updates)} />}
            
            {block.type === 'quiz' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại Thử Thách</label>
                    <select
                      value={block.quizType || 'MULTIPLE_CHOICE'}
                      onChange={(e) => updateBlock(block.id, { quizType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500"
                    >
                      <option value="MULTIPLE_CHOICE">Trắc nghiệm chọn 1 đáp án</option>
                      <option value="SENTENCE_BUILDER">Sắp xếp từ thành câu</option>
                      <option value="ERROR_SPOTLIGHT">Tìm và sửa lỗi sai</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Câu Hỏi Định Hướng</label>
                  <input
                    type="text"
                    value={block.question || ''}
                    onChange={(e) => updateBlock(block.id, { question: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-indigo-500"
                    placeholder="VD: Chọn đáp án đúng nhất để điền vào chỗ trống:"
                  />
                </div>

                {block.quizType === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-3 bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tùy Chọn Đáp Án</label>
                    {(block.options || ['', '', '', '']).map((opt, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="w-6 h-6 flex items-center justify-center bg-slate-800 text-slate-400 font-bold text-[10px] rounded-full shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(block.options || ['', '', '', ''])];
                            newOpts[i] = e.target.value;
                            updateBlock(block.id, { options: newOpts });
                          }}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                          placeholder={`Nhập lựa chọn ${i + 1}`}
                        />
                        <button
                          onClick={() => updateBlock(block.id, { answer: opt })}
                          className={`p-1.5 rounded-md text-xs font-bold transition-all ${
                            block.answer === opt && opt.trim() !== ''
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-500 hover:text-slate-300 border border-transparent'
                          }`}
                          title="Đánh dấu là đáp án đúng"
                        >
                          CORRECT
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {block.quizType === 'SENTENCE_BUILDER' && (
                  <div className="space-y-4 bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Danh sách từ xáo trộn (Ngăn cách bằng dấu phẩy)</label>
                      <input
                        type="text"
                        value={(block.words || []).join(', ')}
                        onChange={(e) => updateBlock(block.id, { words: e.target.value.split(',').map(w => w.trim()).filter(Boolean) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                        placeholder="VD: If, I, were, you, I, would, study"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Câu đáp án đúng</label>
                      <input
                        type="text"
                        value={block.answer || ''}
                        onChange={(e) => updateBlock(block.id, { answer: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                        placeholder="VD: If I were you I would study"
                      />
                    </div>
                  </div>
                )}

                {block.quizType === 'ERROR_SPOTLIGHT' && (
                  <div className="space-y-4 bg-slate-950/30 p-3 rounded-xl border border-slate-800">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Câu chứa lỗi sai</label>
                      <input
                        type="text"
                        value={block.sentence || ''}
                        onChange={(e) => updateBlock(block.id, { sentence: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                        placeholder="VD: She have been there."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Từ sai</label>
                        <input
                          type="text"
                          value={block.incorrectWord || ''}
                          onChange={(e) => updateBlock(block.id, { incorrectWord: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                          placeholder="VD: have"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Từ sửa đúng</label>
                        <input
                          type="text"
                          value={block.correctWord || ''}
                          onChange={(e) => updateBlock(block.id, { correctWord: e.target.value, answer: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
                          placeholder="VD: has"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> Giải thích ngữ pháp (Sư phạm)
                  </label>
                  <textarea
                    value={block.explanation || ''}
                    onChange={(e) => updateBlock(block.id, { explanation: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-yellow-500/50 resize-none"
                    placeholder="Giải thích lý do đúng/sai cho học viên..."
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Block Menu */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-4">
          <button onClick={() => handleAddBlock('text')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition">
            <FileText className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Lý Thuyết</span>
          </button>
          <button onClick={() => handleAddBlock('formula')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition">
            <Binary className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Công Thức</span>
          </button>
          <button onClick={() => handleAddBlock('example')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition">
            <FileText className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ví Dụ</span>
          </button>
          <button onClick={() => handleAddBlock('quiz')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-rose-500 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition">
            <HelpCircle className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Thử Thách</span>
          </button>
          <button onClick={() => handleAddBlock('callout')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 transition">
            <AlertCircle className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Lưu Ý</span>
          </button>
          <button onClick={() => handleAddBlock('media')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-purple-500 hover:bg-purple-500/10 text-slate-400 hover:text-purple-400 transition">
            <Video className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Video</span>
          </button>
        </div>
      </div>
    </div>
  );
}
