import { Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];
export type Confirmation = Database['public']['Tables']['confirmations']['Row'];
export type IncidentType = Database['public']['Enums']['incident_type'];
export type ReportStatus = Database['public']['Enums']['report_status'];

export const INCIDENT_CONFIG: Record<IncidentType, { label: string; icon: string; }> = {
  mobile_snatching: { label: 'Mobile Snatching', icon: '📱' },
  robbery: { label: 'Robbery', icon: '💰' },
  vehicle_theft: { label: 'Vehicle Theft', icon: '🚗' },
  street_harassment: { label: 'Street Harassment', icon: '🚨' },
  assault: { label: 'Assault', icon: '⚠️' },
  theft: { label: 'Theft', icon: '🔓' },
  carjacking: { label: 'Carjacking', icon: '🚙' },
  other: { label: 'Other', icon: '📋' },
};

export type TimeFilter = '24h' | '7d' | '30d';

export interface AreaRisk {
  name: string;
  lat: number;
  lng: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  recentReports: number;
  confirmedReports: number;
  historicalReports: number;
  peakTime: string;
}
