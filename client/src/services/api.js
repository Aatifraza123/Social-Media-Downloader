import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Attach Authorization header from localStorage if available (dual Cookie + Bearer support)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({ message, status: error.response?.status, errors: error.response?.data?.errors });
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  getBranding: () => api.get('/auth/branding'),
};

export const mediaAPI = {
  analyze: (url) => api.post('/media/analyze', { url }),
  download: (data) => api.post('/media/download', data),
  batchDownload: (urls) => api.post('/media/batch', { urls }),
};

export const downloadsAPI = {
  getAll: (params) => api.get('/downloads', { params }),
  getOne: (id) => api.get(`/downloads/${id}`),
  getFileUrl: (id) => `/api/downloads/${id}/file`,
  getFile: async (id, filename) => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(`/api/downloads/${id}/file`, {
      responseType: 'blob',
      withCredentials: true,
      headers,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'downloaded-media.mp4');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  cancel: (id) => api.post(`/downloads/${id}/cancel`),
  retry: (id) => api.post(`/downloads/${id}/retry`),
  delete: (id) => api.delete(`/downloads/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getCharts: () => api.get('/dashboard/charts'),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export default api;
