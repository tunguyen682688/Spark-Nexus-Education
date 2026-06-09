import { FC } from 'react';
import { ArrowLeft, Plus, Trash2, ClipboardList } from 'lucide-react';

import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem, 
  Label 
} from '@spark-nest-ed/frontend-shared-components';
import { useGrammarExamCreator } from '../hooks';
import type { ExamQuestion } from '../types';
import {
  MultipleChoiceQuestionEditor,
  SentenceBuilderQuestionEditor,
  ErrorSpotlightQuestionEditor,
} from '../components';
import { GRAMMAR_UI_TEXT } from '../constants';

interface GrammarExamCreatorContainerProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const GrammarExamCreatorContainer: FC<
  GrammarExamCreatorContainerProps
> = ({ onSuccess, onCancel }) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    level,
    setLevel,
    examType,
    setExamType,
    timeLimitMins,
    setTimeLimitMins,
    questions,
    createMutation,
    handleAddQuestion,
    handleRemoveQuestion,
    handleUpdateQuestion,
    handleUpdateOption,
    handleSubmit,
  } = useGrammarExamCreator({ onSuccess, onCancel });

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans py-10 px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Navigation & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-455 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                {GRAMMAR_UI_TEXT.examCreator.studioBadge}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
              {GRAMMAR_UI_TEXT.examCreator.title}
            </h1>
          </div>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* Section 1: Metadata */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xl">
            <h3 className="text-sm font-extrabold text-white border-b border-border pb-2 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-400" />
              {GRAMMAR_UI_TEXT.examCreator.metaSectionTitle}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase block">
                  {GRAMMAR_UI_TEXT.examCreator.labelTitle}
                </Label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={GRAMMAR_UI_TEXT.examCreator.placeholderTitle}
                  className="w-full bg-muted/50 border-border rounded-xl px-4 py-3 h-11 text-xs text-white placeholder-slate-550 focus-visible:ring-blue-500/50"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase block">
                  {GRAMMAR_UI_TEXT.examCreator.labelDesc}
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={GRAMMAR_UI_TEXT.examCreator.placeholderDesc}
                  className="w-full h-24 bg-muted/50 border-border rounded-xl px-4 py-3 text-xs text-white placeholder-slate-550 focus-visible:ring-blue-500/50 resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase block">
                  {GRAMMAR_UI_TEXT.examCreator.labelExamType}
                </Label>
                <Select value={examType} onValueChange={(val: any) => setExamType(val)}>
                  <SelectTrigger className="w-full bg-muted/50 border-border text-xs text-white rounded-xl h-11">
                    <SelectValue placeholder={GRAMMAR_UI_TEXT.examCreator.placeholderExamType} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-border text-xs text-white">
                    <SelectItem value="TOEIC">TOEIC Practice</SelectItem>
                    <SelectItem value="IELTS">IELTS Academic</SelectItem>
                    <SelectItem value="VSTEP">VSTEP Standard</SelectItem>
                    <SelectItem value="CEFR">CEFR Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase block">
                  {GRAMMAR_UI_TEXT.examCreator.labelLevel}
                </Label>
                <Select value={level} onValueChange={(val: string) => setLevel(val)}>
                  <SelectTrigger className="w-full bg-muted/50 border-border text-xs text-white rounded-xl h-11">
                    <SelectValue placeholder={GRAMMAR_UI_TEXT.examCreator.placeholderLevel} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-border text-xs text-white">
                    <SelectItem value="ALL">{GRAMMAR_UI_TEXT.examCreator.levelAll}</SelectItem>
                    <SelectItem value="A1">CEFR A1</SelectItem>
                    <SelectItem value="A2">CEFR A2</SelectItem>
                    <SelectItem value="B1">CEFR B1</SelectItem>
                    <SelectItem value="B2">CEFR B2</SelectItem>
                    <SelectItem value="C1">CEFR C1</SelectItem>
                    <SelectItem value="C2">CEFR C2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-500 uppercase block">
                  {GRAMMAR_UI_TEXT.examCreator.labelTimeLimit}
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={timeLimitMins}
                  onChange={(e) =>
                    setTimeLimitMins(parseInt(e.target.value) || 10)
                  }
                  className="w-full bg-muted/50 border-border rounded-xl px-4 py-3 h-11 text-xs text-white focus-visible:ring-blue-500/50"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Questions Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                {GRAMMAR_UI_TEXT.examCreator.questionListTitle.replace('{count}', String(questions.length))}
              </h2>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3.5 py-2 text-xs font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/15 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> {GRAMMAR_UI_TEXT.examCreator.btnAddQuestion}
              </button>
            </div>

            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20" />

                {/* Question Header row */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {GRAMMAR_UI_TEXT.examCreator.questionHeader.replace('{index}', String(idx + 1))}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="h-8 w-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/15 hover:border-rose-500/20 text-rose-450 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Grid fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-500 uppercase block">
                      {GRAMMAR_UI_TEXT.examCreator.labelFormat}
                    </Label>
                    <Select
                      value={q.type}
                      onValueChange={(val: any) => {
                        const newType = val as ExamQuestion['type'];
                        const updates: Partial<ExamQuestion> = {
                          type: newType,
                        };
                        if (newType === 'MULTIPLE_CHOICE') {
                          updates.options = ['', '', '', ''];
                          updates.answer = '';
                        } else if (newType === 'SENTENCE_BUILDER') {
                          updates.words = [];
                          updates.answer = '';
                        } else if (newType === 'ERROR_SPOTLIGHT') {
                          updates.sentence = '';
                          updates.incorrectWord = '';
                          updates.correctWord = '';
                          updates.answer = '';
                        }
                        handleUpdateQuestion(idx, updates);
                      }}
                    >
                      <SelectTrigger className="w-full bg-muted/50 border-border text-xs text-white rounded-xl h-10">
                        <SelectValue placeholder={GRAMMAR_UI_TEXT.examCreator.placeholderFormat} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-border text-xs text-white">
                        <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                        <SelectItem value="SENTENCE_BUILDER">Sentence Rebuilder</SelectItem>
                        <SelectItem value="ERROR_SPOTLIGHT">Error Spotlight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-slate-500 uppercase block">
                      {GRAMMAR_UI_TEXT.examCreator.labelCategory}
                    </Label>
                    <Select
                      value={q.category}
                      onValueChange={(val: any) =>
                        handleUpdateQuestion(idx, {
                          category: val as ExamQuestion['category'],
                        })
                      }
                    >
                      <SelectTrigger className="w-full bg-muted/50 border-border text-xs text-white rounded-xl h-10">
                        <SelectValue placeholder={GRAMMAR_UI_TEXT.examCreator.placeholderCategory} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-border text-xs text-white">
                        <SelectItem value="syntax">{GRAMMAR_UI_TEXT.examCreator.categorySyntax}</SelectItem>
                        <SelectItem value="tenses">{GRAMMAR_UI_TEXT.examCreator.categoryTenses}</SelectItem>
                        <SelectItem value="morphology">{GRAMMAR_UI_TEXT.examCreator.categoryMorphology}</SelectItem>
                        <SelectItem value="modality">{GRAMMAR_UI_TEXT.examCreator.categoryModality}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 1. INPUT CHO TRẮC NGHIỆM */}
                  {q.type === 'MULTIPLE_CHOICE' && (
                    <MultipleChoiceQuestionEditor
                      idx={idx}
                      question={q}
                      handleUpdateQuestion={handleUpdateQuestion}
                      handleUpdateOption={handleUpdateOption}
                    />
                  )}

                  {/* 2. INPUT CHO SENTENCE REBUILDER */}
                  {q.type === 'SENTENCE_BUILDER' && (
                    <SentenceBuilderQuestionEditor
                      idx={idx}
                      question={q}
                      handleUpdateQuestion={handleUpdateQuestion}
                    />
                  )}

                  {/* 3. INPUT CHO ERROR SPOTLIGHT */}
                  {q.type === 'ERROR_SPOTLIGHT' && (
                    <ErrorSpotlightQuestionEditor
                      idx={idx}
                      question={q}
                      handleUpdateQuestion={handleUpdateQuestion}
                    />
                  )}

                  {/* GIẢI THÍCH SƯ PHẠM CHUNG */}
                  <div className="space-y-1.5 md:col-span-3">
                    <Label className="text-[9px] font-black text-slate-500 uppercase block">
                      {GRAMMAR_UI_TEXT.examCreator.labelExplanation}
                    </Label>
                    <Textarea
                      value={q.explanation || ''}
                      onChange={(e) =>
                        handleUpdateQuestion(idx, {
                          explanation: e.target.value,
                        })
                      }
                      placeholder={GRAMMAR_UI_TEXT.examCreator.placeholderExplanation}
                      className="w-full h-20 bg-muted/50 border-border rounded-xl px-4 py-2.5 text-xs text-white focus-visible:ring-blue-500/50 resize-none"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 border-t border-border pt-5 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-border text-slate-450 hover:text-slate-200 text-xs py-3.5 px-6 rounded-xl font-bold cursor-pointer"
            >
              {GRAMMAR_UI_TEXT.examCreator.btnCancel}
            </Button>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 px-8 rounded-xl border-none shadow-lg shadow-emerald-500/20 text-xs cursor-pointer active:scale-95 transition-all uppercase tracking-wider disabled:opacity-50"
            >
              {createMutation.isPending
                ? GRAMMAR_UI_TEXT.examCreator.btnPublishing
                : GRAMMAR_UI_TEXT.examCreator.btnPublish}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GrammarExamCreatorContainer;
