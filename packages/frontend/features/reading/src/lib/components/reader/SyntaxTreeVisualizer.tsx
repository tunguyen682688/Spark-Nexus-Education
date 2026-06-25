import React, { useState } from 'react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import { HelpCircle, ChevronDown, ChevronRight, Info } from 'lucide-react';

export interface SyntaxNode {
  label: string;
  text?: string;
  children?: SyntaxNode[];
}

interface SyntaxTreeVisualizerProps {
  tree: SyntaxNode | null;
  sentence: string;
}

const GRAMMAR_INFO: Record<string, { name: string; desc: string; category: string }> = {
  S: { name: 'Sentence', desc: 'Cấu trúc câu hoàn chỉnh bao gồm chủ ngữ và vị ngữ.', category: 'Sentence' },
  NP: { name: 'Noun Phrase', desc: 'Cụm danh từ đóng vai trò như một danh từ, thường có danh từ chính kèm theo các từ hạn định hoặc tính từ bổ nghĩa.', category: 'Phrase' },
  VP: { name: 'Verb Phrase', desc: 'Cụm động từ đóng vai trò làm vị ngữ, diễn tả hành động, trạng thái hoặc quá trình của chủ ngữ.', category: 'Phrase' },
  PP: { name: 'Prepositional Phrase', desc: 'Cụm giới từ bổ nghĩa bắt đầu bằng giới từ bổ sung thông tin nơi chốn, thời gian, cách thức...', category: 'Phrase' },
  ADJP: { name: 'Adjective Phrase', desc: 'Cụm tính từ tập trung xung quanh tính từ, bổ nghĩa làm rõ thuộc tính của danh từ.', category: 'Phrase' },
  ADVP: { name: 'Adverb Phrase', desc: 'Cụm trạng từ tập trung bổ nghĩa cho động từ, tính từ hoặc trạng từ khác.', category: 'Phrase' },
  NN: { name: 'Noun (Danh từ)', desc: 'Từ dùng để chỉ người, vật, địa điểm, khái niệm hoặc hiện tượng.', category: 'Word' },
  VB: { name: 'Verb (Động từ)', desc: 'Từ chỉ hành động, trạng thái, sự tồn tại hoặc thay đổi.', category: 'Word' },
  JJ: { name: 'Adjective (Tính từ)', desc: 'Từ miêu tả đặc điểm, tính chất, số lượng... bổ nghĩa cho danh từ.', category: 'Word' },
  RB: { name: 'Adverb (Trạng từ)', desc: 'Từ biểu thị cách thức, thời gian, mức độ bổ nghĩa động từ/tính từ.', category: 'Word' },
  DT: { name: 'Determiner (Từ hạn định)', desc: 'Từ xác định phạm vi tham chiếu của danh từ (a, an, the, this, that...).', category: 'Word' },
  IN: { name: 'Preposition (Giới từ)', desc: 'Từ chỉ mối quan hệ về không gian, thời gian giữa các thành phần (in, on, at, to...).', category: 'Word' },
  PRP: { name: 'Pronoun (Đại từ)', desc: 'Từ thay thế danh từ để tránh lặp từ (I, you, he, she, it, we, they...).', category: 'Word' },
  CC: { name: 'Conjunction (Liên từ)', desc: 'Từ liên kết các từ, cụm từ hoặc mệnh đề độc lập lại với nhau (and, but, or...).', category: 'Word' },
  MD: { name: 'Modal Verb (Động từ khuyết thiếu)', desc: 'Trợ động từ biểu thị khả năng, sự xin phép, nghĩa vụ bắt buộc (can, will, should, must...).', category: 'Word' },
};

const getNodeColor = (label: string): string => {
  const cleanLabel = label.toUpperCase();
  if (cleanLabel === 'S') return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40';
  if (['NP', 'NN', 'PRP'].includes(cleanLabel)) return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40';
  if (['VP', 'VB'].includes(cleanLabel)) return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40';
  if (['PP', 'IN'].includes(cleanLabel)) return 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/40';
  if (['ADJP', 'JJ'].includes(cleanLabel)) return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40';
  if (['ADVP', 'RB'].includes(cleanLabel)) return 'bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/40';
  if (['MD'].includes(cleanLabel)) return 'bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/40';
  if (['CC'].includes(cleanLabel)) return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40';
  
  return 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-800';
};

