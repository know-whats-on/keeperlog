import React from 'react';
import { motion } from 'motion/react';
import { MedallionBadge, BadgeTier } from './MedallionBadge';

interface MaterialBadgeProps {
  symbol: string;
  category: string;
  name: string;
  tier: BadgeTier;
  recency: number; // 0-20
  onClick?: () => void;
}

export function MaterialBadge({ symbol, category, name, tier, recency, onClick }: MaterialBadgeProps) {
  const isLocked = tier === 'none';
  const isFaded = recency === 0 && !isLocked;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-3 transition-all duration-300 w-full ${isFaded ? 'opacity-40 grayscale-[0.3]' : ''} ${isLocked ? 'opacity-60 saturate-[0.8]' : ''}`}
    >
      {/* 
        Badge Container - Floating directly on dark UI 
        No card background.
      */}
      <MedallionBadge 
        tier={tier} 
        symbol={symbol}
        category={category}
        size={76} 
      />
      
      {/* 
        Label Placement: Badge name shown below medallion 
        All caps, tight letter spacing
      */}
      <div className="flex flex-col items-center text-center">
        <span className={`text-[10px] font-black uppercase tracking-tight leading-tight transition-colors ${isLocked ? 'text-stone-600' : 'text-stone-400'}`}>
          {name}
        </span>
        
        {isFaded && (
          <span className="text-[7px] font-bold uppercase tracking-tighter text-amber-600/70 mt-0.5">
            NEEDS PRACTICE
          </span>
        )}

        {isLocked && (
          <span className="text-[7px] font-bold uppercase tracking-tighter text-stone-700 mt-0.5">
            LOCKED
          </span>
        )}
      </div>
    </motion.button>
  );
}
