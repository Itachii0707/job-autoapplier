import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  return 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const uploadResume = (formData) => api.post('/profile/upload-resume', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const getSearchConfig = () => api.get('/search');
export const updateSearchConfig = (data) => api.put('/search', data);

export const getApplications = () => api.get('/applications');
export const toggleJobAutoApply = (id) => api.patch(`/applications/${id}/toggle-active`);
export const getStatsSummary = () => api.get('/applications/stats');

export const startBot = (platforms = ['linkedin']) => api.post('/automation/start', { platforms });
export const stopBot = () => api.post('/automation/stop');
export const getBotStatus = () => api.get('/automation/status');
export const getAutomationStats = () => api.get('/automation/stats');
export const getAvailablePlatforms = () => api.get('/automation/platforms');

export const getWsUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/+$/, '');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = cleanUrl.replace(/^https?:\/\//, '');
    return `${wsProtocol}//${host}/api/automation/ws/logs`;
  }
  return 'ws://127.0.0.1:8000/api/automation/ws/logs';
};

export default api;
