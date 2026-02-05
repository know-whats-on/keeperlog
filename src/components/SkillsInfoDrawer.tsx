import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, TrendingUp, Info } from 'lucide-react';

interface SkillsInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SkillsInfoDrawer({ isOpen, onClose }: SkillsInfoDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[520px] bg-stone-900 border-t border-x border-stone-800 rounded-t-2xl p-6 pb-[max(32px,env(safe-area-inset-bottom))] shadow-2xl pointer-events-auto max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1 bg-stone-800 rounded-full" />
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-950/50 p-2 rounded-lg border border-emerald-900/30">
                  <Info className="h-5 w-5 text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-white">How progress works</h2>
              </div>
              <button onClick={onClose} className="p-2 -mr-2 text-stone-500"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-8">
              <div className="bg-stone-950/50 border border-stone-800/50 rounded-2xl p-4">
                <p className="text-sm text-stone-400 leading-relaxed">
                  Progress is calculated from your logs and reflections over time. Practising a competency across multiple sessions, adding reflections, and revisiting it recently increases progress.
                </p>
              </div>

              <div className="grid gap-6">
                <InfoItem 
                  title="Evidence & Coverage" 
                  desc="Points are initially recorded when you log your first entry for a specific skill area."
                />
                <InfoItem 
                  title="Reflection & Depth" 
                  desc="Detailed reflections and media captures strengthen the evidence for your skills."
                />
                <InfoItem 
                  title="Consistency" 
                  desc="Repeat practice across different days demonstrates steady learning."
                />
                <InfoItem 
                  title="Recency" 
                  desc="Skills practiced recently remain prominent. Progress may soften visually if an area hasn't been revisited for a long period."
                />
              </div>

              <div className="bg-stone-950 border border-stone-800 rounded-xl p-4">
                <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">Status Guide</h3>
                <div className="space-y-3">
                  <StatusRow label="Not started" desc="No evidence logged yet." />
                  <StatusRow label="In progress" desc="Some practice logged. Build consistency." />
                  <StatusRow label="Consistent" desc="Practised regularly across sessions." />
                  <StatusRow label="Strong" desc="Recent and consistent evidence logged." />
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-stone-100 text-stone-950 font-bold py-4 rounded-xl active:scale-95 transition-transform"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InfoItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 mt-1">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-stone-200 mb-1">{title}</h4>
        <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StatusRow({ label, desc }: { label: string, desc: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="font-bold text-stone-400">{label}</span>
      <span className="text-stone-600 italic">{desc}</span>
    </div>
  );
}
