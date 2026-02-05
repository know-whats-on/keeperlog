import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Info, History, Play } from 'lucide-react';
import { db, Competency } from '../db';
import { calculateCompetencyScore, getStatusColor } from '../lib/scoring';
import { Session, Capture } from '../db';
import { useNavigate } from 'react-router';

interface CompetencyDrawerProps {
  competency: Competency | null;
  onClose: () => void;
  sessions: Session[];
  captures: Capture[];
}

export function CompetencyDrawer({ competency, onClose, sessions, captures }: CompetencyDrawerProps) {
  const navigate = useNavigate();
  const [localConfidence, setLocalConfidence] = React.useState(0);

  // Sync local state if competency prop changes
  React.useEffect(() => {
    if (competency) {
      setLocalConfidence(competency.confidence || 0);
    }
  }, [competency?.id]);

  if (!competency) return null;

  const stats = calculateCompetencyScore(competency.code, sessions, captures, { ...competency, confidence: localConfidence });
  const statusColor = getStatusColor(stats.status);

  const relatedSessions = sessions
    .filter(s => s.competencies?.includes(competency.code))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  const handleConfidenceChange = async (val: number) => {
    setLocalConfidence(val);
    if (competency.id) {
      await db.competencies.update(competency.id, { confidence: val });
    }
  };

  const startPractice = () => {
    navigate('/log', { state: { selectedCompetency: competency.code } });
    onClose();
  };

  const cleanReflection = (text?: string) => {
    if (!text) return "Log entry with no written reflection.";
    // Remove markdown bold prompts and newlines/mangled newlines for a clean snippet
    return text
      .replace(/\*\*.*?\*\*/g, '') // Remove bold prompts
      .replace(/[\\|]n/g, ' ')      // Replace \n or |n with space
      .replace(/-/g, ' ')           // Replace - placeholders
      .trim();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        />

        {/* Drawer */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-[520px] bg-stone-900 border-t border-x border-stone-800 rounded-t-2xl p-6 pb-[max(32px,env(safe-area-inset-bottom))] shadow-2xl pointer-events-auto max-h-[92vh] overflow-y-auto no-scrollbar"
        >
          {/* Pull handle */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-1 bg-stone-800 rounded-full" />
          </div>

          <div className="flex justify-between items-start mb-6">
            <div className="pr-8">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                  {stats.status}
                </span>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                  {competency.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {competency.code}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-stone-500 hover:text-stone-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Description */}
            <div>
              <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Focus Area</h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                {competency.description}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Evidence Overview</h3>
                <span className="text-lg font-bold text-white">{stats.score}<span className="text-stone-600 text-xs font-normal">/100</span></span>
              </div>
              
              <div className="space-y-4">
                <ScoreBar label="Evidence" value={stats.coverage} max={20} />
                <ScoreBar label="Depth" value={stats.depth} max={25} />
                <ScoreBar label="Consistency" value={stats.consistency} max={25} />
                <ScoreBar label="Recency" value={stats.recency} max={20} />
                <ScoreBar label="Confidence" value={stats.confidencePoints} max={10} />
              </div>

              <div className="mt-6 flex gap-3 p-3 bg-stone-900/50 rounded-lg border border-stone-800/50">
                <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                   <p className="text-xs text-stone-300 font-bold">Next Step</p>
                   <p className="text-xs text-stone-400 italic leading-snug">
                    {stats.score < 20 ? "Logging a first practice session would start building evidence here." : "A short note or reflection here would strengthen this area."}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">My Confidence</h3>
                  <span className="text-[9px] text-stone-600 font-medium">For your own reflection only.</span>
                </div>
                <span className="text-sm font-bold text-stone-200">{localConfidence}<span className="text-stone-600 text-[10px] font-normal tracking-normal ml-0.5">/ 5</span></span>
              </div>
              <input 
                type="range"
                min="0"
                max="5"
                step="1"
                value={localConfidence}
                onChange={(e) => handleConfidenceChange(parseInt(e.target.value))}
                className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[8px] font-bold text-stone-600 uppercase tracking-widest px-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Recent Evidence */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="h-3 w-3 text-stone-600" />
                <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Recent logs</h3>
              </div>
              <div className="space-y-2">
                {relatedSessions.length > 0 ? (
                  relatedSessions.map(s => (
                    <div key={s.id} className="p-3 bg-stone-950/50 border border-stone-800/30 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-stone-500 font-bold">{new Date(s.date).toLocaleDateString()}</span>
                        <span className="text-[9px] text-stone-600 italic">{s.facility}</span>
                      </div>
                      <p className="text-xs text-stone-400 line-clamp-1 italic">
                        {cleanReflection(s.reflection)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-stone-600 italic px-1">No recent entries yet.</p>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-stone-900 pb-2">
              <button 
                onClick={startPractice}
                className="flex-1 bg-emerald-500 text-stone-950 font-bold py-4 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 fill-current" />
                Log practice
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ScoreBar({ label, value, max }: { label: string, value: number, max: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
        <span className="text-stone-500">{label}</span>
        <span className="text-stone-300">{value} / {max}</span>
      </div>
      <div className="h-1 w-full bg-stone-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
