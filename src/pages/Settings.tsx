import React, { useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from '../db';
import { Plus, Trash2, Info, ChevronRight, User, ShieldCheck, HardDrive, Eye, EyeOff, Edit2, X, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useNavigate, Link } from 'react-router';
import { seedCompetencies } from '../lib/competencies';
import { cn } from '../lib/utils';

export function SettingsPage() {
  const navigate = useNavigate();
  const competencies = useLiveQuery(() => db.competencies.toArray());
  const [newCode, setNewCode] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editQual, setEditQual] = useState('');

  const profile = JSON.parse(localStorage.getItem('keeperLog_profile') || '{}');

  // Sort by order/active, with safeguards
  const sortedCompetencies = (competencies || []).sort((a, b) => {
    // Active first
    if ((a.active ?? true) !== (b.active ?? true)) return (b.active ?? true) ? 1 : -1;
    return (a.order ?? 999) - (b.order ?? 999);
  });

  const addCompetency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    
    try {
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
    } catch (error) {
      toast.error("Failed to add");
    }
  };

  const toggleActive = async (id: number, current: boolean | undefined) => {
    await db.competencies.update(id, { active: !(current ?? true) });
  };

  const startEdit = (comp: any) => {
    setEditingId(comp.id);
    setEditCode(comp.code || '');
    setEditDesc(comp.description || '');
  };

  const saveEdit = async () => {
    if (editingId) {
      await db.competencies.update(editingId, { code: editCode, description: editDesc });
      setEditingId(null);
      toast.success("Updated");
    }
  };

  const resetDefaults = async () => {
    if (window.confirm("Reset all competencies to default list? This will remove custom ones.")) {
      await db.competencies.clear();
      await seedCompetencies();
      toast.success("Defaults restored");
    }
  };
  
  const startEditProfile = () => {
    setEditName(profile.name || '');
    setEditQual(profile.qualification || '');
    setIsEditingProfile(true);
  };

  const saveProfile = () => {
    const updated = { ...profile, name: editName, qualification: editQual };
    localStorage.setItem('keeperLog_profile', JSON.stringify(updated));
    setIsEditingProfile(false);
    toast.success("Profile updated");
  };

  const cancelEditProfile = () => {
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-xl font-bold text-stone-100">Settings</h1>
      
      {/* Profile Section */}
      <section className="bg-stone-900 rounded-xl border border-stone-800 p-4">
        <div className="flex items-center justify-between mb-4">
           <h2 className="font-semibold text-stone-200 text-sm uppercase tracking-wide">Student Profile</h2>
           {!isEditingProfile && (
             <button onClick={startEditProfile} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium">Edit</button>
           )}
        </div>
        
        {isEditingProfile ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Full Name</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 text-sm focus:border-emerald-500/50 focus:outline-none"
                placeholder="Student Name"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Qualification</label>
              <select 
                value={editQual}
                onChange={(e) => setEditQual(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200 text-sm focus:border-emerald-500/50 focus:outline-none"
              >
                <option value="">Select Qualification...</option>
                <option value="ACM20121 Certificate II in Animal Care">ACM20121 Certificate II in Animal Care</option>
                <option value="ACM30122 Certificate III in Animal Care Services">ACM30122 Certificate III in Animal Care Services</option>
                <option value="ACM30321 Certificate III in Wildlife and Exhibited Animal Care">ACM30321 Certificate III in Wildlife and Exhibited Animal Care</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveProfile} className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-xs font-bold hover:bg-emerald-500">Save Changes</button>
              <button onClick={cancelEditProfile} className="flex-1 bg-stone-800 text-stone-400 rounded-lg py-2 text-xs font-bold hover:bg-stone-700">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 bg-stone-800 rounded-full flex items-center justify-center text-stone-400">
               <User className="h-6 w-6" />
             </div>
             <div>
               <p className="font-bold text-stone-100">{profile.name || 'Student'}</p>
               <p className="text-xs text-stone-500">{profile.qualification}</p>
             </div>
          </div>
        )}
      </section>

      {/* Storage & Privacy */}
      <section className="space-y-3">
         <h2 className="font-semibold text-stone-500 text-xs uppercase tracking-wide px-1">Storage & Data</h2>
         
         <Link to="/settings/storage" className="block bg-stone-900 rounded-xl border border-stone-800 p-4 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="bg-stone-800 p-2 rounded-lg text-emerald-500">
                   <HardDrive className="h-5 w-5" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-stone-200 text-sm">Storage Manager</h3>
                   <p className="text-xs text-stone-500">Manage photos & voice notes</p>
                 </div>
              </div>
              <ChevronRight className="h-5 w-5 text-stone-600" />
            </div>
         </Link>

         <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
           <div className="flex items-start gap-3">
             <ShieldCheck className="h-5 w-5 text-stone-500 flex-shrink-0" />
             <div>
               <h3 className="font-semibold text-stone-200 text-sm">Privacy & Ethics</h3>
               <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                 Do not record restricted or sensitive facility information. Follow site rules.
                 Your entries are stored <strong>only on this device</strong>.
               </p>
             </div>
           </div>
        </div>
      </section>

      {/* Competencies Editor */}
      <section className="bg-stone-900 rounded-xl border border-stone-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-200 text-sm uppercase tracking-wide">Competency List</h2>
          <button onClick={resetDefaults} className="text-[10px] text-stone-500 underline">Reset Defaults</button>
        </div>
        
        <div className="space-y-2 mb-6 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {sortedCompetencies.map(comp => {
            if (!comp.code) return null; // Safe guard against empty codes
            return (
              <div key={comp.id} className={cn("p-3 bg-stone-950/50 border border-stone-800/50 rounded-lg text-sm transition-colors", !(comp.active ?? true) && "opacity-50")}>
                {editingId === comp.id ? (
                  <div className="space-y-2">
                    <input 
                      className="w-full bg-stone-900 border border-stone-700 rounded p-1 text-xs text-white" 
                      value={editCode} 
                      onChange={e => setEditCode(e.target.value)} 
                    />
                    <input 
                      className="w-full bg-stone-900 border border-stone-700 rounded p-1 text-xs text-white" 
                      value={editDesc} 
                      onChange={e => setEditDesc(e.target.value)} 
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="p-1 text-stone-500"><X className="h-4 w-4"/></button>
                      <button onClick={saveEdit} className="p-1 text-emerald-500"><Check className="h-4 w-4"/></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="font-bold text-emerald-500 block text-xs mb-1">{comp.code}</span>
                      <p className="text-xs text-stone-400 leading-relaxed">{comp.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                       <button onClick={() => startEdit(comp)} className="p-1.5 text-stone-600 hover:text-stone-300">
                         <Edit2 className="h-3 w-3" />
                       </button>
                       <button onClick={() => comp.id && toggleActive(comp.id, comp.active)} className="p-1.5 text-stone-600 hover:text-stone-300">
                         {(comp.active ?? true) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                       </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-stone-800 pt-4">
          <p className="text-xs text-stone-500 mb-2">Add New Competency</p>
          <form onSubmit={addCompetency} className="space-y-2">
            <input
              type="text"
              placeholder="Label (e.g. Daily Checks)"
              value={newCode}
              onChange={e => setNewCode(e.target.value)}
              className="w-full text-xs bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Description / Code (Optional)"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full text-xs bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-200"
              />
              <button type="submit" className="bg-emerald-600 text-white rounded-lg px-3 py-2 hover:bg-emerald-500 transition-colors">
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="p-4 bg-stone-900/50 rounded-xl border border-stone-800/50">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-stone-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-stone-300 text-sm">About KeeperLog</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Offline-first journal for TAFE NSW animal care students. 
            </p>
            <p className="text-[10px] text-stone-600 mt-2 font-mono">
              v1.3.0 (Ethics & Competencies)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
