import React from 'react';
import { Sparkles, Plus, Library } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { LISTENING_ROUTES, LISTENING_HUB_TEXT } from '../constants';

interface HubBannerProps {
  onNavigate: (route: string) => void;
  onNavigateContribute: () => void;
}

export const HubBanner: React.FC<HubBannerProps> = ({ onNavigate, onNavigateContribute }) => {
  const text = LISTENING_HUB_TEXT.BANNER;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-purple-900/10 via-card to-card p-8 shadow-2xl">
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-650/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            {text.BADGE}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-100 leading-tight tracking-tight">
            {text.TITLE}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
            {text.DESC}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-center">
          <Button
            onClick={() => onNavigate(LISTENING_ROUTES.EXPLORE)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-extrabold hover:text-white transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            {text.EXPLORE_CTA}
          </Button>
          <Button
            onClick={() => onNavigate(LISTENING_ROUTES.LIBRARY)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border text-secondary-foreground text-xs font-extrabold transition-all active:scale-98"
          >
            <Library className="w-4 h-4 text-purple-400" />
            {text.LIBRARY_CTA}
          </Button>
          <Button
            onClick={onNavigateContribute}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/20 hover:scale-102 active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4" />
            {text.CONTRIBUTE_CTA}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HubBanner;
