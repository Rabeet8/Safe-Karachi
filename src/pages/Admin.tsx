import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReports, useUpdateReportStatus } from '@/hooks/useReports';
import { useProfiles, useDeleteProfile } from '@/hooks/useProfiles';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Clock, Trash2, Users, FileText, Star, ShieldAlert, UserMinus } from 'lucide-react';
import { INCIDENT_CONFIG } from '@/types/crime';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: reports = [] } = useReports('30d');
  const { data: profiles = [], isLoading: profilesLoading } = useProfiles();
  const updateStatus = useUpdateReportStatus();
  const deleteProfile = useDeleteProfile();

  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');

  // RESTRICT ACCESS TO ONE SPECIFIC EMAIL
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL && !!ADMIN_EMAIL;

  if (authLoading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono gap-4">
      <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="animate-pulse tracking-widest text-xs uppercase opacity-50">VERIFYING_CREDENTIALS...</span>
    </div>
  );

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 noise-bg">
        <div className="max-w-md w-full bg-card/50 backdrop-blur-xl border border-border p-8 rounded-2xl text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-danger/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <ShieldAlert size={56} className="mx-auto text-danger mb-6 animate-pulse-danger" />
          <h1 className="text-2xl font-black mb-2 tracking-tighter uppercase italic text-foreground">ACCESS_DENIED</h1>

          <div className="bg-secondary/40 rounded-xl p-4 mb-8 border border-border/50">
            <p className="text-muted-foreground text-[10px] mb-3 uppercase tracking-[0.2em] leading-relaxed opacity-70 font-mono">
              {!ADMIN_EMAIL 
                ? "CONFIGURATION_ERROR: ADMIN_EMAIL_NOT_SET"
                : user
                  ? "SECURITY_BREACH: UNAUTHORIZED_PERSONNEL_DETECTED"
                  : "PROTOCOL_REQUIRED: AUTHENTICATION_SEQUENCE_INCOMPLETE"}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {!user ? (
              <Button
                variant="destructive"
                className="font-mono text-[10px] tracking-widest h-11 shadow-lg shadow-danger/20 rounded-xl"
                onClick={() => window.location.href = '/auth'}
              >
                AUTHORIZE_LOGIN
              </Button>
            ) : (
              <>
                <Button
                  variant="destructive"
                  className="font-mono text-[10px] tracking-widest h-11 rounded-xl"
                  onClick={() => signOut()}
                >
                  TERMINATE_SESSION_&_RETRY
                </Button>
                <Button
                  variant="outline"
                  className="font-mono text-[10px] tracking-widest h-11 border-border/50 hover:bg-secondary rounded-xl"
                  onClick={() => window.location.href = '/'}
                >
                  RETURN_TO_BASE
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleReportAction = (reportId: string, status: 'verified' | 'hidden') => {
    updateStatus.mutate({ reportId, status });
  };

  const handleDeleteUser = (profileId: string) => {
    if (window.confirm("Are you sure you want to delete this user and all their reports? This action cannot be undone.")) {
      deleteProfile.mutate(profileId);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="text-danger" size={20} />
              <h1 className="text-2xl font-bold font-mono tracking-tighter uppercase italic">Control_Center.v1</h1>
            </div>
            <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest opacity-60">
              System Administrator: {user?.email}
            </p>
          </div>

          <div className="flex bg-secondary/80 rounded-xl p-1.5 border border-border/50">
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg transition-all ${activeTab === 'reports' ? 'bg-card text-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <FileText size={14} /> REPORTS
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg transition-all ${activeTab === 'users' ? 'bg-card text-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Users size={14} /> USERS
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'reports' ? (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono font-bold text-muted-foreground tracking-widest uppercase">Report_Management</h2>
                <div className="flex bg-secondary/50 rounded-lg p-1">
                  {(['all', 'pending', 'verified'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 text-[10px] font-mono rounded-md transition-all ${filter === f ? 'bg-card text-foreground' : 'text-muted-foreground'
                        }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {filteredReports.map((report, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    key={report.id}
                    className="bg-card/50 border border-border/50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl flex-shrink-0 border border-border/50 shadow-inner">
                        {INCIDENT_CONFIG[report.incident_type].icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {INCIDENT_CONFIG[(report as any).incident_type].label}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold uppercase ${(report as any).status === 'verified' ? 'bg-safe/10 text-safe' : 'bg-warning/10 text-warning'
                            }`}>
                            {(report as any).status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2 max-w-xl">{(report as any).description || 'N_A'}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground/40 font-mono">
                          <span className="flex items-center gap-1"><Clock size={10} /> {formatDistanceToNow(new Date((report as any).created_at), { addSuffix: true })}</span>
                          <span>📍 {(report as any).location_name || 'UNK_LOC'}</span>
                          <span className="text-info/60 flex items-center gap-1 bg-info/5 px-2 py-0.5 rounded border border-info/10">
                            👤 POSTED_BY: <span className="text-foreground">
                              {profiles.find(p => p.user_id === (report as any).user_id)?.display_name || (report as any).user_id.slice(0, 8)}
                            </span>
                          </span>
                        </div>
                      </div>
                      {(report as any).image_url && (
                        <a
                          href={(report as any).image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <div className="w-16 h-16 rounded-xl border border-border overflow-hidden bg-secondary shadow-sm hover:border-danger/30 transition-colors">
                            <img src={(report as any).image_url} alt="Evidence" className="w-full h-full object-cover" />
                          </div>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {report.status !== 'verified' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 md:flex-none h-8 text-[10px] font-mono text-safe hover:bg-safe/10 gap-1.5 border border-safe/20"
                          onClick={() => handleReportAction(report.id, 'verified')}
                        >
                          <CheckCircle size={12} /> VERIFY
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 md:flex-none h-8 text-[10px] font-mono text-danger hover:bg-danger/10 gap-1.5 border border-danger/20"
                        onClick={() => handleReportAction(report.id, 'hidden')}
                      >
                        <Trash2 size={12} /> REMOVE
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {filteredReports.length === 0 && (
                  <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl bg-secondary/10">
                    <p className="text-xs text-muted-foreground font-mono uppercase tracking-[0.2em]">Zero_Records_Found</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h2 className="text-sm font-mono font-bold text-muted-foreground tracking-widest uppercase">User_Registry</h2>

              <div className="grid gap-3">
                {profiles.map((profile, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    key={profile.id}
                    className="bg-card/50 border border-border/50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-border/80 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-mono border border-border/50">
                        {(profile.display_name || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-sm">{profile.display_name || 'Anonymous User'}</span>
                          <div className="flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                            <Star size={10} className="text-warning fill-warning" />
                            <span className="text-[10px] font-mono font-bold">{profile.trust_score}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60 font-mono">
                          <span>REG_ID: {profile.id.slice(0, 8)}</span>
                          <span>REP_TODAY: {profile.reports_today}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 md:flex-none h-9 text-[10px] font-mono text-danger hover:bg-danger/10 gap-2 border border-danger/20"
                        onClick={() => handleDeleteUser(profile.id)}
                        disabled={deleteProfile.isPending}
                      >
                        <UserMinus size={14} /> DELETE_USER
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {profiles.length === 0 && (
                  <div className="text-center py-20 border border-dashed border-border/50 rounded-2xl">
                    <p className="text-xs text-muted-foreground font-mono">FETCHING_USER_DATA...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;
