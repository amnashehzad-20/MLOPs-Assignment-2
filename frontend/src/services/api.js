import axios from 'axios';

// Create API instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001'
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  signup: (username, email, password) => api.post('/api/auth/signup', { username, email, password }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/api/auth/reset-password', { token, newPassword }),
  getProfile: () => api.get('/api/auth/me')
};

// Tasks API
export const tasksAPI = {
  getTasks: () => api.get('/api/tasks'),
  getTaskById: (id) => api.get(`/api/tasks/${id}`),
  createTask: (taskData) => api.post('/api/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/api/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/api/tasks/${id}`),
  updatePomodoroSession: (id, sessionData) => api.post(`/api/tasks/${id}/pomodoro`, sessionData),
  getStatistics: () => api.get('/api/tasks/statistics')
};

export default api;