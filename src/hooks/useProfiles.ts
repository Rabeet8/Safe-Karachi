
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('trust_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      // First delete associated reports
      await supabase
        .from('reports')
        .delete()
        .eq('user_id', profileId); // Note: profile.user_id might be needed if id != user_id

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('User and their reports removed');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
