import { motion } from 'framer-motion';
import { TrendingUp, Clock } from 'lucide-react';
import type { AreaRisk } from '@/types/crime';

interface AreaRiskPanelProps {
  risks: AreaRisk[];
}

export function AreaRiskPanel({ risks }: AreaRiskPanelProps) {
  const riskStyles = {
    HIGH: { border: 'border-danger/40', badge: 'bg-danger/20 text-danger', glow: 'glow-danger' },
    MEDIUM: { border: 'border-warning/40', badge: 'bg-warning/20 text-warning', glow: '' },
    LOW: { border: 'border-safe/40', badge: 'bg-safe/20 text-safe', glow: '' },
  };

  const filtered = risks.filter(a => a.historicalReports > 0);

  return (
    <div className="space-y-3">
      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No area data available yet
        </div>
      )}
      {filtered.map((area, i) => {
        const style = riskStyles[area.riskLevel];
        return (
          <motion.div
            key={area.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-card border ${style.border} rounded-md p-4 ${area.riskLevel === 'HIGH' ? style.glow : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">{area.name}</span>
              <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm ${style.badge}`}>
                {area.riskLevel}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp size={11} /> {area.historicalReports} reports
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> {area.peakTime}
              </span>
            </div>
            <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${area.score}%` }}
                transition={{ delay: i * 0.05 + 0.3, duration: 0.5 }}
                className={`h-full rounded-full ${
                  area.riskLevel === 'HIGH' ? 'bg-danger' : area.riskLevel === 'MEDIUM' ? 'bg-warning' : 'bg-safe'
                }`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
