// JyotishAI - Shared TypeScript Types

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type PlanetName =
  | 'Sun' | 'Moon' | 'Mars' | 'Mercury'
  | 'Jupiter' | 'Venus' | 'Saturn'
  | 'Rahu' | 'Ketu';

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ChartStyle = 'north_indian' | 'south_indian';

export type YogaType = 'Raj' | 'Dhana' | 'Arishta' | 'Pancha Mahapurusha' | 'Other';

export type YogaStrength = 'Weak' | 'Moderate' | 'Strong' | 'Exceptional';

export type ReportType =
  | 'in_depth'
  | 'career'
  | 'wealth'
  | 'yearly'
  | 'transit_jupiter'
  | 'transit_saturn'
  | 'transit_rahu_ketu'
  | 'numerology'
  | 'gem_recommendation';

export type Language = 'en' | 'hi';

export type Relation = 'self' | 'spouse' | 'parent' | 'child' | 'sibling' | 'other';

export interface Nakshatra {
  name: string;
  number: number;
  pada: 1 | 2 | 3 | 4;
  lord: PlanetName;
  degrees: number;
}

export interface Planet {
  name: PlanetName;
  longitude: number;
  sign: ZodiacSign;
  house: HouseNumber;
  nakshatra: Nakshatra;
  isRetrograde: boolean;
  dignity: 'exalted' | 'debilitated' | 'own' | 'friend' | 'neutral' | 'enemy';
  speed: number;
}

export interface House {
  number: HouseNumber;
  sign: ZodiacSign;
  lord: PlanetName;
  planets: PlanetName[];
  cusp: number;
}

export interface Dasha {
  planet: PlanetName;
  start: Date;
  end: Date;
  type: 'mahadasha' | 'antardasha' | 'pratyantardasha';
}

export interface DashaSequence {
  mahadashas: Dasha[];
  currentMahadasha: Dasha;
  currentAntardasha: Dasha;
  balance: number; // remaining years at birth
}

export interface Yoga {
  name: string;
  type: YogaType;
  strength: YogaStrength;
  description: string;
  effect: string;
  classicalSource?: string;
  planets: PlanetName[];
}

export interface Aspect {
  planet1: PlanetName;
  planet2: PlanetName;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
  isNatal: boolean; // true if both planets are natal, false if transiting
}

export interface ChartData {
  id: string;
  profileId: string;
  lagna: {
    sign: ZodiacSign;
    degrees: number;
  };
  planets: Planet[];
  houses: House[];
  dashas: DashaSequence;
  yogas: Yoga[];
  aspects: Aspect[];
  ashtakavarga?: Partial<Record<PlanetName, number[]>> & { sarva?: number[] };
  calculatedAt: Date;
}

export interface TransitData {
  date: Date;
  planets: Planet[];
  aspects: Aspect[]; // aspects to natal planets
}

export interface BirthData {
  name: string;
  dateOfBirth: Date;
  timeOfBirth: string; // HH:MM format
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: string;
  relation?: Relation;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  relation: Relation;
  birthData: BirthData;
  chartData?: ChartData;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  profileId: string;
  type: ReportType;
  language: Language;
  model: string;
  content: string;
  generatedAt: Date;
  isFavorite: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: {
    reportId: string;
    reportType: ReportType;
    chunkId: string;
    page?: number;
  }[];
  createdAt: Date;
}

export interface Alert {
  id: string;
  profileId: string;
  type: 'transit' | 'dasha_change' | 'eclipse' | 'station';
  title: string;
  description: string;
  date: Date;
  isRead: boolean;
  severity: 'info' | 'warning' | 'important';
  createdAt: Date;
}

export interface NotificationPreferences {
  whatsappDigest: boolean;
  whatsappTime: string;
  emailDigest: boolean;
  emailDay: 'sunday' | 'monday';
  transitAlerts: boolean;
  transitOrb: number; // degrees
  alertTypes: ('transit' | 'dasha_change' | 'eclipse' | 'station')[];
}

export interface Preferences {
  ayanamsha: 'lahiri' | 'kp' | 'raman' | 'krishnamurti';
  houseSystem: 'whole_sign' | 'equal' | 'placidus' | 'koch';
  dashaSystem: 'vimshottari' | 'yogini' | 'ashtottari';
  defaultChartStyle: ChartStyle;
  defaultLanguage: Language;
  theme: 'dark' | 'light';
  aiModel: 'claude' | 'gemini' | 'gpt4o';
  notifications: NotificationPreferences;
}

// Planet Colors for UI
export const PLANET_COLORS: Record<PlanetName, string> = {
  Sun: '#ff9500',
  Moon: '#ffffff',
  Mars: '#ff3b30',
  Mercury: '#34c759',
  Jupiter: '#ffcc00',
  Venus: '#af52de',
  Saturn: '#0a84ff',
  Rahu: '#8e8e93',
  Ketu: '#636366',
};

// Yoga Type Colors
export const YOGA_TYPE_COLORS: Record<YogaType, string> = {
  'Raj': '#c9a227', // gold
  'Dhana': '#34c759', // green
  'Arishta': '#ff3b30', // red
  'Pancha Mahapurusha': '#7c3aed', // purple
  'Other': '#64748b', // gray
};

// Strength Colors
export const STRENGTH_COLORS: Record<YogaStrength, string> = {
  'Weak': '#64748b', // gray
  'Moderate': '#0a84ff', // blue
  'Strong': '#7c3aed', // purple
  'Exceptional': '#c9a227', // gold
};

// Aspect Colors
export const ASPECT_COLORS = {
  conjunction: '#7c3aed', // purple
  opposition: '#ff9500', // orange
  trine: '#34c759', // green
  square: '#ff3b30', // red
  sextile: '#0a84ff', // blue
};
