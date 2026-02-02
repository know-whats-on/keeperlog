import React, { useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from '../db';
import { SessionCard } from '../components/SessionCard';
import { Search } from 'lucide-react';

export function LogHistory() {
  const [search, setSearch] = useState('');
  
  const sessions = useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray());

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
    <div className="space-y-4 pb-20">
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

      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-stone-600 text-sm">
            {search ? 'No matches found.' : 'No sessions yet.'}
          </div>
        ) : (
          filteredSessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))
        )}
      </div>
    </div>
  );
}
