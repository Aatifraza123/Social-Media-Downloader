import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject({ message, status: error.response?.status, errors: error.response?.data?.errors });
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
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
  cancel: (id) => api.post(`/downloads/${id}/cancel`),
  retry: (id) => api.post(`/downloads/${id}/retry`),
  remove: (id) => api.delete(`/downloads/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getCharts: () => api.get('/dashboard/charts'),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.patch('/settings', data),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
