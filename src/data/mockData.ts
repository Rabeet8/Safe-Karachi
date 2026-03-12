import type { CrimeReport, AreaRisk } from '@/types/crime';

const KARACHI_AREAS = [
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

const CRIME_TYPES: CrimeReport['type'][] = ['mobile_snatching', 'robbery', 'theft', 'carjacking', 'assault', 'other'];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomDate(hoursBack: number) {
  const now = new Date();
  return new Date(now.getTime() - Math.random() * hoursBack * 60 * 60 * 1000);
}

export function generateMockReports(count: number = 35): CrimeReport[] {
  return Array.from({ length: count }, (_, i) => {
    const area = KARACHI_AREAS[Math.floor(Math.random() * KARACHI_AREAS.length)];
    const type = CRIME_TYPES[Math.floor(Math.random() * CRIME_TYPES.length)];
    const confirmations = Math.floor(Math.random() * 8);
    const time = randomDate(48);
    
    return {
      id: `report-${i + 1}`,
      type,
      location: {
        lat: area.lat + randomBetween(-0.008, 0.008),
        lng: area.lng + randomBetween(-0.008, 0.008),
        name: area.name,
      },
      time,
      description: getDescription(type, area.name),
      weapon: Math.random() > 0.5 ? (['Gun', 'Knife', 'None'])[Math.floor(Math.random() * 3)] : undefined,
      confirmations,
      downvotes: Math.floor(Math.random() * 3),
      verified: confirmations >= 3,
      reporterTrustScore: Math.floor(randomBetween(20, 100)),
      expiresAt: new Date(time.getTime() + 48 * 60 * 60 * 1000),
    };
  });
}

function getDescription(type: CrimeReport['type'], area: string): string {
  const descriptions: Record<string, string[]> = {
    mobile_snatching: [
      `Phone snatched by two men on motorcycle near ${area}`,
      `Mobile snatching at gunpoint while walking in ${area}`,
      `Phone grabbed from hand near ${area} market area`,
    ],
    robbery: [
      `Armed robbery reported near ${area}`,
      `Two armed men robbed pedestrians in ${area}`,
      `Street robbery near ${area}, valuables taken`,
    ],
    theft: [
      `Bag snatching reported near ${area}`,
      `Vehicle parts stolen in ${area} parking area`,
      `Pickpocketing incident at ${area}`,
    ],
    carjacking: [
      `Car snatched at gunpoint in ${area}`,
      `Attempted carjacking near ${area} signal`,
    ],
    assault: [
      `Physical assault reported in ${area}`,
      `Group attack on pedestrian near ${area}`,
    ],
    other: [
      `Suspicious activity reported in ${area}`,
      `Vandalism near ${area}`,
    ],
  };
  const options = descriptions[type] || descriptions.other;
  return options[Math.floor(Math.random() * options.length)];
}

export function generateAreaRisks(): AreaRisk[] {
  return [
    { name: 'Saddar', riskLevel: 'HIGH', peakTime: '8–11 PM', reportsLast7Days: 23, score: 87 },
    { name: 'Tariq Road', riskLevel: 'HIGH', peakTime: '9–11 PM', reportsLast7Days: 19, score: 79 },
    { name: 'Lyari', riskLevel: 'HIGH', peakTime: '7–10 PM', reportsLast7Days: 17, score: 75 },
    { name: 'Orangi Town', riskLevel: 'HIGH', peakTime: '8 PM–12 AM', reportsLast7Days: 15, score: 72 },
    { name: 'Korangi', riskLevel: 'MEDIUM', peakTime: '9–11 PM', reportsLast7Days: 11, score: 58 },
    { name: 'Nazimabad', riskLevel: 'MEDIUM', peakTime: '8–10 PM', reportsLast7Days: 9, score: 51 },
    { name: 'Gulshan-e-Iqbal', riskLevel: 'MEDIUM', peakTime: '9–11 PM', reportsLast7Days: 7, score: 44 },
    { name: 'Clifton', riskLevel: 'LOW', peakTime: '10 PM–12 AM', reportsLast7Days: 3, score: 22 },
    { name: 'DHA Phase 6', riskLevel: 'LOW', peakTime: '11 PM–1 AM', reportsLast7Days: 2, score: 15 },
  ];
}
