import { differenceInDays } from 'date-fns';
import { Session, Capture, Competency } from '../db';

export interface CompetencyScore {
  score: number;
  coverage: number;
  depth: number;
  consistency: number;
  recency: number;
  confidencePoints: number;
  status: 'Not started' | 'In progress' | 'Consistent' | 'Strong';
  statusMessage: string;
}

export function calculateCompetencyScore(
  competencyCode: string,
  sessions: Session[],
  captures: Capture[],
  competencyMeta?: Competency
): CompetencyScore {
  // Normalize date helper
  const getDate = (d: any) => d instanceof Date ? d : new Date(d);

  // Filter sessions relevant to this competency
  // NEW: Search both session-level competencies AND capture tags for intelligence
  const relevantSessions = sessions
    .filter(s => {
      // Check session level
      const hasSessionLevel = s.competencies?.some(c => {
        const normalizedC = String(c).toLowerCase().trim();
        const normalizedCode = String(competencyCode).toLowerCase().trim();
        return normalizedC === normalizedCode;
      });
      if (hasSessionLevel) return true;

      // Check capture tags within this session
      const sessionCaptures = captures.filter(c => c.sessionId === s.id);
      const hasTagMatch = sessionCaptures.some(c => 
        c.tags?.some(tag => {
          const t = String(tag).toLowerCase().trim();
          const code = String(competencyCode).toLowerCase().trim();
          // Smarter matching: e.g. tag "Husbandry" matches "Routine animal care and husbandry"
          // Also handle behavior vs behaviour
          const tAlt = t.replace('behavior', 'behaviour');
          const codeAlt = code.replace('behavior', 'behaviour');
          return code.includes(t) || t.includes(code) || codeAlt.includes(tAlt) || tAlt.includes(codeAlt);
        })
      );
      
      return hasTagMatch;
    })
    .sort((a, b) => getDate(b.date).getTime() - getDate(a.date).getTime());

  if (relevantSessions.length === 0) {
    return {
      score: 0,
      coverage: 0,
      depth: 0,
      consistency: 0,
      recency: 0,
      confidencePoints: 0,
      status: 'Not started',
      statusMessage: 'No evidence logged yet.'
    };
  }

  // 1. Coverage (0-20)
  // At least one entry exists
  const coverage = 20;

  // 2. Depth (0-25)
  // Check if any relevant session has a reflection longer than a "quick note"
  let maxDepth = 0;
  relevantSessions.forEach(s => {
    const reflectionLength = s.reflection?.length || 0;
    const sessionCaptures = captures.filter(c => c.sessionId === s.id);
    const hasMedia = sessionCaptures.some(c => c.type === 'photo' || c.type === 'observation');
    
    let depthPoints = 10; // Base points for just tagging
    if (reflectionLength > 100) depthPoints += 10;
    if (hasMedia) depthPoints += 5;
    
    if (depthPoints > maxDepth) maxDepth = depthPoints;
  });
  const depth = Math.min(maxDepth, 25);

  // 3. Consistency (0-25)
  // Unique dates (ignoring multiple entries on same day)
  const uniqueDates = new Set(relevantSessions.map(s => getDate(s.date).toDateString()));
  const daysCount = uniqueDates.size;
  
  // Scoring: 1 day = 5, 2 days = 10, 3 days = 15, 4 days = 20, 5+ days = 25
  const consistency = Math.min(daysCount * 5, 25);

  // 4. Recency (0-20)
  // Practiced in last 14 days = 20
  // Decay after that
  const latestSession = relevantSessions[0];
  const daysSince = differenceInDays(new Date(), getDate(latestSession.date));
  
  let recency = 0;
  if (daysSince <= 14) {
    recency = 20;
  } else if (daysSince <= 30) {
    recency = 15;
  } else if (daysSince <= 60) {
    recency = 10;
  } else if (daysSince <= 90) {
    recency = 5;
  }

  // 5. Confidence (0-10)
  // Student self-rating 1-5 -> 2-10 points
  const confidencePoints = (competencyMeta?.confidence || 0) * 2;
  
  // Total Score (Max 100)
  const totalScore = Math.min(coverage + depth + consistency + recency + confidencePoints, 100);

  // LOGGING FOR DEBUGGING
  console.log(`[Scoring] Code: ${competencyCode}`, {
    sessionsCount: relevantSessions.length,
    coverage,
    depth,
    consistency,
    recency,
    confidencePoints,
    totalScore,
    relevantSessionIds: relevantSessions.map(s => s.id)
  });

  // Status Mapping
  let status: CompetencyScore['status'] = 'In progress';
  let statusMessage = 'Some practice logged. Build consistency.';

  if (totalScore >= 80) {
    status = 'Strong';
    statusMessage = 'Recent and consistent evidence logged.';
  } else if (totalScore >= 50) {
    status = 'Consistent';
    statusMessage = 'Practised regularly across sessions.';
  } else if (totalScore > 0) {
    status = 'In progress';
    statusMessage = 'Some practice logged. Build consistency.';
  } else {
    status = 'Not started';
    statusMessage = 'No evidence logged yet.';
  }

  return {
    score: totalScore,
    coverage,
    depth,
    consistency,
    recency,
    confidencePoints,
    status,
    statusMessage
  };
}

export function getStatusColor(status: CompetencyScore['status']) {
  switch (status) {
    case 'Strong': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'Consistent': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'In progress': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    default: return 'text-stone-500 bg-stone-500/10 border-stone-500/20';
  }
}
