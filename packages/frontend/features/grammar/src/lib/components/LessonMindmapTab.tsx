import { FC, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { GRAMMAR_UI_TEXT } from '../constants';

interface LessonMindmapTabProps {
  title: string;
  level: string;
}

type MindmapNode = 'CENTRAL' | 'FORMULA' | 'USAGE' | 'EXAMPLES';

export const LessonMindmapTab: FC<LessonMindmapTabProps> = ({ title, level }) => {
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);

  const getDetail = (node: MindmapNode) => {
    if (node === 'CENTRAL') return GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeCentralDetail.replace('{title}', title).replace('{level}', level);
    if (node === 'FORMULA') return GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeFormulaDetail;
    if (node === 'USAGE') return GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeUsageDetail;
    return GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeExamplesDetail;
  };

  const getLabel = (node: MindmapNode) => {
    if (node === 'CENTRAL') return GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeCentral;
    if (node === 'FORMULA') return GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeFormula;
    if (node === 'USAGE') return GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeUsage;
    return GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeExamples;
  };

  return (
    <div className="bg-card border border-border text-card-foreground rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-300">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-5 w-5 text-indigo-400" /> {GRAMMAR_UI_TEXT.lessonDetail.mindmapTitle}
        </h3>
        <p className="text-xs text-muted-foreground/70">{GRAMMAR_UI_TEXT.lessonDetail.mindmapDesc}</p>
      </div>

      <div className="relative border border-border bg-background/60 p-4 flex flex-col items-center justify-center min-h-[380px] overflow-hidden">
        <svg className="w-full max-w-[580px] h-[340px]" viewBox="0 0 600 350">
          <line x1="300" y1="175" x2="130" y2="90" className="stroke-indigo-500/40" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="300" y1="175" x2="470" y2="90" className="stroke-indigo-500/40" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="300" y1="175" x2="300" y2="280" className="stroke-indigo-500/40" strokeWidth="2" strokeDasharray="3 3" />

          <g className="cursor-pointer group" onClick={() => setSelectedNode('CENTRAL')}>
            <rect x="200" y="145" width="200" height="60" rx="30"
              className="fill-indigo-600/10 stroke-indigo-500 group-hover:fill-indigo-600/20 group-hover:scale-102 transition-all" strokeWidth="2" />
            <text x="300" y="180" className="fill-indigo-100 font-extrabold text-xs text-center" textAnchor="middle">{title}</text>
          </g>

          <g className="cursor-pointer group" onClick={() => setSelectedNode('FORMULA')}>
            <rect x="50" y="60" width="160" height="50" rx="12"
              className="fill-blue-500/10 stroke-blue-500 group-hover:fill-blue-500/20 transition" strokeWidth="1.5" />
            <text x="130" y="90" className="fill-blue-300 font-bold text-xs" textAnchor="middle">{GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeFormula}</text>
          </g>

          <g className="cursor-pointer group" onClick={() => setSelectedNode('USAGE')}>
            <rect x="390" y="60" width="160" height="50" rx="12"
              className="fill-purple-500/10 stroke-purple-500 group-hover:fill-purple-500/20 transition" strokeWidth="1.5" />
            <text x="470" y="90" className="fill-purple-300 font-bold text-xs" textAnchor="middle">{GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeUsage}</text>
          </g>

          <g className="cursor-pointer group" onClick={() => setSelectedNode('EXAMPLES')}>
            <rect x="220" y="255" width="160" height="50" rx="12"
              className="fill-emerald-500/10 stroke-emerald-500 group-hover:fill-emerald-500/20 transition" strokeWidth="1.5" />
            <text x="300" y="285" className="fill-emerald-300 font-bold text-xs" textAnchor="middle">{GRAMMAR_UI_TEXT.lessonDetail.mindmapNodeExamples}</text>
          </g>
        </svg>

        {selectedNode && (
          <div className="absolute inset-x-6 bottom-6 bg-card/95 border border-border rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{getLabel(selectedNode)}</span>
              <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground p-1 border-none bg-transparent cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">{getDetail(selectedNode)}</p>
          </div>
        )}
      </div>
    </div>
  );
};
