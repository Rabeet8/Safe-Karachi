import { motion } from 'framer-motion';
import { INCIDENT_CONFIG, type Report } from '@/types/crime';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, ThumbsDown, Shield } from 'lucide-react';
import { useVoteReport } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';

interface RecentReportsProps {
  reports: Report[];
  selectedId?: string | null;
  onReportSelect?: (id: string) => void;
}

export function RecentReports({ reports, selectedId, onReportSelect }: RecentReportsProps) {
  const vote = useVoteReport();
  const { user } = useAuth();

  const handleVote = (reportId: string, voteType: 'confirm' | 'reject') => {
    if (!user) return;
    vote.mutate({ reportId, voteType });
  };

  return (
    <div className="space-y-2.5">
      {reports.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No reports in this time period
        </div>
      )}
      {reports.slice(0, 15).map((report, i) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onReportSelect?.(report.id)}
          className={`bg-card border rounded-lg p-4 transition-all duration-200 group cursor-pointer ${selectedId === report.id
              ? 'border-danger shadow-sm shadow-danger/10 ring-1 ring-danger/20'
              : 'border-border hover:border-muted-foreground/20'
            }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-lg w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                {INCIDENT_CONFIG[report.incident_type].icon}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {INCIDENT_CONFIG[report.incident_type].label}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {report.location_name && `${report.location_name} · `}
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            {report.status === 'verified' ? (
              <span className="flex items-center gap-1 text-[10px] text-safe font-mono bg-safe/10 px-2 py-1 rounded-md">
                <Shield size={10} /> Verified
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono bg-secondary px-2 py-1 rounded-md">
                {report.confirmations}/3
              </span>
            )}
          </div>
          {report.description && (
            <div className="flex gap-3 mt-2.5 pl-11">
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">{report.description}</p>
              {report.image_url && (
                <a 
                  href={report.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-secondary hover:border-danger/50 transition-colors">
                    <img src={report.image_url} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                </a>
              )}
            </div>
          )}
          {!report.description && report.image_url && (
            <div className="mt-2.5 pl-11">
              <a 
                href={report.image_url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-12 rounded-lg border border-border overflow-hidden bg-secondary hover:border-danger/50 transition-colors">
                  <img src={report.image_url} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              </a>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-3 mt-3 pl-11 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleVote(report.id, 'confirm')}
                disabled={vote.isPending}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-safe transition-colors disabled:opacity-50 px-2 py-1 rounded-md hover:bg-safe/10"
              >
                <CheckCircle size={12} /> Confirm
              </button>
              <button
                onClick={() => handleVote(report.id, 'reject')}
                disabled={vote.isPending}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-danger transition-colors disabled:opacity-50 px-2 py-1 rounded-md hover:bg-danger/10"
              >
                <ThumbsDown size={12} /> Not Accurate
              </button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
