import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { TimeFilter, IncidentType, Report } from '@/types/crime';
import { toast } from 'sonner';

export function useReports(timeFilter: TimeFilter) {
  const hours = timeFilter === '24h' ? 24 : timeFilter === '7d' ? 168 : 720;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  return useQuery({
    queryKey: ['reports', timeFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .gte('created_at', since)
        .neq('status', 'hidden')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Report[];
    },
    refetchInterval: 30000,
  });
}

export function useAllReports() {
  return useQuery({
    queryKey: ['all-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .neq('status', 'hidden')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Report[];
    },
    refetchInterval: 60000,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (report: {
      incident_type: IncidentType;
      latitude: number;
      longitude: number;
      location_name?: string;
      description?: string;
      weapon?: string;
      image_url?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('reports')
        .insert({ ...report, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report submitted successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useVoteReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ reportId, voteType }: { reportId: string; voteType: 'confirm' | 'reject' }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('confirmations')
        .insert({ report_id: reportId, user_id: user.id, vote_type: voteType });
      if (error) {
        if (error.code === '23505') throw new Error('You already voted on this report');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Vote recorded');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useUploadEvidence() {
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2, 11)}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('evidence').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('evidence').getPublicUrl(fileName);
      return data.publicUrl;
    },
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: 'verified' | 'hidden' }) => {
      const { data, error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report updated successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
