import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, MapPin, LogIn, LogOut, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: reports = [], isLoading } = useReports(timeFilter);
  const areaRisks = useMemo(() => computeAreaRisks(reports), [reports]);

  const totalReports = reports.length;
  const verifiedCount = reports.filter(r => r.status === 'verified').length;
  const hotspots = areaRisks.filter(a => a.riskLevel === 'HIGH').length;
  const verifiedRate = totalReports > 0 ? Math.round((verifiedCount / totalReports) * 100) : 0;

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface-overlay/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-danger/15 flex items-center justify-center">
                <Shield size={18} className="text-danger" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger rounded-full animate-pulse-danger" />
            </div>
            <div>
              <span className="font-mono text-sm font-bold tracking-wider text-foreground">
                SAFE<span className="text-danger">KARACHI</span>
              </span>
              <div className="text-[10px] text-muted-foreground -mt-0.5 tracking-wide">Community Safety Network</div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-0.5 bg-secondary/80 rounded-lg p-1">
              {(['24h', '7d', '30d'] as TimeFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-3.5 py-1.5 text-xs font-mono rounded-md transition-all duration-200 ${
                    timeFilter === f
                      ? 'bg-card text-foreground shadow-sm'
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
              className="gap-1.5 bg-danger hover:bg-danger/90 text-danger-foreground font-mono text-xs rounded-lg shadow-lg shadow-danger/20"
            >
              <AlertTriangle size={13} />
              Report Incident
            </Button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-mono text-foreground">
                  {(profile?.display_name || user.email || '?')[0].toUpperCase()}
                </div>
                <span className="hidden lg:inline text-xs text-muted-foreground font-mono">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground h-7 w-7 p-0">
                  <LogOut size={14} />
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

          {/* Mobile menu toggle */}
          <button className="md:hidden text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="md:hidden border-t border-border px-4 py-3 space-y-3 bg-surface-overlay"
          >
            <div className="flex items-center gap-1 bg-secondary/80 rounded-lg p-1 w-fit">
              {(['24h', '7d', '30d'] as TimeFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                    timeFilter === f ? 'bg-card text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => { setReportOpen(true); setMobileMenuOpen(false); }} size="sm" className="bg-danger hover:bg-danger/90 text-danger-foreground font-mono text-xs rounded-lg">
                <AlertTriangle size={13} className="mr-1.5" /> Report
              </Button>
              {user ? (
                <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
                  <LogOut size={14} className="mr-1.5" /> Sign Out
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-muted-foreground font-mono text-xs">
                    <LogIn size={14} className="mr-1.5" /> Login
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <StatsBar
          totalReports={totalReports}
          hotspots={hotspots}
          verifiedRate={verifiedRate}
          loading={isLoading}
        />

        {/* Map + Sidebar */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-5">
          {/* Map section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse-danger" />
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Live Crime Map
                </h2>
              </div>
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                  showHeatmap
                    ? 'border-danger/30 text-danger bg-danger/10'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {showHeatmap ? '🔥 Heatmap ON' : '🔥 Heatmap OFF'}
              </button>
            </div>
            <div className="h-[480px] lg:h-[580px] relative z-0">
              <CrimeMap reports={reports} showHeatmap={showHeatmap} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="flex bg-secondary/60 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex-1 px-3 py-2 text-xs font-mono rounded-md transition-all duration-200 ${
                  activeTab === 'reports' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Recent Reports
              </button>
              <button
                onClick={() => setActiveTab('areas')}
                className={`flex-1 px-3 py-2 text-xs font-mono rounded-md transition-all duration-200 ${
                  activeTab === 'areas' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Area Risk
              </button>
            </div>
            <div className="max-h-[540px] overflow-y-auto pr-0.5">
              {activeTab === 'reports' ? (
                <RecentReports reports={reports} />
              ) : (
                <AreaRiskPanel risks={areaRisks} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border pt-8 pb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-danger" />
              <span className="text-xs text-muted-foreground font-mono">
                SAFE<span className="text-danger">KARACHI</span>
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground/60 text-center sm:text-right">
              Crowd-powered street safety · Reports expire after 48h · Community verified
            </div>
          </div>
        </footer>
      </main>

      <ReportForm isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
};

export default Index;
