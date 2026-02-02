import React from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from '../db';
import { Download, FileJson, FileText, Trash2, Printer, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';
import { Link } from 'react-router';

export function ExportPage() {
  const sessions = useLiveQuery(() => db.sessions.toArray());
  const captures = useLiveQuery(() => db.captures.toArray());
  
  const totalHours = sessions?.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) || 0;
  const completedSessionsCount = sessions?.filter(s => s.status === 'completed').length || 0;

  const updateExportStatus = () => {
    localStorage.setItem('keeperLog_lastExportDate', new Date().toISOString());
    localStorage.setItem('keeperLog_lastExportCount', completedSessionsCount.toString());
  };

  const downloadJSON = () => {
    if (!sessions) return;
    const exportData = { sessions, captures };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `keeperlog_backup_${format(new Date(), 'yyyy-MM-dd')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    updateExportStatus();
    toast.success("JSON export started");
  };

  const downloadCSV = () => {
    if (!sessions || sessions.length === 0) return;
    
    // Headers
    const headers = ["Date", "Facility", "Supervisor", "Role", "Duration (mins)", "Reflection"];
    
    // Rows
    const rows = sessions.map(s => [
      format(s.date, 'yyyy-MM-dd'),
      `"${s.facility.replace(/"/g, '""')}"`,
      `"${(s.supervisor || '').replace(/"/g, '""')}"`,
      `"${(s.role || '').replace(/"/g, '""')}"`,
      s.durationMinutes || 0,
      `"${(s.reflection || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `keeperlog_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    updateExportStatus();
    toast.success("CSV export started");
  };

  const clearData = async () => {
    if (window.confirm("Are you sure you want to delete ALL data? This cannot be undone.")) {
      await db.sessions.clear();
      await db.captures.clear();
      // Also reset export status
      localStorage.removeItem('keeperLog_lastExportDate');
      localStorage.removeItem('keeperLog_lastExportCount');
      toast.success("All data deleted");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-xl font-bold text-stone-100">Export & Data</h1>
         <div className="text-right">
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Total Logged</p>
            <p className="text-lg font-bold text-emerald-500">{(totalHours / 60).toFixed(1)} hours</p>
         </div>
      </div>
      
      <div className="bg-stone-900 rounded-xl border border-stone-800 divide-y divide-stone-800 overflow-hidden">
        <Link to="/print" target="_blank" className="w-full p-4 flex items-center justify-between hover:bg-stone-800 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <div className="bg-stone-800 p-2.5 rounded-lg group-hover:bg-stone-700 transition-colors">
              <Printer className="h-5 w-5 text-stone-400 group-hover:text-stone-200" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-200 text-sm">Print Report</h3>
              <p className="text-xs text-stone-500">PDF-ready view (Assessor friendly)</p>
            </div>
          </div>
          <Download className="h-4 w-4 text-stone-600 group-hover:text-stone-400" />
        </Link>

        <button onClick={downloadCSV} className="w-full p-4 flex items-center justify-between hover:bg-stone-800 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <div className="bg-stone-800 p-2.5 rounded-lg group-hover:bg-stone-700 transition-colors">
              <FileText className="h-5 w-5 text-emerald-600 group-hover:text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-200 text-sm">Export CSV</h3>
              <p className="text-xs text-stone-500">Spreadsheet format</p>
            </div>
          </div>
          <Download className="h-4 w-4 text-stone-600 group-hover:text-stone-400" />
        </button>

        <button onClick={downloadJSON} className="w-full p-4 flex items-center justify-between hover:bg-stone-800 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <div className="bg-stone-800 p-2.5 rounded-lg group-hover:bg-stone-700 transition-colors">
              <FileJson className="h-5 w-5 text-amber-600 group-hover:text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-200 text-sm">Backup JSON</h3>
              <p className="text-xs text-stone-500">Full backup (includes photos)</p>
            </div>
          </div>
          <Download className="h-4 w-4 text-stone-600 group-hover:text-stone-400" />
        </button>
      </div>

      <div className="bg-red-950/10 rounded-xl border border-red-900/30 p-4">
        <div className="flex items-center gap-2 mb-2 text-red-500">
           <AlertTriangle className="h-4 w-4" />
           <h3 className="font-semibold text-sm">Danger Zone</h3>
        </div>
        <p className="text-xs text-red-900/60 dark:text-red-400/60 mb-4">Deleting data removes it permanently from this browser.</p>
        <button 
          onClick={clearData}
          className="w-full py-3 bg-transparent border border-red-900/50 text-red-500 rounded-lg font-medium hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Data
        </button>
      </div>
    </div>
  );
}
