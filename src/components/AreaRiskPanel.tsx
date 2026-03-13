import { motion } from 'framer-motion';
import { TrendingUp, Clock } from 'lucide-react';
import type { AreaRisk } from '@/types/crime';

interface AreaRiskPanelProps {
  risks: AreaRisk[];
  selectedAreaName?: string | null;
  onAreaSelect?: (area: AreaRisk) => void;
}

export function AreaRiskPanel({ risks, selectedAreaName, onAreaSelect }: AreaRiskPanelProps) {
  const riskStyles = {
    HIGH: { card: 'border-danger/25 bg-danger/5', badge: 'bg-danger/15 text-danger', bar: 'bg-danger' },
    MEDIUM: { card: 'border-warning/25 bg-warning/5', badge: 'bg-warning/15 text-warning', bar: 'bg-warning' },
    LOW: { card: 'border-safe/25 bg-safe/5', badge: 'bg-safe/15 text-safe', bar: 'bg-safe' },
  };

  const filtered = risks.filter(a => a.historicalReports > 0);

  return (
    <div className="space-y-2.5">
      {filtered.length === 0 && (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No area data available yet
        </div>
      )}
      {filtered.map((area, i) => {
        const style = riskStyles[area.riskLevel];
        return (
          <motion.div
            key={area.name}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onAreaSelect?.(area)}
            className={`border rounded-lg p-4 ${style.card} transition-all duration-200 cursor-pointer ${selectedAreaName === area.name ? 'ring-2 ring-primary border-primary' : ''
              }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-foreground">{area.name}</span>
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md font-semibold ${style.badge}`}>
                {area.riskLevel}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <TrendingUp size={11} /> {area.historicalReports} reports
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={11} /> {area.peakTime}
              </span>
            </div>
            <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${area.score}%` }}
                transition={{ delay: i * 0.04 + 0.3, duration: 0.6, ease: 'easeOut' }}
                className={`h-full rounded-full ${style.bar}`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
