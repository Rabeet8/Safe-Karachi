import type { Report, AreaRisk } from '@/types/crime';

export const KARACHI_AREAS = [
  { name: 'Saddar', lat: 24.8607, lng: 67.0100 },
  { name: 'Tariq Road', lat: 24.8700, lng: 67.0650 },
  { name: 'Clifton', lat: 24.8138, lng: 67.0300 },
  { name: 'Gulshan-e-Iqbal', lat: 24.9200, lng: 67.0950 },
  { name: 'North Nazimabad', lat: 24.9400, lng: 67.0350 },
  { name: 'Korangi', lat: 24.8300, lng: 67.1300 },
  { name: 'Malir', lat: 24.8800, lng: 67.2000 },
  { name: 'DHA Phase 6', lat: 24.7950, lng: 67.0600 },
  { name: 'Orangi Town', lat: 24.9600, lng: 66.9800 },
  { name: 'Lyari', lat: 24.8500, lng: 66.9900 },
  { name: 'PECHS', lat: 24.8650, lng: 67.0500 },
  { name: 'Bahadurabad', lat: 24.8750, lng: 67.0700 },
  { name: 'Nazimabad', lat: 24.9200, lng: 67.0300 },
  { name: 'FB Area', lat: 24.9300, lng: 67.0500 },
  { name: 'Shah Faisal', lat: 24.8700, lng: 67.1500 },
];

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Approximate distance in degrees (good enough for grouping)
  return Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2);
}

export function computeAreaRisks(reports: Report[]): AreaRisk[] {
  const areaStats = new Map<string, {
    recentReports: number;
    confirmedReports: number;
    historicalReports: number;
    hourCounts: number[];
  }>();

  // Initialize stats for all areas
  KARACHI_AREAS.forEach(area => {
    areaStats.set(area.name, {
      recentReports: 0,
      confirmedReports: 0,
      historicalReports: 0,
      hourCounts: new Array(24).fill(0),
    });
  });

  // Severity weights for different incident types
  const SEVERITY_WEIGHTS: Record<string, number> = {
    carjacking: 4,
    assault: 4,
    robbery: 3,
    mobile_snatching: 3,
    vehicle_theft: 2,
    street_harassment: 2,
    theft: 1,
    other: 1
  };

  const now = Date.now();

  // Assign each report to exactly ONE nearest area
  reports.forEach(r => {
    const nearestAreaName = getNearestArea(r.latitude, r.longitude);
    const stats = areaStats.get(nearestAreaName);
    
    if (stats) {
      const weight = SEVERITY_WEIGHTS[r.incident_type] || 1;
      stats.historicalReports += weight; // Weighted count
      
      const reportTime = new Date(r.created_at).getTime();
      if (now - reportTime < 24 * 60 * 60 * 1000) {
        stats.recentReports += weight; // Weighted recent impact
      }
      
      if (r.status === 'verified') {
        stats.confirmedReports += weight; // Verified threats carry more weight
      }
      
      const hour = new Date(r.created_at).getHours();
      stats.hourCounts[hour]++;
    }
  });

  return KARACHI_AREAS.map(area => {
    const stats = areaStats.get(area.name)!;
    
    // Calculate nuanced risk score
    // Max theoretical score could be high, so we normalize
    const rawScore = (
      stats.recentReports * 1.5 +    // Active threats are most critical
      stats.confirmedReports * 1.0 + // Verified status adds confidence
      stats.historicalReports * 0.2  // Long-term history adds baseline risk
    );

    const clampedScore = Math.min(Math.round(rawScore), 100);
    const riskLevel: AreaRisk['riskLevel'] = clampedScore >= 50 ? 'HIGH' : clampedScore >= 25 ? 'MEDIUM' : 'LOW';

    const peakHour = stats.hourCounts.indexOf(Math.max(...stats.hourCounts));
    const peakTime = stats.historicalReports > 0 
      ? `${peakHour % 12 || 12}–${(peakHour + 3) % 12 || 12} ${peakHour >= 12 ? 'PM' : 'AM'}`
      : 'N/A';

    return {
      name: area.name,
      lat: area.lat,
      lng: area.lng,
      riskLevel,
      score: clampedScore,
      recentReports: stats.recentReports,
      confirmedReports: stats.confirmedReports,
      historicalReports: stats.historicalReports,
      peakTime,
    };
  }).sort((a, b) => b.score - a.score);
}

export function getNearestArea(lat: number, lng: number): string {
  let minDistance = Infinity;
  let nearestArea = 'Unknown';

  KARACHI_AREAS.forEach(area => {
    const dist = getDistance(lat, lng, area.lat, area.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestArea = area.name;
    }
  });

  return nearestArea;
}

export function getProximityValid(userLat: number, userLng: number, reportLat: number, reportLng: number): boolean {
  // Haversine distance in meters
  const R = 6371000;
  const dLat = (reportLat - userLat) * Math.PI / 180;
  const dLng = (reportLng - userLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLat * Math.PI / 180) * Math.cos(reportLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c <= 300;
}
