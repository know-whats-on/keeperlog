import Dexie, { type Table } from 'dexie';

export interface UserProfile {
  name: string;
  qualification: string;
  defaultFacility?: string;
  targetHours?: number;
  reflectionLength: 'short' | 'standard';
}

export interface Session {
  id?: number;
  date: Date;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  facility: string;
  supervisor?: string;     // Supervisor Name
  supervisorNote?: string; // New: Optional note from supervisor
  role?: string;
  area?: string;
  status: 'active' | 'completed';
  
  // Reflection data
  reflection?: string;
  reflectionPrompts?: Record<string, string>; 
  competencies?: string[]; // IDs or Codes
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Capture {
  id?: number;
  sessionId: number;
  timestamp: Date;
  type: 'text' | 'observation' | 'photo' | 'voice';
  content?: string; 
  tags?: string[];
  mediaUrl?: string; 
  includeInExport?: boolean; // New: Default false for photos
}

export interface Competency {
  id?: number;
  code: string;       // This will now hold the "Plain English" label primarily, or we add a 'label' field? 
                      // PRD says: "Default competency label set". "Students may optionally add unit codes... in label description".
                      // So 'code' was used for ACM... before. Let's make 'code' the Short Label, and 'description' the detail?
                      // Actually, let's keep 'code' as the identifier/short text and 'description' as the full text.
                      // Or better: 'label' and 'description'.
                      // For backward compat, I'll use 'code' as the main Label.
  description: string;
  category: string;
  active?: boolean;   // New: For soft delete/hiding
  order?: number;     // New: For custom sorting
  confidence?: number; // New: Student self-rating 1-5
}

// Legacy
export interface LogEntry {
  id?: number;
  date: Date;
  durationMinutes: number;
  facility: string;
  activityType: string;
  notes: string;
  reflection: string;
  competencies: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class KeeperLogDatabase extends Dexie {
  sessions!: Table<Session>;
  captures!: Table<Capture>;
  competencies!: Table<Competency>;
  logs!: Table<LogEntry>; 

  constructor() {
    super('KeeperLogDB');
    
    this.version(3).stores({
      sessions: '++id, date, facility, status',
      captures: '++id, sessionId, timestamp, type',
      competencies: '++id, code, category, active, order, confidence', // Added active, order, confidence
      logs: '++id, date, facility, activityType'
    });

    // Handle version change across tabs
    this.on('versionchange', () => {
      this.close();
      // Optionally reload or just stay closed. Usually closing is enough to let the other tab finish the upgrade.
    });
  }
}

// Singleton pattern
const global = window as any;
let dbInstance: KeeperLogDatabase;

if (!global._keeperLogDb_v3) {
  dbInstance = new KeeperLogDatabase();
  global._keeperLogDb_v3 = dbInstance;
} else {
  dbInstance = global._keeperLogDb_v3;
}

export const db = dbInstance;
