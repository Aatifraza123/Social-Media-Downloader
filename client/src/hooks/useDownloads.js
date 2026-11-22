import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { downloadsAPI, mediaAPI, dashboardAPI, settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useDownloadsList(params = {}) {
  return useQuery({
    queryKey: ['downloads', params],
    queryFn: () => downloadsAPI.getAll(params),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardAPI.getStats(),
  });
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: () => dashboardAPI.getCharts(),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.get(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => settingsAPI.update(data),
    onSuccess: () => {
      toast.success('Settings updated');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update settings');
    },
  });
}

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
      toast.success('Download queued successfully!');
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start download');
    },
  });
}

export function useCancelDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => downloadsAPI.cancel(id),
    onSuccess: () => {
      toast.success('Download cancelled');
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel download');
    },
  });
}

export function useRetryDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => downloadsAPI.retry(id),
    onSuccess: () => {
      toast.success('Download retry queued');
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to retry download');
    },
  });
}

export function useDeleteDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => downloadsAPI.remove(id),
    onSuccess: () => {
      toast.success('Download entry deleted');
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete');
    },
  });
}

export function useBatchDownload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (urls) => mediaAPI.batchDownload(urls),
    onSuccess: (data) => {
      const results = data.data?.results || [];
      const success = results.filter(r => r.success).length;
      toast.success(`Batch submitted: ${success}/${results.length} started`);
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Batch download failed');
    },
  });
}
