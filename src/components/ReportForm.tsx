import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MapPin, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INCIDENT_CONFIG, type IncidentType } from '@/types/crime';
import { useCreateReport, useUploadEvidence } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';

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
      },
      () => {
        // Default to Karachi center if denied
        setCoords({ lat: 24.8607, lng: 67.0011 });
        setGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !coords) return;

    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        imageUrl = await uploadEvidence.mutateAsync(imageFile);
      } catch {
        return;
      }
    }

    await createReport.mutateAsync({
      incident_type: selectedType,
      latitude: coords.lat,
      longitude: coords.lng,
      location_name: locationName || undefined,
      description: description || undefined,
      weapon: weapon || undefined,
      image_url: imageUrl,
    });

    // Reset form
    setSelectedType('');
    setLocationName('');
    setDescription('');
    setWeapon('');
    setImageFile(null);
    setCoords(null);
    onClose();
  };

  if (!user) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-md p-8 text-center max-w-sm"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border border-border rounded-md w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-mono text-sm uppercase tracking-wider text-foreground">Report Incident</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Incident Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(INCIDENT_CONFIG) as [IncidentType, typeof INCIDENT_CONFIG[IncidentType]][]).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedType(key)}
                      className={`p-2.5 rounded-md border text-left text-sm flex items-center gap-2 transition-all ${
                        selectedType === key
                          ? 'border-danger bg-danger/10 text-foreground'
                          : 'border-border bg-secondary text-muted-foreground hover:border-muted-foreground'
                      }`}
                    >
                      <span>{val.icon}</span>
                      <span>{val.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  <MapPin size={12} className="inline mr-1" /> Location *
                </label>
                {!coords ? (
                  <Button type="button" variant="outline" size="sm" onClick={getLocation} disabled={gettingLocation}>
                    {gettingLocation ? <><Loader2 size={14} className="animate-spin mr-1" /> Getting location...</> : 'Use My Location'}
                  </Button>
                ) : (
                  <div className="text-xs text-safe font-mono">
                    ✓ Location set ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                  </div>
                )}
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  placeholder="Area name (e.g., Tariq Road near Chase Up)"
                  maxLength={200}
                  className="w-full mt-2 bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Weapon Used
                </label>
                <select
                  value={weapon}
                  onChange={e => setWeapon(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-muted-foreground"
                >
                  <option value="">None</option>
                  <option value="Gun">Gun</option>
                  <option value="Knife">Knife</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the incident..."
                  rows={3}
                  maxLength={1000}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
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
                  className="gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={14} />
                  {imageFile ? imageFile.name.slice(0, 20) : 'Add Evidence'}
                </Button>
                <div className="flex-1" />
                <Button
                  type="submit"
                  size="sm"
                  className="gap-1.5 bg-danger hover:bg-danger/90 text-danger-foreground"
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
