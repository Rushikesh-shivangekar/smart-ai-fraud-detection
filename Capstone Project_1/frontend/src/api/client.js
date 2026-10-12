import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status,
      message: error.response?.data?.detail || error.response?.data?.msg || error.message || 'An error occurred',
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

export const authAPI = {
  login: (username, password) => api.post('/login', { username, password }),
  register: (username, password) => api.post('/register', { username, password }),
};

export const fraudAPI = {
  getHealth: () => api.get('/health'),
  getDashboard: (username) => api.get(`/dashboard/${username}`),
  getTransactions: (username) => api.get(`/transactions/${username}`),
  
  scanPayment: (formData) => {
    return api.post('/scan-payment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  confirmPayment: (paymentId, username, password) => {
    return api.post('/confirm-payment', {
      payment_id: paymentId,
      username,
      password,
    });
  },

  generateOTP: (username) => api.post('/generate-otp', { username }),

  verifyOTP: (username, otp) => api.post('/verify-otp', { username, otp }),

  directPay: (paymentData) => api.post('/pay', paymentData),
};

export default api;
