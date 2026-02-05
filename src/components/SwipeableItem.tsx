import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  label?: string;
  className?: string;
}

export function SwipeableItem({ children, onDelete, label = "Delete", className = "" }: SwipeableItemProps) {
  const [isSwiping, setIsSwiping] = useState(false);

  return (
    <motion.div
      layout
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ type: 'spring', stiffness: 500, damping: 50, mass: 1 }}
      className={`relative ${className}`}
    >
      {/* Delete Background - Matches the container's shape */}
      <div className={`absolute inset-0 bg-red-600 rounded-xl flex items-center justify-end px-6 transition-opacity duration-150 ${isSwiping ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col items-center gap-1 text-white">
          <Trash2 className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </div>
      </div>

      {/* Foreground Content - The draggable part */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={{ left: 0.1, right: 0.05 }}
        onDragStart={() => setIsSwiping(true)}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) {
            onDelete();
          } else {
            // Only hide the red background if we didn't delete
            setIsSwiping(false);
          }
        }}
        className="relative z-10 bg-stone-950 rounded-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
