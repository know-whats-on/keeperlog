import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, Award, ArrowRight } from 'lucide-react';
import { BadgeDefinition } from '../data/badges';
import { MedallionBadge, BadgeTier } from './MedallionBadge';

interface BadgeDetailDrawerProps {
  badge: BadgeDefinition | null;
  tier: BadgeTier;
  score: number;
  onClose: () => void;
  onAction: (code: string) => void;
}

export function BadgeDetailDrawer({ badge, tier, score, onClose, onAction }: BadgeDetailDrawerProps) {
  if (!badge) return null;

  const nextTier = tier === 'none' ? 'Bronze' : tier === 'bronze' ? 'Silver' : tier === 'silver' ? 'Gold' : 'Max';
  const nextTarget = tier === 'none' ? 1 : tier === 'bronze' ? 50 : tier === 'silver' ? 80 : 100;

  const tierColors = {
    gold: 'text-[#a3832b]',
    silver: 'text-[#8a8a8a]',
    bronze: 'text-[#7d5236]',
    none: 'text-stone-700'
  };

  return (
    <AnimatePresence>
      {badge && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[520px] bg-[#0a0a0a] border-t border-x border-stone-800 rounded-t-[32px] p-6 pb-[max(32px,env(safe-area-inset-bottom))] shadow-2xl pointer-events-auto"
          >
            <div className="flex justify-center mb-8">
              <div className="w-12 h-1 bg-stone-800 rounded-full" />
            </div>

            <div className="flex flex-col items-center text-center mb-10">
              {/* Featured view: 120px medallion */}
              <MedallionBadge 
                tier={tier} 
                symbol={badge.symbol}
                category={badge.category}
                size={120} 
                className="mb-8"
              />
              
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{badge.name}</h2>
              
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-widest ${tierColors[tier]}`}>
                  {tier === 'none' ? 'LOCKED' : `${tier} TIER`}
                </span>
                <span className="text-stone-800">|</span>
                <span className="text-[11px] text-stone-500 font-bold uppercase tracking-widest">
                   {score}% PROFICIENCY
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-stone-900/50 border border-stone-800/50 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-4 w-4 text-stone-600" />
                  <h3 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Linked Competency</h3>
                </div>
                <p className="text-sm text-stone-300 font-medium leading-snug">{badge.competencyCode}</p>
              </div>

              <div className="bg-stone-900/30 border border-stone-800/30 rounded-2xl p-5">
                 <p className="text-base text-stone-400 leading-relaxed font-medium mb-6 italic">
                  "{badge.description}"
                </p>
                
                {tier !== 'gold' && (
                  <div className="flex items-center justify-between p-3.5 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <Award className={`h-5 w-5 ${tierColors[nextTier.toLowerCase() as BadgeTier]}`} />
                      <span className="text-xs font-black text-stone-400 uppercase tracking-tight">Next: {nextTier}</span>
                    </div>
                    <span className="text-xs font-bold text-stone-600">{nextTarget}% Threshold</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => { onAction(badge.competencyCode); onClose(); }}
                  className="flex-1 bg-emerald-700 text-white font-black py-4 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  PRACTICE SKILL
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
