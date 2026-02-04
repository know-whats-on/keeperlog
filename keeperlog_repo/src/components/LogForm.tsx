import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { db, LogEntry, Competency } from '../lib/db';
import { Mic, Save, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogFormProps {
  initialData?: LogEntry;
  onSave: () => void;
  onCancel: () => void;
}

const ACTIVITY_TYPES = [
  "Husbandry", "Feeding", "Cleaning", "Medical", "Enrichment", "Training", "Observation", "Maintenance", "Public Talk"
];

export function LogForm({ initialData, onSave, onCancel }: LogFormProps) {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [isExpanded, setIsExpanded] = useState(!!initialData); // Expand automatically if editing
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LogEntry>({
    defaultValues: initialData || {
      timestamp: new Date(),
      activityType: 'Husbandry',
      competencies: []
    }
  });

  const selectedCompetencies = watch('competencies') || [];

  useEffect(() => {
    db.competencies.toArray().then(setCompetencies);
  }, []);

  const onSubmit = async (data: LogEntry) => {
    setSaveStatus('saving');
    try {
      const entry = {
        ...data,
        timestamp: new Date(data.timestamp), // Ensure date object
        updatedAt: new Date(),
        createdAt: initialData?.createdAt || new Date(),
      };

      if (initialData?.id) {
        await db.logs.update(initialData.id, entry);
      } else {
        await db.logs.add(entry);
      }
      
      setSaveStatus('saved');
      setTimeout(() => {
        onSave();
      }, 500);
    } catch (error) {
      console.error("Failed to save", error);
      setSaveStatus('idle');
    }
  };

  const toggleCompetency = (label: string) => {
    const current = selectedCompetencies;
    if (current.includes(label)) {
      setValue('competencies', current.filter(c => c !== label));
    } else {
      setValue('competencies', [...current, label]);
    }
  };

  const addCustomCompetency = async () => {
    const label = prompt("Enter new competency label:");
    if (label && !competencies.find(c => c.label === label)) {
      await db.competencies.add({ label, isDefault: false });
      const updated = await db.competencies.toArray();
      setCompetencies(updated);
      // Auto-select the new one
      toggleCompetency(label);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24">
      {/* Header / Quick Actions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">
          {initialData ? 'Edit Log' : 'New Entry'}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 text-slate-500">
          <X size={24} />
        </button>
      </div>

      {/* Primary Details - Always Visible */}
      <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Activity Type</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setValue('activityType', type)}
                className={cn(
                  "px-3 py-2 rounded-full text-sm font-medium transition-colors",
                  watch('activityType') === type
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Time</label>
            <input
              type="datetime-local"
              {...register('timestamp', { required: true })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Species / Area</label>
            <input
              placeholder="e.g. Koalas"
              {...register('speciesArea', { required: true })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {errors.speciesArea && <span className="text-xs text-red-500">Required</span>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Quick Note (What happened?)</label>
          <textarea
            {...register('notes', { required: true })}
            placeholder="Briefly describe the task or observation..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]"
          />
          {errors.notes && <span className="text-xs text-red-500">Required</span>}
        </div>
      </div>

      {/* Expandable Reflection Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between items-center p-4 bg-slate-50 text-left border-b border-slate-100"
        >
          <span className="font-semibold text-slate-700 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full uppercase tracking-wide">Optional</span>
            Reflection & Evidence
          </span>
          {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </button>

        {isExpanded && (
          <div className="p-4 space-y-5 animate-in slide-in-from-top-2 duration-200">
            
            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start text-sm text-blue-800">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>Reflecting now helps you build evidence for your assessment later. You can always come back to edit this.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">So What? (Implications)</label>
              <p className="text-xs text-slate-500 mb-2">Why was this important? (Welfare, Safety, Procedure)</p>
              <textarea
                {...register('reflectionSoWhat')}
                placeholder="e.g., I noticed the enclosure lock was stiff, so I reported it to ensure animals couldn't escape..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Now What? (Future Action)</label>
              <p className="text-xs text-slate-500 mb-2">What will you do differently next time?</p>
              <textarea
                {...register('reflectionNowWhat')}
                placeholder="e.g., I will check all locks before entering..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Map to Competencies</label>
              <div className="flex flex-wrap gap-2">
                {competencies.map(comp => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => toggleCompetency(comp.label)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selectedCompetencies.includes(comp.label)
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {comp.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={addCustomCompetency}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-slate-300 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  + Add New
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Save */}
      <div className="fixed bottom-6 right-6 left-6 flex gap-3">
        <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="flex-1 bg-emerald-600 text-white py-4 rounded-xl shadow-lg font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70"
        >
            {saveStatus === 'saving' ? 'Saving...' : (
                <>
                <Save size={20} />
                Save Entry
                </>
            )}
        </button>
      </div>
    </form>
  );
}
