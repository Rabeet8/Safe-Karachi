export interface CrimeReport {
  id: string;
  type: 'mobile_snatching' | 'robbery' | 'theft' | 'carjacking' | 'assault' | 'other';
  location: { lat: number; lng: number; name: string };
  time: Date;
  description: string;
  weapon?: string;
  confirmations: number;
  downvotes: number;
  verified: boolean;
  reporterTrustScore: number;
  expiresAt: Date;
}

export interface AreaRisk {
  name: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  peakTime: string;
  reportsLast7Days: number;
  score: number;
}

export const CRIME_TYPES = {
  mobile_snatching: { label: 'Mobile Snatching', icon: '📱', color: 'danger' },
  robbery: { label: 'Robbery', icon: '💰', color: 'danger' },
  theft: { label: 'Theft', icon: '🔓', color: 'warning' },
  carjacking: { label: 'Carjacking', icon: '🚗', color: 'danger' },
  assault: { label: 'Assault', icon: '⚠️', color: 'danger' },
  other: { label: 'Other', icon: '📋', color: 'warning' },
} as const;

export type CrimeType = keyof typeof CRIME_TYPES;
