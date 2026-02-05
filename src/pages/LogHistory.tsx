import React, { useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from '../db';
import { SessionCard } from '../components/SessionCard';
import { Search, Trash2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

import { SwipeableItem } from '../components/SwipeableItem';

export function LogHistory() {
  const [search, setSearch] = useState('');
  
  const sessions = useLiveQuery(async () => {
    const data = await db.sessions.toArray();
    // Sort by startTime descending (newest first)
    // We use startTime because date might just be the day, while startTime has precision
    return data.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  });

  const handleDelete = async (sessionId: number) => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;

    // Get captures to restore them too if needed
    const relatedCaptures = await db.captures.where('sessionId').equals(sessionId).toArray();

    try {
      // Perform deletion
      await db.sessions.delete(sessionId);
      await db.captures.where('sessionId').equals(sessionId).delete();

      toast.success("Session deleted", {
        description: `${session.facility} on ${new Date(session.date).toLocaleDateString()}`,
        action: {
          label: "Undo",
          onClick: async () => {
            // Restore session
            const { id, ...sessionData } = session;
            const newId = await db.sessions.add(sessionData);
            
            // Restore captures
            if (relatedCaptures.length > 0) {
              const restoredCaptures = relatedCaptures.map(({ id, ...c }) => ({
                ...c,
                sessionId: newId as number
              }));
              await db.captures.bulkAdd(restoredCaptures);
            }
            toast.success("Session restored");
          }
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete session");
    }
  };

  const filteredSessions = sessions?.filter(session => {
    const term = search.toLowerCase();
    return (
      session.facility.toLowerCase().includes(term) ||
      (session.area && session.area.toLowerCase().includes(term)) ||
      (session.reflection && session.reflection.toLowerCase().includes(term)) ||
      (session.competencies && session.competencies.some(c => c.toLowerCase().includes(term)))
    );
  }) || [];

  return (
    <div className="flex flex-col space-y-4 p-4 pb-12 max-w-md mx-auto min-h-screen">
      <h1 className="text-xl font-bold text-stone-100">Placement History</h1>
      
      <div className="sticky top-0 bg-stone-950 pt-2 pb-4 z-10 border-b border-stone-900/0">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-stone-200 placeholder:text-stone-600"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-stone-600 text-sm">
            {search ? 'No matches found.' : 'No sessions yet.'}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredSessions.map(session => (
              <SwipeableItem 
                key={session.id} 
                onDelete={() => session.id && handleDelete(session.id)}
              >
                <SessionCard session={session} />
              </SwipeableItem>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
