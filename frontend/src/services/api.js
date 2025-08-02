import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Login failed';
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Registration failed';
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
};

// Wallet API
export const walletAPI = {
  getWallet: async (userId) => {
    try {
      const response = await api.get(`/wallets/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch wallet';
    }
  },
};

// Transaction API
export const transactionAPI = {
  credit: async (walletId, amount) => {
    try {
      const response = await api.post('/transactions/credit', null, {
        params: { walletId, amount },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Credit transaction failed';
    }
  },

  debit: async (walletId, amount) => {
    try {
      const response = await api.post('/transactions/debit', null, {
        params: { walletId, amount },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Debit transaction failed';
    }
  },

  transfer: async (receiverWalletId, amount) => {
    try {
      const response = await api.post('/transactions/transfer', null, {
        params: { receiverWalletId, amount },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Transfer failed';
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to fetch dashboard data';
    }
  },
};

export default api; 