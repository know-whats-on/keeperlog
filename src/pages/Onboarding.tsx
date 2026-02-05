import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, AlertTriangle, ShieldCheck, Cloud, Lock, CheckCircle2, User } from 'lucide-react';
import { Toaster, toast } from "sonner@2.0.3";
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ForestAnimation } from '../components/ForestAnimation';
import { supabase, serverFetch } from '../lib/supabase';

const QUALIFICATIONS = [
  "Animal Care Cert I",
  "Animal Care Cert II",
  "Animal Care Cert III",
  "Wildlife & Exhibited Animal Care Cert III",
  "Other"
];

const STYLES = {
  input: "w-full p-3 bg-stone-900 border border-stone-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-stone-100 placeholder:text-stone-600 transition-all text-sm",
  label: "block text-[10px] font-bold text-stone-500 mb-1.5 uppercase tracking-wider",
  buttonPrimary: "w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
  buttonSecondary: "w-full text-stone-600 font-medium py-2 hover:text-stone-500 transition-colors text-xs"
};

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  
  // Profile State
  const [name, setName] = useState('');
  const [qualification, setQualification] = useState(QUALIFICATIONS[2]);
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
        setIsLogin(true);
        setIsEmailVerified(true);
      }
    };
    checkUser();
  }, []);

  const [storageAvailable, setStorageAvailable] = useState(true);
  const [storageWarningAcknowledged, setStorageWarningAcknowledged] = useState(false);

  // Automatic Email Detection
  useEffect(() => {
    if (!email || !email.includes('@') || !email.includes('.')) {
      setIsEmailVerified(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const result = await serverFetch('/check-email', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim() })
        });
        if (result && typeof result.exists === 'boolean') {
          setIsLogin(result.exists);
          setIsEmailVerified(true);
        }
      } catch (e) {
        console.error("Email check failed:", e);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [email]);

  useEffect(() => {
    const testKey = '__storage_test__';
    try {
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      setStorageAvailable(true);
    } catch (e) {
      setStorageAvailable(false);
    }
  }, []);

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter your email address first");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent! Check your inbox.");
    } catch (e: any) {
      toast.error(e.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!storageAvailable && !storageWarningAcknowledged) {
      toast.error("Local storage is required for KeeperLog to function.");
      return;
    }

    if (email.trim() && !password) {
      toast.error("Please enter a password.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Handle Cloud Auth if email is provided
      if (email.trim()) {
        if (isLogin) {
          // SIGN IN FLOW
          const { data, error } = await supabase.auth.signInWithPassword({ 
            email: email.trim(), 
            password 
          });
          
          if (error) {
            console.error("Sign-in error full object:", error);
            // Robust check for invalid credentials
            const isInvalid = error.message?.toLowerCase().includes("invalid") || 
                             error.message?.toLowerCase().includes("credentials") ||
                             error.status === 400;
            
            if (isInvalid) {
              toast.error("Incorrect password. Please try again or use 'Forgot?' to reset it.");
              setIsLoading(false);
              return;
            }
            throw error;
          }
        } else {
          // SIGN UP FLOW
          if (password !== confirmPassword) {
            throw new Error("Passwords do not match. Please verify your password.");
          }
          
          try {
            const result = await serverFetch('/signup', {
              method: 'POST',
              body: JSON.stringify({ 
                email: email.trim(), 
                password, 
                name: name.trim() || 'Student' 
              })
            });
            
            // Sign in automatically after creation
            const { error: loginError } = await supabase.auth.signInWithPassword({ 
              email: email.trim(), 
              password 
            });
            if (loginError) {
              console.error("Automatic login failed after signup:", loginError);
              throw loginError;
            }
          } catch (err: any) {
            console.error("Signup error details:", err);
            const msg = err.message.toLowerCase();
            if (msg.includes("already exists") || msg.includes("already been registered")) {
              setIsLogin(true); // Auto-switch to login state
              setIsEmailVerified(true);
              toast.info("Account already exists. Switched to Sign In.");
              setIsLoading(false);
              return;
            }
            throw err;
          }
        }
      }

      // 2. Save Profile Locally (Offline-First)
      const profile = {
        name: name.trim() || 'Student',
        qualification,
        onboardingCompleted: true,
        reflectionLength: 'standard'
      };

      localStorage.setItem('keeperLog_profile', JSON.stringify(profile));
      localStorage.setItem('keeperlog_onboarding_v1', 'complete');
      localStorage.setItem('keeperlog_onboarding_meta', JSON.stringify({
        version: 'v1.4.1',
        completedAt: new Date().toISOString(),
        cloudSync: !!email.trim()
      }));
      
      toast.success(email.trim() ? "Account ready & Setup complete!" : "Setup complete!");
      navigate('/');
    } catch (e: any) {
      console.error('Onboarding Submission Error:', e);
      toast.error(e.message || "Something went wrong. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const goNext = () => {
    setDirection('forward');
    setStep(step + 1);
  };

  const goBack = () => {
    setDirection('backward');
    if (step > 1) setStep(step - 1);
  };

  const getAnimationClass = () => {
    if (direction === 'forward') return 'animate-in fade-in slide-in-from-right-3 duration-[250ms] ease-out';
    return 'animate-in fade-in slide-in-from-left-3 duration-[250ms] ease-out';
  };

  return (
    <div className="h-screen bg-stone-950 flex flex-col overflow-hidden text-stone-100">
      {/* Banner - Extended for step 1 */}
      <div className={`relative overflow-hidden flex-shrink-0 ${step === 1 ? 'h-[50vh]' : 'h-[30vh]'}`}>
        {step === 1 ? (
          <ForestAnimation />
        ) : (
          <>
            <ImageWithFallback
              src={
                step === 2 ? "https://images.unsplash.com/photo-1730314737142-2f6bb293f893?q=80&w=1080" :
                "https://images.unsplash.com/photo-1696013910376-c56f76dd8178?q=80&w=1080"
              }
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-stone-950/40 to-stone-950" />
          </>
        )}
      </div>

      <div className="flex-1 px-6 flex flex-col overflow-y-auto">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col min-h-0">
          
          <div className="flex-1 flex flex-col justify-center py-4">
            
            {step === 1 && (
              <div key="step1" className={`text-center space-y-4 ${getAnimationClass()}`}>
                <h1 className="text-4xl font-bold tracking-tight">KeeperLog</h1>
                <p className="text-lg text-stone-400 leading-relaxed px-4">
                  Capture fast. Reflect with structure. Export evidence.
                </p>
                <div className="pt-8 flex items-center justify-center gap-6 opacity-40">
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Verify</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Cloud className="h-5 w-5" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Sync</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Lock className="h-5 w-5" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Secure</span>
                  </div>
                </div>
                <p className="text-center text-[10px] text-stone-600 italic pt-8">
                  Made with 💛 by a TAFE NSW Student
                </p>
              </div>
            )}

            {step === 2 && (
              <div key="step2" className={`space-y-6 ${getAnimationClass()}`}>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold">Offline-First.</h1>
                  <p className="text-stone-400 text-sm">Your records stay on this device by default.</p>
                </div>
                
                <div className="bg-stone-900/40 border border-stone-800 p-5 rounded-2xl space-y-4">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Privacy by Design</h3>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">No tracking. No ads. Just your data, exactly where you left it.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <Cloud className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Optional Cloud Sync</h3>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">Choose to sync your records to the cloud for backup and multi-device access.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div key="step3" className={`space-y-6 overflow-y-auto pb-4 ${getAnimationClass()}`}>
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-bold">Let's get started.</h1>
                  <p className="text-xs text-stone-500">Quick profile setup and optional backup.</p>
                </div>

                <div className="space-y-4">
                  {/* Basic Profile */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className={STYLES.label}>Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-stone-600" />
                        <input 
                          type="text" 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          placeholder="Sam Rivera" 
                          className={STYLES.input + " pl-10"} 
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className={STYLES.label}>Qualification</label>
                      <select 
                        value={qualification} 
                        onChange={e => setQualification(e.target.value)} 
                        className={STYLES.input}
                      >
                        {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-800"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-stone-950 px-2 text-stone-600">Optional Cloud Sync</span></div>
                  </div>

                  {/* Cloud Auth */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={STYLES.label}>Email Address</label>
                        {isCheckingEmail && <span className="text-[10px] text-emerald-500 animate-pulse font-bold uppercase tracking-wider">Checking...</span>}
                      </div>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="student@tafensw.edu.au" 
                        className={STYLES.input} 
                      />
                    </div>

                    {email.trim() && email.includes('@') && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between">
                          <label className={STYLES.label}>{isLogin ? "Password" : "Create Password"}</label>
                          <div className="flex gap-3">
                            {isLogin && (
                              <button 
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-[10px] font-bold text-stone-500 uppercase tracking-wider hover:text-emerald-500 transition-colors"
                              >
                                Forgot?
                              </button>
                            )}
                            {!isEmailVerified && (
                              <button 
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider hover:text-emerald-400 transition-colors"
                              >
                                {isLogin ? "New User?" : "Sign In?"}
                              </button>
                            )}
                          </div>
                        </div>
                        <input 
                          type="password" 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          placeholder="••••••••" 
                          className={STYLES.input} 
                        />
                        {!isLogin && (
                          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                            <label className={STYLES.label}>Confirm Password</label>
                            <input 
                              type="password" 
                              value={confirmPassword} 
                              onChange={e => setConfirmPassword(e.target.value)} 
                              placeholder="••••••••" 
                              className={STYLES.input} 
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress & Navigation */}
          <div className="space-y-4 pb-8 flex-shrink-0">
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'bg-emerald-500 w-8' : 'bg-stone-800 w-4'}`} />
              ))}
            </div>

            <div className="space-y-2">
              {step < 3 ? (
                <button onClick={goNext} className={STYLES.buttonPrimary}>
                  Continue <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button 
                  onClick={handleFinalSubmit} 
                  disabled={isLoading}
                  className={STYLES.buttonPrimary}
                >
                  {isLoading ? "Setting up..." : (
                    email.trim() 
                      ? (isLogin ? "Sign In & Start" : "Create Account & Start") 
                      : "Start Offline"
                  )}
                </button>
              )}
              
              {step > 1 && (
                <button onClick={goBack} className={STYLES.buttonSecondary}>
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}