import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const QUALIFICATIONS = [
  "Animal Care Cert I",
  "Animal Care Cert II",
  "Animal Care Cert III",
  "Wildlife & Exhibited Animal Care Cert III",
  "Other"
];

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [qualification, setQualification] = useState(QUALIFICATIONS[3]);
  const [defaultFacility, setDefaultFacility] = useState('');
  const [targetHours, setTargetHours] = useState('');
  const [reflectionLength, setReflectionLength] = useState<'short' | 'standard'>('standard');

  const handleComplete = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    const profile = {
      name,
      qualification,
      defaultFacility,
      targetHours: targetHours ? Number(targetHours) : undefined,
      reflectionLength,
      onboardingCompleted: true
    };

    localStorage.setItem('keeperLog_profile', JSON.stringify(profile));
    toast.success("Profile created!");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full space-y-8">
        
        {/* Step 1: Welcome & Privacy */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <div className="bg-emerald-900/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <ShieldCheck className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Welcome to KeeperLog</h1>
              <p className="text-stone-400">Your professional field journal for animal care placements.</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-stone-200 text-sm uppercase tracking-wide">Privacy Notice</h3>
              <p className="text-sm text-stone-400 leading-relaxed">
                Your entries are stored <strong>only on this device</strong>. No data is sent to the cloud. 
                Please export your logs regularly to back them up.
              </p>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="text-center">
              <div className="bg-stone-900 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border border-stone-800">
                <User className="h-6 w-6 text-stone-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Create Profile</h1>
              <p className="text-sm text-stone-500">Tailor the app to your studies.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jane Goodall"
                  className="w-full p-4 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-2">Qualification</label>
                <select 
                  value={qualification}
                  onChange={e => setQualification(e.target.value)}
                  className="w-full p-4 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200 appearance-none"
                >
                  {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-2">Default Facility (Optional)</label>
                <input 
                  type="text" 
                  value={defaultFacility}
                  onChange={e => setDefaultFacility(e.target.value)}
                  placeholder="e.g. Taronga Zoo"
                  className="w-full p-4 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2">Target Hours</label>
                    <input 
                      type="number" 
                      value={targetHours}
                      onChange={e => setTargetHours(e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full p-4 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2">Reflections</label>
                    <select 
                      value={reflectionLength}
                      onChange={e => setReflectionLength(e.target.value as any)}
                      className="w-full p-4 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200 appearance-none"
                    >
                      <option value="short">Short (2 prompts)</option>
                      <option value="standard">Standard (4 prompts)</option>
                    </select>
                 </div>
              </div>
            </div>

            <button 
              onClick={handleComplete}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition-colors"
            >
              Start using KeeperLog
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
