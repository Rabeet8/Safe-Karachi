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
                <label className="block text-xs font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">
                  <MapPin size={11} className="inline mr-1 -mt-0.5" /> Location *
                </label>
                {!coords ? (
                  <Button type="button" variant="outline" size="sm" onClick={getLocation} disabled={gettingLocation} className="rounded-lg">
                    {gettingLocation ? <><Loader2 size={14} className="animate-spin mr-1.5" /> Getting location...</> : '📍 Use My Location'}
                  </Button>
                ) : (
                  <div className="text-xs text-safe font-mono bg-safe/10 border border-safe/20 rounded-lg px-3 py-2 inline-block">
                    ✓ Location set ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                  </div>
                )}
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  placeholder="Area name (e.g., Tariq Road near Chase Up)"
                  maxLength={200}
                  className="w-full mt-2 bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 transition-all"
                />
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
