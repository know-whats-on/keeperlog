import React, { useRef } from 'react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from '../db';
import { Download, FileJson, FileText, Trash2, Printer, AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { format, parse } from 'date-fns';
import { Link } from 'react-router';

export function ExportPage() {
  const sessions = useLiveQuery(() => db.sessions.toArray());
  const captures = useLiveQuery(() => db.captures.toArray());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    
    // Reflection prompts (matching SessionComplete.tsx)
    const PROMPTS = [
      "What did you observe or assist with today?",
      "Why was it done that way? (Rationale)",
      "What did you learn or understand better?",
      "What would you do differently or watch for next time?"
    ];
    
    // Headers with separate columns for each reflection prompt
    const headers = [
      "Date", 
      "Facility", 
      "Supervisor", 
      "Role", 
      "Duration (mins)",
      "Q1: What did you observe?",
      "Q2: Why was it done that way?",
      "Q3: What did you learn?",
      "Q4: What would you do differently?"
    ];
    
    // Rows
    const rows = sessions.map(s => {
      // Parse reflectionPrompts if available
      const answers = s.reflectionPrompts || {};
      
      return [
        format(s.date, 'yyyy-MM-dd'),
        `"${s.facility.replace(/"/g, '""')}"`,
        `"${(s.supervisor || '').replace(/"/g, '""')}"`,
        `"${(s.role || '').replace(/"/g, '""')}"`,
        s.durationMinutes || 0,
        `"${(answers[PROMPTS[0]] || '').replace(/"/g, '""')}"`,
        `"${(answers[PROMPTS[1]] || '').replace(/"/g, '""')}"`,
        `"${(answers[PROMPTS[2]] || '').replace(/"/g, '""')}"`,
        `"${(answers[PROMPTS[3]] || '').replace(/"/g, '""')}"`
      ];
    });

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

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        currentRow.push(currentField);
        currentField = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        // End of row (handle both \n and \r\n)
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip the \n in \r\n
        }
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField);
          if (currentRow.some(field => field.trim())) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
        }
      } else {
        currentField += char;
      }
    }
    
    // Add last field and row if exists
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some(field => field.trim())) {
        rows.push(currentRow);
      }
    }
    
    return rows;
  };

  const processCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        
        if (rows.length < 2) {
          toast.error("CSV file is empty or invalid");
          return;
        }

        // Reflection prompts (matching SessionComplete.tsx)
        const PROMPTS = [
          "What did you observe or assist with today?",
          "Why was it done that way? (Rationale)",
          "What did you learn or understand better?",
          "What would you do differently or watch for next time?"
        ];

        // Skip header row
        const dataRows = rows.slice(1);
        let importedCount = 0;

        for (const row of dataRows) {
          // Updated to expect 9 columns (Date, Facility, Supervisor, Role, Duration, Q1, Q2, Q3, Q4)
          if (row.length < 9) {
            console.warn('Skipped row with insufficient columns:', row.length, 'Expected: 9');
            continue;
          }

          const [dateStr, facility, supervisor, role, durationStr, q1, q2, q3, q4] = row;

          try {
            const date = parse(dateStr.trim(), 'yyyy-MM-dd', new Date());
            const durationMinutes = parseInt(durationStr.trim()) || 0;

            // Build reflectionPrompts object
            const reflectionPrompts: Record<string, string> = {
              [PROMPTS[0]]: q1 || '',
              [PROMPTS[1]]: q2 || '',
              [PROMPTS[2]]: q3 || '',
              [PROMPTS[3]]: q4 || ''
            };

            await db.sessions.add({
              date,
              facility: facility.trim() || 'Unknown',
              supervisor: supervisor.trim() || '',
              role: role.trim() || '',
              durationMinutes,
              reflectionPrompts,
              status: 'completed',
              competencyCodes: [],
              behaviours: [],
              notableSpecies: [],
              createdAt: new Date(),
              updatedAt: new Date()
            });

            importedCount++;
          } catch (err) {
            console.warn('Skipped invalid row:', err);
          }
        }

        if (importedCount > 0) {
          toast.success(`Imported ${importedCount} session${importedCount > 1 ? 's' : ''}`);
        } else {
          toast.error("No valid sessions found in CSV");
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error("Failed to import CSV. Please check the file format.");
      }
    };

    reader.readAsText(file);
    
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    <div className="max-w-md mx-auto p-4 pb-32 space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-xl font-bold text-stone-100">Export & Data</h1>
         <div className="text-right">
            <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Total Logged</p>
            <p className="text-lg font-bold text-emerald-500">{(totalHours / 60).toFixed(1)} hours</p>
         </div>
      </div>
      
      {/* Export Section */}
      <div>
        <h2 className="font-semibold text-stone-500 text-xs uppercase tracking-wide px-1 mb-3">Export Data</h2>
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
      </div>

      {/* Import Section */}
      <div>
        <h2 className="font-semibold text-stone-500 text-xs uppercase tracking-wide px-1 mb-3">Import Data</h2>
        <div className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
          <button onClick={handleImportCSV} className="w-full p-4 flex items-center justify-between hover:bg-stone-800 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="bg-stone-800 p-2.5 rounded-lg group-hover:bg-stone-700 transition-colors">
                <Upload className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-200 text-sm">Import CSV</h3>
                <p className="text-xs text-stone-500">Restore sessions from CSV file</p>
              </div>
            </div>
            <Upload className="h-4 w-4 text-stone-600 group-hover:text-stone-400" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={processCSVImport}
          className="hidden"
        />
      </div>

      <div className="bg-blue-950/10 rounded-xl border border-blue-900/30 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-400 text-sm mb-1">Import Notes</h3>
            <p className="text-xs text-blue-400/70 leading-relaxed">
              CSV files must have 9 columns: Date, Facility, Supervisor, Role, Duration (mins), Q1: What did you observe?, Q2: Why was it done that way?, Q3: What did you learn?, Q4: What would you do differently? Imported sessions are added to your existing data.
            </p>
          </div>
        </div>
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
