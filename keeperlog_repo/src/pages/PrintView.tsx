import React from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from '../db';
import { format } from 'date-fns';
import { Info, AlertTriangle } from 'lucide-react';

export function PrintView() {
  const data = useLiveQuery(async () => {
    const sessions = await db.sessions.orderBy('date').reverse().toArray();
    const captures = await db.captures.toArray(); // Fetch all, filter later
    return { sessions, captures };
  });

  const profile = JSON.parse(localStorage.getItem('keeperLog_profile') || '{}');

  if (!data) return <div className="text-stone-900 p-8 font-mono">Preparing report...</div>;

  const { sessions, captures } = data;
  const totalHours = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  return (
    <div className="bg-white min-h-screen text-black print:text-black font-sans leading-relaxed">
      <div className="max-w-[210mm] mx-auto p-12 print:p-0 print:mx-0 print:w-full">
        
        {/* Header */}
        <div className="mb-8 border-b-2 border-gray-900 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 uppercase tracking-tight">Placement Logbook</h1>
              <h2 className="text-xl text-gray-800 font-medium">{profile.name || 'Student Name'}</h2>
              <p className="text-sm text-gray-600 mt-1">{profile.qualification}</p>
            </div>
            <div className="text-right">
               <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 print:border-gray-300 inline-block text-right min-w-[120px]">
                 <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Logged Hours</div>
                 <div className="text-3xl font-bold text-gray-900 leading-none">
                   {(totalHours / 60).toFixed(1)} <span className="text-sm font-normal text-gray-600">hrs</span>
                 </div>
               </div>
               <p className="text-[10px] text-gray-400 mt-2 font-mono">Generated {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-8">
          {sessions.length === 0 ? (
             <p className="text-gray-500 italic py-10 text-center">No completed sessions found.</p>
          ) : (
             sessions.map(session => {
               // Filter photos for this session that are allowed in export
               const sessionPhotos = captures.filter(c => 
                 c.sessionId === session.id && 
                 c.type === 'photo' && 
                 c.includeInExport === true &&
                 c.mediaUrl
               );

               return (
                <div key={session.id} className="break-inside-avoid border border-gray-300 rounded-none mb-8 bg-white shadow-sm print:shadow-none">
                  {/* Session Header */}
                  <div className="bg-gray-50 border-b border-gray-300 p-4 flex justify-between items-start print:bg-gray-100">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{session.facility}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {format(session.date, 'EEEE, d MMM yyyy')}
                        {session.area && <span className="mx-2 text-gray-400">|</span>}
                        {session.area}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-bold text-gray-900 tabular-nums">{Math.floor(session.durationMinutes / 60)}h {session.durationMinutes % 60}m</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">{session.role || 'Student'}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Reflection */}
                    <div className="mb-6">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Daily Reflection</h4>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed font-serif">
                        {session.reflection ? session.reflection.replace(/\*\*/g, '') : <span className="italic text-gray-400">No reflection recorded.</span>}
                      </div>
                    </div>

                    {/* Competencies */}
                    {session.competencies && session.competencies.length > 0 && (
                      <div className="mb-6">
                         <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Competencies</h4>
                         <div className="flex flex-wrap gap-1.5">
                            {session.competencies.map(c => (
                              <span key={c} className="text-[10px] font-medium border border-gray-200 px-2 py-1 rounded bg-gray-50 text-gray-700">
                                {c}
                              </span>
                            ))}
                         </div>
                      </div>
                    )}

                    {/* Photos (Safe Only) */}
                    {sessionPhotos.length > 0 && (
                       <div className="mb-6 break-inside-avoid">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Approved Photos
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                             {sessionPhotos.map(photo => (
                               <div key={photo.id} className="border border-gray-200 p-1 bg-white">
                                  <img src={photo.mediaUrl} alt="" className="w-full h-40 object-cover block" />
                                  {photo.content && <p className="text-[10px] text-gray-500 mt-1 p-1 italic">{photo.content}</p>}
                               </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {/* Supervisor Section */}
                    <div className="mt-8 pt-4 border-t border-dashed border-gray-300">
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Supervisor Verification</h4>
                       
                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                         <div className="flex-1">
                           <p className="text-sm font-bold text-gray-900">
                             {session.supervisor || <span className="font-normal text-gray-400 italic">Name not recorded</span>}
                           </p>
                           {session.supervisorNote ? (
                             <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 border-l-2 border-gray-300 italic">
                               "{session.supervisorNote}"
                             </div>
                           ) : (
                             <p className="text-xs text-gray-400 mt-1">No additional comments.</p>
                           )}
                         </div>
                         
                         {/* Signature Line (for hard copy) */}
                         <div className="w-48 text-right print:block hidden">
                           <div className="h-8 border-b border-gray-400 w-full"></div>
                           <p className="text-[10px] text-gray-400 mt-1">Signature (Optional)</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
               );
             })
          )}
        </div>

        {/* Footer Safeguard Warning */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
             <AlertTriangle className="h-3 w-3 inline mr-1 mb-0.5" />
             Ethical Documentation
           </p>
           <p className="text-[10px] text-gray-400">
             Do not record restricted or sensitive facility information. Follow site rules. 
             This document is for learning evidence only.
           </p>
        </div>
        
        {/* Print Controls */}
        <div className="mt-8 text-center print:hidden pb-20">
          <button onClick={() => window.print()} className="bg-emerald-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-emerald-700 font-bold transition-transform active:scale-95 flex items-center gap-2 mx-auto">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
             Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
