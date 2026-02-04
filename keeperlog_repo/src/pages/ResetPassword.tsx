import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner@2.0.3';
import { supabase } from '../lib/supabase';

const STYLES = {
  input: "w-full p-3 bg-stone-900 border border-stone-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-stone-100 placeholder:text-stone-600 transition-all text-sm",
  label: "block text-[10px] font-bold text-stone-500 mb-1.5 uppercase tracking-wider",
  buttonPrimary: "w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
};

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Invalid or expired reset link.");
        // We don't redirect immediately to allow the user to see the error
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success("Password updated successfully!");
      
      setTimeout(() => {
        navigate('/onboarding');
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="h-screen bg-stone-950 flex flex-col items-center justify-center px-6 text-stone-100">
        <Toaster theme="dark" position="top-center" />
        <div className="bg-stone-900 border border-stone-800 p-8 rounded-3xl text-center space-y-4 max-w-sm w-full animate-in fade-in zoom-in duration-300">
          <div className="h-16 w-16 bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold">Password Updated!</h1>
          <p className="text-stone-400 text-sm">Your password has been reset successfully. Redirecting you to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-stone-950 flex flex-col px-6 text-stone-100">
      <Toaster theme="dark" position="top-center" />
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center text-emerald-500 mx-auto mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
          <p className="text-stone-400 text-sm">Choose a strong password for your KeeperLog account.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className={STYLES.label}>New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className={STYLES.input}
                required
              />
            </div>
            <div>
              <label className={STYLES.label}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="••••••••" 
                className={STYLES.input}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={STYLES.buttonPrimary}
          >
            {isLoading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-[10px] text-stone-600 uppercase font-bold tracking-widest pt-4">
          KeeperLog Security
        </p>
      </div>
    </div>
  );
}
