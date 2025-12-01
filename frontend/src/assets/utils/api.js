import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { Email: email, Password: password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/api/auth/getprofile');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response.data;
  },
};

// Service Request API functions
export const serviceRequestAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/service-requests', { params });
    return response.data;
  },
  
  getCompletedForWorker: async (workerId) => {
    const response = await api.get(`/api/service-requests/worker/${workerId}/completed`);
    return response.data;
  },
  
  accept: async (requestId) => {
    const response = await api.put(`/api/service-requests/${requestId}/accept`);
    return response.data;
  },
};

// Worker API functions
export const workerAPI = {
  listWorkers: async (params = {}) => {
    const response = await api.get('/api/workers', { params });
    return response.data;
  },
  
  getWorkerProfile: async (workerId) => {
    const response = await api.get(`/api/workers/${workerId}`);
    return response.data;
  },
  
  getMyProfile: async (workerId) => {
    const response = await api.get(`/api/workers/${workerId}`);
    return response.data;
  },
  
  updateMyProfile: async (data) => {
    const response = await api.put('/api/workers/me', data);
    return response.data;
  },
};

export default api;

