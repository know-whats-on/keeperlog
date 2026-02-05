import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Target, 
  Award, 
  Search,
  ArrowRight,
  TrendingUp,
  Info,
  Inbox,
  Loader2
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Competency } from '../db';
import { BADGE_DEFINITIONS, BadgeDefinition } from '../data/badges';
import { MaterialBadge } from '../components/MaterialBadge';
import { BadgeDetailDrawer } from '../components/BadgeDetailDrawer';
import { CompetencyDrawer } from '../components/CompetencyDrawer';
import { SkillsInfoDrawer } from '../components/SkillsInfoDrawer';
import { calculateCompetencyScore, getStatusColor } from '../lib/scoring';
import { BadgeTier } from '../components/MedallionBadge';

type FilterType = 'all' | 'gaps' | 'improving' | 'strong';

export function Skills() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<{ definition: BadgeDefinition, tier: BadgeTier, score: number } | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  // Load data from DB
  const sessions = useLiveQuery(() => db.sessions.toArray());
  const captures = useLiveQuery(() => db.captures.toArray());
  const competencies = useLiveQuery(() => db.competencies.toArray());

  // Aggregate data and calculate scores
  const competencyData = useMemo(() => {
    if (!competencies || !sessions || !captures) return [];
    
    const activeCompetencies = competencies.filter(c => c.active !== false);
    
    return activeCompetencies.map(c => {
      const stats = calculateCompetencyScore(c.code, sessions, captures, c);
      const relevantSessions = sessions
        .filter(s => s.competencies?.includes(c.code))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      
      return {
        competency: c,
        stats,
        lastPracticed: relevantSessions[0]?.date || null,
        logsCount: relevantSessions.length
      };
    });
  }, [competencies, sessions, captures]);

  const filteredData = useMemo(() => {
    let data = [...competencyData];

    // Filter
    if (filter === 'gaps') data = data.filter(d => d.stats.score < 30);
    else if (filter === 'improving') data = data.filter(d => d.stats.score >= 30 && d.stats.score < 80);
    else if (filter === 'strong') data = data.filter(d => d.stats.score >= 80);

    // Search
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(d => 
        d.competency.code.toLowerCase().includes(s) || 
        d.competency.category.toLowerCase().includes(s)
      );
    }

    // Always sort A-Z by code
    data.sort((a, b) => a.competency.code.localeCompare(b.competency.code));

    return data;
  }, [competencyData, filter, search]);

  const totalCount = competencyData.length;
  const coveredCount = competencyData.filter(d => d.stats.score > 0).length;
  const overallCoverage = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;
  
  const startPractice = (compCode?: string) => {
    navigate('/session/new', { state: { selectedCompetency: compCode } });
  };

  const isLoading = !competencies || !sessions || !captures;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          <p className="text-stone-500 text-sm font-medium animate-pulse">Calculating progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-stone-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-stone-900">
        <div className="max-w-md mx-auto px-4 pt-8 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
               <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-stone-400 active:text-stone-100 transition-colors">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold tracking-tight">Skill Tracker</h1>
            </div>
            <button onClick={() => setIsInfoOpen(true)} className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-stone-400 active:bg-stone-800 transition-colors">
              <Info className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-stone-500 font-medium">Industry competency & achievement monitoring.</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8 pb-20">
        {/* Industry Progress Card */}
        <section className="mb-12">
          <div className="bg-stone-900/40 border border-stone-800/60 rounded-[32px] p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp className="h-24 w-24" />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1">Industry Progress</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{overallCoverage}%</span>
                  <span className="text-stone-600 text-[10px] font-bold uppercase tracking-widest">Complete</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Target className="h-7 w-7 text-emerald-500" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallCoverage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-emerald-600 rounded-full shadow-[0_0_12px_rgba(5,150,105,0.3)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section - 2 COLUMN GRID */}
        <section className="mb-16">
          <div className="flex flex-col mb-8 px-1">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-amber-600" />
              <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Achievements</h2>
            </div>
            <p className="text-[9px] text-stone-600 font-bold uppercase tracking-tight">Earned through consistent practice</p>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-12">
            {BADGE_DEFINITIONS.map(badgeDef => {
              const data = competencyData.find(d => d.competency.code === badgeDef.competencyCode);
              const score = data?.stats.score || 0;
              const recency = data?.stats.recency || 0;
              
              let tier: BadgeTier = 'none';
              if (score >= 80) tier = 'gold';
              else if (score >= 50) tier = 'silver';
              else if (score > 0) tier = 'bronze';

              return (
                <MaterialBadge 
                  key={badgeDef.id}
                  symbol={badgeDef.symbol}
                  category={badgeDef.category}
                  name={badgeDef.name}
                  tier={tier}
                  recency={recency}
                  onClick={() => setSelectedBadge({ definition: badgeDef, tier, score })}
                />
              );
            })}
          </div>
        </section>

        {/* Competency List */}
        <section className="mb-12 pt-10 border-t border-stone-900">
          <div className="flex items-center justify-between mb-8 px-1">
            <h2 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Competency Index</h2>
            <div className="flex items-center gap-2 text-[9px] font-bold text-stone-600 uppercase tracking-widest">
              A-Z CATALOGUE
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600" />
              <input 
                type="text"
                placeholder="Search skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-900/30 border border-stone-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-900/50 transition-colors placeholder:text-stone-700"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
              <FilterBtn active={filter === 'gaps'} onClick={() => setFilter('gaps')} label="Gaps" />
              <FilterBtn active={filter === 'improving'} onClick={() => setFilter('improving')} label="Improving" />
              <FilterBtn active={filter === 'strong'} onClick={() => setFilter('strong')} label="Strong" />
            </div>
          </div>

          <div className="space-y-4">
            {filteredData.length > 0 ? (
              filteredData.map(d => (
                <button
                  key={d.competency.id}
                  onClick={() => setSelectedCompetency(d.competency)}
                  className="w-full p-6 bg-stone-900/20 border border-stone-800/40 rounded-3xl text-left active:bg-stone-900/40 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{d.competency.category}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight mb-2 tracking-tight">{d.competency.code}</h3>
                      <p className="text-xs text-stone-500 font-medium line-clamp-2 italic leading-relaxed">{d.competency.description}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-md border text-[9px] font-black uppercase tracking-tighter ${getStatusColor(d.stats.status)}`}>
                      {d.stats.status}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="h-1 w-full bg-stone-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            d.stats.score >= 80 ? 'bg-emerald-600' : 
                            d.stats.score >= 50 ? 'bg-blue-600' : 
                            d.stats.score > 0 ? 'bg-amber-700' : 'bg-stone-800'
                          }`}
                          style={{ width: `${d.stats.score}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-400">{d.stats.score}%</span>
                      <ArrowRight className="h-3 w-3 text-stone-700 group-active:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center text-center px-10 border border-stone-900 rounded-[32px] bg-stone-950/20">
                <div className="w-16 h-16 rounded-full bg-stone-900/50 flex items-center justify-center mb-5">
                  <Inbox className="h-8 w-8 text-stone-800" />
                </div>
                <h3 className="text-stone-500 font-bold mb-2">No results found</h3>
                <p className="text-stone-700 text-xs font-medium">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Drawers */}
      <CompetencyDrawer 
        competency={selectedCompetency} 
        onClose={() => setSelectedCompetency(null)}
        sessions={sessions || []}
        captures={captures || []}
      />

      <BadgeDetailDrawer 
        badge={selectedBadge?.definition || null}
        tier={selectedBadge?.tier || 'none'}
        score={selectedBadge?.score || 0}
        onClose={() => setSelectedBadge(null)}
        onAction={(code) => startPractice(code)}
      />
      
      <SkillsInfoDrawer 
        isOpen={isInfoOpen} 
        onClose={() => setIsInfoOpen(false)} 
      />

      <div style={{ height: 'max(100px, env(safe-area-inset-bottom))' }} />
    </div>
  );
}

function FilterBtn({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
        active 
          ? 'bg-emerald-700 border-emerald-700 text-white shadow-lg shadow-emerald-900/20' 
          : 'bg-stone-900/50 border-stone-800 text-stone-500 active:bg-stone-800'
      }`}
    >
      {label}
    </button>
  );
}
