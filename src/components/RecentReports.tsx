import { motion } from 'framer-motion';
import { INCIDENT_CONFIG, type Report } from '@/types/crime';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, ThumbsDown, Shield } from 'lucide-react';
import { useVoteReport } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';

interface RecentReportsProps {
  reports: Report[];
}

export function RecentReports({ reports }: RecentReportsProps) {
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
          className="bg-card border border-border rounded-lg p-4 hover:border-muted-foreground/20 transition-all duration-200 group"
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
            <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed pl-11">{report.description}</p>
          )}
          {user && (
            <div className="flex items-center gap-3 mt-3 pl-11 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
