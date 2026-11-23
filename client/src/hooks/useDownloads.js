import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaAPI, downloadsAPI, dashboardAPI, settingsAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useAnalyzeUrl() {
  return useMutation({
    mutationFn: (url) => mediaAPI.analyze(url),
    onError: (error) => {
      toast.error(error.message || 'Failed to analyze URL');
    },
  });
}

export function useStartDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => mediaAPI.download(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Ingestion pipeline initialized');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start download');
    },
  });
}

export function useBatchDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (urls) => mediaAPI.batchDownload(urls),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      const results = data.data?.results || [];
      const success = results.filter((r) => r.success).length;
      toast.success(`Batch submitted: ${success}/${results.length} scheduled`);
    },
    onError: (error) => {
      toast.error(error.message || 'Batch download failed');
    },
  });
}

export function useDownloadsList(params = {}) {
  return useQuery({
    queryKey: ['downloads', params],
    queryFn: () => downloadsAPI.getAll(params),
    refetchInterval: 10000,
  });
}

export function useDeleteDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => downloadsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Record purged from storage and database');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete record');
    },
  });
}

export function useRetryDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => downloadsAPI.retry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      toast.success('Retrying download pipeline');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to retry download');
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats(),
    refetchInterval: 15000,
  });
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: () => dashboardAPI.getCharts(),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.get(),
  });
}

export function useBranding() {
  return useQuery({
    queryKey: ['branding'],
    queryFn: () => authAPI.getBranding(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => settingsAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['branding'] });
      toast.success('System settings saved');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings');
    },
  });
}
