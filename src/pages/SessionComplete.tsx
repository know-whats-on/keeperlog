import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { db } from '../db';
import { CompetencySelector } from '../components/CompetencySelector';
import { ChevronLeft, CheckCircle2, Clock, Sparkles, UserCheck } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { differenceInMinutes } from 'date-fns';
import { AutoSaveIndicator } from '../components/AutoSaveIndicator';

const PROMPTS = [
  "What did you observe or assist with today?",
  "Why was it done that way? (Rationale)",
  "What did you learn or understand better?",
  "What would you do differently or watch for next time?"
];

export function SessionComplete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId = Number(id);
  
  const [loading, setLoading] = useState(false);
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [competencies, setCompetencies] = useState<string[]>([]);
  
  // Supervisor Fields
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorNote, setSupervisorNote] = useState('');
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const isFirstLoad = useRef(true);

  // Profile settings for reflection length
  const profile = JSON.parse(localStorage.getItem('keeperLog_profile') || '{}');
  const isShort = profile.reflectionLength === 'short';
  const activePrompts = isShort ? [PROMPTS[0], PROMPTS[2]] : PROMPTS;

  useEffect(() => {
    // Initial load: calculate duration based on start time
    db.sessions.get(sessionId).then(session => {
      if (session) {
        if (isFirstLoad.current) {
          const now = new Date();
          const diff = differenceInMinutes(now, session.startTime);
          setDuration(session.durationMinutes || (diff > 0 ? diff : 0));
          
          // Default end time to now
          const h = now.getHours().toString().padStart(2, '0');
          const m = now.getMinutes().toString().padStart(2, '0');
          setEndTime(`${h}:${m}`);

          if (session.reflectionPrompts) {
            setAnswers(session.reflectionPrompts);
          }
          if (session.competencies) {
            setCompetencies(session.competencies);
          }
          // Load supervisor fields
          setSupervisorName(session.supervisor || '');
          setSupervisorNote(session.supervisorNote || '');
          
          isFirstLoad.current = false;
        }
      }
    });
  }, [sessionId]);

  // Auto-save effect
  useEffect(() => {
    if (isFirstLoad.current) return;

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const reflectionText = activePrompts.map(p => `**${p}**\n${answers[p] || '-'}`).join('\n\n');
        
        await db.sessions.update(sessionId, {
          durationMinutes: duration,
          reflection: reflectionText,
          reflectionPrompts: answers,
          competencies: competencies,
          supervisor: supervisorName,
          supervisorNote: supervisorNote,
          updatedAt: new Date()
        });
        
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (err) {
        console.error("Auto-save failed", err);
        setSaveStatus('error');
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [answers, competencies, duration, sessionId, activePrompts, supervisorName, supervisorNote]);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Ensure final save happens
      const reflectionText = activePrompts.map(p => `**${p}**\n${answers[p] || '-'}`).join('\n\n');

      await db.sessions.update(sessionId, {
        endTime: new Date(), 
        durationMinutes: duration,
        status: 'completed',
        reflection: reflectionText,
        reflectionPrompts: answers,
        competencies: competencies,
        supervisor: supervisorName,
        supervisorNote: supervisorNote,
        updatedAt: new Date()
      });

      toast.success("Session logged successfully!");
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-3 -ml-3 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-stone-100">End of Day Reflection</h1>
        </div>
        <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="space-y-8">
        
        {/* Hours Logging */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
             <Clock className="h-4 w-4 text-emerald-500" />
             <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Hours</h2>
           </div>
           
           <div className="bg-stone-900 p-5 rounded-xl border border-stone-800">
             <div className="flex justify-between items-center mb-4">
               <label className="text-sm text-stone-400">Total Duration</label>
               <span className="text-xl font-bold text-emerald-400">{Math.floor(duration / 60)}h {duration % 60}m</span>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Minutes</label>
                 <input 
                   type="number" 
                   value={duration}
                   onChange={e => setDuration(Number(e.target.value))}
                   className="w-full p-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 text-center font-mono"
                 />
               </div>
               <div className="flex items-end">
                 <p className="text-xs text-stone-500 mb-3">Confirm your total hands-on hours for the day.</p>
               </div>
             </div>
           </div>
        </section>

        {/* Competencies */}
        <section className="space-y-4">
           <CompetencySelector selectedIds={competencies} onChange={setCompetencies} />
        </section>

        {/* Structured Reflection */}
        <section className="space-y-6">
           <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
             <Sparkles className="h-4 w-4 text-emerald-500" />
             <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Reflection</h2>
           </div>

           {activePrompts.map((prompt, idx) => (
             <div key={idx} className="space-y-2">
               <label className="block text-sm font-medium text-stone-300">{prompt}</label>
               <textarea 
                 value={answers[prompt] || ''}
                 onChange={e => setAnswers(prev => ({...prev, [prompt]: e.target.value}))}
                 className="w-full p-4 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200 placeholder:text-stone-700 min-h-[100px]"
                 placeholder="Tap to type..."
               />
             </div>
           ))}
        </section>

        {/* Supervisor Section (Optional) */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
             <UserCheck className="h-4 w-4 text-stone-500" />
             <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Supervisor (Optional)</h2>
           </div>
           
           <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 space-y-3">
             <div>
               <label className="block text-xs font-medium text-stone-500 mb-1">Supervisor Name</label>
               <input 
                 type="text" 
                 value={supervisorName}
                 onChange={e => setSupervisorName(e.target.value)}
                 placeholder="Who supervised you?"
                 className="w-full p-3 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-200"
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-stone-500 mb-1">Supervisor Note / Comment</label>
               <textarea 
                 value={supervisorNote}
                 onChange={e => setSupervisorNote(e.target.value)}
                 placeholder="Optional verification note..."
                 rows={2}
                 className="w-full p-3 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-200"
               />
             </div>
             <p className="text-[10px] text-stone-600 italic">
               No signature required. Notes are included in exports if present.
             </p>
           </div>
        </section>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="flex-shrink-0 pt-6 pb-2 bg-stone-950">
        <button 
          onClick={handleFinish}
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-emerald-900/30 hover:bg-emerald-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="h-5 w-5" />
          {loading ? 'Finalizing...' : 'Complete Day & Save'}
        </button>
      </div>
    </div>
  );
}
