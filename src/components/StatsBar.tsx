import { motion } from 'framer-motion';
import { Shield, AlertTriangle, MapPin, Clock } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  variant?: 'danger' | 'warning' | 'safe' | 'info';
}

function StatCard({ icon, value, label, variant = 'info' }: StatCardProps) {
  const variantClasses = {
    danger: 'border-danger/30 glow-danger',
    warning: 'border-warning/30 glow-warning',
    safe: 'border-safe/30 glow-safe',
    info: 'border-border',
  };

  const iconClasses = {
    danger: 'text-danger',
    warning: 'text-warning',
    safe: 'text-safe',
    info: 'text-info',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-md p-5 ${variantClasses[variant]}`}
    >
      <div className={`mb-3 ${iconClasses[variant]}`}>{icon}</div>
      <div className="font-mono text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<AlertTriangle size={22} />}
        value={147}
        label="Reports Today"
        variant="danger"
      />
      <StatCard
        icon={<MapPin size={22} />}
        value={23}
        label="Active Hotspots"
        variant="warning"
      />
      <StatCard
        icon={<Shield size={22} />}
        value="78%"
        label="Verified Rate"
        variant="safe"
      />
      <StatCard
        icon={<Clock size={22} />}
        value="2m"
        label="Avg Response"
        variant="info"
      />
    </div>
  );
}
