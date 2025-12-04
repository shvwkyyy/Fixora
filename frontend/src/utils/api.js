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

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
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
    // Map frontend fields to backend expected format
    const backendData = {
      firstName: userData.FName || userData.firstName,
      lastName: userData.LName || userData.lastName,
      email: userData.Email || userData.email,
      password: userData.Password || userData.password,
      phone: userData.Phone || userData.phone,
      city: userData.City || userData.city,
      area: userData.Area || userData.area,
      userType: userData.UserType || userData.userType || 'user',
    };
    const response = await api.post('/api/auth/register', backendData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
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
    localStorage.removeItem('user');
    return response.data;
  },
};

// Service Request API functions
export const serviceRequestAPI = {
  create: async (problemDescription) => {
    const response = await api.post('/api/service-requests', { problemDescription });
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/api/service-requests', { params });
    return response.data;
  },

  getById: async (requestId) => {
    const response = await api.get(`/api/service-requests/${requestId}`);
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
  
  getMyProfile: async () => {
    const response = await api.get('/api/workers/me');
    return response.data;
  },
  
  updateMyProfile: async (data) => {
    // Map frontend fields to backend expected format
    const backendData = {
      specialty: data.specialty,
      hourPrice: data.hourlyRate || data.hourPrice,
      facebookAccount: data.facebook || data.facebookAccount,
      tiktokAccount: data.tiktok || data.tiktokAccount,
      linkedinAccount: data.linkedin || data.linkedinAccount,
      nationalIdFront: data.nationalIdFront,
      nationalIdBack: data.nationalIdBack,
      nationalIdWithFace: data.idSelfie || data.nationalIdWithFace,
    };
    const response = await api.put('/api/workers/me', backendData);
    return response.data;
  },
};

// User API functions
export const userAPI = {
  getMe: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  updateMe: async (data) => {
    const response = await api.put('/api/users/me', data);
    return response.data;
  },
};

// Review API functions
export const reviewAPI = {
  create: async (workerId, rating, comment = '') => {
    const response = await api.post('/api/reviews', { workerId, rating, comment });
    return response.data;
  },

  getWorkerReviews: async (workerId, params = {}) => {
    const response = await api.get(`/api/reviews/worker/${workerId}`, { params });
    return response.data;
  },

  delete: async (reviewId) => {
    const response = await api.delete(`/api/reviews/${reviewId}`);
    return response.data;
  },
};

// Message API functions
export const messageAPI = {
  sendMessage: async (receiverId, contentText, contentImage = null) => {
    const response = await api.post('/api/messages', { receiverId, contentText, contentImage });
    return response.data;
  },

  getConversations: async () => {
    const response = await api.get('/api/messages/conversations');
    return response.data;
  },

  getMessages: async (otherUserId) => {
    const response = await api.get(`/api/messages/conversation/${otherUserId}`);
    return response.data;
  },
};

export default api;

