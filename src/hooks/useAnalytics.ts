
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getNearestArea } from '@/lib/riskEngine';
import { INCIDENT_CONFIG, type TimeFilter, type IncidentType } from '@/types/crime';
import { startOfDay, subDays, format, parseISO, isAfter, isBefore, getHours } from 'date-fns';

export interface AnalyticsData {
  totalReports: number;
  mostCommonCrime: string;
  peakCrimeTime: string;
  topArea: string;
  reportsPerDay: { date: string; count: number }[];
  crimesByType: { type: string; count: number }[];
  crimesByTime: { name: string; value: number }[];
  crimesByArea: { area: string; count: number }[];
}

export function useAnalytics(timeFilter: TimeFilter, crimeTypeFilter: IncidentType | 'all') {
  return useQuery({
    queryKey: ['analytics', timeFilter, crimeTypeFilter],
    queryFn: async (): Promise<AnalyticsData> => {
      // Calculate 'since' date
      const now = new Date();
      let since: Date;
      if (timeFilter === '24h') since = subDays(now, 1);
      else if (timeFilter === '7d') since = subDays(now, 7);
      else if (timeFilter === '30d') since = subDays(now, 30);
      else since = new Date(0); // All time

      // Fetch reports
      let query = supabase
        .from('reports')
        .select('*')
        .neq('status', 'hidden');

      if (timeFilter !== 'all' as any) {
        query = query.gte('created_at', since.toISOString());
      }
      
      if (crimeTypeFilter !== 'all') {
        query = query.eq('incident_type', crimeTypeFilter);
      }

      const { data: reports, error } = await query;
      if (error) throw error;

      if (!reports || reports.length === 0) {
        return {
          totalReports: 0,
          mostCommonCrime: 'N/A',
          peakCrimeTime: 'N/A',
          topArea: 'N/A',
          reportsPerDay: [],
          crimesByType: [],
          crimesByTime: [],
          crimesByArea: []
        };
      }

      // 1. Summary Metrics
      const totalReports = reports.length;
      
      const typeCounts: Record<string, number> = {};
      const areaCounts: Record<string, number> = {};
      const hourlyCounts = new Array(24).fill(0);
      const dailyCounts: Record<string, number> = {};

      reports.forEach(r => {
        // Types
        typeCounts[r.incident_type] = (typeCounts[r.incident_type] || 0) + 1;
        
        // Areas
        const area = getNearestArea(r.latitude, r.longitude);
        areaCounts[area] = (areaCounts[area] || 0) + 1;
        
        // Time
        const date = parseISO(r.created_at);
        hourlyCounts[getHours(date)]++;
        
        // Daily (last 30 days specific logic generally, but we'll do for all in filter)
        const dateStr = format(date, 'yyyy-MM-dd');
        dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
      });

      const mostCommonCrimeKey = Object.entries(typeCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      const mostCommonCrime = INCIDENT_CONFIG[mostCommonCrimeKey as IncidentType]?.label || 'Other';
      
      const topArea = Object.entries(areaCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      
      const peakHour = hourlyCounts.indexOf(Math.max(...hourlyCounts));
      const peakCrimeTime = `${peakHour % 12 || 12} ${peakHour >= 12 ? 'PM' : 'AM'}`;

      // 2. Crimes Per Day (fill gaps for last 30 days)
      const reportsPerDay = Object.entries(dailyCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30); // Limit to last 30 days for the chart clarity as requested

      // 3. Crimes By Type
      const crimesByType = Object.entries(typeCounts)
        .map(([type, count]) => ({ 
          type: INCIDENT_CONFIG[type as IncidentType]?.label || type, 
          count 
        }))
        .sort((a, b) => b.count - a.count);

      // 4. Crimes By Time of Day
      const timeBuckets = {
        'Morning (6AM-12PM)': 0,
        'Afternoon (12PM-6PM)': 0,
        'Evening (6PM-10PM)': 0,
        'Night (10PM-6AM)': 0
      };

      hourlyCounts.forEach((count, hour) => {
        if (hour >= 6 && hour < 12) timeBuckets['Morning (6AM-12PM)'] += count;
        else if (hour >= 12 && hour < 18) timeBuckets['Afternoon (12PM-6PM)'] += count;
        else if (hour >= 18 && hour < 22) timeBuckets['Evening (6PM-10PM)'] += count;
        else timeBuckets['Night (10PM-6AM)'] += count;
      });

      const crimesByTime = Object.entries(timeBuckets).map(([name, value]) => ({ name, value }));

      // 5. Crimes By Area
      const crimesByArea = Object.entries(areaCounts)
        .map(([area, count]) => ({ area, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalReports,
        mostCommonCrime,
        peakCrimeTime,
        topArea,
        reportsPerDay,
        crimesByType,
        crimesByTime,
        crimesByArea
      };
    }
  });
}
