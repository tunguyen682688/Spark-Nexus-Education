import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame, Crown, ChevronLeft } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { useGrammarLeaderboard } from '../hooks/use-grammar-analytics';
import { GRAMMAR_UI_TEXT } from '../constants';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  rank: number;
}

interface GrammarLeaderboardContainerProps {
  onBack: () => void;
}

export function GrammarLeaderboardContainer({ onBack }: GrammarLeaderboardContainerProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all-time'>('week');
  const { data: leaderboardData = [], isLoading } = useGrammarLeaderboard(timeframe);

  const isCurrentUser = (name: string) =>
    name.toLowerCase().includes('mock') ||
    name.includes(GRAMMAR_UI_TEXT.leaderboard.userBadge);

  const top3 = leaderboardData.slice(0, 3) as LeaderboardUser[];
  const others = leaderboardData.slice(3) as LeaderboardUser[];

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10 min-h-screen bg-background text-foreground">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 flex items-center gap-2">
              <Trophy className="h-8 w-8 text-amber-400" />
              {GRAMMAR_UI_TEXT.leaderboard.title}
            </h1>
            <p className="text-muted-foreground font-medium">{GRAMMAR_UI_TEXT.leaderboard.subtitle}</p>
          </div>
        </div>

        <div className="flex bg-muted rounded-xl p-1 border border-border">
          <button 
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'week' ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {GRAMMAR_UI_TEXT.leaderboard.btnWeek}
          </button>
          <button 
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeframe === 'month' ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {GRAMMAR_UI_TEXT.leaderboard.btnMonth}
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="relative pt-12 pb-6 flex items-end justify-center gap-2 sm:gap-6">
        {/* Hạng 2 */}
        {top3[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center z-10"
          >
            <div className="relative mb-2">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl drop-shadow-[0_0_10px_rgba(192,192,192,0.8)]">
                <span role="img" aria-label="Huy chương bạc">
                  🥈
                </span>
              </div>
              <div className="h-16 w-16 rounded-full bg-secondary border-4 border-border shadow-[0_0_20px_rgba(192,192,192,0.3)] flex items-center justify-center text-3xl">
                {top3[1].avatar}
              </div>
            </div>
            <div className="bg-gradient-to-t from-secondary/80 to-secondary/30 border border-border w-24 sm:w-32 h-28 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-xl">
              <span className="font-bold text-foreground text-sm truncate w-full text-center px-2">{top3[1].name}</span>
              <span className="font-black text-muted-foreground mt-1 flex items-center text-xs"><Star className="w-3 h-3 text-amber-400 mr-1"/>{top3[1].xp}</span>
              <span className="text-4xl font-black text-muted-foreground/30 mt-2">2</span>
            </div>
          </motion.div>
        )}

        {/* Hạng 1 */}
        {top3[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center z-20"
          >
            <div className="relative mb-4">
              <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400 h-8 w-8 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
              <div className="h-20 w-20 rounded-full bg-secondary border-4 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)] flex items-center justify-center text-4xl">
                {top3[0].avatar}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                {GRAMMAR_UI_TEXT.leaderboard.championBadge}
              </div>
            </div>
            <div className="bg-gradient-to-t from-amber-900/40 to-amber-700/20 border border-amber-500/50 w-28 sm:w-36 h-36 rounded-t-2xl flex flex-col items-center justify-start pt-6 shadow-[0_0_40px_rgba(251,191,36,0.15)]">
              <span className="font-black text-amber-100 text-base truncate w-full text-center px-2">{top3[0].name}</span>
              <span className="font-black text-amber-400 mt-1 flex items-center text-sm"><Star className="w-4 h-4 mr-1"/>{top3[0].xp}</span>
              <span className="text-5xl font-black text-amber-500/20 mt-2">1</span>
            </div>
          </motion.div>
        )}

        {/* Hạng 3 */}
        {top3[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center z-10"
          >
            <div className="relative mb-2">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl drop-shadow-[0_0_10px_rgba(205,127,50,0.8)]">
                <span role="img" aria-label="Huy chương đồng">
                  🥉
                </span>
              </div>
              <div className="h-16 w-16 rounded-full bg-secondary border-4 border-[#CD7F32] shadow-[0_0_20px_rgba(205,127,50,0.3)] flex items-center justify-center text-3xl">
                {top3[2].avatar}
              </div>
            </div>
            <div className="bg-gradient-to-t from-orange-500/20 to-orange-500/5 border border-orange-500/40 w-24 sm:w-32 h-24 rounded-t-2xl flex flex-col items-center justify-start pt-4 shadow-xl">
              <span className="font-bold text-orange-200/80 text-sm truncate w-full text-center px-2">{top3[2].name}</span>
              <span className="font-black text-orange-400/80 mt-1 flex items-center text-xs"><Star className="w-3 h-3 text-amber-400 mr-1"/>{top3[2].xp}</span>
              <span className="text-4xl font-black text-[#CD7F32]/30 mt-2">3</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* List Others */}
      <div className="space-y-3">
        {others.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-2xl border ${isCurrentUser(user.name) ? 'bg-primary/10 border-primary/45 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-card border-border hover:bg-muted/40'} transition-colors`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 text-center font-bold text-muted-foreground">{user.rank}</div>
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-2xl border border-border">
                {user.avatar}
              </div>
              <div>
                <div className={`font-bold ${isCurrentUser(user.name) ? 'text-primary' : 'text-foreground'}`}>
                  {user.name}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs font-medium">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400" /> {user.xp.toLocaleString()} XP
                  </span>
                  <span className="text-muted-foreground/75 flex items-center gap-1 border-l border-border pl-3">
                    <Flame className="h-3 w-3 text-orange-500" /> {user.streak} {GRAMMAR_UI_TEXT.leaderboard.streakUnit}
                  </span>
                </div>
              </div>
            </div>
            
            {isCurrentUser(user.name) && (
              <div className="hidden sm:block">
                <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                  {GRAMMAR_UI_TEXT.leaderboard.userBadge}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
