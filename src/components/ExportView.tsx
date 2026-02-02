import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format } from 'date-fns';
import { Download, Printer, ArrowLeft } from 'lucide-react';

export function ExportView({ onBack }: { onBack: () => void }) {
  const logs = useLiveQuery(() => db.logs.orderBy('timestamp').reverse().toArray());

  const downloadCSV = () => {
    if (!logs) return;
    
    const headers = ['Date', 'Time', 'Activity', 'Species/Area', 'Notes', 'Reflect: So What', 'Reflect: Now What', 'Competencies'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        format(log.timestamp, 'yyyy-MM-dd'),
        format(log.timestamp, 'HH:mm'),
        `"${log.activityType}"`,
        `"${log.speciesArea}"`,
        `"${log.notes.replace(/"/g, '""')}"`,
        `"${(log.reflectionSoWhat || '').replace(/"/g, '""')}"`,
        `"${(log.reflectionNowWhat || '').replace(/"/g, '""')}"`,
        `"${(log.competencies || []).join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `keeperlog_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!logs) return <div>Loading...</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-center print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600">
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex gap-2">
            <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
                <Printer size={18} />
                Print
            </button>
            <button 
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
            >
                <Download size={18} />
                Export CSV
            </button>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto print:p-0">
        <div className="mb-8 border-b border-slate-200 pb-4">
            <h1 className="text-3xl font-bold text-slate-900">Placement Logbook</h1>
            <p className="text-slate-500 mt-2">Generated from KeeperLog</p>
        </div>

        <div className="space-y-8">
            {logs.map(log => (
                <div key={log.id} className="border-b border-slate-100 pb-6 break-inside-avoid">
                    <div className="flex justify-between mb-2">
                        <div className="font-bold text-lg text-slate-800">
                            {format(log.timestamp, 'd MMM yyyy')} <span className="text-slate-400 font-normal text-sm ml-2">{format(log.timestamp, 'HH:mm')}</span>
                        </div>
                        <div className="text-sm font-semibold bg-slate-100 px-2 py-1 rounded">
                            {log.activityType}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-[120px_1fr] gap-4 mb-2">
                        <div className="text-sm font-semibold text-slate-500">Area/Species</div>
                        <div className="text-sm text-slate-900">{log.speciesArea}</div>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] gap-4 mb-2">
                        <div className="text-sm font-semibold text-slate-500">Description</div>
                        <div className="text-sm text-slate-900">{log.notes}</div>
                    </div>

                    {(log.reflectionSoWhat || log.reflectionNowWhat) && (
                        <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Reflection</h4>
                            {log.reflectionSoWhat && (
                                <div className="mb-2">
                                    <span className="font-semibold text-slate-700 text-sm">So What: </span>
                                    <span className="text-sm text-slate-600">{log.reflectionSoWhat}</span>
                                </div>
                            )}
                            {log.reflectionNowWhat && (
                                <div>
                                    <span className="font-semibold text-slate-700 text-sm">Now What: </span>
                                    <span className="text-sm text-slate-600">{log.reflectionNowWhat}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {log.competencies && log.competencies.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {log.competencies.map(c => (
                                <span key={c} className="text-xs border border-slate-200 text-slate-500 px-2 py-1 rounded-full">
                                    {c}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
