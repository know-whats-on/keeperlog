import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { calculateCompetencyScore } from '../lib/scoring';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export function SkillProgressCard() {
  const sessions = useLiveQuery(() => db.sessions.toArray());
  const captures = useLiveQuery(() => db.captures.toArray());
  const competencies = useLiveQuery(() => db.competencies.toArray());

  if (!sessions || !competencies || !captures) return null;

  const activeCompetencies = competencies.filter(c => c.active !== false);

  // Calculate average proficiency score
  const totalScores = activeCompetencies.reduce((acc, c) => {
    const stats = calculateCompetencyScore(c.code, sessions, captures, c);
    return acc + stats.score;
  }, 0);
  
  const averageScore = activeCompetencies.length > 0 
    ? Math.round(totalScores / activeCompetencies.length)
    : 0;

  return (
    <div className="bg-stone-900 rounded-xl shadow-lg border border-stone-800 relative overflow-hidden min-h-[180px] flex items-center group">
       <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 flex items-center bg-stone-950">
         <img 
           src="https://images.unsplash.com/photo-1720263869270-c8c0c4b75475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6b29rZWVwZXIlMjBhbmltYWwlMjBlbmNsb3N1cmUlMjBnaXJhZmZlJTIwcmhpbm9jZXJvcyUyMHNhZmFyaSUyMHBhcmslMjB6b28lMjBrZWVwZXIlMjBjYXJlfGVufDF8fHx8MTc3MDI1MjM1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
           alt="Skill Tracker" 
           className="w-full h-full object-cover opacity-60 object-center"
         />
         <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/50 to-transparent"></div>
       </div>
      <div className="p-6 relative z-10 w-full">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold text-white leading-none">Skill Tracker</h2>
        </div>
        <p className="text-sm text-stone-200 mb-6 max-w-[220px] leading-relaxed drop-shadow-md">
          Monitor your industry competency and achievement progress.
        </p>
        <Link 
           to="/skills" 
           className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all hover:bg-emerald-500"
         >
           View Progress
           <ChevronRight className="h-4 w-4" />
         </Link>

        {/* Mini progress pill */}
        <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
           <span className="text-[10px] font-black text-white">{averageScore}%</span>
           <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500" style={{ width: `${averageScore}%` }} />
           </div>
        </div>
      </div>
    </div>
  );
}
