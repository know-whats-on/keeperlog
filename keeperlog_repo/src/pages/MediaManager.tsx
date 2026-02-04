import React, { useState, useEffect } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from '../db';
import { Trash2, AlertTriangle, HardDrive, ChevronLeft, Image as ImageIcon, Mic } from 'lucide-react';
import { useStorageEstimate } from '../lib/storage';
import { useNavigate } from 'react-router';
import { toast } from 'sonner@2.0.3';

export function MediaManager() {
  const navigate = useNavigate();
  const estimate = useStorageEstimate();
  const captures = useLiveQuery(() => db.captures.where('type').anyOf('photo', 'voice').toArray());

  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (captures) {
      // Approximate size calculation
      const withSize = captures.map(c => ({
        ...c,
        size: c.mediaUrl ? c.mediaUrl.length : 0 // base64 length is approx bytes
      })).sort((a, b) => b.size - a.size);
      setItems(withSize);
    }
  }, [captures]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this media file? This will remove the entire capture entry.")) {
      try {
        await db.captures.delete(id);
        toast.success("Entry deleted");
      } catch (e) {
        toast.error("Failed to delete");
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const usagePercent = estimate ? (estimate.usage / estimate.quota) * 100 : 0;
  const isWarning = usagePercent > 70;
  const isCritical = usagePercent > 90;

  return (
    <div className="pb-20">
       <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="p-3 -ml-3 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-stone-100">Storage & Media</h1>
      </div>

      {/* Storage Meter */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-900/20 text-red-500' : 'bg-emerald-900/20 text-emerald-500'}`}>
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-stone-200">Device Storage</h2>
            <p className="text-xs text-stone-500">
              {estimate ? `${formatSize(estimate.usage)} used of ${formatSize(estimate.quota)}` : 'Calculating...'}
            </p>
          </div>
        </div>

        <div className="w-full bg-stone-800 rounded-full h-2.5 mb-2 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`} 
            style={{ width: `${Math.max(usagePercent, 1)}%` }}
          ></div>
        </div>
        
        {isWarning && (
          <div className="flex items-start gap-2 mt-3 text-amber-500 text-xs bg-amber-950/20 p-2 rounded">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <p>Storage running low. Export your data and clear old media.</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wide">Large Files</h2>
        <span className="text-xs text-stone-500">{items.length} files found</span>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-stone-600 py-8 text-sm">No media files found.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-stone-900 border border-stone-800 rounded-xl p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.type === 'photo' && item.mediaUrl ? (
                  <img src={item.mediaUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Mic className="h-5 w-5 text-stone-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-300 capitalize">{item.type}</span>
                  <span className="text-[10px] text-stone-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-stone-400 truncate">{item.content || 'No description'}</p>
                <p className="text-[10px] text-emerald-500 mt-0.5">{formatSize(item.size)}</p>
              </div>

              <button 
                onClick={() => handleDelete(item.id)}
                className="p-2 text-stone-600 hover:text-red-500 hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
