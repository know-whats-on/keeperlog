import React, { useState } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from '../db';
import { Check, Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface CompetencySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CompetencySelector({ selectedIds, onChange }: CompetencySelectorProps) {
  const competencies = useLiveQuery(() => 
    db.competencies
      .filter(c => c.active !== false)
      .toArray()
  );
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Safe defaults if db returns broken objects
  const safeCompetencies = competencies || [];

  // Sort by order, then by code
  const sorted = safeCompetencies.sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.code || '').localeCompare(b.code || '');
  });

  const filtered = sorted.filter(c => 
    (c.code || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (code: string) => {
    if (!selectedIds) return;
    if (selectedIds.includes(code)) {
      onChange(selectedIds.filter(id => id !== code));
    } else {
      onChange([...selectedIds, code]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2">
         <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Competencies</h2>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedIds && selectedIds.map(code => (
          <span key={code} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 leading-tight text-left max-w-full">
            <span className="truncate max-w-[200px]">{code}</span>
            <button type="button" onClick={() => toggleSelection(code)} className="text-emerald-500 hover:text-emerald-300 ml-1 flex-shrink-0">
              &times;
            </button>
          </span>
        ))}
        <button 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors border",
            isOpen 
              ? "bg-stone-800 text-stone-200 border-stone-700"
              : "bg-stone-900 text-stone-500 border-stone-800 hover:border-stone-700 hover:text-stone-400"
          )}
        >
          <Plus className="h-3 w-3" /> {(selectedIds?.length || 0) === 0 ? "Add Competency" : "Add Another"}
        </button>
      </div>

      {isOpen && (
        <div className="border border-stone-800 rounded-xl p-3 bg-stone-900/50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-3 h-4 w-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search competencies..."
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-950 border border-stone-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-stone-200 placeholder:text-stone-600"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filtered.map(comp => {
                if (!comp.code) return null; // Skip invalid records
                return (
                  <button
                    key={comp.code}
                    type="button"
                    onClick={() => toggleSelection(comp.code)}
                    className={cn(
                      "w-full text-left px-3 py-3 rounded-lg text-sm flex items-start justify-between gap-3 transition-colors",
                      (selectedIds || []).includes(comp.code) 
                        ? "bg-emerald-900/20 text-emerald-100 border border-emerald-900/30" 
                        : "text-stone-400 hover:bg-stone-800 border border-transparent"
                    )}
                  >
                    <div>
                      <span className={cn("font-bold block text-xs mb-1", (selectedIds || []).includes(comp.code) ? "text-emerald-400" : "text-stone-300")}>
                        {comp.code}
                      </span>
                      <span className="text-[10px] opacity-70 block leading-relaxed">{comp.description}</span>
                    </div>
                    {(selectedIds || []).includes(comp.code) && <Check className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />}
                  </button>
                );
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-stone-600 text-center py-4">No matching competencies found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
