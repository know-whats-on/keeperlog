import React, { useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { db } from '../db';
import { ChevronLeft, Save, Camera, Mic, X, Tag, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from '../lib/utils';
import { compressImage } from '../lib/storage';

const COMMON_TAGS = ["Husbandry", "Feeding", "Behavior", "Medical", "Training", "Enrichment"];

export function SessionCapture() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as 'text' | 'photo' | 'voice' || 'text';
  
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [includeInExport, setIncludeInExport] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!content && !image && !audioData && typeParam !== 'voice') {
      toast.error("Please add some content");
      return;
    }

    try {
      await db.captures.add({
        sessionId: Number(id),
        timestamp: new Date(),
        type: typeParam,
        content: content,
        mediaUrl: image || audioData || undefined,
        tags: tags,
        includeInExport: typeParam === 'photo' ? includeInExport : undefined
      });
      toast.success("Captured");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Allow up to 10MB input, but we compress it down
    if (file.size > 10000000) {
      toast.error("Image too large (max 10MB)");
      return;
    }

    setIsCompressing(true);
    try {
      // Compress to max 1200px width/height, 0.7 quality
      const compressed = await compressImage(file, 1200, 0.7);
      setImage(compressed);
    } catch (error) {
      console.error(error);
      toast.error("Failed to process image");
    } finally {
      setIsCompressing(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  // Mock Voice Recording for MVP reliability
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setAudioData("data:audio/webm;base64,MOCK_AUDIO_DATA"); // Placeholder
      toast.success("Voice note saved");
    } else {
      setIsRecording(true);
    }
  };

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="p-3 -ml-3 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-stone-100">
           {typeParam === 'photo' ? 'Add Photo' : typeParam === 'voice' ? 'Voice Note' : 'Quick Note'}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Type Specific Inputs */}
        {typeParam === 'photo' && (
          <div className="space-y-4">
             {/* Rules Reminder */}
             <div className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-500 mb-1">
                   <AlertTriangle className="h-4 w-4" />
                   <h3 className="text-xs font-bold uppercase tracking-wider">Photo Rules</h3>
                </div>
                <ul className="text-xs text-amber-200/80 space-y-1 list-disc pl-4">
                   <li>No visitor faces or public identifiable info.</li>
                   <li>No restricted infrastructure (locks, keys, security).</li>
                   <li>Follow all facility policies and supervisor directions.</li>
                   <li>Prefer photos of equipment/enrichment over animals.</li>
                </ul>
             </div>

             {!image ? (
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={isCompressing}
                 className="w-full aspect-square border-2 border-dashed border-stone-700 rounded-2xl flex flex-col items-center justify-center bg-stone-900 hover:bg-stone-800 transition-colors disabled:opacity-50 group"
               >
                 <Camera className="h-12 w-12 text-stone-500 mb-2 group-hover:text-emerald-500 transition-colors" />
                 <span className="text-stone-400 font-medium">{isCompressing ? "Compressing..." : "Take / Upload Photo"}</span>
               </button>
             ) : (
               <div className="space-y-3">
                 <div className="relative rounded-2xl overflow-hidden border border-stone-800">
                   <img src={image} alt="Preview" className="w-full h-auto" />
                   <button 
                     onClick={() => setImage(null)}
                     className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-900/80 backdrop-blur-sm"
                   >
                     <X className="h-4 w-4" />
                   </button>
                 </div>
                 
                 <label className="flex items-center gap-3 p-3 bg-stone-900 rounded-xl border border-stone-800 cursor-pointer hover:bg-stone-800 transition-colors">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        checked={includeInExport} 
                        onChange={e => setIncludeInExport(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-stone-600 transition-all checked:border-emerald-500 checked:bg-emerald-500"
                      />
                      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div>
                       <span className="text-sm font-medium text-stone-200">Include in Export</span>
                       <p className="text-[10px] text-stone-500">Default OFF. Only enable if safe and permitted.</p>
                    </div>
                 </label>
               </div>
             )}
             <input 
               type="file" 
               accept="image/*" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
               className="hidden" 
             />
          </div>
        )}

        {typeParam === 'voice' && (
          <div className="flex flex-col items-center justify-center py-12 bg-stone-900 rounded-2xl border border-stone-800">
             <button
               onClick={toggleRecording}
               className={cn(
                 "h-24 w-24 rounded-full flex items-center justify-center transition-all",
                 isRecording ? "bg-red-900/20 animate-pulse border-4 border-red-500" : "bg-emerald-900/20 border-4 border-emerald-500/30 hover:bg-emerald-900/40"
               )}
             >
               <Mic className={cn("h-10 w-10", isRecording ? "text-red-500" : "text-emerald-500")} />
             </button>
             <p className="mt-4 text-stone-400 text-sm font-medium">
               {isRecording ? "Recording... Tap to stop" : audioData ? "Recording saved" : "Tap to record"}
             </p>
          </div>
        )}

        {/* Note / Description */}
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-2">
            {typeParam === 'voice' ? 'Transcript / Summary (Optional)' : 'Description'}
          </label>
          <textarea 
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Add details..."
            rows={4}
            className="w-full p-4 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200 placeholder:text-stone-600"
          />
        </div>

        {/* Tags */}
        <div>
           <label className="block text-xs font-medium text-stone-500 mb-2 flex items-center gap-2">
             <Tag className="h-3 w-3" /> Tags
           </label>
           <div className="flex flex-wrap gap-2">
             {COMMON_TAGS.map(tag => (
               <button
                 key={tag}
                 onClick={() => toggleTag(tag)}
                 className={cn(
                   "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                   tags.includes(tag) 
                     ? "bg-emerald-900/40 text-emerald-400 border-emerald-500/50" 
                     : "bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-600"
                 )}
               >
                 {tag}
               </button>
             ))}
           </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button 
            onClick={handleSave}
            disabled={isCompressing}
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" /> {isCompressing ? 'Processing...' : 'Save Capture'}
          </button>
        </div>
      </div>
    </div>
  );
}
