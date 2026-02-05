import React from 'react';
import { format } from 'date-fns';
import { Session } from '../db';
import { MapPin, Clock, Timer, CheckCircle2, PlayCircle } from 'lucide-react';
import { Link } from 'react-router';

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}` : `${m}m`;
  };

  return (
    <Link to={`/session/${session.id}`} className="block bg-stone-900 rounded-xl border border-stone-800 p-4 active:border-emerald-500/50 transition-colors group hover:border-emerald-500/30">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-base font-semibold text-stone-200 group-hover:text-emerald-400 transition-colors">{session.facility}</span>
          <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {format(session.date, 'MMM d')}
            </span>
            <span className="flex items-center gap-1">
              {session.status === 'active' ? (
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                   <PlayCircle className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-stone-500">
                   <Timer className="h-3 w-3" /> {formatDuration(session.durationMinutes)}
                </span>
              )}
            </span>
          </div>
        </div>
        
        {session.status === 'completed' && (
           <CheckCircle2 className="h-5 w-5 text-stone-700" />
        )}
      </div>
      
      {session.area && (
        <div className="flex items-center gap-1 text-xs text-stone-600 mb-3">
          <MapPin className="h-3 w-3" />
          {session.area}
        </div>
      )}

      {session.reflectionPrompts && Object.values(session.reflectionPrompts).some(v => v) && (
        <p className="text-sm text-stone-400 line-clamp-2 leading-relaxed italic">
          "{Object.values(session.reflectionPrompts).find(v => v)?.substring(0, 100)}..."
        </p>
      )}
      
      {session.competencies && session.competencies.length > 0 && (
         <div className="mt-3 flex flex-wrap gap-1">
            {session.competencies.slice(0, 3).map(c => (
              <span key={c} className="text-[10px] bg-stone-800 text-stone-500 px-1.5 py-0.5 rounded border border-stone-700">
                {c}
              </span>
            ))}
            {session.competencies.length > 3 && (
              <span className="text-[10px] text-stone-600 px-1">+ {session.competencies.length - 3}</span>
            )}
         </div>
      )}
    </Link>
  );
}
