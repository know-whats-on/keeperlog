import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from '../db';
import { 
  Plus, Trash2, Info, ChevronRight, User, ShieldCheck, 
  HardDrive, Eye, EyeOff, Edit2, X, Check, RotateCcw, 
  Cloud, CloudOff, LogOut, Download, Upload, FileJson, 
  AlertCircle, RefreshCw, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useNavigate, Link } from 'react-router';
import { seedCompetencies } from '../lib/competencies';
import { cn } from '../lib/utils';
import { supabase, serverFetch } from '../lib/supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createDataBundle, restoreDataBundle, downloadBundle } from '../lib/data-exchange';
import profileImage from 'figma:asset/b206651a4067f57050f8e5709556b1718b1b3360.png';

export function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const competencies = useLiveQuery(() => db.competencies.toArray());
  
  // States
  const [session, setSession] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editQual, setEditQual] = useState('');
  
  // Competency States
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const profile = JSON.parse(localStorage.getItem('keeperLog_profile') || '{}');

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        // getUser() validates the token with the server
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log("[Settings] No valid user found:", error?.message);
          setSession(null);
          return;
        }

        // Token is valid, now get the session object which contains the access_token
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.access_token) {
          fetchSyncStatus(session.access_token);
        }
      } catch (err) {
        console.error("[Settings] Session check failed:", err);
        setSession(null);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSyncStatus = async (token: string) => {
    // Sync is coming soon, status check not needed yet
    return;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    toast.success("Signed out successfully");
  };

  const handleCloudBackup = () => {
    toast.info("Cloud Backup is coming soon! Your data is currently saved safely on this device.");
  };

  const handleCloudRestore = () => {
    toast.info("Cloud Restore is coming soon!");
  };

  const handleLocalExport = async () => {
    try {
      const bundle = await createDataBundle();
      downloadBundle(bundle);
      toast.success("Backup file downloaded");
    } catch (e) {
      toast.error("Export failed");
    }
  };

  const handleLocalImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bundle = JSON.parse(event.target?.result as string);
        if (window.confirm("Import backup file? This will replace all current data.")) {
          await restoreDataBundle(bundle);
          toast.success("Import successful! Refreshing...");
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (err) {
        toast.error("Invalid backup file format");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Profile Editor
  const startEditProfile = () => {
    setEditName(profile.name || '');
    setEditQual(profile.qualification || '');
    setIsEditingProfile(true);
  };

  const saveProfile = async () => {
    const updated = { ...profile, name: editName, qualification: editQual };
    localStorage.setItem('keeperLog_profile', JSON.stringify(updated));
    setIsEditingProfile(false);
    toast.success("Profile updated");
  };

  // Competency Editor
  const sortedCompetencies = (competencies || []).sort((a, b) => {
    if ((a.active ?? true) !== (b.active ?? true)) return (b.active ?? true) ? 1 : -1;
    return (a.order ?? 999) - (b.order ?? 999);
  });

  const addCompetency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    await db.competencies.add({
      code: newCode,
      description: newDesc,
      category: 'Custom',
      active: true,
      order: 999
    });
    setNewCode('');
    setNewDesc('');
    toast.success("Competency added");
  };

  const toggleActive = async (id: number, current: boolean | undefined) => {
    await db.competencies.update(id, { active: !(current ?? true) });
  };

  const saveEdit = async () => {
    if (editingId) {
      await db.competencies.update(editingId, { code: editCode, description: editDesc });
      setEditingId(null);
      toast.success("Updated");
    }
  };

  const resetDefaults = async () => {
    if (window.confirm("Reset all competencies to default?")) {
      await db.competencies.clear();
      await seedCompetencies();
      toast.success("Defaults restored");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-32 px-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-100">Settings</h1>
        <div className="px-2 py-1 bg-stone-900 rounded border border-stone-800 text-[10px] font-mono text-stone-500">v1.5.0 Robust Sync</div>
      </div>
      
      {/* 1. Data Exchange Center */}
      <section className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
        <div className="p-4 border-b border-stone-800 bg-stone-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className={cn("h-4 w-4 text-emerald-500", isSyncing && "animate-spin")} />
            <h2 className="font-bold text-stone-200 text-sm uppercase tracking-wider">Data Exchange</h2>
          </div>
          {lastSynced && (
            <span className="text-[10px] text-stone-500">Last synced: {new Date(lastSynced).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
          )}
        </div>

        <div className="p-5 space-y-6">
          {/* Cloud Sync Row */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl", session ? "bg-emerald-500/10 text-emerald-500" : "bg-stone-800 text-stone-600")}>
                <Cloud className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-100 text-sm">{session ? "Cloud Backup Active" : "Cloud Backup Disabled"}</h3>
                <p className="text-xs text-stone-500">{session ? session.user.email : "Sign in to enable cross-device sync"}</p>
              </div>
              {!session && (
                <button 
                  onClick={() => navigate('/onboarding')}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-500 transition-colors uppercase tracking-wider"
                >
                  Connect
                </button>
              )}
            </div>

            {session && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={handleCloudBackup}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  <Upload className="h-4 w-4" /> Backup
                </button>
                <button 
                  onClick={handleCloudRestore}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  <Download className="h-4 w-4" /> Restore
                </button>
              </div>
            )}
          </div>

          <div className="h-px bg-stone-800 w-full" />

          {/* Local File Exchange */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-stone-800 rounded-xl text-stone-400">
                <FileJson className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-100 text-sm">Local File Backup</h3>
                <p className="text-xs text-stone-500">Download a .json file of your entire database.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleLocalExport}
                className="flex items-center justify-center gap-2 border border-stone-800 hover:bg-stone-800 text-stone-300 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <Download className="h-4 w-4" /> Export File
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 border border-stone-800 hover:bg-stone-800 text-stone-300 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <Upload className="h-4 w-4" /> Import File
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleLocalImport} 
                className="hidden" 
                accept=".json"
              />
            </div>
          </div>
        </div>

        {session && (
          <div className="p-3 bg-stone-950/50 flex justify-center">
            <button 
              onClick={handleLogout}
              className="text-[10px] font-bold text-stone-600 hover:text-red-500 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
            >
              <LogOut className="h-3 w-3" /> Disconnect Cloud Account
            </button>
          </div>
        )}
      </section>

      {/* 2. Profile Section */}
      <section className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
        <div className="flex items-center justify-between mb-5">
           <h2 className="font-bold text-stone-200 text-sm uppercase tracking-wider">Student Profile</h2>
           {!isEditingProfile && (
             <button onClick={startEditProfile} className="text-xs text-emerald-500 font-bold hover:text-emerald-400">Edit Profile</button>
           )}
        </div>
        
        {isEditingProfile ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase">Full Name</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-500 uppercase">Qualification</label>
              <select 
                value={editQual}
                onChange={(e) => setEditQual(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-100 text-sm outline-none"
              >
                <option value="ACM20121 Certificate II in Animal Care">ACM20121 Certificate II in Animal Care</option>
                <option value="ACM30122 Certificate III in Animal Care Services">ACM30122 Certificate III in Animal Care Services</option>
                <option value="ACM30321 Certificate III in Wildlife and Exhibited Animal Care">ACM30321 Certificate III in Wildlife and Exhibited Animal Care</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveProfile} className="flex-1 bg-emerald-600 text-white rounded-xl py-3 text-xs font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/20">Save Changes</button>
              <button onClick={() => setIsEditingProfile(false)} className="flex-1 bg-stone-800 text-stone-400 rounded-xl py-3 text-xs font-bold hover:bg-stone-700">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-full border-2 border-stone-800 p-0.5 overflow-hidden flex-shrink-0">
               <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-full" />
             </div>
             <div>
               <p className="font-bold text-lg text-stone-100 leading-tight">{profile.name || 'Student'}</p>
               <p className="text-xs text-stone-500 font-medium">{profile.qualification || 'Qualification not set'}</p>
             </div>
          </div>
        )}
      </section>

      {/* 3. Competencies Editor */}
      <section className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-stone-200 text-sm uppercase tracking-wider">Competency List</h2>
          <button onClick={resetDefaults} className="text-[10px] font-bold text-stone-600 hover:text-stone-400 transition-colors uppercase tracking-widest">Reset Defaults</button>
        </div>
        
        <div className="space-y-2 mb-6 pr-2">
          {sortedCompetencies.map(comp => (
            <div key={comp.id} className={cn("p-4 bg-stone-950/50 border border-stone-800/50 rounded-xl transition-all", !(comp.active ?? true) && "opacity-40 grayscale")}>
              {editingId === comp.id ? (
                <div className="space-y-2">
                  <input className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-xs text-white" value={editCode} onChange={e => setEditCode(e.target.value)} />
                  <textarea className="w-full bg-stone-900 border border-stone-700 rounded p-2 text-xs text-white h-20" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="p-2 text-stone-500"><X className="h-4 w-4"/></button>
                    <button onClick={saveEdit} className="p-2 text-emerald-500"><Check className="h-4 w-4"/></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="font-bold text-emerald-500 text-[10px] uppercase tracking-wider mb-1 block">{comp.code}</span>
                    <p className="text-xs text-stone-400 leading-relaxed font-medium">{comp.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                     <button onClick={() => { setEditingId(comp.id!); setEditCode(comp.code); setEditDesc(comp.description); }} className="p-2 text-stone-600 hover:text-stone-300"><Edit2 className="h-4 w-4" /></button>
                     <button onClick={() => comp.id && toggleActive(comp.id, comp.active)} className="p-2 text-stone-600 hover:text-stone-300">{(comp.active ?? true) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={addCompetency} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
          <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Add Custom Item</p>
          <input
            placeholder="Short Label (e.g. Feeding)"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            className="w-full text-xs bg-stone-900 border border-stone-800 rounded-xl p-3 text-stone-200 outline-none"
          />
          <div className="flex gap-2">
            <input
              placeholder="Description (Optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="flex-1 text-xs bg-stone-900 border border-stone-800 rounded-xl p-3 text-stone-200 outline-none"
            />
            <button type="submit" className="bg-stone-800 text-emerald-500 rounded-xl px-4 py-2 hover:bg-stone-700 transition-colors">
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </form>
      </section>

      {/* 4. Info Section */}
      <section className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-stone-800 rounded-lg text-stone-500 flex-shrink-0"><Info className="h-5 w-5" /></div>
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-stone-200 text-sm">Offline First Security</h3>
              <p className="text-xs text-stone-500 leading-relaxed mt-1">
                KeeperLog is designed for TAFE students working in areas with zero connectivity. 
                All logs, photos, and voice notes are stored safely on your device in IndexedDB.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-stone-600 font-bold uppercase tracking-widest">
              <span>Privacy Guaranteed</span>
              <span className="h-1 w-1 bg-stone-800 rounded-full" />
              <span>NSW TAFE Ready</span>
            </div>
            <p className="text-xs text-stone-600 pt-2 border-t border-stone-800">
              Made with 💛 by a TAFE NSW Student
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
