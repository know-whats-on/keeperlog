import Dexie, { Table } from 'dexie';

export interface LogEntry {
  id?: number;
  timestamp: Date;
  activityType: string;
  speciesArea: string; // "Koalas", "Food Prep", "Reptile House"
  notes: string; // Quick capture notes
  
  // Reflection fields (So What? Now What?)
  reflectionWhat?: string;
  reflectionSoWhat?: string;
  reflectionNowWhat?: string;
  
  competencies: string[]; // Array of tags e.g. "Welfare", "OHS"
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface Competency {
  id?: number;
  label: string;
  isDefault: boolean;
}

class KeeperLogDB extends Dexie {
  logs!: Table<LogEntry>;
  competencies!: Table<Competency>;

  constructor() {
    super('KeeperLogDB');
    this.version(1).stores({
      logs: '++id, timestamp, activityType, speciesArea',
      competencies: '++id, &label' // Unique labels
    });
  }
}

export const db = new KeeperLogDB();

// Seed default competencies if empty
db.on('populate', () => {
  db.competencies.bulkAdd([
    { label: "Welfare", isDefault: true },
    { label: "Biosecurity", isDefault: true },
    { label: "OHS / WHS", isDefault: true },
    { label: "Husbandry", isDefault: true },
    { label: "Nutrition", isDefault: true },
    { label: "Enrichment", isDefault: true },
    { label: "Observation", isDefault: true },
    { label: "Public Interaction", isDefault: true },
    { label: "Maintenance", isDefault: true },
  ]);
});
