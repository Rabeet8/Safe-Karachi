import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MapPin, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CRIME_TYPES, type CrimeType } from '@/types/crime';

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportForm({ isOpen, onClose }: ReportFormProps) {
  const [selectedType, setSelectedType] = useState<CrimeType | ''>('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [weapon, setWeapon] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setSelectedType('');
      setLocation('');
      setTime('');
      setDescription('');
      setWeapon('');
    }, 2000);
  };

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

            {submitted ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <div className="text-foreground font-semibold">Report Submitted</div>
                <div className="text-sm text-muted-foreground mt-1">Awaiting community verification</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                    Incident Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(CRIME_TYPES) as [CrimeType, typeof CRIME_TYPES[CrimeType]][]).map(([key, val]) => (
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
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g., Tariq Road near Chase Up"
                    required
                    maxLength={200}
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      required
                      className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                      Weapon
                    </label>
                    <select
                      value={weapon}
                      onChange={e => setWeapon(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-muted-foreground"
                    >
                      <option value="">None</option>
                      <option value="gun">Gun</option>
                      <option value="knife">Knife</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Camera size={14} />
                    Add Evidence
                  </Button>
                  <div className="flex-1" />
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    className="gap-1.5 bg-danger hover:bg-danger/90 text-danger-foreground"
                    disabled={!selectedType || !location || !time}
                  >
                    <Send size={14} />
                    Submit Report
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
