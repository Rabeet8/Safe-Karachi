import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, MapPin, LogIn, LogOut, Menu, X, BarChart3, History, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatsBar } from '@/components/StatsBar';
import { CrimeMap } from '@/components/CrimeMap';
import { ReportForm } from '@/components/ReportForm';
import { RecentReports } from '@/components/RecentReports';
import { AreaRiskPanel } from '@/components/AreaRiskPanel';
import { useReports, useAllReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { computeAreaRisks } from '@/lib/riskEngine';
import { HistoricalTable } from '@/components/HistoricalTable';
import { ReplayTimeline } from '@/components/ReplayTimeline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TimeFilter, AreaRisk, Report } from '@/types/crime';

type Tab = 'reports' | 'areas';

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
  const [activeTab, setActiveTab] = useState<Tab>('reports');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaRisk | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  const { data: reports = [], isLoading } = useReports(timeFilter);
  const { data: allReports = [] } = useAllReports();
  const areaRisks = useMemo(() => computeAreaRisks(reports), [reports]);

  const [replayOpen, setReplayOpen] = useState(false);
  const [replayReports, setReplayReports] = useState<Report[]>([]);
  const [newestReportId, setNewestReportId] = useState<string | null>(null);

  const totalReports = allReports.length;
  const hotspots = areaRisks.filter(a => a.riskLevel === 'HIGH').length;

  const handleTimelineUpdate = (currentTime: Date, visible: Report[]) => {
    setReplayReports(visible);
    // Find if a new report just appeared
    if (visible.length > 0) {
      const latest = visible[visible.length - 1];
      if (latest.id !== newestReportId) {
        setNewestReportId(latest.id);
      }
    } else {
      setNewestReportId(null);
    }
  };

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
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground font-mono text-xs">
                <BarChart3 size={14} />
                Analytics
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplayOpen(!replayOpen)}
              className={`gap-1.5 font-mono text-xs transition-colors ${replayOpen ? 'text-danger bg-danger/10' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <History size={14} />
              Replay
            </Button>
            <div className="flex items-center gap-0.5 bg-secondary/80 rounded-lg p-1">
              {(['24h', '7d', '30d'] as TimeFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-3.5 py-1.5 text-xs font-mono rounded-md transition-all duration-200 ${timeFilter === f
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
                {user.email?.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase() && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="h-7 px-2 font-mono text-[10px] gap-1.5 text-danger hover:bg-danger/10 border border-danger/20">
                      <Shield size={12} />
                      ADMIN
                    </Button>
                  </Link>
                )}
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
                  className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${timeFilter === f ? 'bg-card text-foreground' : 'text-muted-foreground'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/analytics" className="w-full">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5 text-muted-foreground font-mono text-xs">
                  <BarChart3 size={14} /> Analytics
                </Button>
              </Link>
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
            </div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <StatsBar
          totalReports={totalReports}
          hotspots={hotspots}
          loading={isLoading}
        />

        {/* Map + Sidebar */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Map section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse-danger" />
                <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Operational_Tactical_Map
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMapFullscreen(true)}
                className="h-7 px-2 font-mono text-[10px] gap-1.5 bg-secondary/50 hover:bg-secondary border border-border/50"
              >
                <Maximize2 size={12} />
                FULLSCREEN
              </Button>
            </div>


            <div className="h-[400px] md:h-[500px] lg:h-[620px] relative z-0 rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
              <CrimeMap
                reports={replayOpen ? replayReports : reports}
                areaRisks={areaRisks}
                selectedReportId={selectedReportId}
                selectedArea={selectedArea}
                replayActive={replayOpen}
                newestReportId={newestReportId}
              />
            </div>
            
            <AnimatePresence>
              {replayOpen && (
                <ReplayTimeline
                  reports={reports}
                  onTimeUpdate={handleTimelineUpdate}
                  onClose={() => setReplayOpen(false)}
                />
              )}
            </AnimatePresence>

            {/* Map Fullscreen Dialog */}
            <Dialog open={isMapFullscreen} onOpenChange={setIsMapFullscreen}>
              <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] p-0 overflow-hidden border-border/20 bg-background flex flex-col">
                <DialogHeader className="p-4 border-b border-border/50 bg-black/40 backdrop-blur-md shrink-0">
                  <div className="flex items-center justify-between w-full">
                    <DialogTitle className="font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                      Tactical_Navigation_Interface
                    </DialogTitle>
                    <div className="text-[10px] font-mono text-muted-foreground mr-8 hidden sm:block">
                      COORD_MODE: ACTIVE · ZOOM_SCALE: REALTIME
                    </div>
                  </div>
                </DialogHeader>
                <div className="flex-1 relative w-full overflow-hidden">
                  <CrimeMap
                    reports={replayOpen ? replayReports : reports}
                    areaRisks={areaRisks}
                    selectedReportId={selectedReportId}
                    selectedArea={selectedArea}
                    replayActive={replayOpen}
                    newestReportId={newestReportId}
                  />
                  {replayOpen && (
                    <ReplayTimeline
                      reports={reports}
                      onTimeUpdate={handleTimelineUpdate}
                      onClose={() => setReplayOpen(false)}
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="flex bg-secondary/60 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex-1 px-3 py-2 text-xs font-mono rounded-md transition-all duration-200 ${activeTab === 'reports' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Recent Reports
              </button>
              <button
                onClick={() => setActiveTab('areas')}
                className={`flex-1 px-3 py-2 text-xs font-mono rounded-md transition-all duration-200 ${activeTab === 'areas' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Area Risk
              </button>
            </div>
            <div className="max-h-[540px] overflow-y-auto pr-0.5">
              {activeTab === 'reports' ? (
                <RecentReports
                  reports={replayOpen ? [...replayReports].reverse() : reports}
                  selectedId={selectedReportId}
                  onReportSelect={(id) => {
                    setSelectedReportId(id);
                    setSelectedArea(null);
                  }}
                />
              ) : (
                <AreaRiskPanel
                  risks={areaRisks}
                  selectedAreaName={selectedArea?.name || null}
                  onAreaSelect={(area) => {
                    setSelectedArea(area);
                    setSelectedReportId(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Historical Table Section */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-border" />
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
              Historical Records Database
            </h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <HistoricalTable />
        </section>

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
              Crowd-powered street safety · Reports expire after 30d · Community verified
            </div>
          </div>
        </footer>
      </main>

      <ReportForm isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
};

export default Index;
