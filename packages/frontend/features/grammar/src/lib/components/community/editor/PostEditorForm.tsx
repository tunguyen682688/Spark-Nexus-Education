import { Tag, Plus, X, ArrowUp, ArrowDown, Copy, Trash2, HelpCircle, Binary, FileText, Video, AlertCircle } from 'lucide-react';
import { Input, Textarea } from '@spark-nest-ed/frontend-shared-components';
import { GrammarBlock } from '../../../types';
import { GRAMMAR_UI_TEXT } from '../../../constants';
import TextBlockEditor from '../../TextBlockEditor';
import FormulaBlockEditor from '../../FormulaBlockEditor';
import ExampleBlockEditor from '../../ExampleBlockEditor';
import MediaBlockEditor from '../../MediaBlockEditor';
import CalloutBlockEditor from '../../CalloutBlockEditor';

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

const T = GRAMMAR_UI_TEXT.postEditor;

export function PostEditorForm({
  title, setTitle, tags, newTag, setNewTag, handleAddTag, handleRemoveTag,
  blocks, handleAddBlock, updateBlock, duplicateBlock, moveBlock, setBlockToDelete
}: PostEditorFormProps) {
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 pb-24">
      {/* Title & Tags */}
      <div className="bg-card border border-border p-6 rounded-2xl space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{T.labelTitle}</label>
          <Input
            type="text"
            placeholder={T.placeholderTitle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-background border border-border focus:border-primary rounded-xl px-4 py-3 text-lg font-bold text-foreground placeholder:text-muted-foreground/50 transition"
          />
        </div>
        
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> {T.labelTags}
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span key={tag} className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                #{tag}
                <button onClick={() => handleRemoveTag(tag)} className="hover:text-destructive transition ml-1 bg-transparent border-none cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2 relative">
            <Input
              type="text"
              placeholder={T.placeholderTag}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              className="bg-background border border-border focus:border-primary rounded-xl px-4 py-2 text-sm text-foreground transition w-64"
            />
            <button onClick={handleAddTag} className="bg-muted hover:bg-muted/80 text-foreground border border-border p-2 rounded-xl transition cursor-pointer">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="group relative bg-card border border-border hover:border-muted-foreground/30 rounded-2xl p-5 transition-all">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider border border-primary/20">
                {index + 1}. {block.blockLabel || T.defaultBlockLabel}
              </span>
              <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-md hover:bg-muted"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-md hover:bg-muted"><ArrowDown className="h-4 w-4" /></button>
                <div className="w-px h-4 bg-border mx-1" />
                <button onClick={() => duplicateBlock(block.id)} className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-muted" title={T.btnDuplicate}><Copy className="h-4 w-4" /></button>
                <button onClick={() => setBlockToDelete(block.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted" title={T.btnDelete}><Trash2 className="h-4 w-4" /></button>
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
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{T.labelQuizType}</label>
                    <select
                      value={block.quizType || 'MULTIPLE_CHOICE'}
                      onChange={(e) => updateBlock(block.id, { quizType: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary"
                    >
                      <option value="MULTIPLE_CHOICE">{T.quizTypeMultipleChoice}</option>
                      <option value="SENTENCE_BUILDER">{T.quizTypeSentenceBuilder}</option>
                      <option value="ERROR_SPOTLIGHT">{T.quizTypeErrorSpotlight}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{T.labelQuestion}</label>
                  <Input
                    type="text"
                    value={block.question || ''}
                    onChange={(e) => updateBlock(block.id, { question: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary"
                    placeholder={T.placeholderQuestion}
                  />
                </div>

                {block.quizType === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-3 bg-muted/20 p-3 rounded-xl border border-border">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">{T.labelOptions}</label>
                    {(block.options || ['', '', '', '']).map((opt, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="w-6 h-6 flex items-center justify-center bg-muted text-muted-foreground font-bold text-[10px] rounded-full shrink-0 border border-border">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <Input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(block.options || ['', '', '', ''])];
                            newOpts[i] = e.target.value;
                            updateBlock(block.id, { options: newOpts });
                          }}
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
                          placeholder={T.placeholderOption.replace('{index}', String(i + 1))}
                        />
                        <button
                          onClick={() => updateBlock(block.id, { answer: opt })}
                          className={`p-1.5 rounded-md text-xs font-bold transition-all border cursor-pointer ${
                            block.answer === opt && opt.trim() !== ''
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-muted text-muted-foreground hover:text-foreground border-border'
                          }`}
                          title={T.btnMarkCorrect}
                        >
                          {T.btnCorrect}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {block.quizType === 'SENTENCE_BUILDER' && (
                  <div className="space-y-4 bg-muted/20 p-3 rounded-xl border border-border">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{T.labelShuffledWords}</label>
                      <Input
                        type="text"
                        value={(block.words || []).join(', ')}
                        onChange={(e) => updateBlock(block.id, { words: e.target.value.split(',').map(w => w.trim()).filter(Boolean) })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                        placeholder={T.placeholderShuffledWords}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{T.labelCorrectSentence}</label>
                      <Input
                        type="text"
                        value={block.answer || ''}
                        onChange={(e) => updateBlock(block.id, { answer: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                        placeholder={T.placeholderCorrectSentence}
                      />
                    </div>
                  </div>
                )}

                {block.quizType === 'ERROR_SPOTLIGHT' && (
                  <div className="space-y-4 bg-muted/20 p-3 rounded-xl border border-border">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{T.labelErrorSentence}</label>
                      <Input
                        type="text"
                        value={block.sentence || ''}
                        onChange={(e) => updateBlock(block.id, { sentence: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                        placeholder={T.placeholderErrorSentence}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{T.labelIncorrectWord}</label>
                        <Input
                          type="text"
                          value={block.incorrectWord || ''}
                          onChange={(e) => updateBlock(block.id, { incorrectWord: e.target.value })}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                          placeholder={T.placeholderIncorrectWord}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{T.labelCorrectWord}</label>
                        <Input
                          type="text"
                          value={block.correctWord || ''}
                          onChange={(e) => updateBlock(block.id, { correctWord: e.target.value, answer: e.target.value })}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground"
                          placeholder={T.placeholderCorrectWord}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" /> {T.labelExplanation}
                  </label>
                  <Textarea
                    value={block.explanation || ''}
                    onChange={(e) => updateBlock(block.id, { explanation: e.target.value })}
                    rows={2}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-amber-500/55 resize-none"
                    placeholder={T.placeholderExplanation}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Block Menu */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-4">
          <button onClick={() => handleAddBlock('text')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition cursor-pointer bg-transparent">
            <FileText className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{T.blockText}</span>
          </button>
          <button onClick={() => handleAddBlock('formula')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition cursor-pointer bg-transparent">
            <Binary className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{T.blockFormula}</span>
          </button>
          <button onClick={() => handleAddBlock('example')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition cursor-pointer bg-transparent">
            <FileText className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{T.blockExample}</span>
          </button>
          <button onClick={() => handleAddBlock('quiz')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition cursor-pointer bg-transparent">
            <HelpCircle className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{T.blockQuiz}</span>
          </button>
          <button onClick={() => handleAddBlock('callout')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition cursor-pointer bg-transparent">
            <AlertCircle className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{T.blockCallout}</span>
          </button>
          <button onClick={() => handleAddBlock('media')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition cursor-pointer bg-transparent">
            <Video className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{T.blockMedia}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
