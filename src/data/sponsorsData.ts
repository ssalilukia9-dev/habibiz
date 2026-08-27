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
    id: 'aloha',
    name: 'Aloha',
    role: 'Global Technology & Infrastructure Sponsor',
    description: 'Empowering digital sanctuaries with world-class engineering, precision infrastructure, and spiritual innovation.',
    tier: 'Global',
    logoText: 'ALOHA',
    logoBg: 'from-[#1B4D6E] via-[#0D3049] to-[#061C2C]',
    badgeColor: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
    accent: '#1B4D6E'
  },
  {
    id: 'isis-wrist',
    name: 'ISIS Wrist',
    role: 'Principal Horology & Companion Partner',
    description: 'Precision engineered spiritual timepieces, sanctuary sync wristwear, and luxury artisan craftsmanship.',
    tier: 'Principal',
    logoText: 'ISIS',
    logoBg: 'from-amber-400 via-amber-600 to-amber-800',
    badgeColor: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    accent: '#C58F54'
  }
];
