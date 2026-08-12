import { Save, Globe, Eye, BookOpen, ChevronDown, Loader2, ArrowLeft, X } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { SaveGrammarLessonDto, GrammarLessonDetailResponse } from '../types';
import { useGrammarLessonEditor, OutlineItem } from '../hooks';
import { GRAMMAR_UI_TEXT } from '../constants';
import { LessonPreviewContent } from '../components/LessonPreviewContent';
import { BlockEditorCard } from '../components/BlockEditorCard';
import { LessonEditorDialogs } from '../components/LessonEditorDialogs';

interface GrammarLessonEditorContainerProps {
  id?: string;
  lessonDetail?: GrammarLessonDetailResponse;
  isSaving: boolean;
  onPublish: (payload: SaveGrammarLessonDto, isDraft: boolean) => Promise<void>;
  onCancel: () => void;
}

const GrammarLessonEditorContainer = ({
  id,
  lessonDetail,
  isSaving,
  onPublish,
  onCancel,
}: GrammarLessonEditorContainerProps) => {
  const {
    title, setTitle, vietnameseTitle, setVietnameseTitle, status, level, setLevel,
    tags, setIsDirty, isAddTagOpen, setIsAddTagOpen,
    newTag, setNewTag, blockToDelete, setBlockToDelete, outline, isPreviewOpen, setIsPreviewOpen,
    viewMode, setViewMode, blocks, handleBack, handleScrollToBlock, submitAddTag, submitDeleteBlock,
    handleLoadTemplate, duplicateBlock, handleAddTag, handleRemoveTag, updateBlock, deleteBlock,
    moveBlock, handleAddBlock, handlePublish,
  } = useGrammarLessonEditor({ id, lessonDetail, isSaving, onPublish, onCancel });

  const previewProps = { blocks, title, vietnameseTitle, level };

  return (
    <div className="min-h-screen bg-[#03050d] text-slate-100 font-sans py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-full mx-auto flex flex-col gap-6">
        {/* View Mode Switcher Header */}
        <div className="bg-[#070a14] border border-slate-900 rounded-3xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button type="button" onClick={handleBack}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-[#0c1020] border border-slate-850 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all cursor-pointer"
              title={GRAMMAR_UI_TEXT.lessonEditor.btnBackTitle}>
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block">
                {id ? GRAMMAR_UI_TEXT.lessonEditor.modeEdit : GRAMMAR_UI_TEXT.lessonEditor.modeCreate}
              </span>
              <h2 className="text-sm font-extrabold text-slate-200 mt-0.5">
                {title || GRAMMAR_UI_TEXT.lessonEditor.titleDefault}
              </h2>
            </div>
          </div>
          <div className="flex bg-[#0c1020] rounded-2xl p-1 border border-slate-850 w-full sm:w-auto justify-center">
            {([
              { mode: 'edit' as const, label: GRAMMAR_UI_TEXT.lessonEditor.tabEdit },
              { mode: 'split' as const, label: GRAMMAR_UI_TEXT.lessonEditor.tabSplit },
              { mode: 'preview' as const, label: GRAMMAR_UI_TEXT.lessonEditor.tabPreview },
            ]).map((t) => (
              <button key={t.mode} type="button" onClick={() => setViewMode(t.mode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${viewMode === t.mode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:text-slate-200'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'preview' ? (
          <div className="bg-[#070a14] border border-slate-900 rounded-3xl p-8 shadow-xl">
            <LessonPreviewContent {...previewProps} />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Work Area */}
            <div className="flex-1 space-y-6">
              {/* Header Title & Vietnamese Title Block */}
              <div className="bg-[#070a14] border border-slate-900 focus-within:border-blue-500/40 focus-within:shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)] rounded-3xl p-6 shadow-xl flex flex-col gap-3 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <input type="text" value={title}
                    onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
                    className="text-2xl sm:text-3xl font-extrabold text-white border-none outline-none focus:ring-0 w-full bg-transparent placeholder-slate-650"
                    placeholder={GRAMMAR_UI_TEXT.lessonEditor.placeholderTitle} />
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />{status}
                    </span>
                    <div className="relative inline-block">
                      <select value={level}
                        onChange={(e) => { setLevel(e.target.value); setIsDirty(true); }}
                        className="appearance-none bg-[#0c1020] border border-slate-850 rounded-xl px-3 py-1 text-xs font-bold text-slate-200 outline-none pr-8 cursor-pointer hover:border-slate-750 transition-colors">
                        <option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option>
                        <option value="B2">B2</option><option value="C1">C1</option><option value="C2">C2</option>
                      </select>
                      <ChevronDown className="h-3 w-3 text-slate-500 absolute right-2.5 top-1.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <input type="text" value={vietnameseTitle}
                  onChange={(e) => { setVietnameseTitle(e.target.value); setIsDirty(true); }}
                  className="text-sm font-bold text-slate-400 border-none outline-none focus:ring-0 w-full bg-transparent placeholder-slate-600 -mt-1"
                  placeholder={GRAMMAR_UI_TEXT.lessonEditor.placeholderVnTitle} />
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-900/60">
                  <span role="img" aria-label="tag icon" className="text-slate-500 text-sm mr-1">🏷️</span>
                  {tags.map((tag: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border flex items-center gap-1 bg-[#0c1020] text-slate-400 border-slate-850">
                      <span>{tag}</span>
                      <button onClick={() => handleRemoveTag(tag)} className="text-[9px] text-slate-500 hover:text-red-500 ml-0.5 bg-transparent border-none cursor-pointer">✕</button>
                    </span>
                  ))}
                  <button onClick={handleAddTag}
                    className="h-6 w-6 inline-flex items-center justify-center rounded-lg border border-dashed border-slate-800 text-slate-500 hover:text-slate-350 hover:border-slate-700 transition-colors text-xs font-bold bg-transparent cursor-pointer">+</button>
                </div>
              </div>

              {/* Dynamic Blocks */}
              <div className="space-y-6">
                {blocks.length === 0 ? (
                  <div className="bg-[#070a14] border border-dashed border-slate-850 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3">
                    <span role="img" aria-label="empty icon" className="text-3xl">📝</span>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{GRAMMAR_UI_TEXT.lessonEditor.emptyTitle}</h3>
                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{GRAMMAR_UI_TEXT.lessonEditor.emptyDesc}</p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-3">
                      {(['standard', 'practice', 'academic'] as const).map((type) => (
                        <button key={type} type="button" onClick={() => handleLoadTemplate(type)}
                          className={`px-4 py-2.5 text-xs font-extrabold bg-[#0b1022] hover:bg-${type === 'standard' ? 'blue' : type === 'practice' ? 'emerald' : 'purple'}-600/90 text-slate-200 hover:text-white rounded-xl transition-all cursor-pointer border border-${type === 'standard' ? 'blue' : type === 'practice' ? 'emerald' : 'purple'}-500/20 hover:border-transparent shadow-md active:scale-95 flex items-center gap-1.5`}>
                      {type === 'standard' ? GRAMMAR_UI_TEXT.lessonEditor.templateStandardBtn : type === 'practice' ? GRAMMAR_UI_TEXT.lessonEditor.templatePracticeBtn : GRAMMAR_UI_TEXT.lessonEditor.templateAcademicBtn}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : blocks.map((block, idx) => (
                  <BlockEditorCard
                    key={block.id || idx}
                    block={block}
                    idx={idx}
                    totalBlocks={blocks.length}
                    onUpdateBlock={updateBlock}
                    onMoveBlock={moveBlock}
                    onDuplicateBlock={duplicateBlock}
                    onDeleteBlock={deleteBlock}
                  />
                ))}
              </div>
            </div>

            {/* Split View Right Side Panel */}
            {viewMode === 'split' && (
              <div className="flex-1 bg-[#070a14] border border-slate-900 rounded-3xl p-6 shadow-xl max-h-[85vh] overflow-y-auto lg:sticky lg:top-28">
                <div className="text-xs font-bold text-slate-500 tracking-wider uppercase border-b border-slate-900 pb-3 mb-4 flex items-center justify-between">
                  <span>{GRAMMAR_UI_TEXT.lessonEditor.splitLivePreview}</span>
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">{GRAMMAR_UI_TEXT.lessonEditor.realtimeBadge}</span>
                </div>
                <LessonPreviewContent {...previewProps} isSplit />
              </div>
            )}

            {/* Action Panel & Outline (Edit Mode) */}
            {viewMode === 'edit' && (
              <div className="w-full lg:w-72 space-y-6 lg:sticky lg:top-28 self-start">
                <div className="flex gap-3">
                  <Button onClick={() => handlePublish(true)} disabled={isSaving}
                    className="flex-1 bg-[#070a14] hover:bg-slate-900 text-slate-300 hover:text-slate-100 font-bold border border-slate-850 py-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5">
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-4 w-4 text-slate-400" />}
                    {GRAMMAR_UI_TEXT.lessonEditor.btnSaveDraft}
                  </Button>
                  <Button onClick={() => handlePublish(false)} disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-md shadow-blue-500/20 text-xs flex items-center justify-center gap-1.5 border-none">
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Globe className="h-4 w-4" />}
                    {GRAMMAR_UI_TEXT.lessonEditor.btnPublish}
                  </Button>
                </div>
                <div className="bg-[#070a14] border border-slate-900 rounded-3xl p-5 shadow-xl space-y-5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 tracking-wider uppercase border-b border-slate-900/60 pb-3">
                    <BookOpen className="h-4 w-4 text-blue-500" />{GRAMMAR_UI_TEXT.lessonEditor.outlineTitle}
                  </div>
                  <div className="space-y-1.5">
                    {outline.map((item: OutlineItem) => {
                      const isCompleted = item.status === 'COMPLETED';
                      const isActive = item.status === 'ACTIVE';
                      return (
                        <div key={item.id} onClick={() => handleScrollToBlock(item.id)}
                          className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all border cursor-pointer hover:bg-slate-900/40 ${isActive ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'text-slate-400 border-transparent hover:text-slate-200'}`}>
                          <div className="flex items-center gap-2.5">
                            <span className={`h-4 w-4 rounded flex items-center justify-center border text-[9px] ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : isActive ? 'bg-blue-500/10 border-blue-500/20 text-blue-450' : 'bg-[#0c1020] border-slate-850 text-slate-650'}`}>
                              {isCompleted ? '✓' : '•'}
                            </span>
                            <span className="truncate max-w-[130px]" title={item.label}>{item.label}</span>
                          </div>
                          <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-800'}`} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-2 border-t border-slate-900/60 text-center">
                    <button onClick={() => setIsPreviewOpen(true)}
                      className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-wider bg-transparent border-none outline-none cursor-pointer">
                      <Eye className="h-3.5 w-3.5" />{GRAMMAR_UI_TEXT.lessonEditor.btnPreviewLesson}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#070a14]/90 backdrop-blur-md border border-slate-900/60 rounded-full px-6 py-3 shadow-2xl shadow-black/50 flex items-center gap-4 z-50">
        {([
          { label: 'Text', icon: 'Tt', type: 'text' as const },
          { label: 'Formula', icon: '🖼️', type: 'formula' as const },
          { label: 'Example', icon: '📋', type: 'example' as const },
          { label: 'Quiz', icon: '❓', type: 'quiz' as const },
          { label: 'Media', icon: '🎥', type: 'media' as const },
          { label: 'Callout', icon: '💡', type: 'callout' as const },
        ]).map((block, idx) => (
          <button key={idx} onClick={() => handleAddBlock(block.type)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-slate-900 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all active:scale-95 border-none bg-transparent cursor-pointer">
            <span role="img" className="text-slate-450">{block.icon}</span>
            <span>{GRAMMAR_UI_TEXT.lessonEditor.blockTypeNames[block.type]}</span>
          </button>
        ))}
      </div>

      {/* Live Preview Overlay */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[1000] bg-[#03050d] text-slate-100 overflow-y-auto font-sans">
          <div className="sticky top-0 bg-[#03050d]/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between z-50">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black bg-blue-500/20 text-blue-455 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">PREVIEW MODE</span>
              <span className="text-xs text-slate-400 font-medium">{GRAMMAR_UI_TEXT.lessonEditor.studentPreviewTitle}</span>
            </div>
            <button onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-2 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center gap-1.5 border-none cursor-pointer">
              <X className="h-4 w-4" />{GRAMMAR_UI_TEXT.lessonEditor.btnStudentPreviewClose}
            </button>
          </div>
          <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
            <LessonPreviewContent {...previewProps} />
          </div>
        </div>
      )}

      <LessonEditorDialogs
        isAddTagOpen={isAddTagOpen} setIsAddTagOpen={setIsAddTagOpen}
        newTag={newTag} setNewTag={setNewTag} submitAddTag={submitAddTag}
        blockToDelete={blockToDelete} setBlockToDelete={setBlockToDelete} submitDeleteBlock={submitDeleteBlock}
      />
    </div>
  );
};

export default GrammarLessonEditorContainer;
