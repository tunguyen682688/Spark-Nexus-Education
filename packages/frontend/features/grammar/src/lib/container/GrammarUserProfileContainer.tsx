import { motion } from 'framer-motion';
import {
  Trophy,
  Flame,
  Star,
  ShieldCheck,
  ArrowLeft,
  Award,
  Zap,
  BookOpen,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { Button, Card } from '@spark-nest-ed/frontend-shared-components';
import type { CommunityGrammarCertificate } from '../types';
import { useGrammarUserProfile } from '../hooks';
import { GRAMMAR_UI_TEXT } from '../constants';

interface GrammarUserProfileContainerProps {
  onBack: () => void;
}

export function GrammarUserProfileContainer({
  onBack,
}: GrammarUserProfileContainerProps) {
  const {
    isLoading,
    currentXP,
    streakDays,
    completedLessons,
    totalLessons,
    percentComplete,
    brokenTrapsCount,
    skillData,
    certificates,
  } = useGrammarUserProfile();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
          <p className="text-sm text-muted-foreground font-semibold">{GRAMMAR_UI_TEXT.userProfile.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {GRAMMAR_UI_TEXT.userProfile.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {GRAMMAR_UI_TEXT.userProfile.subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Thống kê & Radar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar & Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 rounded-3xl bg-card border-border text-card-foreground flex flex-col items-center text-center relative overflow-hidden shadow-xl">
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />
              <div className="h-24 w-24 rounded-full bg-secondary border-4 border-card shadow-xl flex items-center justify-center relative z-10 mb-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20" />
                <span role="img" aria-label="User Avatar" className="text-3xl">👤</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1 z-10">
                {GRAMMAR_UI_TEXT.userProfile.rankName}
              </h2>
              <div className="flex items-center gap-2 text-indigo-400 font-medium z-10">
                <Trophy className="h-4 w-4" />
                {GRAMMAR_UI_TEXT.userProfile.avatarRank}
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <Card className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <div className="flex items-center gap-2 text-orange-400 mb-2">
                <Flame className="h-5 w-5" />
                <span className="font-bold text-xs">{GRAMMAR_UI_TEXT.userProfile.statStreak}</span>
              </div>
              <div className="text-2xl font-black text-foreground">
                {streakDays}{' '}
                <span className="text-sm font-normal text-muted-foreground">{GRAMMAR_UI_TEXT.userProfile.statStreakUnit}</span>
              </div>
            </Card>

            <Card className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Star className="h-5 w-5" />
                <span className="font-bold text-xs">{GRAMMAR_UI_TEXT.userProfile.statXP}</span>
              </div>
              <div className="text-2xl font-black text-foreground">{currentXP}</div>
            </Card>

            <Card className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-bold text-xs">{GRAMMAR_UI_TEXT.userProfile.statTraps}</span>
              </div>
              <div className="text-2xl font-black text-foreground">
                {brokenTrapsCount}
              </div>
            </Card>

            <Card className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <BookOpen className="h-5 w-5" />
                <span className="font-bold text-xs">{GRAMMAR_UI_TEXT.userProfile.statLessons}</span>
              </div>
              <div className="text-2xl font-black text-foreground">
                {completedLessons}
                <span className="text-sm text-muted-foreground/75 font-normal">
                  /{totalLessons}
                </span>
              </div>
            </Card>
          </motion.div>

          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 rounded-3xl bg-card border-border text-card-foreground shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-400" />
                  {GRAMMAR_UI_TEXT.userProfile.masteryLabel}
                </h3>
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  {percentComplete}%
                </span>
              </div>

              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={skillData}
                  >
                    <PolarGrid className="stroke-border/60" stroke="currentColor" />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fill: 'currentColor', className: 'fill-muted-foreground', fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--popover-foreground))',
                        borderRadius: '12px',
                      }}
                      itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                      formatter={(value: number) => [`${value}%`, GRAMMAR_UI_TEXT.userProfile.chartTooltipLabel]}
                    />
                    <Radar
                      name="Skills"
                      dataKey="value"
                      stroke="#818cf8"
                      strokeWidth={2}
                      fill="#818cf8"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Cột phải: Chứng chỉ */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full"
          >
            <Card className="p-6 rounded-3xl bg-card border-border text-card-foreground h-full flex flex-col shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">
                    {GRAMMAR_UI_TEXT.userProfile.certRoomTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {GRAMMAR_UI_TEXT.userProfile.certRoomDesc}
                  </p>
                </div>
              </div>

              {!certificates || certificates.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-2xl">
                  <Award className="h-16 w-16 text-slate-700 mb-4" />
                  <h4 className="text-lg font-bold text-foreground mb-2">
                    {GRAMMAR_UI_TEXT.userProfile.noCertsTitle}
                  </h4>
                  <p className="text-sm text-slate-500 max-w-xs">
                    {GRAMMAR_UI_TEXT.userProfile.noCertsDesc}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((cert: CommunityGrammarCertificate) => (
                    <motion.div
                      key={cert.id}
                      whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
                      className="group relative h-48 rounded-2xl overflow-hidden perspective-1000"
                      style={{ perspective: 1000 }}
                    >
                      <Card className="absolute inset-0 bg-gradient-to-br from-card to-muted border-border rounded-2xl transition-transform duration-300 group-hover:border-indigo-500/50 shadow-xl flex flex-col justify-between p-5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                              <span className="text-xs font-bold text-indigo-300">
                                {cert.level}
                              </span>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                                {GRAMMAR_UI_TEXT.userProfile.certBadge}
                              </div>
                              <div className="font-black text-foreground">
                                {cert.examType}
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {cert.serialNumber}
                          </div>
                        </div>

                        <div className="text-center">
                          <Award className="h-12 w-12 text-indigo-400/20 mx-auto" />
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-[10px] text-slate-400">
                              {GRAMMAR_UI_TEXT.userProfile.certDateLabel}
                            </div>
                            <div className="text-xs font-medium text-foreground/80">
                              {new Date(cert.issuedAt).toLocaleDateString(
                                'vi-VN'
                              )}
                            </div>
                          </div>
                          {cert.metadata?.bestScore && (
                            <div className="text-right">
                              <div className="text-[10px] text-slate-400">
                                {GRAMMAR_UI_TEXT.userProfile.certScoreLabel}
                              </div>
                              <div className="text-lg font-black text-indigo-400">
                                {cert.metadata.bestScore}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
