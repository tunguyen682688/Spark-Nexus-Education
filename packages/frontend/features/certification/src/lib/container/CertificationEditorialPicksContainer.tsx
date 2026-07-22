import React, { useState, useMemo } from 'react';
import { 
  Award, Star, Clock, Users, ArrowRight, Play, Bookmark, 
  ShieldCheck, CheckCircle2, Sparkles, Check
} from 'lucide-react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Button, Badge
} from '@spark-nest-ed/frontend-shared-components';

export const CertificationEditorialPicksContainer: React.FC = () => {
  const [levelFilter, setLevelFilter] = useState<string>('All Picks');
  const [examSelect, setExamSelect] = useState<string>('All Exams');
  const [skillSelect, setSkillSelect] = useState<string>('All Skills');

  const topBadges = [
    { title: 'Expert Curated', desc: 'Selected by exam specialists with proven results', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' },
    { title: 'Quality Assured', desc: 'Strict quality standards and regular updates', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
    { title: 'Proven Effective', desc: 'High completion & success rate by learners', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Best Value', desc: 'Most comprehensive content at the best value', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' }
  ];

  const editorialPicks = [
    {
      id: 'ep1',
      title: 'IELTS Academic Complete Mastery',
      tag: "Editor's Choice",
      tagColor: 'bg-indigo-600 text-white',
      exam: 'IELTS',
      desc: 'The most comprehensive IELTS Academic preparation.',
      rating: '4.9',
      reviews: '12.6K',
      learners: '58.3K',
      mocks: '24',
      minis: '8',
      questions: '3200+',
      level: 'Intermediate',
      duration: '220 mins',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'ep2',
      title: 'TOEIC 900+ Score Booster',
      tag: 'Best Seller',
      tagColor: 'bg-emerald-500 text-white',
      exam: 'TOEIC',
      desc: 'Target 900+ with high-quality practice tests.',
      rating: '4.8',
      reviews: '9.4K',
      learners: '42.1K',
      mocks: '18',
      minis: '6',
      questions: '2800+',
      level: 'Advanced',
      duration: '150 mins',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'ep3',
      title: 'TOEFL iBT Ultimate Preparation',
      tag: 'Top Rated',
      tagColor: 'bg-sky-500 text-white',
      exam: 'TOEFL',
      desc: 'Everything you need to excel in the TOEFL iBT.',
      rating: '4.8',
      reviews: '7.2K',
      learners: '32.6K',
      mocks: '14',
      minis: '5',
      questions: '2100+',
      level: 'Intermediate',
      duration: '180 mins',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'ep4',
      title: 'Cambridge C1 Advanced Mastery',
      tag: 'Highly Recommended',
      tagColor: 'bg-purple-500 text-white',
      exam: 'Cambridge',
      desc: 'Complete practice for Cambridge C1 Advanced exam.',
      rating: '4.8',
      reviews: '7.1K',
      learners: '28.7K',
      mocks: '12',
      minis: '4',
      questions: '1900+',
      level: 'Upper-Intermediate',
      duration: '165 mins',
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=300&auto=format&fit=crop'
    },
    {
      id: 'ep5',
      title: 'VSTEP B2 Complete Practice',
      tag: 'New Pick',
      tagColor: 'bg-amber-500 text-white',
      exam: 'VSTEP',
      desc: 'Full practice tests and strategies for VSTEP B2.',
      rating: '4.7',
      reviews: '2.8K',
      learners: '11.6K',
      mocks: '10',
      minis: '4',
      questions: '1600+',
      level: 'Intermediate',
      duration: '120 mins',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=300&auto=format&fit=crop'
    }
  ];

  const mostPicked = [
    { title: 'TOEIC 900+ Score Booster', exam: 'TOEIC', picked: '42.1K picks', trend: '+ 28%', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50' },
    { title: 'IELTS Academic Complete Mastery', exam: 'IELTS', picked: '31.8K picks', trend: '+ 21%', icon: Star, color: 'text-indigo-500 bg-indigo-50' },
    { title: 'Cambridge C1 Advanced Mastery', exam: 'Cambridge', picked: '18.6K picks', trend: '+ 16%', icon: Award, color: 'text-purple-500 bg-purple-50' },
    { title: 'TOEFL iBT Ultimate Preparation', exam: 'TOEFL', picked: '15.3K picks', trend: '+ 14%', icon: Sparkles, color: 'text-sky-500 bg-sky-50' }
  ];

  const filteredPicks = useMemo(() => {
    return editorialPicks.filter(item => {
      const matchLevel = levelFilter === 'All Picks' || item.level.toLowerCase().includes(levelFilter.toLowerCase().replace(' picks', ''));
      const matchExam = examSelect === 'All Exams' || item.exam.toUpperCase() === examSelect.toUpperCase();
      return matchLevel && matchExam;
    });
  }, [levelFilter, examSelect]);

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2 tracking-tight">
            Editorial Picks 🏆
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Handpicked by our exam experts to help you study smarter and achieve your target score.
          </p>
        </div>
        <span className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">View All Picks</span>
      </div>

      {/* Top badges banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topBadges.map((badge, idx) => (
          <Card key={idx} className="border-border bg-slate-50/50 dark:bg-slate-900/40">
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${badge.color}`}>
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground leading-none">{badge.title}</h4>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">{badge.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-border">
        <div className="flex flex-wrap items-center gap-2">
          {['All Picks', 'Beginner', 'Intermediate', 'Advanced', 'Trending', 'New', 'Updated'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition-all duration-200 ${
                levelFilter === lvl
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={examSelect}
            onChange={(e) => setExamSelect(e.target.value)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none"
          >
            <option>All Exams</option>
            <option>IELTS</option>
            <option>TOEIC</option>
            <option>TOEFL</option>
            <option>Cambridge</option>
            <option>VSTEP</option>
          </select>

          <select 
            value={skillSelect}
            onChange={(e) => setSkillSelect(e.target.value)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl border border-border bg-card text-foreground focus:outline-none"
          >
            <option>All Skills</option>
            <option>Listening</option>
            <option>Reading</option>
            <option>Writing</option>
            <option>Speaking</option>
          </select>
        </div>
      </div>

      {/* Grid of Picks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {filteredPicks.map((item) => (
          <Card key={item.id} className="border-border hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img src={item.image} alt={item.title} className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <Badge className={`absolute top-3 left-3 text-[9px] font-black border-none ${item.tagColor}`}>
                {item.tag}
              </Badge>
              <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white">
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] text-blue-200 font-bold">{item.exam}</span>
                <h4 className="font-extrabold text-xs leading-snug mt-0.5">{item.title}</h4>
              </div>
            </div>

            <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 font-bold text-foreground">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  {item.rating}
                  <span className="font-normal text-muted-foreground">({item.reviews})</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {item.learners}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl text-center text-[10px] font-bold">
                <div>
                  <div>{item.mocks}</div>
                  <div className="text-[8px] text-muted-foreground uppercase font-bold">Mocks</div>
                </div>
                <div>
                  <div>{item.minis}</div>
                  <div className="text-[8px] text-muted-foreground uppercase font-bold">Minis</div>
                </div>
                <div>
                  <div>{item.questions}</div>
                  <div className="text-[8px] text-muted-foreground uppercase font-bold">Ques</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1">
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 font-bold">{item.level}</span>
                <span>{item.duration}</span>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl mt-2 flex items-center justify-center gap-1.5 group">
                Start Learning
                <Play className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Why These Picks */}
        <Card className="xl:col-span-1 border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">Why These Picks?</CardTitle>
            <CardDescription>Our standard curation process guarantees success</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: 'Expert methodology', desc: 'Created by experienced educators and exam specialists.', icon: ShieldCheck, color: 'text-indigo-600' },
              { title: 'Proven track record', desc: 'High success rate from thousands of learners.', icon: Award, color: 'text-purple-600' },
              { title: 'Regular updates', desc: 'Content updated based on latest exam patterns.', icon: Clock, color: 'text-emerald-500' },
              { title: 'Comprehensive coverage', desc: 'Covers all question types and exam sections.', icon: CheckCircle2, color: 'text-amber-500' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex gap-3">
                  <div className={`p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-900/60 mt-0.5 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground leading-none">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Most Picked This Week */}
        <Card className="xl:col-span-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Most Picked This Week</CardTitle>
              <CardDescription>Popular choices by our learner community</CardDescription>
            </div>
            <Button variant="link" className="text-xs text-indigo-600 hover:text-indigo-500">View All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mostPicked.map((item, idx) => {
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl font-black ${item.color}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-foreground truncate max-w-[200px]">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 text-[8px] font-black">{item.exam}</Badge>
                          <span className="text-[10px] text-muted-foreground">{item.picked}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{item.trend}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Bottom CTA Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-100 to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/20 border border-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-foreground">Follow expert picks, achieve your target!</h4>
          <p className="text-[11px] text-muted-foreground mt-1">Let our experts guide you to success with the best curated exam collections.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-600/10">
          Explore All Collections
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

    </div>
  );
};
