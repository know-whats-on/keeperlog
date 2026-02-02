import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, LogEntry } from '../lib/db';
import { format } from 'date-fns';
import { Edit2, Tag, Calendar, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogListProps {
  onEdit: (entry: LogEntry) => void;
}

export function LogList({ onEdit }: LogListProps) {
  // Use live query to reactively update when DB changes
  const logs = useLiveQuery(
    () => db.logs.orderBy('timestamp').reverse().toArray()
  );

  if (!logs) return <div className="p-8 text-center text-slate-400">Loading logs...</div>;

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">No logs yet</h3>
        <p className="text-slate-500 max-w-xs mt-2">
          Start your first shift by tapping the + button below.
        </p>
      </div>
    );
  }

  // Group by date
  const groupedLogs: Record<string, LogEntry[]> = {};
  logs.forEach(log => {
    const dateKey = format(log.timestamp, 'yyyy-MM-dd');
    if (!groupedLogs[dateKey]) groupedLogs[dateKey] = [];
    groupedLogs[dateKey].push(log);
  });

  return (
    <div className="space-y-6 pb-24">
      {Object.keys(groupedLogs).map(dateKey => (
        <div key={dateKey} className="space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
            {format(new Date(dateKey), 'EEEE, d MMMM')}
          </h3>
          
          <div className="space-y-3">
            {groupedLogs[dateKey].map(log => (
              <div 
                key={log.id} 
                onClick={() => onEdit(log)}
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-md">
                      {log.activityType}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {format(log.timestamp, 'HH:mm')}
                    </span>
                  </div>
                  {/* Status Indicator: Has reflection? */}
                  {(log.reflectionSoWhat || log.reflectionNowWhat) && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" title="Reflection added" />
                  )}
                </div>
                
                <h4 className="font-semibold text-slate-800 mb-1">{log.speciesArea}</h4>
                <p className="text-sm text-slate-600 line-clamp-2">{log.notes}</p>
                
                {log.competencies && log.competencies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {log.competencies.slice(0, 3).map(comp => (
                      <span key={comp} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {comp}
                      </span>
                    ))}
                    {log.competencies.length > 3 && (
                      <span className="text-[10px] text-slate-400 px-1">+{log.competencies.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
