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
    <div className="min-h-screen bg-background text-foreground font-sans pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-900/15 via-purple-900/5 to-transparent pointer-events-none" />
      
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} className="p-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg transition">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">{GRAMMAR_UI_TEXT.createPost.title}</h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> {GRAMMAR_UI_TEXT.createPost.autosaveLabel}</p>
          </div>
        </div>

        <div className="flex bg-muted/80 p-1 rounded-xl border border-border">
          <button onClick={() => setViewMode('EDITOR')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'EDITOR' ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}>Edit</button>
          <button onClick={() => setViewMode('SPLIT')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition hidden lg:block ${viewMode === 'SPLIT' ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}>Split</button>
          <button onClick={() => setViewMode('PREVIEW')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${viewMode === 'PREVIEW' ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}>Preview</button>
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
            <div className={`bg-card/65 border-border rounded-3xl ${viewMode === 'SPLIT' ? 'border p-6 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto' : ''}`}>
              <PostPreview title={title} tags={tags} blocks={blocks} isSplit={viewMode === 'SPLIT'} />
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!blockToDelete} onOpenChange={(open) => !open && setBlockToDelete(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">{GRAMMAR_UI_TEXT.createPost.dialogDeleteTitle}</DialogTitle><DialogDescription className="text-muted-foreground">{GRAMMAR_UI_TEXT.createPost.dialogDeleteDesc}</DialogDescription></DialogHeader>
          <DialogFooter><Button onClick={() => setBlockToDelete(null)} className="bg-secondary hover:bg-secondary/80 text-foreground border-none transition">{GRAMMAR_UI_TEXT.createPost.btnCancel}</Button><Button onClick={submitDeleteBlock} className="bg-red-600 hover:bg-red-555 text-white transition">{GRAMMAR_UI_TEXT.createPost.btnDeletePermanent}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExitConfirmOpen} onOpenChange={setIsExitConfirmOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">{GRAMMAR_UI_TEXT.createPost.dialogExitTitle}</DialogTitle><DialogDescription className="text-muted-foreground">{GRAMMAR_UI_TEXT.createPost.dialogExitDesc}</DialogDescription></DialogHeader>
          <DialogFooter><Button onClick={() => setIsExitConfirmOpen(false)} className="bg-secondary hover:bg-secondary/80 text-foreground border-none transition">{GRAMMAR_UI_TEXT.createPost.btnContinueEditing}</Button><Button onClick={handleConfirmExit} className="bg-red-600 hover:bg-red-555 text-white transition">{GRAMMAR_UI_TEXT.createPost.btnConfirmExit}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GrammarCreatePostContainer;
