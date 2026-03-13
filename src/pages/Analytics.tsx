
import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Filter, 
  Download, 
  ChevronLeft,
  Loader2,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { INCIDENT_CONFIG, type TimeFilter, type IncidentType } from '@/types/crime';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#e63946', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

export default function Analytics() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');
  const [crimeType, setCrimeType] = useState<IncidentType | 'all'>('all');

  const { data, isLoading } = useAnalytics(timeFilter, crimeType);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background noise-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-danger animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Analyzing_Crime_Patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background noise-bg pb-12">
      {/* Header */}
      <header className="border-b border-border bg-surface-overlay/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8 hover:bg-secondary">
                <ChevronLeft size={20} />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <BarChart3 className="text-danger" size={20} />
              <h1 className="font-mono text-sm font-bold tracking-wider uppercase">Crime_Analytics</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <Button variant="outline" size="sm" className="hidden md:flex gap-2 font-mono text-[10px] uppercase h-9 border-border bg-secondary/30">
               <Download size={14} /> Export_CSV
             </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {/* Filters */}
        <section className="bg-card/30 border border-border p-4 rounded-2xl backdrop-blur-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Filter size={16} className="text-muted-foreground" />
            <div className="flex bg-secondary/50 rounded-lg p-1">
              {(['24h', '7d', '30d', 'all'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f as any)}
                  className={`px-4 py-1.5 text-[10px] font-mono rounded-md transition-all ${timeFilter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-64">
             <select 
               value={crimeType}
               onChange={(e) => setCrimeType(e.target.value as any)}
               className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2 text-xs font-mono focus:outline-none focus:border-danger/50"
             >
               <option value="all">ALL_INCIDENT_TYPES</option>
               {Object.entries(INCIDENT_CONFIG).map(([key, config]) => (
                 <option key={key} value={key}>{config.label.toUpperCase()}</option>
               ))}
             </select>
          </div>
        </section>

        {/* SECTION 1: Summary Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Reports" value={data?.totalReports || 0} icon={<TrendingUp size={20}/>} color="text-info" />
          <MetricCard title="Most Common" value={data?.mostCommonCrime || 'N/A'} icon={<Shield size={20}/>} color="text-danger" />
          <MetricCard title="Peak Time" value={data?.peakCrimeTime || 'N/A'} icon={<Clock size={20}/>} color="text-warning" />
          <MetricCard title="Top Area" value={data?.topArea || 'N/A'} icon={<MapPin size={20}/>} color="text-safe" />
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* SECTION 2: Crimes Per Day */}
          <ChartContainer title="Crime Reports Trend (Last 30 Days)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.reportsPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: '12px' }}
                  itemStyle={{ color: '#e63946' }}
                />
                <Line type="monotone" dataKey="count" stroke="#e63946" strokeWidth={2} dot={{ fill: '#e63946', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* SECTION 3: Crimes By Type */}
          <ChartContainer title="Incidents By Type">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.crimesByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" stroke="#666" fontSize={10} />
                <YAxis dataKey="type" type="category" stroke="#666" fontSize={10} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Bar dataKey="count" fill="#e63946" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* SECTION 4: Crime By Time of Day */}
          <ChartContainer title="Temporal Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.crimesByTime}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.crimesByTime.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* SECTION 5: Crime By Area */}
          <ChartContainer title="Top 5 Affected Areas">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.crimesByArea}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="area" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: { title: string, value: string | number, icon: ReactNode, color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/40 border border-border p-6 rounded-2xl backdrop-blur-sm space-y-3"
    >
      <div className={`p-2 w-fit rounded-lg bg-secondary/50 ${color}`}>{icon}</div>
      <div>
        <h3 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{title}</h3>
        <p className="text-xl font-bold font-mono tracking-tight mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

function ChartContainer({ title, children }: { title: string, children: ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card/20 border border-border p-6 rounded-2xl backdrop-blur-sm space-y-6"
    >
      <h3 className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em] border-l-2 border-danger pl-3">{title}</h3>
      {children}
    </motion.div>
  );
}
