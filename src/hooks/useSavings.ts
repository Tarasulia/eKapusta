import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savingsOperations } from '../lib/database.js';
import { Saving } from '../types/savings.js';

export const QUERY_KEYS = {
  savings: ['savings'],
  stats: ['savings-stats'],
} as const;

// Hook to get all savings
export const useSavings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.savings,
    queryFn: savingsOperations.getAllSavings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get savings statistics
export const useSavingsStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: savingsOperations.getStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to add saving
export const useAddSaving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saving: Omit<Saving, 'id'>) => savingsOperations.addSaving(saving),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.savings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
};

// Hook to update saving
export const useUpdateSaving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, saving }: { id: number; saving: Partial<Saving> }) =>
      savingsOperations.updateSaving(id, saving),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.savings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
};

// Hook to delete saving
export const useDeleteSaving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => savingsOperations.deleteSaving(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.savings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
    },
  });
};
