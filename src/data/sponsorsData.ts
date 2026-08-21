export interface SponsorItem {
  id: string;
  name: string;
  role: string;
  description: string;
  tier: 'Principal' | 'Global' | 'Innovation' | 'Sacred Heritage';
  logoText: string;
  logoBg: string;
  badgeColor: string;
  linkText?: string;
  accent: string;
}

export const SANCTUARY_SPONSORS: SponsorItem[] = [
  {
    id: 'isis-wrists',
    name: 'ISIS WRISTS',
    role: 'Principal Horology & Companion Partner',
    description: 'Precision engineered spiritual timepieces and companion sync wristwear.',
    tier: 'Principal',
    logoText: 'IW',
    logoBg: 'from-amber-400 via-amber-600 to-amber-800',
    badgeColor: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    accent: '#C58F54'
  },
  {
    id: 'aloha-group',
    name: 'ALOHA GROUP',
    role: 'Global Technology & Infrastructure Sponsor',
    description: 'Empowering digital sanctuaries with world-class engineering, precision & innovation.',
    tier: 'Global',
    logoText: 'AG',
    logoBg: 'from-[#1B4D6E] via-[#0D3049] to-[#061C2C]',
    badgeColor: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
    accent: '#1B4D6E'
  },
  {
    id: 'aloha-ventures',
    name: 'ALOHA CAPITAL',
    role: 'Ethical Waqf & Ecosystem Foundation',
    description: 'Fostering halal digital public goods and sacred Islamic knowledge repositories globally.',
    tier: 'Innovation',
    logoText: 'AC',
    logoBg: 'from-emerald-500 via-teal-700 to-emerald-950',
    badgeColor: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
    accent: '#10B981'
  }
];
