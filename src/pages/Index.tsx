import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, MapPin, Clock, LogIn, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatsBar } from '@/components/StatsBar';
import { CrimeMap } from '@/components/CrimeMap';
import { ReportForm } from '@/components/ReportForm';
import { RecentReports } from '@/components/RecentReports';
import { AreaRiskPanel } from '@/components/AreaRiskPanel';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { computeAreaRisks } from '@/lib/riskEngine';
import type { TimeFilter } from '@/types/crime';

type Tab = 'reports' | 'areas';

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('reports');

  const { data: reports = [], isLoading } = useReports(timeFilter);
  const areaRisks = useMemo(() => computeAreaRisks(reports), [reports]);

  const totalReports = reports.length;
  const verifiedCount = reports.filter(r => r.status === 'verified').length;
  const hotspots = areaRisks.filter(a => a.riskLevel === 'HIGH').length;
  const verifiedRate = totalReports > 0 ? Math.round((verifiedCount / totalReports) * 100) : 0;

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <header className="border-b border-border bg-surface-overlay/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Shield size={22} className="text-danger" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger rounded-full animate-pulse-danger" />
            </div>
            <span className="font-mono text-sm font-bold tracking-wider text-foreground">
              SAFE<span className="text-danger">KARACHI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-secondary rounded-md p-0.5">
              {(['24h', '7d', '30d'] as TimeFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-3 py-1 text-xs font-mono rounded-sm transition-all ${
                    timeFilter === f
                      ? 'bg-card text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <Button
              onClick={() => setReportOpen(true)}
              size="sm"
              className="gap-1.5 bg-danger hover:bg-danger/90 text-danger-foreground font-mono text-xs"
            >
              <AlertTriangle size={13} />
              Report
            </Button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs text-muted-foreground font-mono">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
                  <LogOut size={15} />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground font-mono text-xs">
                  <LogIn size={14} />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <StatsBar
          totalReports={totalReports}
          hotspots={hotspots}
          verifiedRate={verifiedRate}
          loading={isLoading}
        />

        {/* Map + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Live Crime Map
              </h2>
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`text-xs font-mono px-2.5 py-1 rounded-sm border transition-all ${
                  showHeatmap
                    ? 'border-danger/40 text-danger bg-danger/10'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {showHeatmap ? '🔥 Heatmap ON' : '🔥 Heatmap OFF'}
              </button>
            </div>
            <div className="h-[500px] lg:h-[560px]">
              <CrimeMap reports={reports} showHeatmap={showHeatmap} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex bg-secondary rounded-md p-0.5">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex-1 px-3 py-1.5 text-xs font-mono rounded-sm transition-all ${
                  activeTab === 'reports' ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Recent Reports
              </button>
              <button
                onClick={() => setActiveTab('areas')}
                className={`flex-1 px-3 py-1.5 text-xs font-mono rounded-sm transition-all ${
                  activeTab === 'areas' ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Area Risk
              </button>
            </div>
            <div className="max-h-[520px] overflow-y-auto pr-1">
              {activeTab === 'reports' ? (
                <RecentReports reports={reports} />
              ) : (
                <AreaRiskPanel risks={areaRisks} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-6 pb-8 text-center">
          <div className="text-xs text-muted-foreground font-mono">
            SAFEKARACHI — Crowd-powered street safety for Karachi citizens
          </div>
          <div className="text-[10px] text-muted-foreground/60 mt-1">
            Reports auto-expire after 48 hours · Community verified data
          </div>
        </footer>
      </main>

      <ReportForm isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
};

export default Index;
