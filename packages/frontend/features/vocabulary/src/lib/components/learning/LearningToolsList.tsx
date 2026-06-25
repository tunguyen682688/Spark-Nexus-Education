import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { LEARNING_TOOL_CONFIG } from '../../constants';
import { VOCABULARY_UI_TEXT } from '../../constants/vocabulary-ui-text';

export interface LearningTool {
  name: string;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
  badge?: string;
  gradient: string;
  iconBg: string;
  badgeColor?: string;
  disabled?: boolean;
}

export interface LearningToolsListProps {
  vocabularySetId: string;
  tools?: LearningTool[];
}

/** Icon definitions – one per key */
const ICONS: Record<string, React.ReactNode> = {
  flashcard: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path strokeLinecap="round" d="M8 12h8M8 15h5" />
    </svg>
  ),
  study: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  ),
  test: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  ),
  match: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h7m-7 6h7m-7 6h7M14 6h6M14 12h6M14 18h6" />
    </svg>
  ),
  box: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
    </svg>
  ),
};

const TOOL_STYLES: Record<string, { gradient: string; iconBg: string; badgeColor?: string }> = {
  flashcard: {
    gradient: 'from-blue-600/15 via-blue-500/8 to-transparent border-blue-500/25 hover:border-blue-400/50',
    iconBg: 'bg-blue-500/15 text-blue-400 group-hover:bg-blue-500/25',
  },
  study: {
    gradient: 'from-purple-600/15 via-purple-500/8 to-transparent border-purple-500/25 hover:border-purple-400/50',
    iconBg: 'bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25',
  },
  test: {
    gradient: 'from-emerald-600/15 via-emerald-500/8 to-transparent border-emerald-500/25 hover:border-emerald-400/50',
    iconBg: 'bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
  match: {
    gradient: 'from-amber-600/10 via-amber-500/5 to-transparent border-amber-600/20 hover:border-amber-500/40',
    iconBg: 'bg-amber-500/10 text-amber-400/70 group-hover:bg-amber-500/20',
    badgeColor: 'bg-amber-800/30 text-amber-500 border border-amber-700/30',
  },
  box: {
    gradient: 'from-slate-600/15 via-slate-500/8 to-transparent border-slate-600/25 hover:border-slate-500/40',
    iconBg: 'bg-slate-500/15 text-slate-400 group-hover:bg-slate-500/25',
    badgeColor: 'bg-slate-700/40 text-slate-400 border border-slate-700/50',
  },
};

const DISABLED_TOOLS = new Set(['match', 'box']);

const LearningToolsList: React.FC<LearningToolsListProps> = ({
  vocabularySetId,
  tools,
}) => {
  const navigate = useNavigate();

  const defaultTools: LearningTool[] =
    tools ??
    LEARNING_TOOL_CONFIG.map((config) => {
      const styles = TOOL_STYLES[config.key] ?? TOOL_STYLES['box'];
      const isDisabled = DISABLED_TOOLS.has(config.key);

      return {
        name: config.label,
        description: config.description,
        icon: ICONS[config.key] ?? null,
        badge: config.badge,
        gradient: styles.gradient,
        iconBg: styles.iconBg,
        badgeColor: styles.badgeColor,
        disabled: isDisabled,
        onClick: () => {
          if (isDisabled) return;
          if (config.key === 'flashcard') {
            navigate(ROUTES.VOCABULARIES.FLASHCARD.replace(':id', vocabularySetId));
          } else if (config.key === 'study') {
            navigate(ROUTES.VOCABULARIES.QUIZ.replace(':id', vocabularySetId));
          } else if (config.key === 'test') {
            navigate(ROUTES.VOCABULARIES.TEST.replace(':id', vocabularySetId));
          }
        },
      };
    });

  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
        {VOCABULARY_UI_TEXT.LEARNING_TOOLS.TITLE}
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {defaultTools.map((tool, index) => (
          <div
            key={index}
            onClick={!tool.disabled ? tool.onClick : undefined}
            className={`group relative flex flex-col gap-3 p-4 rounded-xl border bg-gradient-to-br transition-all duration-200 overflow-hidden
              ${tool.gradient}
              ${tool.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
              }`}
          >
            {/* Badge */}
            {tool.badge && (
              <span className={`absolute top-2.5 right-2.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                tool.badgeColor ?? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {tool.badge}
              </span>
            )}

            {/* Icon */}
            <div className={`p-2.5 rounded-lg self-start transition-all duration-200 ${tool.iconBg}`}>
              {tool.icon}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors duration-200 leading-tight pr-6">
                {tool.name}
              </span>
              {tool.description && (
                <span className="text-[10px] text-slate-500 font-medium leading-snug">
                  {tool.description}
                </span>
              )}
            </div>

            {/* Hover bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-all duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningToolsList;
