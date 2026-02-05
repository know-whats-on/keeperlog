import React from 'react';

export interface BadgeDefinition {
  id: string;
  name: string;
  symbol: string;
  category: 'observation' | 'consistency' | 'hygiene' | 'communication' | 'habitat' | 'safety' | 'ethics' | 'handling' | 'operational';
  competencyCode: string;
  description: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'eagle',
    name: 'Eagle Eye',
    symbol: 'eye',
    category: 'observation',
    competencyCode: 'Observe and record behaviour/health',
    description: 'Precision in monitoring and reporting animal signals.'
  },
  {
    id: 'tortoise',
    name: 'Tortoise Steady',
    symbol: 'shell',
    category: 'consistency',
    competencyCode: 'Routine animal care and husbandry',
    description: 'Consistency in essential daily care and checks.'
  },
  {
    id: 'otter',
    name: 'Otter Method',
    symbol: 'shield-drop',
    category: 'hygiene',
    competencyCode: 'Hygiene, cleaning, and biosecurity',
    description: 'Methodical approach to cleaning and infection control.'
  },
  {
    id: 'dolphin',
    name: 'Dolphin Signal',
    symbol: 'wave-dot',
    category: 'communication',
    competencyCode: 'Communication and record keeping',
    description: 'Clarity and accuracy in handover and documentation.'
  },
  {
    id: 'wombat',
    name: 'Wombat Builder',
    symbol: 'bricks',
    category: 'habitat',
    competencyCode: 'Habitat/enclosure maintenance',
    description: 'Maintaining safe and secure environments.'
  },
  {
    id: 'kangaroo',
    name: 'Kangaroo Guard',
    symbol: 'shield',
    category: 'safety',
    competencyCode: 'Workplace health and safety (WHS)',
    description: 'Proactive hazard management and safe movement.'
  },
  {
    id: 'bee',
    name: 'Bee Diligent',
    symbol: 'hexagon',
    category: 'consistency',
    competencyCode: 'Enrichment participation and evaluation',
    description: 'Focus on animal mental and physical stimulation.'
  },
  {
    id: 'swan',
    name: 'Swan Ethical',
    symbol: 'heart',
    category: 'ethics',
    competencyCode: 'Animal welfare and ethical practice',
    description: 'Commitment to humane care and welfare decisions.'
  },
  {
    id: 'bear',
    name: 'Bear Secure',
    symbol: 'lock',
    category: 'handling',
    competencyCode: 'Safe handling and restraint',
    description: 'Safety and confidence in physical interactions.'
  },
  {
    id: 'owl',
    name: 'Owl Guard',
    symbol: 'bell',
    category: 'operational',
    competencyCode: 'Visitor/operational safety',
    description: 'Awareness of public and operational boundaries.'
  }
];
