import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function ForestAnimation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Floating particles (dust in sunset light)
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
    delay: Math.random() * 3,
  }));

  // Flying birds
  const birds = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    startY: 5 + Math.random() * 70, // Birds fly throughout the sky
    delay: i * 2.5, // Stagger their appearance
    duration: 15 + Math.random() * 10, // Vary flight speed
    size: 0.6 + Math.random() * 0.4, // Vary size for depth
  }));

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-orange-300 via-pink-300 to-purple-400">
      {/* Sunset sky gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-200 via-orange-300 to-rose-400" />
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/50 via-pink-400/40 to-purple-500/60" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/40 via-transparent to-indigo-400/30" />
      
      {/* Animated sunset glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-300/30 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating particles (sunset dust) */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1.5 h-1.5 rounded-full bg-orange-200/80"
          style={{
            left: `${particle.startX}%`,
            top: `${particle.startY}%`,
            filter: 'blur(1px)',
            boxShadow: '0 0 8px 3px rgba(254, 215, 170, 0.4)',
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * -80 - 20, 0],
            opacity: [0, 0.9, 0.5, 0.9, 0],
            scale: [0, 1.2, 1, 1.2, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Flying birds */}
      {birds.map((bird) => (
        <motion.div
          key={`bird-${bird.id}`}
          className="absolute"
          style={{
            top: `${bird.startY}%`,
            left: '-10%',
          }}
          initial={{ x: 0, opacity: 0 }}
          animate={mounted ? {
            x: ['0vw', '110vw'],
            y: [0, -20, -10, -30, 0],
            opacity: [0, 1, 1, 1, 0],
          } : {}}
          transition={{
            duration: bird.duration,
            delay: bird.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            style={{
              width: `${24 * bird.size}px`,
              height: `${24 * bird.size}px`,
            }}
            animate={{
              rotateX: [0, 20, 0, -20, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Bird body */}
            <ellipse
              cx="12"
              cy="12"
              rx="2"
              ry="3"
              fill="rgba(68, 64, 60, 0.8)"
            />
            {/* Left wing */}
            <motion.path
              d="M12 12 Q8 8, 4 10"
              stroke="rgba(68, 64, 60, 0.8)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: [
                  "M12 12 Q8 8, 4 10",
                  "M12 12 Q8 6, 4 4",
                  "M12 12 Q8 8, 4 10",
                ],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Right wing */}
            <motion.path
              d="M12 12 Q16 8, 20 10"
              stroke="rgba(68, 64, 60, 0.8)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: [
                  "M12 12 Q16 8, 20 10",
                  "M12 12 Q16 6, 20 4",
                  "M12 12 Q16 8, 20 10",
                ],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.svg>
        </motion.div>
      ))}

      {/* Gentle fade to dark at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-950 pointer-events-none" 
           style={{ 
             background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(12, 10, 9, 0.3) 60%, rgba(12, 10, 9, 0.7) 80%, rgba(12, 10, 9, 0.95) 100%)'
           }} 
      />
    </div>
  );
}