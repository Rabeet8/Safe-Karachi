import { useState } from 'react';
import { useAllReports } from '@/hooks/useReports';
import { useProfiles } from '@/hooks/useProfiles';
import { INCIDENT_CONFIG, type Report } from '@/types/crime';
import { format } from 'date-fns';
import { Search, Filter, ArrowUpDown, ExternalLink, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReportDetailModal } from './ReportDetailModal';
import { getNearestArea, KARACHI_AREAS } from '@/lib/riskEngine';

export function HistoricalTable() {
  const { data: reports = [], isLoading: reportsLoading } = useAllReports();
  const { data: profiles = [] } = useProfiles();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [weaponFilter, setWeaponFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      (report.location_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.weapon?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || report.incident_type === typeFilter;
    const matchesArea = areaFilter === 'all' || getNearestArea(report.latitude, report.longitude) === areaFilter;
    const matchesWeapon = weaponFilter === 'all'
      ? true
      : weaponFilter === 'armed'
        ? !!report.weapon
        : !report.weapon;

    return matchesSearch && matchesType && matchesArea && matchesWeapon;
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const getReporterName = (userId: string) => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.display_name || userId.slice(0, 8);
  };

  if (reportsLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse font-mono text-xs uppercase tracking-widest">Loading_Historical_Records...</div>;
  }

  return (
    <div className="space-y-6">
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        reporterName={selectedReport ? getReporterName(selectedReport.user_id) : undefined}
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search location, weapon or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/30 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-danger/50 transition-all font-mono placeholder:text-muted-foreground/40"
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none min-w-[140px]">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-danger/50 appearance-none cursor-pointer pr-10 text-foreground"
            >
              <option value="all" className="bg-card">ALL_INCIDENTS</option>
              {Object.entries(INCIDENT_CONFIG).map(([key, config]) => (
                <option key={key} value={key} className="bg-card">{config.label.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative flex-1 md:flex-none min-w-[140px]">
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-danger/50 appearance-none cursor-pointer pr-10 text-foreground"
            >
              <option value="all" className="bg-card">ALL_AREAS</option>
              {KARACHI_AREAS.map(area => (
                <option key={area.name} value={area.name} className="bg-card">{area.name.toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative flex-1 md:flex-none min-w-[120px]">
            <select
              value={weaponFilter}
              onChange={(e) => setWeaponFilter(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-danger/50 appearance-none cursor-pointer pr-10 text-foreground"
            >
              <option value="all" className="bg-card">WEAPON:_ALL</option>
              <option value="armed" className="bg-card text-danger">ARMED_ONLY</option>
              <option value="unarmed" className="bg-card">UNARMED</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="p-3 bg-secondary/50 border border-border rounded-xl hover:bg-secondary/80 transition-all text-muted-foreground"
            title="Sort by Date"
          >
            <ArrowUpDown size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card/30 backdrop-blur-sm shadow-xl">
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              <th className="p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60 w-32">Date</th>
              <th className="p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60 w-48">Type</th>
              <th className="p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60 w-48">Location</th>
              <th className="p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60 w-32">Weapon</th>
              <th className="p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60">Description</th>
              <th className="p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60 w-40">Posted By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredReports.map((report, idx) => (
              <motion.tr
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.005 }}
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="hover:bg-secondary/20 transition-all cursor-pointer group active:scale-[0.99]"
              >
                <td className="p-4 text-[11px] font-mono whitespace-nowrap">
                  <div className="font-bold text-foreground/80">{format(new Date(report.created_at), 'dd MMM yyyy')}</div>
                  <div className="text-[9px] opacity-40 uppercase">{format(new Date(report.created_at), 'HH:mm')}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base filter saturate-50 group-hover:saturate-100 transition-all">{INCIDENT_CONFIG[report.incident_type].icon}</span>
                    <span className="text-xs font-semibold text-foreground/90">{INCIDENT_CONFIG[report.incident_type].label}</span>
                  </div>
                </td>
                <td className="p-4 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground/90 truncate max-w-[180px]">
                      📍 {report.location_name || 'COORDS_ONLY'}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground pl-4 uppercase tracking-tighter opacity-60">
                      {getNearestArea(report.latitude, report.longitude)}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${report.weapon
                    ? 'border-danger/40 bg-danger/5 text-danger font-bold'
                    : 'border-border/30 text-muted-foreground opacity-30 italic'}`}>
                    {report.weapon || 'N/A'}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
                    {report.description || 'View details...'}
                  </p>
                </td>
                <td className="p-4">
                  <span className="text-[10px] font-mono text-info/70 bg-info/5 px-2 py-1 rounded border border-info/20 whitespace-nowrap group-hover:border-info/40 transition-all">
                    👤 {getReporterName(report.user_id)}
                  </span>
                </td>
              </motion.tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted-foreground font-mono text-xs uppercase tracking-widest">
                  Zero_Records_Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
