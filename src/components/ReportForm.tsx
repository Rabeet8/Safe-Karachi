import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MapPin, Camera, Loader2, CheckCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INCIDENT_CONFIG, type IncidentType } from '@/types/crime';
import { useCreateReport, useUploadEvidence } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapRecenter({ position }: { position: { lat: number, lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], 15);
  }, [position, map]);
  return null;
}

function LocationMarker({ position, setPosition }: { position: { lat: number, lng: number } | null, setPosition: (p: { lat: number, lng: number }) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position === null ? null : (
    <Marker 
      position={[position.lat, position.lng]} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition({ lat: pos.lat, lng: pos.lng });
        },
      }}
    />
  );
}

import { toast } from 'sonner';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportForm({ isOpen, onClose }: ReportFormProps) {
  const { user } = useAuth();
  const createReport = useCreateReport();
  const uploadEvidence = useUploadEvidence();

  const [selectedType, setSelectedType] = useState<IncidentType | ''>('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [weapon, setWeapon] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLocation = () => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingLocation(false);
        toast.success("Current location captured");
      },
      () => {
        setCoords({ lat: 24.8607, lng: 67.0011 });
        setGettingLocation(false);
        toast.info("Using default Karachi coordinates (Location denied)");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleLocationSearch = async (query: string) => {
    if (query.length < 3) return;
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Karachi')}&limit=1`);
      const data = await resp.json();
      if (data && data[0]) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      }
    } catch (e) {
      console.error("Search failed", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !coords) {
      toast.error("Please select incident type and location");
      return;
    }

    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        imageUrl = await uploadEvidence.mutateAsync(imageFile);
      } catch (err: any) {
        toast.error("Failed to upload image: " + (err.message || "Unknown error"));
        return;
      }
    }

    try {
      await createReport.mutateAsync({
        incident_type: selectedType,
        latitude: coords.lat,
        longitude: coords.lng,
        location_name: locationName || undefined,
        description: description || undefined,
        weapon: weapon || undefined,
        image_url: imageUrl,
      });

      setSelectedType('');
      setLocationName('');
      setDescription('');
      setWeapon('');
      setImageFile(null);
      setCoords(null);
      onClose();
    } catch (err: any) {
      toast.error("Failed to submit report: " + (err.message || "Unknown error"));
    }
  };

  if (!user) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-xl p-8 text-center max-w-sm shadow-2xl shadow-black/50"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl mb-3">🔒</div>
              <div className="text-foreground font-semibold mb-2">Login Required</div>
              <div className="text-sm text-muted-foreground">You need to sign in to report incidents</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/60"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground text-base">Report Incident</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Help keep Karachi safe</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">
                  Incident Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(INCIDENT_CONFIG) as [IncidentType, typeof INCIDENT_CONFIG[IncidentType]][]).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedType(key)}
                      className={`p-3 rounded-lg border text-left text-sm flex items-center gap-2.5 transition-all duration-200 ${
                        selectedType === key
                          ? 'border-danger/50 bg-danger/10 text-foreground shadow-sm'
                          : 'border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
                      }`}
                    >
                      <span className="text-base">{val.icon}</span>
                      <span className="text-xs font-medium">{val.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider flex items-center justify-between">
                  <span><MapPin size={11} className="inline mr-1 -mt-0.5" /> Incident Location *</span>
                  {coords && (
                    <span className="text-[10px] text-safe font-mono animate-pulse">✓ LOCATION_LOCKED</span>
                  )}
                </label>
                
                <div className="flex gap-2 mb-3">
                  <Button 
                    type="button" 
                    variant={gettingLocation ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={getLocation} 
                    disabled={gettingLocation} 
                    className="flex-1 rounded-lg h-10 gap-2 border-border/50"
                  >
                    {gettingLocation ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                    {gettingLocation ? 'GPS_LOCATING...' : 'Use My GPS'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <input
                        type="text"
                        value={locationName}
                        onChange={e => setLocationName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleLocationSearch(locationName))}
                        placeholder="Search area (e.g. Rafah-e-Aam, North Nazimabad)"
                        className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-danger/50 font-mono"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleLocationSearch(locationName)}
                      className="h-[42px] px-4"
                    >
                      Search
                    </Button>
                  </div>

                  <div className="h-[200px] w-full rounded-xl overflow-hidden border border-border relative group">
                    <MapContainer
                      center={coords || [24.8607, 67.0011]}
                      zoom={13}
                      className="h-full w-full"
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                      <LocationMarker position={coords} setPosition={setCoords} />
                      <MapRecenter position={coords} />
                    </MapContainer>
                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg text-[10px] text-white/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      Click or drag marker to fine-tune location
                    </div>
                  </div>

                  {coords && (
                    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex items-center justify-between">
                      <div className="text-[10px] font-mono text-muted-foreground flex flex-col gap-0.5">
                        <span className="text-safe lowercase">✓ coordinate_ready</span>
                        <span>LAT: {coords.lat.toFixed(6)}</span>
                        <span>LNG: {coords.lng.toFixed(6)}</span>
                      </div>
                      <div className="w-8 h-8 rounded bg-safe/10 border border-safe/20 flex items-center justify-center text-safe">
                        <CheckCircle size={14} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">
                  Weapon Used
                </label>
                <select
                  value={weapon}
                  onChange={e => setWeapon(e.target.value)}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-all"
                >
                  <option value="">None</option>
                  <option value="Gun">Gun</option>
                  <option value="Knife">Knife</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the incident..."
                  rows={3}
                  maxLength={1000}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-lg"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={14} />
                  {imageFile ? imageFile.name.slice(0, 18) : 'Add Evidence'}
                </Button>
                <div className="flex-1" />
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 bg-danger hover:bg-danger/90 text-danger-foreground rounded-lg shadow-lg shadow-danger/20 px-5"
                  disabled={!selectedType || !coords || createReport.isPending}
                >
                  {createReport.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit Report
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
