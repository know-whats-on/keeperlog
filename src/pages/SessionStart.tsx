import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { db } from '../db';
import { ChevronLeft, Calendar, MapPin, User, Briefcase } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';

export function SessionStart() {
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem('keeperLog_profile') || '{}');
  
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [facility, setFacility] = useState(profile.defaultFacility || '');
  const [supervisor, setSupervisor] = useState('');
  const [role, setRole] = useState('Assisted');
  const [area, setArea] = useState('');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facility) {
      toast.error("Facility is required");
      return;
    }

    try {
      const startTime = new Date(`${date}T${time}`);
      const id = await db.sessions.add({
        date: new Date(date),
        startTime,
        facility,
        supervisor,
        role,
        area,
        status: 'active',
        durationMinutes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      toast.success("Session started");
      navigate(`/session/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to start session");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-3 -ml-3 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold text-stone-100">New Placement Day</h1>
      </div>

      <form onSubmit={handleStart} className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto pb-4">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full">
                  <label className="block text-xs font-medium text-stone-500 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-stone-500" />
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e => setDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3.5 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200"
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label className="block text-xs font-medium text-stone-500 mb-2">Start Time</label>
                  <input 
                    type="time" 
                    value={time} 
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-3.5 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200"
                  />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-stone-500 mb-2">Facility / Site</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-stone-500" />
                  <input 
                    type="text" 
                    value={facility} 
                    onChange={e => setFacility(e.target.value)}
                    placeholder="e.g. Taronga Zoo"
                    className="w-full pl-10 pr-3 py-3.5 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200"
                  />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-stone-500 mb-2">Area / Section (Optional)</label>
                <input 
                  type="text" 
                  value={area} 
                  onChange={e => setArea(e.target.value)}
                  placeholder="e.g. Primates, Marine"
                  className="w-full px-4 py-3.5 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full">
                  <label className="block text-xs font-medium text-stone-500 mb-2">Supervisor (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-stone-500" />
                    <input 
                      type="text" 
                      value={supervisor} 
                      onChange={e => setSupervisor(e.target.value)}
                      placeholder="Name"
                      className="w-full pl-10 pr-3 py-3.5 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200"
                    />
                  </div>
                </div>
                <div className="w-full">
                   <label className="block text-xs font-medium text-stone-500 mb-2">Role</label>
                   <div className="relative">
                     <Briefcase className="absolute left-3 top-3.5 h-4 w-4 text-stone-500" />
                     <select 
                       value={role} 
                       onChange={e => setRole(e.target.value)}
                       className="w-full pl-10 pr-3 py-3.5 text-sm bg-stone-900 border border-stone-800 rounded-xl focus:ring-1 focus:ring-emerald-500 text-stone-200 appearance-none"
                     >
                       <option value="Observer">Observer</option>
                       <option value="Assisted">Assisted</option>
                       <option value="Hands-on">Hands-on</option>
                     </select>
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="flex-shrink-0 pt-6 pb-2 bg-stone-950">
          <button 
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 active:scale-[0.98] transition-all"
          >
            Start Session
          </button>
        </div>
      </form>
    </div>
  );
}
