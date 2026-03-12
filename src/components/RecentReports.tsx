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
    <div className="space-y-3">
      {reports.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No reports in this time period
        </div>
      )}
      {reports.slice(0, 15).map((report, i) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="bg-card border border-border rounded-md p-4 hover:border-muted-foreground/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{INCIDENT_CONFIG[report.incident_type].icon}</span>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {INCIDENT_CONFIG[report.incident_type].label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {report.location_name && `📍 ${report.location_name} · `}
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            {report.status === 'verified' ? (
              <span className="flex items-center gap-1 text-xs text-safe font-mono">
                <Shield size={12} /> Verified
              </span>
            ) : (
              <span className="text-xs text-muted-foreground font-mono">
                {report.confirmations}/3
              </span>
            )}
          </div>
          {report.description && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{report.description}</p>
          )}
          {user && (
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => handleVote(report.id, 'confirm')}
                disabled={vote.isPending}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-safe transition-colors disabled:opacity-50"
              >
                <CheckCircle size={13} /> Confirm
              </button>
              <button
                onClick={() => handleVote(report.id, 'reject')}
                disabled={vote.isPending}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-danger transition-colors disabled:opacity-50"
              >
                <ThumbsDown size={13} /> Not Accurate
              </button>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
