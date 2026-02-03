import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const QUALIFICATIONS = [
  "Animal Care Cert I",
  "Animal Care Cert II",
  "Animal Care Cert III",
  "Wildlife & Exhibited Animal Care Cert III",
  "Other"
];

// Check if localStorage is available
function checkLocalStorage(): boolean {
  try {
    const test = '__keeperlog_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Track step views for local instrumentation
function trackStepView(step: number) {
  try {
    const key = `keeperlog_step_${step}_viewed`;
    const count = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(count + 1));
  } catch (e) {
    // Silent fail - tracking is optional
  }
}

function trackOnboardingComplete() {
  try {
    const key = 'keeperlog_onboarding_completed_count';
    const count = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(count + 1));
  } catch (e) {
    // Silent fail
  }
}

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [name, setName] = useState('');
  const [qualification, setQualification] = useState(QUALIFICATIONS[2]);
  const [defaultFacility, setDefaultFacility] = useState('');
  const [reflectionStyle, setReflectionStyle] = useState<'short' | 'standard'>('standard');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [storageWarningAcknowledged, setStorageWarningAcknowledged] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check localStorage availability on mount
  useEffect(() => {
    const available = checkLocalStorage();
    setStorageAvailable(available);
    if (!available) {
      console.warn('localStorage is not available - KeeperLog will not persist data');
    }
  }, []);

  // Track step views
  useEffect(() => {
    trackStepView(step);
  }, [step]);

  // Pre-fill from existing profile if available (migration from old onboarding)
  useEffect(() => {
    if (!storageAvailable) return;
    
    const existingProfile = localStorage.getItem('keeperLog_profile');
    if (existingProfile) {
      try {
        const profile = JSON.parse(existingProfile);
        if (profile.name) setName(profile.name);
        if (profile.qualification) setQualification(profile.qualification);
        if (profile.defaultFacility) setDefaultFacility(profile.defaultFacility);
        if (profile.reflectionLength) setReflectionStyle(profile.reflectionLength);
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [storageAvailable]);

  const handleComplete = () => {
    if (!storageAvailable && !storageWarningAcknowledged) {
      toast.error("Please acknowledge the storage warning to continue");
      return;
    }

    const profile = {
      name: name.trim() || 'Student',
      qualification,
      defaultFacility: defaultFacility.trim(),
      reflectionLength: reflectionStyle,
      onboardingCompleted: true
    };

    try {
      localStorage.setItem('keeperLog_profile', JSON.stringify(profile));
      localStorage.setItem('keeperlog_onboarding_v1', 'complete');
      localStorage.setItem('keeperlog_onboarding_meta', JSON.stringify({
        version: 'v1',
        completedAt: new Date().toISOString()
      }));
      
      trackOnboardingComplete();
      toast.success("Welcome to KeeperLog!");
      navigate('/');
    } catch (e) {
      toast.error("Failed to save profile. Please check browser settings.");
      console.error('Storage error:', e);
    }
  };

  const handleSkip = () => {
    // PRD: Skip on Step 1 jumps to Step 3 (setup) to reduce friction
    setDirection('forward');
    setStep(3);
  };

  const goNext = () => {
    setDirection('forward');
    setStep(step + 1);
  };

  const goBack = () => {
    setDirection('backward');
    if (step > 1) setStep(step - 1);
  };

  // Animation classes based on direction and reduced motion
  const getAnimationClass = () => {
    if (prefersReducedMotion) {
      return 'animate-in fade-in duration-200';
    }
    if (direction === 'forward') {
      return 'animate-in fade-in slide-in-from-right-3 duration-[220ms] ease-in-out';
    }
    return 'animate-in fade-in slide-in-from-left-3 duration-[220ms] ease-in-out';
  };

  // Banner parallax effect (subtle, respects reduced motion)
  const getBannerTransform = () => {
    if (prefersReducedMotion) return '';
    return 'transition-transform duration-[240ms] ease-in-out';
  };

  return (
    <div className="h-screen bg-stone-950 flex flex-col overflow-hidden">
      {/* LocalStorage Warning Banner */}
      {!storageAvailable && (
        <div className="bg-amber-900/30 border-b border-amber-800/50 p-4 flex items-start gap-3 flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-200">Local storage is blocked</p>
            <p className="text-xs text-amber-300/80 mt-1">
              KeeperLog may not save your progress. Check your browser settings or privacy mode.
            </p>
            {!storageWarningAcknowledged && (
              <button
                onClick={() => setStorageWarningAcknowledged(true)}
                className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 underline"
              >
                Continue anyway (at your own risk)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Banner Area - 35% height with smooth fade */}
      <div className="h-[35vh] relative overflow-hidden flex-shrink-0">
        {step === 1 && (
          <div className={getBannerTransform()}>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1663517895302-a7e60bb49cd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGZlYXRoZXIlMjB0ZXh0dXJlJTIwY2xvc2UtdXB8ZW58MXx8fHwxNzcwMTEyNDMwfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Field journal texture"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}
        {step === 2 && (
          <div className={getBannerTransform()}>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1730314737142-2f6bb293f893?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3BvZ3JhcGhpYyUyMG1hcCUyMG5hdHVyZSUyMG1pbmltYWx8ZW58MXx8fHwxNzcwMTEyNDMxfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Privacy shield"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}
        {step === 3 && (
          <div className={getBannerTransform()}>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1760119199314-2c11dd1f12d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkbGlmZSUyMHNpbGhvdWV0dGUlMjBzdW5zZXQlMjBtaW5pbWFsfGVufDF8fHx8MTc3MDExMjQzMXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Wildlife care context"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        )}
        {/* Smooth gradient fade from transparent to solid */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-950/60 to-stone-950" />
      </div>

      {/* Content Area - 65% with content above dots */}
      <div className="flex-1 px-6 flex flex-col overflow-y-auto">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col min-h-0">
          
          {/* Main Content - positioned above dots */}
          <div className="flex-1 flex flex-col justify-center overflow-y-auto min-h-0 pb-4">
            
            {/* Step 1: Value / Positioning */}
            {step === 1 && (
              <div key="step1" className={`text-center space-y-4 ${getAnimationClass()}`}>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Your offline placement journal.
                </h1>
                <p className="text-lg text-stone-400 leading-relaxed max-w-sm mx-auto">
                  Capture fast. Reflect with structure. Export evidence.
                </p>
              </div>
            )}

            {/* Step 2: Privacy + Offline Trust */}
            {step === 2 && (
              <div key="step2" className={`text-center space-y-4 ${getAnimationClass()}`}>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Private and on-device.
                </h1>
                <p className="text-lg text-stone-400 leading-relaxed max-w-sm mx-auto">
                  Entries stay on this device. Export regularly to back up.
                </p>
                <p className="text-sm text-stone-600 pt-2">
                  No login. No cloud. Works offline.
                </p>
              </div>
            )}

            {/* Step 3: Minimal Setup */}
            {step === 3 && (
              <div key="step3" className={`space-y-4 ${getAnimationClass()}`}>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Set up in 20 seconds.
                  </h1>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    A few defaults so KeeperLog feels like yours.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">
                      Name <span className="text-stone-700">(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Sam Rivera"
                      className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-stone-100 placeholder:text-stone-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">
                      Qualification
                    </label>
                    <select 
                      value={qualification}
                      onChange={e => setQualification(e.target.value)}
                      className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-stone-100 appearance-none transition-all"
                    >
                      {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">
                      Default Placement Site <span className="text-stone-700">(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      value={defaultFacility}
                      onChange={e => setDefaultFacility(e.target.value)}
                      placeholder="e.g. Taronga Zoo"
                      className="w-full p-3 bg-stone-900 border border-stone-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-stone-100 placeholder:text-stone-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">
                      Reflection Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setReflectionStyle('short')}
                        className={`p-3 rounded-lg border transition-all duration-[100ms] active:scale-[0.98] ${
                          reflectionStyle === 'short' 
                            ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' 
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <div className="font-semibold text-sm">Short</div>
                        <div className="text-xs opacity-70">2 prompts</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReflectionStyle('standard')}
                        className={`p-3 rounded-lg border transition-all duration-[100ms] active:scale-[0.98] ${
                          reflectionStyle === 'standard' 
                            ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' 
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <div className="font-semibold text-sm">Standard</div>
                        <div className="text-xs opacity-70">4 prompts</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Dots - now below content */}
          <div className="flex items-center justify-center gap-2 mb-4 flex-shrink-0">
            <div className={`h-2 w-2 rounded-full transition-all duration-300 ${step === 1 ? 'bg-emerald-500 w-6' : 'bg-stone-700'}`} />
            <div className={`h-2 w-2 rounded-full transition-all duration-300 ${step === 2 ? 'bg-emerald-500 w-6' : 'bg-stone-700'}`} />
            <div className={`h-2 w-2 rounded-full transition-all duration-300 ${step === 3 ? 'bg-emerald-500 w-6' : 'bg-stone-700'}`} />
          </div>

          {/* Navigation Buttons - Fixed to bottom */}
          <div className="space-y-3 pb-4 flex-shrink-0">
            {step === 1 && (
              <>
                <button 
                  onClick={goNext}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 active:scale-[0.98] active:opacity-95 transition-all duration-[100ms] flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleSkip}
                  className="w-full text-stone-600 font-medium py-2 hover:text-stone-500 transition-colors text-sm"
                >
                  Skip
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <button 
                  onClick={goNext}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 active:scale-[0.98] active:opacity-95 transition-all duration-[100ms] flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={goBack}
                  className="w-full text-stone-600 font-medium py-2 hover:text-stone-500 transition-colors text-sm"
                >
                  Back
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <button 
                  onClick={handleComplete}
                  disabled={!storageAvailable && !storageWarningAcknowledged}
                  className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 active:scale-[0.98] active:opacity-95 transition-all duration-[100ms] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start using KeeperLog
                </button>
                <button 
                  onClick={goBack}
                  className="w-full text-stone-600 font-medium py-2 hover:text-stone-500 transition-colors text-sm"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
