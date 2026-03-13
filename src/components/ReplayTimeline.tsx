
import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, FastForward, Rewind, Clock, RotateCcw, X, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addSeconds, differenceInSeconds, startOfDay, subDays } from 'date-fns';
import type { Report, TimeFilter } from '@/types/crime';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ReplayTimelineProps {
  reports: Report[];
  onTimeUpdate: (currentTime: Date, visibleReports: Report[]) => void;
  onClose: () => void;
}

export function ReplayTimeline({ reports, onTimeUpdate, onClose }: ReplayTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [timeRange, setTimeRange] = useState<TimeFilter>('24h');
  
  // Sort reports by time
  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [reports]);

  // Determine start/end times based on filter
  const { startTime, endTime } = useMemo(() => {
    const end = new Date();
    let start = new Date(0);
    
    if (timeRange === '24h') start = subDays(end, 1);
    else if (timeRange === '7d') start = subDays(end, 7);
    else if (timeRange === '30d') start = subDays(end, 30);
    
    // If we have reports, align with first report for better experience
    if (sortedReports.length > 0) {
      const firstReport = new Date(sortedReports[0].created_at);
      if (firstReport < start) start = firstReport;
    }
    
    return { startTime: start, endTime: end };
  }, [timeRange, sortedReports]);

  const [currentTime, setCurrentTime] = useState(startTime);
  const totalDuration = differenceInSeconds(endTime, startTime);
  const playhead = differenceInSeconds(currentTime, startTime);

  // Playback logic
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      // Scale: 1 second IRL = 'speed' minutes in playback
      // Actually let's do something more dramatic: 1s IRL = (speed * hour/10)
      const incrementSeconds = speed * 3600 / 10; // Adjustable scale
      
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = addSeconds(prev, incrementSeconds);
          if (next >= endTime) {
            setIsPlaying(false);
            return endTime;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, endTime]);

  // Notify parent of visible reports
  useEffect(() => {
    const visible = sortedReports.filter(r => new Date(r.created_at) <= currentTime);
    onTimeUpdate(currentTime, visible);
  }, [currentTime, sortedReports, onTimeUpdate]);

  const handleSliderChange = (val: number[]) => {
    setCurrentTime(addSeconds(startTime, val[0]));
    setIsPlaying(false);
  };

  const reset = () => {
    setCurrentTime(startTime);
    setIsPlaying(false);
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-[500]"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="text-danger" size={18} />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">Crime_Replay_Timeline</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
              <span className="font-mono text-sm font-bold text-foreground">
                {format(currentTime, 'MMM dd, HH:mm')}
              </span>
            </div>

            <div className="flex items-center gap-1 group">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={reset}
                 className="p-2 h-9 w-9"
               >
                 <RotateCcw size={16} />
               </Button>
               <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-full p-0 flex items-center justify-center shadow-lg shadow-danger/20"
               >
                 {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
               </Button>
               
               <div className="flex bg-secondary/30 rounded-lg p-1 ml-2">
                 {[1, 5, 20].map(s => (
                   <button
                     key={s}
                     onClick={() => setSpeed(s)}
                     className={`px-3 py-1 text-[10px] font-mono rounded ${speed === s ? 'bg-card text-foreground' : 'text-muted-foreground'}`}
                   >
                     {s}x
                   </button>
                 ))}
               </div>
            </div>
          </div>

          <div className="space-y-2">
            <Slider
              value={[playhead]}
              max={totalDuration}
              step={1}
              onValueChange={handleSliderChange}
              className="py-1"
            />
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground uppercase opacity-50">
              <span>{format(startTime, 'HH:mm')}</span>
              <span>Timeline Progress</span>
              <span>{format(endTime, 'HH:mm')}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {(['24h', '7d', '30d'] as TimeFilter[]).map(f => (
            <button
              key={f}
              onClick={() => { setTimeRange(f); reset(); }}
              className={`px-3 py-1 text-[9px] font-mono rounded-full border transition-all ${timeRange === f ? 'border-danger/50 text-danger bg-danger/10' : 'border-border text-muted-foreground'}`}
            >
              RANGE:_{f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
