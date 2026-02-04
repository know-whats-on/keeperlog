import { db } from '../db';

export interface DataBundle {
  version: number;
  timestamp: string;
  profile: any;
  sessions: any[];
  captures: any[];
  competencies: any[];
  logs: any[]; // Legacy
}

const BUNDLE_VERSION = 2;

/**
 * Creates a complete snapshot of all user data
 */
export async function createDataBundle(): Promise<DataBundle> {
  const [sessions, captures, competencies, logs] = await Promise.all([
    db.sessions.toArray(),
    db.captures.toArray(),
    db.competencies.toArray(),
    db.logs.toArray()
  ]);

  const profile = JSON.parse(localStorage.getItem('keeperLog_profile') || '{}');

  return {
    version: BUNDLE_VERSION,
    timestamp: new Date().toISOString(),
    profile,
    sessions,
    captures,
    competencies,
    logs
  };
}

/**
 * Restores a data bundle into the local database
 * WARNING: This clears existing data to ensure consistency
 */
export async function restoreDataBundle(bundle: DataBundle): Promise<boolean> {
  if (!bundle || typeof bundle !== 'object') {
    throw new Error("Invalid backup data format");
  }

  // Validate version if necessary (future proofing)
  console.log(`Restoring bundle version: ${bundle.version} from ${bundle.timestamp}`);

  try {
    // Clear existing data safely
    await db.transaction('rw', [db.sessions, db.captures, db.competencies, db.logs], async () => {
      await Promise.all([
        db.sessions.clear(),
        db.captures.clear(),
        db.competencies.clear(),
        db.logs.clear()
      ]);

      // Restore tables
      if (bundle.sessions?.length) await db.sessions.bulkAdd(bundle.sessions.map(cleanItem));
      if (bundle.captures?.length) await db.captures.bulkAdd(bundle.captures.map(cleanItem));
      if (bundle.competencies?.length) await db.competencies.bulkAdd(bundle.competencies.map(cleanItem));
      if (bundle.logs?.length) await db.logs.bulkAdd(bundle.logs.map(cleanItem));
    });

    // Restore profile
    if (bundle.profile) {
      localStorage.setItem('keeperLog_profile', JSON.stringify(bundle.profile));
    }

    return true;
  } catch (error) {
    console.error("Restore failed:", error);
    throw error;
  }
}

/**
 * Ensures ID fields don't cause conflicts on bulkAdd if they were already there
 */
function cleanItem(item: any) {
  // If we're doing a full restore, we usually want to keep the IDs to maintain relations (like sessionId)
  // But Dexie bulkAdd might fail if IDs exist and we don't handle it.
  // Since we clear() first, keeping IDs is good for relational integrity.
  
  // Convert ISO strings back to Date objects for the DB
  const dateFields = ['date', 'startTime', 'endTime', 'createdAt', 'updatedAt', 'timestamp'];
  const cleaned = { ...item };
  
  dateFields.forEach(field => {
    if (cleaned[field] && typeof cleaned[field] === 'string') {
      cleaned[field] = new Date(cleaned[field]);
    }
  });

  return cleaned;
}

/**
 * Downloads the bundle as a JSON file
 */
export function downloadBundle(bundle: DataBundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  
  a.href = url;
  a.download = `KeeperLog_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
