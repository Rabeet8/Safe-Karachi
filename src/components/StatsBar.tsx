import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Shield, Clock } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  variant?: 'danger' | 'warning' | 'safe' | 'info';
}

function StatCard({ icon, value, label, variant = 'info' }: StatCardProps) {
  const styles = {
    danger: { card: 'border-danger/20 bg-danger/5', icon: 'text-danger bg-danger/15', value: 'text-danger' },
    warning: { card: 'border-warning/20 bg-warning/5', icon: 'text-warning bg-warning/15', value: 'text-warning' },
    safe: { card: 'border-safe/20 bg-safe/5', icon: 'text-safe bg-safe/15', value: 'text-safe' },
    info: { card: 'border-info/20 bg-info/5', icon: 'text-info bg-info/15', value: 'text-info' },
  };

  const s = styles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-4 ${s.card} transition-all duration-300 hover:shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.icon}`}>
          {icon}
        </div>
        <div>
          <div className={`font-mono text-2xl font-bold ${s.value}`}>{value}</div>
          <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

interface StatsBarProps {
  totalReports: number;
  hotspots: number;
  verifiedRate: number;
  loading: boolean;
}

export function StatsBar({ totalReports, hotspots, verifiedRate, loading }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={<AlertTriangle size={20} />}
        value={loading ? '—' : totalReports}
        label="Total Reports"
        variant="danger"
      />
      <StatCard
        icon={<MapPin size={20} />}
        value={loading ? '—' : hotspots}
        label="Active Hotspots"
        variant="warning"
      />
      <StatCard
        icon={<Shield size={20} />}
        value={loading ? '—' : `${verifiedRate}%`}
        label="Verified Rate"
        variant="safe"
      />
      <StatCard
        icon={<Clock size={20} />}
        value="48h"
        label="Report Expiry"
        variant="info"
      />
    </div>
  );
}