const TreeNode: React.FC<{
  node: SyntaxNode;
  depth: number;
  isLast: boolean;
  onSelect: (node: SyntaxNode) => void;
  selectedNode: SyntaxNode | null;
  expandedNodes: Set<string>;
  toggleNode: (nodePath: string) => void;
  nodePath: string;
}> = ({ node, depth, isLast, onSelect, selectedNode, expandedNodes, toggleNode, nodePath }) => {
  const isLeaf = !node.children || node.children.length === 0;
  const isExpanded = expandedNodes.has(nodePath);
  const isSelected = selectedNode?.label === node.label && selectedNode?.text === node.text;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNode(nodePath);
  };

  const handleSelect = () => {
    onSelect(node);
  };

  return (
    <div className="flex flex-col select-none">
      <div 
        className={cn(
          "flex items-center gap-1.5 py-1 px-2 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/40",
          isSelected && "bg-blue-50/40 dark:bg-blue-900/10 font-medium"
        )}
        onClick={handleSelect}
      >
        {/* Toggle Icon */}
        {!isLeaf ? (
          <button 
            onClick={handleToggle}
            className="h-4 w-4 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <div className="w-4 h-4 shrink-0" />
        )}

        {/* Node Label Badge */}
        <span className={cn(
          "px-1.5 py-0.5 rounded text-[10px] font-mono border font-bold uppercase select-none tracking-wider",
          getNodeColor(node.label)
        )}>
          {node.label}
        </span>

        {/* Leaf text value */}
        {isLeaf && node.text && (
          <span className="text-xs font-serif font-bold text-slate-800 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-850 px-1.5 py-0.5 rounded border border-slate-200/30">
            "{node.text}"
          </span>
        )}
      </div>

      {/* Children Nodes */}
      {!isLeaf && isExpanded && node.children && (
        <div className="pl-4 ml-2 border-l border-slate-150 dark:border-slate-800/80 flex flex-col gap-0.5 mt-0.5">
          {node.children.map((child, idx) => {
            const childPath = `${nodePath}-${idx}`;
            return (
              <TreeNode
                key={childPath}
                node={child}
                depth={depth + 1}
                isLast={idx === (node.children?.length ?? 0) - 1}
                onSelect={onSelect}
                selectedNode={selectedNode}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                nodePath={childPath}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SyntaxTreeVisualizer: React.FC<SyntaxTreeVisualizerProps> = ({ tree, sentence }) => {
  const [selectedNode, setSelectedNode] = useState<SyntaxNode | null>(null);
  
  // Default expanded is root node (path "0")
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['0', '0-0', '0-1', '0-2']));

  const toggleNode = (nodePath: string) => {
    const next = new Set(expandedNodes);
    if (next.has(nodePath)) {
      next.delete(nodePath);
    } else {
      next.add(nodePath);
    }
    setExpandedNodes(next);
  };

  const handleSelectNode = (node: SyntaxNode) => {
    setSelectedNode(node);
  };

  if (!tree) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2">
        <HelpCircle className="h-6 w-6 text-slate-300" />
        <span className="text-xs font-medium">Không tìm thấy sơ đồ cây cú pháp cho câu này.</span>
      </div>
    );
  }

  const activeGrammarInfo = selectedNode ? GRAMMAR_INFO[selectedNode.label.toUpperCase()] : null;

  return (
    <div className="space-y-3 flex flex-col h-full max-h-[350px]">
      {/* Scrollable Tree View Container */}
      <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50/30 dark:bg-slate-900/20 overflow-y-auto max-h-[220px] font-sans flex-1">
        <TreeNode
          node={tree}
          depth={0}
          isLast={true}
          onSelect={handleSelectNode}
          selectedNode={selectedNode}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
          nodePath="0"
        />
      </div>

      {/* Grammar details card based on selection */}
      <div className="bg-blue-50/30 dark:bg-slate-850/50 border border-blue-100/30 dark:border-slate-800/80 rounded-xl p-2.5 space-y-1 shrink-0 select-text">
        {activeGrammarInfo ? (
          <>
            <div className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {activeGrammarInfo.category} - {selectedNode?.label}
              </span>
            </div>
            <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-205">
              {activeGrammarInfo.name} {selectedNode?.text && `("${selectedNode.text}")`}
            </h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
              {activeGrammarInfo.desc}
            </p>
          </>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 py-1.5">
            <HelpCircle className="h-4 w-4 text-slate-350 dark:text-slate-600" />
            <span className="text-[10px] font-semibold italic">Nhấp vào một thành phần trên cây cú pháp để xem chi tiết giải thích ngữ pháp.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyntaxTreeVisualizer;
