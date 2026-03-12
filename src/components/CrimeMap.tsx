import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Report } from '@/types/crime';
import { INCIDENT_CONFIG } from '@/types/crime';
import { formatDistanceToNow } from 'date-fns';

const KARACHI_CENTER: [number, number] = [24.8607, 67.0011];

function HeatmapCircles({ reports }: { reports: Report[] }) {
  const heatPoints: Record<string, { lat: number; lng: number; count: number }> = {};
  reports.forEach(report => {
    const key = `${Math.round(report.latitude * 100)}-${Math.round(report.longitude * 100)}`;
    if (!heatPoints[key]) {
      heatPoints[key] = { lat: report.latitude, lng: report.longitude, count: 0 };
    }
    heatPoints[key].count++;
  });

  return (
    <>
      {Object.values(heatPoints).map((point, i) => (
        <CircleMarker
          key={`heat-${i}`}
          center={[point.lat, point.lng]}
          radius={Math.min(point.count * 12, 50)}
          pathOptions={{
            fillColor: point.count > 3 ? '#e63946' : point.count > 1 ? '#f4a261' : '#2a9d8f',
            fillOpacity: 0.15,
            stroke: false,
          }}
        />
      ))}
    </>
  );
}

interface CrimeMapProps {
  reports: Report[];
  showHeatmap?: boolean;
}

export function CrimeMap({ reports, showHeatmap = true }: CrimeMapProps) {
  const getMarkerColor = (type: Report['incident_type']) => {
    const dangerTypes = ['mobile_snatching', 'robbery', 'assault', 'carjacking'];
    if (dangerTypes.includes(type)) return '#e63946';
    return '#f4a261';
  };

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden border border-border">
      <MapContainer
        center={KARACHI_CENTER}
        zoom={12}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {showHeatmap && <HeatmapCircles reports={reports} />}
        
        {reports.map(report => (
          <CircleMarker
            key={report.id}
            center={[report.latitude, report.longitude]}
            radius={6}
            pathOptions={{
              fillColor: getMarkerColor(report.incident_type),
              fillOpacity: 0.9,
              color: getMarkerColor(report.incident_type),
              weight: 2,
              opacity: 0.7,
            }}
          >
            <Popup>
              <div className="font-sans min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{INCIDENT_CONFIG[report.incident_type].icon}</span>
                  <span className="font-semibold text-sm">{INCIDENT_CONFIG[report.incident_type].label}</span>
                </div>
                {report.description && <p className="text-xs opacity-80 mb-2">{report.description}</p>}
                <div className="flex flex-col gap-1 text-xs opacity-70">
                  {report.location_name && <span>📍 {report.location_name}</span>}
                  <span>🕐 {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                  {report.weapon && <span>🔫 Weapon: {report.weapon}</span>}
                  <span>{report.status === 'verified' ? '✅ Verified' : `👥 ${report.confirmations}/3 confirmations`}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-md p-3 z-[1000]">
        <div className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">Risk Level</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span className="text-xs text-foreground">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-foreground">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-safe" />
            <span className="text-xs text-foreground">Low Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
