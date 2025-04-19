import axios from 'axios';

// Create base API instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration or unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Task management
export const taskApi = {
  getStatus: (taskId: string) => api.get(`/tasks/${taskId}`),
  cancel: (taskId: string) => api.post(`/tasks/${taskId}/cancel`),
};

// Investigation management
export const investigationApi = {
  create: (data: any) => api.post('/investigations', data),
  getAll: () => api.get('/investigations'),
  getById: (id: string) => api.get(`/investigations/${id}`),
  update: (id: string, data: any) => api.put(`/investigations/${id}`, data),
  delete: (id: string) => api.delete(`/investigations/${id}`),
};

// Profile data
export const profileApi = {
  getById: (id: string) => api.get(`/profiles/${id}`),
  search: (params: any) => api.get('/profiles/search', { params }),
};

// Tools and integrations
export const toolsApi = {
  runEmailScan: (email: string) => api.post('/tools/email-scan', { email }),
  runPhoneScan: (phone: string) => api.post('/tools/phone-scan', { phone }),
  runSocialScan: (username: string) => api.post('/tools/social-scan', { username }),
  runAddressScan: (address: string) => api.post('/tools/address-scan', { address }),
  runImageScan: (imageUrl: string) => api.post('/tools/image-scan', { imageUrl }),
};