import React from 'react';
import { motion } from 'motion/react';

interface EagleEyeMedallionProps {
  tier: 'bronze' | 'silver' | 'gold' | 'none';
  className?: string;
}

export function EagleEyeMedallion({ tier, className = "" }: EagleEyeMedallionProps) {
  if (tier === 'none') return null;

  const colors = {
    bronze: {
      rim: 'from-[#8c5a3c] via-[#b38b6d] to-[#5e3c25]',
      enamel: 'bg-[#1a0f0a]',
      icon: 'text-[#cd7f32]/80',
    },
    silver: {
      rim: 'from-[#a0a0a0] via-[#e0e0e0] to-[#707070]',
      enamel: 'bg-[#0a0a0c]',
      icon: 'text-[#c0c0c0]/80',
    },
    gold: {
      rim: 'from-[#b38b2d] via-[#f7e4a1] to-[#7a5a1a]', // Satin Gold
      enamel: 'bg-[#080a05]', // Deep enamel center
      icon: 'text-[#d4af37]/90', // Brushed metal feel
    }
  }[tier];

  return (
    <div className={`relative aspect-square flex items-center justify-center ${className}`}>
      {/* Outer Rim - Medallion Edge (Brushed Metal) */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${colors.rim} shadow-2xl p-[3px]`}>
        {/* Inner Border / Bevel */}
        <div className="w-full h-full rounded-full bg-black/20 flex items-center justify-center p-[2px]">
          {/* Enamel Center */}
          <div className={`w-full h-full rounded-full ${colors.enamel} shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden relative`}>
             {/* Subtle Enamel Sheen */}
             <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
             
             {/* Eagle Icon - Literal Animal Form */}
             <svg viewBox="0 0 100 100" fill="currentColor" className={`w-[70%] h-[70%] ${colors.icon} filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]`}>
                {/* Eagle Head - Profile-ish but forward facing alertness */}
                <path d="
                  M50 20 
                  C65 20, 75 30, 75 45 
                  C75 60, 65 75, 50 75 
                  C35 75, 25 60, 25 45 
                  C25 30, 35 20, 50 20 
                  Z" 
                  className="opacity-10"
                />
                
                {/* Beak & Head Structure */}
                <path d="
                  M50 25 
                  C40 25, 32 35, 32 45 
                  C32 50, 35 55, 40 58
                  L50 65
                  L60 58
                  C65 55, 68 50, 68 45
                  C68 35, 60 25, 50 25
                  Z
                  M50 45
                  L42 45
                  C42 42, 45 40, 50 40
                  C55 40, 58 42, 58 45
                  L50 45
                " />

                {/* Wings suggestion (symmetrical) */}
                <path d="
                  M25 45 
                  C15 40, 5 45, 2 60
                  C5 55, 15 50, 25 50
                  M75 45
                  C85 40, 95 45, 98 60
                  C95 55, 85 50, 75 50
                " />

                {/* Eyes - Forward facing, sharp */}
                <rect x="42" y="38" width="4" height="1" className="text-black/40" />
                <rect x="54" y="38" width="4" height="1" className="text-black/40" />
                
                {/* Highlights */}
                <circle cx="44" cy="38.5" r="0.5" fill="white" className="opacity-60" />
                <circle cx="56" cy="38.5" r="0.5" fill="white" className="opacity-60" />
             </svg>
          </div>
        </div>
      </div>
      
      {/* Studio Lighting Effects */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
    </div>
  );
}
