
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Shield, AlertTriangle, ExternalLink, User } from 'lucide-react';
import { Report, INCIDENT_CONFIG } from '@/types/crime';
import { format } from 'date-fns';
import { getNearestArea } from '@/lib/riskEngine';

interface ReportDetailModalProps {
  report: Report | null;
  onClose: () => void;
  reporterName?: string;
}

export function ReportDetailModal({ report, onClose, reporterName }: ReportDetailModalProps) {
  if (!report) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
        >
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 bg-secondary/80 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col">
            {/* Header / Banner */}
            <div className="h-24 bg-gradient-to-r from-danger/20 via-background to-background relative overflow-hidden">
               <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-danger/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               </div>
               <div className="h-full flex items-end px-8 pb-4">
                 <div className="flex items-center gap-3">
                   <span className="text-3xl">{INCIDENT_CONFIG[report.incident_type].icon}</span>
                   <h2 className="text-2xl font-bold font-mono tracking-tighter uppercase italic">
                     {INCIDENT_CONFIG[report.incident_type].label}
                   </h2>
                 </div>
               </div>
            </div>

            <div className="p-8 grid md:grid-cols-[1fr_240px] gap-8">
              <div className="space-y-6">
                <section className="space-y-2">
                  <h3 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Incident_Information</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-foreground/90 font-medium">
                        <MapPin size={16} className="text-danger" />
                        <span>{report.location_name || 'Coordinates Only'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground pl-6 uppercase tracking-wider opacity-60">
                        Area: {getNearestArea(report.latitude, report.longitude)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/90">
                      <Clock size={16} className="text-info" />
                      <span>{format(new Date(report.created_at), 'PPPP p')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground/90">
                      <User size={16} className="text-warning" />
                      <span>Reporter: {reporterName || report.user_id.slice(0, 8)}</span>
                    </div>
                    {report.weapon && (
                      <div className="flex items-center gap-2 text-sm text-danger font-bold">
                        <AlertTriangle size={16} />
                        <span>Armed: {report.weapon}</span>
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/20 p-4 rounded-xl border border-border/50">
                    {report.description || 'No description provided for this incident.'}
                  </p>
                </section>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                    report.status === 'verified' ? 'bg-safe/10 text-safe border border-safe/20' : 'bg-warning/10 text-warning border border-warning/20'
                  }`}>
                    {report.status === 'verified' ? <Shield size={12}/> : null}
                    {report.status}
                  </div>
                </div>
              </div>

              {/* Sidebar / Image area */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Evidence</h3>
                {report.image_url ? (
                  <div className="space-y-3">
                    <div className="aspect-square rounded-xl border border-border overflow-hidden bg-secondary shadow-lg">
                      <img src={report.image_url} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                    <a 
                      href={report.image_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-mono transition-all border border-border"
                    >
                      <ExternalLink size={14} /> VIEW_FULL_IMAGE
                    </a>
                  </div>
                ) : (
                  <div className="aspect-square rounded-xl border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs italic opacity-50">
                    No_Visual_Evidence
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
