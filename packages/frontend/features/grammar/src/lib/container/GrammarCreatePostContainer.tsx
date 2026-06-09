import { ArrowLeft, BookOpen, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { useGrammarCreatePost } from '../hooks';
import { GRAMMAR_UI_TEXT } from '../constants';
import { 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@spark-nest-ed/frontend-shared-components';

import { PostEditorForm } from '../components/community/editor/PostEditorForm';
import { PostPreview } from '../components/community/editor/PostPreview';

interface GrammarCreatePostContainerProps {
  onBackToCommunity: () => void;
}

export function GrammarCreatePostContainer({ onBackToCommunity }: GrammarCreatePostContainerProps) {
  const {
    title,
    setTitle,
    tags,
    viewMode,
    setViewMode,
    blocks,
    newTag,
    setNewTag,
    blockToDelete,
    setBlockToDelete,
    isExitConfirmOpen,
    setIsExitConfirmOpen,
    createPostMutation,
    templates,
    handleBack,
    handleConfirmExit,
    applyTemplate,
    handleAddTag,
    handleRemoveTag,
    handleAddBlock,
    updateBlock,
    duplicateBlock,
    moveBlock,
    submitDeleteBlock,
    handlePublish,
  } = useGrammarCreatePost({ onBackToCommunity });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-900/15 via-purple-900/5 to-transparent pointer-events-none" />
      
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-900/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-lg transition">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-200">{GRAMMAR_UI_TEXT.createPost.title}</h1>
            <p className="text-[10px] text-slate-500 flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> {GRAMMAR_UI_TEXT.createPost.autosaveLabel}</p>
          </div>
        </div>

        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setViewMode('EDITOR')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'EDITOR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Edit</button>
          <button onClick={() => setViewMode('SPLIT')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition hidden lg:block ${viewMode === 'SPLIT' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Split</button>
          <button onClick={() => setViewMode('PREVIEW')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'PREVIEW' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Preview</button>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handlePublish} disabled={createPostMutation.isPending} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-550 hover:to-purple-550 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2">
            {createPostMutation.isPending ? GRAMMAR_UI_TEXT.createPost.btnPublishing : <><Send className="h-4 w-4" /> {GRAMMAR_UI_TEXT.createPost.btnPublish}</>}
          </Button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 mt-6 relative z-10">
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-3 min-w-max">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-850"><BookOpen className="h-4 w-4 text-indigo-400" /> Templates:</span>
            {templates.map(tpl => (
              <button key={tpl.name} onClick={() => applyTemplate(tpl)} className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 hover:text-indigo-300 transition flex items-center gap-1.5 whitespace-nowrap">
                {tpl.name} <CheckCircle2 className="h-3.5 w-3.5 opacity-50" />
              </button>
            ))}
          </div>
        </div>

        <div className={`grid gap-8 ${viewMode === 'SPLIT' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {(viewMode === 'EDITOR' || viewMode === 'SPLIT') && (
            <PostEditorForm
              title={title} setTitle={setTitle}
              tags={tags} newTag={newTag} setNewTag={setNewTag}
              handleAddTag={handleAddTag} handleRemoveTag={handleRemoveTag}
              blocks={blocks} handleAddBlock={handleAddBlock}
              updateBlock={updateBlock} duplicateBlock={duplicateBlock}
              moveBlock={moveBlock} setBlockToDelete={setBlockToDelete}
            />
          )}

          {(viewMode === 'PREVIEW' || viewMode === 'SPLIT') && (
            <div className={`bg-slate-950/60 border-slate-900 rounded-3xl ${viewMode === 'SPLIT' ? 'border p-6 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto' : ''}`}>
              <PostPreview title={title} tags={tags} blocks={blocks} isSplit={viewMode === 'SPLIT'} />
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!blockToDelete} onOpenChange={(open) => !open && setBlockToDelete(null)}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader><DialogTitle className="text-slate-100">{GRAMMAR_UI_TEXT.createPost.dialogDeleteTitle}</DialogTitle><DialogDescription className="text-slate-400">{GRAMMAR_UI_TEXT.createPost.dialogDeleteDesc}</DialogDescription></DialogHeader>
          <DialogFooter><Button onClick={() => setBlockToDelete(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-none transition">{GRAMMAR_UI_TEXT.createPost.btnCancel}</Button><Button onClick={submitDeleteBlock} className="bg-red-600 hover:bg-red-550 text-white transition">{GRAMMAR_UI_TEXT.createPost.btnDeletePermanent}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExitConfirmOpen} onOpenChange={setIsExitConfirmOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader><DialogTitle className="text-slate-100">{GRAMMAR_UI_TEXT.createPost.dialogExitTitle}</DialogTitle><DialogDescription className="text-slate-400">{GRAMMAR_UI_TEXT.createPost.dialogExitDesc}</DialogDescription></DialogHeader>
          <DialogFooter><Button onClick={() => setIsExitConfirmOpen(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-none transition">{GRAMMAR_UI_TEXT.createPost.btnContinueEditing}</Button><Button onClick={handleConfirmExit} className="bg-red-600 hover:bg-red-550 text-white transition">{GRAMMAR_UI_TEXT.createPost.btnConfirmExit}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GrammarCreatePostContainer;
