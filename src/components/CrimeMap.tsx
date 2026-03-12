import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { CrimeReport } from '@/types/crime';
import { CRIME_TYPES } from '@/types/crime';
import { generateMockReports } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';

const KARACHI_CENTER: [number, number] = [24.8607, 67.0011];

function HeatmapCircles({ reports }: { reports: CrimeReport[] }) {
  // Group reports by proximity and create heat circles
  const heatPoints = reports.reduce((acc, report) => {
    const key = `${Math.round(report.location.lat * 100)}-${Math.round(report.location.lng * 100)}`;
    if (!acc[key]) {
      acc[key] = { lat: report.location.lat, lng: report.location.lng, count: 0 };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { lat: number; lng: number; count: number }>);

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
  showHeatmap?: boolean;
  timeFilter?: '24h' | '7d' | '30d';
}

export function CrimeMap({ showHeatmap = true, timeFilter = '7d' }: CrimeMapProps) {
  const [reports] = useState<CrimeReport[]>(() => generateMockReports(35));
  const [mapReady, setMapReady] = useState(false);

  const filteredReports = reports.filter(r => {
    const now = Date.now();
    const hours = timeFilter === '24h' ? 24 : timeFilter === '7d' ? 168 : 720;
    return now - r.time.getTime() < hours * 60 * 60 * 1000;
  });

  const getMarkerColor = (type: CrimeReport['type']) => {
    const config = CRIME_TYPES[type];
    if (config.color === 'danger') return '#e63946';
    if (config.color === 'warning') return '#f4a261';
    return '#2a9d8f';
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
        <MapEvents onMapReady={() => setMapReady(true)} />
        
        {showHeatmap && <HeatmapCircles reports={filteredReports} />}
        
        {filteredReports.map(report => (
          <CircleMarker
            key={report.id}
            center={[report.location.lat, report.location.lng]}
            radius={6}
            pathOptions={{
              fillColor: getMarkerColor(report.type),
              fillOpacity: 0.9,
              color: getMarkerColor(report.type),
              weight: 2,
              opacity: 0.7,
            }}
          >
            <Popup>
              <div className="font-sans min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{CRIME_TYPES[report.type].icon}</span>
                  <span className="font-semibold text-sm">{CRIME_TYPES[report.type].label}</span>
                </div>
                <p className="text-xs opacity-80 mb-2">{report.description}</p>
                <div className="flex flex-col gap-1 text-xs opacity-70">
                  <span>📍 {report.location.name}</span>
                  <span>🕐 {formatDistanceToNow(report.time, { addSuffix: true })}</span>
                  {report.weapon && <span>🔫 Weapon: {report.weapon}</span>}
                  <span>{report.verified ? '✅ Verified' : `👥 ${report.confirmations}/3 confirmations`}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      {/* Map legend */}
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
