import React from 'react';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'none';

interface MedallionBadgeProps {
  tier: BadgeTier;
  symbol: string;
  category?: string;
  size?: number;
  className?: string;
}

export function MedallionBadge({ tier, symbol, category = "safety", size = 76, className = "" }: MedallionBadgeProps) {
  // Apple Watch Style Materials
  const materials = {
    none: {
      rim: 'from-[#121212] via-[#2a2a2a] to-[#0a0a0a]', // Dark Graphite/Iron
      symbol: 'text-black/40',
      highlight: 'rgba(255, 255, 255, 0.03)'
    },
    bronze: {
      rim: 'from-[#3d2a1f] via-[#7d5236] to-[#2b1d15]', // Oxidized Bronze
      symbol: 'text-[#61412d]',
      highlight: 'rgba(125, 82, 54, 0.08)'
    },
    silver: {
      rim: 'from-[#2d2d2d] via-[#8a8a8a] to-[#1f1f1f]', // Satin Silver
      symbol: 'text-[#636363]',
      highlight: 'rgba(138, 138, 138, 0.06)'
    },
    gold: {
      rim: 'from-[#3d2f10] via-[#a3832b] to-[#261d0a]', // Warm Anodized Gold
      symbol: 'text-[#7a6221]',
      highlight: 'rgba(163, 131, 43, 0.12)'
    }
  }[tier];

  // Enamel Category Colors
  const enamelColors: Record<string, string> = {
    observation: 'from-[#142121] to-[#0a1111]',
    consistency: 'from-[#161a13] to-[#0b0d09]',
    hygiene: 'from-[#0f1f21] to-[#070f10]',
    communication: 'from-[#0a0f1c] to-[#05070e]',
    habitat: 'from-[#1c1912] to-[#0e0c09]',
    safety: 'from-[#121212] to-[#090909]',
    ethics: 'from-[#1a1515] to-[#0d0a0a]',
    handling: 'from-[#171418] to-[#0b0a0c]',
    operational: 'from-[#1a1a1a] to-[#0d0d0d]'
  };

  const enamelFill = tier === 'none' 
    ? 'from-[#0a0a0a] to-[#050505]' // Pure dark field for locked
    : (enamelColors[category] || enamelColors.safety);

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 5. Shadow Layer (Outer) */}
      <div className="absolute inset-0 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.4)] pointer-events-none" />

      {/* 1. Outer Rim (Metal Material) - 7px simulated */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${materials.rim} p-[1px]`}>
         {/* Rim Inner Bevel/Border */}
         <div className="w-full h-full rounded-full bg-black/40 p-[6px]">
            
            {/* 2. Enamel Field (Inner Circle) */}
            <div className={`w-full h-full rounded-full bg-gradient-to-b ${enamelFill} relative overflow-hidden flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)]`}>
              
              {/* 4. Highlight Layer (Top-edge Radial) */}
              <div 
                className="absolute inset-0 pointer-events-none" 
                style={{ background: `radial-gradient(circle at 50% 10%, ${materials.highlight}, transparent 60%)` }} 
              />

              {/* 3. Symbol Layer (Vector) */}
              <div className={`w-[60%] h-[60%] ${materials.symbol} relative z-10 flex items-center justify-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]`}>
                <SymbolSVG name={symbol} />
              </div>

              {/* Internal Rim Reflection (Subtle) */}
              <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />
            </div>
         </div>
      </div>
    </div>
  );
}

function SymbolSVG({ name }: { name: string }) {
  // Simple bold recognisable symbols
  switch (name) {
    case 'eye':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 25C25 25 10 50 10 50C10 50 25 75 50 75C75 75 90 50 90 50C90 50 75 25 50 25ZM50 65C41.7 65 35 58.3 35 50C35 41.7 41.7 35 50 35C58.3 35 65 41.7 65 50C65 58.3 58.3 65 50 65ZM50 42C45.6 42 42 45.6 42 50C42 54.4 45.6 58 50 58C54.4 58 58 54.4 58 50C58 45.6 54.4 42 50 42Z" />
        </svg>
      );
    case 'shell':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 15C30 15 15 35 15 55C15 75 30 85 50 85C70 85 85 75 85 55C85 35 70 15 50 15ZM30 55C30 45 40 30 50 30C60 30 70 45 70 55V65H30V55Z" />
          <path d="M40 70H60V75H40V70Z" opacity="0.6" />
        </svg>
      );
    case 'shield-drop':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 10L15 25V50C15 75 50 90 50 90C50 90 85 75 85 50V25L50 10Z" />
          <path d="M50 30C50 30 35 45 35 55C35 63 41.7 70 50 70C58.3 70 65 63 65 55C65 45 50 30 50 30Z" fill="black" opacity="0.3" />
        </svg>
      );
    case 'wave-dot':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M10 50C10 50 20 35 35 35C50 35 55 55 70 55C85 55 90 40 90 40V65C90 65 80 80 65 80C50 80 45 60 30 60C15 60 10 75 10 75V50Z" />
          <circle cx="50" cy="30" r="8" />
        </svg>
      );
    case 'bricks':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <rect x="15" y="25" width="30" height="20" rx="2" />
          <rect x="55" y="25" width="30" height="20" rx="2" />
          <rect x="25" y="55" width="50" height="20" rx="2" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 10L15 25V50C15 75 50 90 50 90C50 90 85 75 85 50V25L50 10Z" />
        </svg>
      );
    case 'hexagon':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 10L85 30V70L50 90L15 70V30L50 10Z" />
          <path d="M50 30L67 40V60L50 70L33 60V40L50 30Z" fill="black" opacity="0.3" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 85C50 85 10 65 10 40C10 25 25 15 40 15C45 15 50 20 50 20C50 20 55 15 60 15C75 15 90 25 90 40C90 65 50 85 50 85Z" />
        </svg>
      );
    case 'lock':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <rect x="25" y="45" width="50" height="35" rx="4" />
          <path d="M35 45V30C35 21.7 41.7 15 50 15C58.3 15 65 21.7 65 30V45" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 15C35 15 25 25 25 40V65H75V40C75 25 65 15 50 15ZM42 75H58C58 79.4 54.4 83 50 83C45.6 83 42 79.4 42 75Z" />
        </svg>
      );
    default:
      // Fallback icon if symbol name doesn't match
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <circle cx="50" cy="50" r="25" />
        </svg>
      );
  }
}