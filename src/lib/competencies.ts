import { db, Competency } from '../db';

export const DEFAULT_COMPETENCIES: Omit<Competency, 'id'>[] = [
  { code: 'Routine animal care and husbandry', description: 'Feeding, watering, daily checks', category: 'Core', active: true, order: 0 },
  { code: 'Animal welfare and ethical practice', description: 'Welfare decisions, humane care', category: 'Core', active: true, order: 1 },
  { code: 'Observe and record behaviour/health', description: 'Signals, monitoring, reporting', category: 'Core', active: true, order: 2 },
  { code: 'Hygiene, cleaning, and biosecurity', description: 'PPE, disinfecting, cross-contamination control', category: 'Core', active: true, order: 3 },
  { code: 'Workplace health and safety (WHS)', description: 'Hazards, manual handling, safe procedures', category: 'Core', active: true, order: 4 },
  { code: 'Enrichment participation and evaluation', description: 'Prep, delivery, response/outcomes', category: 'Core', active: true, order: 5 },
  { code: 'Habitat/enclosure maintenance', description: 'Safe upkeep, checks, environmental condition', category: 'Core', active: true, order: 6 },
  { code: 'Safe handling and restraint', description: 'Observed/assisted only where permitted', category: 'Core', active: true, order: 7 },
  { code: 'Communication and record keeping', description: 'Handover notes, clarity, documentation', category: 'Core', active: true, order: 8 },
  { code: 'Visitor/operational safety', description: 'Public impacts, safe boundaries in animal settings', category: 'Core', active: true, order: 9 },
];

export async function seedCompetencies() {
  const count = await db.competencies.count();
  
  // If empty or very few (likely old test data), seed defaults
  // Real app might need smarter migration, but for this prototype we force the new structure if it looks "wrong" or empty
  if (count < 5) {
     await db.competencies.clear(); // Wipe old test data
     await db.competencies.bulkAdd(DEFAULT_COMPETENCIES);
     console.log("Seeded default competencies");
  } else {
     // Check if we have the new style (long labels)
     const first = await db.competencies.toCollection().first();
     if (first && first.code && first.code.length < 10) { // Simple heuristic: old codes were 'ACM...' (short)
        console.log("Migrating to plain English competencies...");
        // Don't delete user data in a real scenario, but here we replace for compliance with new PRD
        await db.competencies.clear();
        await db.competencies.bulkAdd(DEFAULT_COMPETENCIES);
     }
  }
}
