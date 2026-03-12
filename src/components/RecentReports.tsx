import { motion } from 'framer-motion';
import { CRIME_TYPES, type CrimeReport } from '@/types/crime';
import { formatDistanceToNow } from 'date-fns';
import { generateMockReports } from '@/data/mockData';
import { CheckCircle, ThumbsDown, Shield } from 'lucide-react';

const reports = generateMockReports(10).sort((a, b) => b.time.getTime() - a.time.getTime());

export function RecentReports() {
  return (
    <div className="space-y-3">
      {reports.map((report, i) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-card border border-border rounded-md p-4 hover:border-muted-foreground/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{CRIME_TYPES[report.type].icon}</span>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {CRIME_TYPES[report.type].label}
                </div>
                <div className="text-xs text-muted-foreground">
                  📍 {report.location.name} · {formatDistanceToNow(report.time, { addSuffix: true })}
                </div>
              </div>
            </div>
            {report.verified ? (
              <span className="flex items-center gap-1 text-xs text-safe font-mono">
                <Shield size={12} /> Verified
              </span>
            ) : (
              <span className="text-xs text-muted-foreground font-mono">
                {report.confirmations}/3
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{report.description}</p>
          <div className="flex items-center gap-3 mt-3">
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-safe transition-colors">
              <CheckCircle size={13} /> Confirm
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-danger transition-colors">
              <ThumbsDown size={13} /> Not Accurate
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
