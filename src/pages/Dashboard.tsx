import React, { useEffect, useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db, Session } from '../db';
import { Plus, Play, FileText, Camera, Mic, ChevronRight, Clock, MapPin, Download, AlertCircle } from 'lucide-react';
import { SkillProgressCard } from '../components/SkillProgressCard';
import { Link, useNavigate } from 'react-router';
import { startOfWeek, differenceInDays } from 'date-fns';
import profileImage from 'figma:asset/b206651a4067f57050f8e5709556b1718b1b3360.png';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);
  
  // Check for active session
  const activeSession = useLiveQuery(() => db.sessions.where('status').equals('active').first());
  
  // Recent sessions
  const recentSessions = useLiveQuery(() => db.sessions.reverse().limit(3).toArray());
  
  // Export Reminder Logic
  const allSessionsCount = useLiveQuery(() => db.sessions.count());
  const [showExportReminder, setShowExportReminder] = useState(false);

  useEffect(() => {
    if (allSessionsCount === undefined) return;

    const lastExport = localStorage.getItem('keeperLog_lastExportDate');
    const lastExportCount = parseInt(localStorage.getItem('keeperLog_lastExportCount') || '0', 10);
    
    const daysSince = lastExport ? differenceInDays(new Date(), new Date(lastExport)) : 999;
    const sessionsSince = allSessionsCount - lastExportCount;

    // Warn if > 5 sessions or > 7 days since last export
    if (sessionsSince > 5 || (daysSince > 7 && allSessionsCount > 0)) {
      setShowExportReminder(true);
    }
  }, [allSessionsCount]);
  
  // Weekly stats
  const weeklyStats = useLiveQuery(async () => {
    const start = startOfWeek(new Date());
    const entries = await db.sessions.where('date').aboveOrEqual(start).toArray();
    const count = entries.length;
    const minutes = entries.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    return { count, minutes };
  });

  // Total stats (all time)
  const totalStats = useLiveQuery(async () => {
    const entries = await db.sessions.toArray();
    const count = entries.length;
    const minutes = entries.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    return { count, minutes };
  });
  
  const timeOfDay = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
  const profile = JSON.parse(localStorage.getItem('keeperLog_profile') || '{}');

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const handleQuickCapture = (type: 'text' | 'photo' | 'voice') => {
    if (activeSession?.id) {
      navigate(`/session/${activeSession.id}/capture?type=${type}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-12 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">KeeperLog</p>
            {session && <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />}
          </div>
          <h1 className="text-2xl font-bold text-white">Good {timeOfDay}, {profile.name?.split(' ')[0] || 'Keeper'}.</h1>
        </div>
        <button 
          onClick={() => navigate('/settings')}
          className="h-10 w-10 rounded-full border-2 border-stone-700 overflow-hidden hover:border-emerald-500 transition-colors active:scale-95"
        >
          <img 
            src={profileImage} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      {/* Export Reminder */}
      {showExportReminder && (
        <Link to="/export" className="block bg-amber-900/20 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2">
           <div className="flex items-center gap-3">
             <AlertCircle className="h-5 w-5 text-amber-500" />
             <div>
               <p className="text-sm font-bold text-amber-500">Backup Recommended</p>
               <p className="text-xs text-stone-400">It's been a while since your last export.</p>
             </div>
           </div>
           <ChevronRight className="h-4 w-4 text-amber-500" />
        </Link>
      )}

      {/* Active Session Card or Start Day */}
      {activeSession ? (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden group animate-in slide-in-from-top-4">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Play className="h-24 w-24 text-emerald-500" />
          </div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2">
               <span className="animate-pulse h-2 w-2 rounded-full bg-emerald-500"></span>
               <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Session Active</p>
             </div>
             <h2 className="text-xl font-bold text-white mb-1">{activeSession.facility}</h2>
             <p className="text-sm text-stone-400 mb-6 flex items-center gap-2">
               <Clock className="h-3 w-3" /> Started {activeSession.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </p>

             <div className="grid grid-cols-3 gap-3">
               <button onClick={() => handleQuickCapture('text')} className="bg-stone-900/80 backdrop-blur-sm p-3 rounded-xl border border-emerald-500/20 flex flex-col items-center gap-2 hover:bg-emerald-900/40 transition-colors">
                 <FileText className="h-5 w-5 text-emerald-400" />
                 <span className="text-[10px] font-medium text-stone-300">Note</span>
               </button>
               <button onClick={() => handleQuickCapture('photo')} className="bg-stone-900/80 backdrop-blur-sm p-3 rounded-xl border border-emerald-500/20 flex flex-col items-center gap-2 hover:bg-emerald-900/40 transition-colors">
                 <Camera className="h-5 w-5 text-emerald-400" />
                 <span className="text-[10px] font-medium text-stone-300">Photo</span>
               </button>
               <button onClick={() => handleQuickCapture('voice')} className="bg-stone-900/80 backdrop-blur-sm p-3 rounded-xl border border-emerald-500/20 flex flex-col items-center gap-2 hover:bg-emerald-900/40 transition-colors">
                 <Mic className="h-5 w-5 text-emerald-400" />
                 <span className="text-[10px] font-medium text-stone-300">Voice</span>
               </button>
             </div>
             
             <Link to={`/session/${activeSession.id}`} className="mt-4 block text-center text-xs text-emerald-500 font-medium hover:underline">
               View Session Details &rarr;
             </Link>
          </div>
        </div>
      ) : (
        <div className="bg-stone-900 rounded-xl shadow-lg border border-stone-800 relative overflow-hidden min-h-[180px] flex items-center group">
           <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 flex items-center bg-stone-950">
             <img 
               src="https://images.unsplash.com/photo-1681406121957-04890dd8852f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYW5nYXJvb3MlMjBhdXN0cmFsaWElMjBncmFzc3klMjBmaWVsZHxlbnwxfHx8fDE3NzAwMjI0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
               alt="Kangaroos in field" 
               className="w-full h-full object-cover opacity-80 object-center"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/50 to-transparent"></div>
           </div>
          <div className="p-6 relative z-10 w-full">
            <h2 className="text-xl font-bold text-white mb-2">Ready to start?</h2>
            <p className="text-sm text-stone-200 mb-4 max-w-[200px] leading-relaxed drop-shadow-md">Begin a new placement day log.</p>
            <Link 
               to="/session/new" 
               className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all hover:bg-emerald-500"
             >
               <Plus className="h-5 w-5" /> Start Placement Day
             </Link>
          </div>
        </div>
      )}

      {/* Skill Tracker Card */}
      <SkillProgressCard />

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <p className="text-[10px] text-stone-500 uppercase tracking-wide font-bold mb-1">This Week</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">{weeklyStats?.count || 0}</span>
            <span className="text-xs text-stone-500 mb-1">sessions</span>
          </div>
        </div>
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
          <p className="text-[10px] text-stone-500 uppercase tracking-wide font-bold mb-1">Hours Logged</p>
          <div className="flex items-end gap-2">
             <span className="text-2xl font-bold text-emerald-500">{formatDuration(totalStats?.minutes || 0)}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Recent Sessions</h2>
          <Link to="/logs" className="text-[10px] text-emerald-500 flex items-center gap-1 hover:text-emerald-400 font-medium uppercase tracking-wide">
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="space-y-3">
           {recentSessions?.map(session => {
             // Get the first reflection answer to display
             const firstAnswer = session.reflectionPrompts ? Object.values(session.reflectionPrompts)[0] : '';
             
             return (
               <Link key={session.id} to={`/session/${session.id}`} className="block bg-stone-900 border border-stone-800 p-4 rounded-xl hover:border-emerald-500/30 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <h3 className="font-bold text-stone-200">{session.facility}</h3>
                     <p className="text-xs text-stone-500">{new Date(session.date).toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric'})}</p>
                   </div>
                   <span className="text-xs font-mono text-emerald-500 bg-emerald-950/30 px-2 py-1 rounded">
                     {Math.floor(session.durationMinutes / 60)}h {session.durationMinutes % 60}m
                   </span>
                 </div>
                 {firstAnswer && (
                   <p className="text-xs text-stone-400 line-clamp-2 italic">"{firstAnswer.substring(0, 100)}..."</p>
                 )}
               </Link>
             );
           })}
           {(!recentSessions || recentSessions.length === 0) && (
             <div className="text-center py-8 text-stone-600 text-sm">No recent history</div>
           )}
        </div>
      </div>
    </div>
  );
}