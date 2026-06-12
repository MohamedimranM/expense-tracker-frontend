import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; currency?: string }) =>
    api.put('/auth/profile', data),
};

export const expenseAPI = {
  create: (data: any) => api.post('/expenses', data),
  getAll: (params?: any) => api.get('/expenses', { params }),
  getById: (id: string) => api.get(`/expenses/${id}`),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const dashboardAPI = {
  getDaily: (date: string) => api.get(`/dashboard/daily/${date}`),
  getWeekly: (date: string) => api.get(`/dashboard/weekly/${date}`),
  getMonthly: (year: number, month: number) =>
    api.get(`/dashboard/monthly/${year}/${month}`),
  getYearly: (year: number) => api.get(`/dashboard/yearly/${year}`),
  getOverview: () => api.get('/dashboard/overview/all'),
};

export default api;
