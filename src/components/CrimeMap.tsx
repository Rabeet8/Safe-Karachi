
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState, Fragment } from 'react';
import type { Report, AreaRisk } from '@/types/crime';
import { INCIDENT_CONFIG } from '@/types/crime';
import { formatDistanceToNow } from 'date-fns';
import { Maximize2, Minimize2, Home } from 'lucide-react';

const KARACHI_CENTER: [number, number] = [24.8607, 67.0011];

function MapController({ selectedReport, selectedArea, resetView }: { selectedReport?: Report | null, selectedArea?: AreaRisk | null, resetView?: number }) {
  const map = useMap();

  useEffect(() => {
    if (resetView) {
      map.flyTo(KARACHI_CENTER, 12, { duration: 1.5 });
    }
  }, [resetView, map]);

  useEffect(() => {
    if (selectedReport) {
      map.flyTo([selectedReport.latitude, selectedReport.longitude], 15, {
        duration: 1.5
      });
    } else if (selectedArea) {
      map.flyTo([selectedArea.lat, selectedArea.lng], 14, {
        duration: 1.5
      });
    }
  }, [selectedReport, selectedArea, map]);

  return null;
}

interface CrimeMapProps {
  reports: Report[];
  areaRisks?: AreaRisk[];
  selectedReportId?: string | null;
  selectedArea?: AreaRisk | null;
  replayActive?: boolean;
  newestReportId?: string | null;
}

export function CrimeMap({ reports, areaRisks = [], selectedReportId, selectedArea, replayActive, newestReportId }: CrimeMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const markerRefs = useRef<Record<string, any>>({});
  
  const selectedReport = reports.find(r => r.id === selectedReportId);

  useEffect(() => {
    if (selectedReportId && markerRefs.current[selectedReportId]) {
      const marker = markerRefs.current[selectedReportId];
      marker.openPopup();
      if (typeof marker.bringToFront === 'function') {
        marker.bringToFront();
      }
    }
  }, [selectedReportId]);

  const getMarkerColor = (type: Report['incident_type']) => {
    const dangerTypes = ['mobile_snatching', 'robbery', 'assault', 'carjacking'];
    if (dangerTypes.includes(type)) return '#e63946'; // High Risk Red
    return '#f59e0b'; // Medium Risk Yellow
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const recenterMap = () => {
    setResetKey(prev => prev + 1);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden border border-border shadow-lg shadow-black/30 transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none' : 'relative'
    }`}>
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

        <MapController selectedReport={selectedReport} selectedArea={selectedArea} resetView={resetKey} />

        {/* High Risk Area Visualizations */}
        {!replayActive && areaRisks.filter(a => a.riskLevel === 'HIGH').map((area, i) => (
          <CircleMarker
            key={`hotspot-${i}`}
            center={[area.lat, area.lng]}
            radius={60}
            pathOptions={{
              fillColor: '#e63946',
              fillOpacity: 0.1,
              stroke: true,
              color: '#e63946',
              weight: 1,
              dashArray: '5, 10',
              opacity: 0.3
            }}
          >
            <Popup>
              <div className="font-mono text-[10px] text-danger font-bold uppercase tracking-widest">
                High Risk Area: {area.name}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {[...reports]
          .sort((a, b) => (a.id === selectedReportId ? 1 : b.id === selectedReportId ? -1 : 0))
          .map(report => {
            const isSelected = report.id === selectedReportId;
            const isNewest = report.id === newestReportId;
            return (
              <Fragment key={report.id}>
                {isNewest && (
                  <CircleMarker
                    center={[report.latitude, report.longitude]}
                    radius={30}
                    pathOptions={{
                      fillColor: getMarkerColor(report.incident_type),
                      fillOpacity: 0.2,
                      color: getMarkerColor(report.incident_type),
                      weight: 1,
                      className: 'animate-ping'
                    }}
                  />
                )}
                <CircleMarker
                  ref={(ref) => {
                    if (ref) markerRefs.current[report.id] = ref;
                  }}
                  center={[report.latitude, report.longitude]}
                  radius={isSelected ? 12 : 6}
                  pane={isSelected ? 'markerPane' : 'overlayPane'}
                  pathOptions={{
                    fillColor: getMarkerColor(report.incident_type),
                    fillOpacity: isSelected ? 1 : 0.9,
                    color: isSelected ? '#ffffff' : getMarkerColor(report.incident_type),
                    weight: isSelected ? 3 : 2,
                    opacity: 1,
                  }}
                >
                  <Popup>
                    <div className="font-sans min-w-[200px]">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{INCIDENT_CONFIG[report.incident_type].icon}</span>
                            <span className="font-semibold text-sm">{INCIDENT_CONFIG[report.incident_type].label}</span>
                          </div>
                          {report.description && <p className="text-xs opacity-80 mb-2">{report.description}</p>}
                        </div>
                        {report.image_url && (
                          <a 
                            href={report.image_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-shrink-0 mt-1"
                          >
                            <div className="w-14 h-14 rounded-md border border-border overflow-hidden bg-secondary">
                              <img src={report.image_url} alt="Evidence" className="w-full h-full object-cover" />
                            </div>
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 text-xs opacity-70">
                        {report.location_name && <span>📍 {report.location_name}</span>}
                        <span>🕐 {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                        {report.weapon && <span>⚠️ Weapon: {report.weapon}</span>}
                        <span>{report.status === 'verified' ? '✅ Verified' : `👥 ${report.confirmations}/3 confirmations`}</span>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </Fragment>
            );
          })}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
        <button
          onClick={recenterMap}
          className="p-2.5 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg hover:bg-secondary transition-colors text-foreground"
          title="Recenter Map"
        >
          <Home size={18} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-md border border-border rounded-lg p-3 z-10 shadow-lg">
        <div className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-widest">Legend</div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            <span className="text-[11px] text-foreground">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-[11px] text-foreground">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-safe" />
            <span className="text-[11px] text-foreground">Low Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
