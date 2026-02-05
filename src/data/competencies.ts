export interface CompetencyData {
  id: string;
  code: string;
  title: string;
  category: 'General' | 'Husbandry' | 'Clinical' | 'Wildlife' | 'Safety';
  description: string;
}

export const COMPETENCY_LIST: CompetencyData[] = [
  // General / Core
  {
    id: 'acm-core-1',
    code: 'ACMCAS201',
    title: 'Work in the animal care industry',
    category: 'General',
    description: 'Basic industry knowledge, daily routines, and working within professional boundaries.'
  },
  {
    id: 'acm-core-2',
    code: 'ACMWHS201',
    title: 'Participate in WHS processes',
    category: 'Safety',
    description: 'Identifying hazards, using PPE correctly, and following emergency protocols.'
  },
  // Husbandry
  {
    id: 'acm-hus-1',
    code: 'ACMCAS301',
    title: 'Maintain animal hygiene',
    category: 'Husbandry',
    description: 'Cleaning enclosures, sanitation protocols, and waste management.'
  },
  {
    id: 'acm-hus-2',
    code: 'ACMCAS302',
    title: 'Provide basic care of mammals',
    category: 'Husbandry',
    description: 'Feeding, monitoring, and enrichment for common mammal species.'
  },
  {
    id: 'acm-hus-3',
    code: 'ACMCAS303',
    title: 'Provide basic care of birds',
    category: 'Husbandry',
    description: 'Feeding, health checks, and enclosure requirements for avian species.'
  },
  {
    id: 'acm-hus-4',
    code: 'ACMCAS304',
    title: 'Provide basic care of reptiles',
    category: 'Husbandry',
    description: 'Temperature monitoring, feeding, and handling of reptiles.'
  },
  // Clinical / Support
  {
    id: 'acm-cli-1',
    code: 'ACMCAS306',
    title: 'Provide first aid to animals',
    category: 'Clinical',
    description: 'Stabilizing injured animals and supporting veterinary procedures.'
  },
  {
    id: 'acm-cli-2',
    code: 'ACMSPE312',
    title: 'Monitor animal health',
    category: 'Clinical',
    description: 'Assessing vital signs, observing behavior, and recording health data.'
  },
  // Wildlife & Exotic
  {
    id: 'acm-wild-1',
    code: 'ACMWLH301',
    title: 'Rehabilitate wildlife',
    category: 'Wildlife',
    description: 'Rescuing, caring for, and preparing native wildlife for release.'
  },
  {
    id: 'acm-wild-2',
    code: 'ACMEXH301',
    title: 'Exhibit animal care',
    category: 'Wildlife',
    description: 'Working in zoos or sanctuaries with exhibited animals.'
  }
];

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: {
    type: 'count' | 'category' | 'streak';
    value: number;
    target?: string;
  };
}

export const BADGES: Badge[] = [
  {
    id: 'badge-mammal-expert',
    name: 'Mammal Monitor',
    icon: '🐾',
    description: 'Logged 5 sessions caring for mammals.',
    requirement: { type: 'count', value: 5, target: 'Husbandry' }
  },
  {
    id: 'badge-safety-first',
    name: 'Safety Steward',
    icon: '🛡️',
    description: 'Logged 3 sessions with WHS focus.',
    requirement: { type: 'count', value: 3, target: 'Safety' }
  },
  {
    id: 'badge-wildlife-hero',
    name: 'Wildlife Hero',
    icon: '🦅',
    description: 'First wildlife rehabilitation entry.',
    requirement: { type: 'count', value: 1, target: 'Wildlife' }
  }
];
