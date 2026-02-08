import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useLiveQuery } from "dexie-react-hooks";
import { db, Capture } from '../db';
import { ChevronLeft, FileText, Camera, Mic, Clock, CheckCircle2, MapPin, Trash2, Download, Images } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { SwipeableItem } from '../components/SwipeableItem';
import { PhotoLightbox } from '../components/PhotoLightbox';

export function SessionActive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId = Number(id);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');

  const session = useLiveQuery(() => db.sessions.get(sessionId));
  const captures = useLiveQuery(async () => {
    const data = await db.captures.where('sessionId').equals(sessionId).toArray();
    // Sort by timestamp descending (newest first) to match reverse ID behavior but persist across restores
    return data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  });

  const handleDeleteCapture = async (capture: Capture) => {
    if (!capture.id) return;
    
    try {
      await db.captures.delete(capture.id);
      toast.success("Capture deleted", {
        action: {
          label: "Undo",
          onClick: async () => {
            const { id, ...capData } = capture;
            await db.captures.add(capData);
            toast.success("Capture restored");
          }
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete capture");
    }
  };

  const handleBulkDownloadPhotos = async () => {
    if (!captures) return;
    
    const photoCaptures = captures.filter(c => c.type === 'photo' && c.mediaUrl);
    
    if (photoCaptures.length === 0) {
      toast.error("No photos to download");
      return;
    }

    // Download each photo
    photoCaptures.forEach((capture, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = capture.mediaUrl!;
        link.download = `${session?.facility}_photo_${index + 1}_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200); // Stagger downloads to avoid browser blocking
    });

    toast.success(`Downloading ${photoCaptures.length} photo(s)`);
  };

  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setLightboxOpen(true);
  };

  if (!session) return <div className="p-8 text-center text-stone-500">Loading session...</div>;

  const isCompleted = session.status === 'completed';

  const handleEndSession = () => {
    navigate(`/session/${sessionId}/complete`);
  };

  return (
    <div className="max-w-md mx-auto p-4 flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <button onClick={() => navigate('/logs')} className="p-2 -ml-2 text-stone-400 hover:text-stone-100">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold text-stone-100">{session.facility}</h1>
          <p className={`text-[10px] font-mono uppercase tracking-widest ${isCompleted ? 'text-stone-500' : 'text-emerald-500'}`}>
            {isCompleted ? 'Completed Session' : 'Active Session'}
          </p>
        </div>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Session Info (Visible for all, but prominent for completed) */}
      <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-4 mb-6 flex-shrink-0 flex flex-col gap-2">
         <div className="flex justify-between items-center text-xs text-stone-400">
            <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> {format(session.date, 'MMMM d, yyyy')}</span>
            <span>{Math.floor(session.durationMinutes / 60)}h {session.durationMinutes % 60}m</span>
         </div>
         {session.area && (
           <div className="flex items-center gap-2 text-xs text-stone-500">
             <MapPin className="h-3 w-3" /> {session.area} ({session.role})
           </div>
         )}
         {isCompleted && session.reflectionPrompts && (
           <div className="mt-2 pt-2 border-t border-stone-800 space-y-2">
             {Object.entries(session.reflectionPrompts).slice(0, 1).map(([prompt, answer]) => (
               <div key={prompt}>
                 <p className="text-[10px] text-stone-500 font-semibold mb-0.5">{prompt}</p>
                 <p className="text-xs text-stone-300 line-clamp-2">{answer || '-'}</p>
               </div>
             ))}
           </div>
         )}
      </div>

      {/* Quick Capture Grid (Only if Active) */}
      {!isCompleted && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Link to={`/session/${sessionId}/capture?type=text`} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:border-emerald-500/30">
            <div className="bg-stone-800 p-2 rounded-full text-emerald-400">
               <FileText className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-stone-300">Note</span>
          </Link>
          <Link to={`/session/${sessionId}/capture?type=photo`} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:border-emerald-500/30">
             <div className="bg-stone-800 p-2 rounded-full text-emerald-400">
               <Camera className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-stone-300">Photo</span>
          </Link>
          <Link to={`/session/${sessionId}/capture?type=voice`} className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex flex-col items-center gap-2 active:scale-95 transition-transform hover:border-emerald-500/30">
             <div className="bg-stone-800 p-2 rounded-full text-emerald-400">
               <Mic className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-stone-300">Voice</span>
          </Link>
        </div>
      )}

      {/* Scrollable content area */}
      <div className="space-y-4">
        {/* Timeline Header - Sticky */}
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-stone-950 py-2 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Timeline</h2>
            <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded-full">{captures?.length || 0}</span>
          </div>
          {captures && captures.filter(c => c.type === 'photo' && c.mediaUrl).length > 0 && (
            <button 
              onClick={handleBulkDownloadPhotos}
              className="flex items-center gap-1.5 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-colors"
            >
              <Images className="h-3 w-3" />
              Download All Photos
            </button>
          )}
        </div>

        {!captures || captures.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-stone-800 rounded-xl bg-stone-900/20">
            <p className="text-stone-500 text-sm">No captures recorded.</p>
          </div>
        ) : (
          <div className="relative border-l border-stone-800 ml-4 space-y-6 pb-6 pt-2">
            <AnimatePresence initial={false}>
              {captures.map(cap => (
                <div key={cap.id} className="relative pl-6 group/item">
                  {/* Dot - Outside swipeable area */}
                  <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-stone-900 border border-stone-700 group-hover/item:border-emerald-500/50 transition-colors z-20"></div>
                  
                  <SwipeableItem onDelete={() => handleDeleteCapture(cap)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-stone-500">
                        {cap.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-stone-800 text-stone-300 rounded uppercase font-bold tracking-wide">
                        {cap.type}
                      </span>
                    </div>
                    
                    <div className="bg-stone-900 border border-stone-800 rounded-lg p-3 group-hover/item:border-stone-700 transition-colors shadow-sm">
                      {cap.content && <p className="text-sm text-stone-300 mb-2 whitespace-pre-wrap">{cap.content}</p>}
                      {cap.mediaUrl && cap.type === 'photo' && (
                        <img 
                          src={cap.mediaUrl} 
                          alt="Capture" 
                          className="rounded-lg max-h-48 w-full object-cover border border-stone-800 cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => openLightbox(cap.mediaUrl!)}
                        />
                      )}
                      {cap.mediaUrl && cap.type === 'voice' && (
                        <div className="bg-stone-950 p-3 rounded-lg border border-stone-800/50 mt-1">
                          <audio src={cap.mediaUrl} controls className="w-full h-8 accent-emerald-500" />
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-stone-500 italic">
                            <Mic className="h-3 w-3" /> Voice recording
                          </div>
                        </div>
                      )}
                      {cap.tags && cap.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cap.tags.map(tag => (
                            <span key={tag} className="text-[10px] text-emerald-500 bg-emerald-950/30 px-1.5 rounded">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </SwipeableItem>
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Reflection Section (Only for Completed Sessions) - Inside scrollable area */}
        {isCompleted && session.reflectionPrompts && (
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2 mb-2">
               <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest">End of Day Reflection</h2>
            </div>
            
            <div className="space-y-3">
              {Object.entries(session.reflectionPrompts).map(([prompt, answer]) => (
                <div key={prompt} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-stone-400 mb-2">{prompt}</p>
                  <p className="text-sm text-stone-200 leading-relaxed whitespace-pre-line">{answer || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action (Only if Active) */}
      {!isCompleted && (
        <div className="sticky bottom-4 pt-4 bg-gradient-to-t from-stone-950 via-stone-950 to-transparent">
          <button 
            onClick={handleEndSession}
            className="w-full bg-stone-800 text-stone-200 border border-stone-700 font-bold py-4 rounded-xl hover:bg-stone-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/50"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Complete Session
          </button>
        </div>
      )}

      {/* Photo Lightbox */}
      <PhotoLightbox 
        isOpen={lightboxOpen}
        imageUrl={lightboxImage}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}