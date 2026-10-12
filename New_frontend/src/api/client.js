import axios from 'axios';
import { standaloneEngine } from './standaloneEngine';

/**
 * Checks if the current environment is running inside Capacitor (Android APK)
 * or mobile container.
 */
export const isCapacitorOrMobile = () => {
  if (typeof window === 'undefined') return false;
  if (window.location && window.location.protocol === 'capacitor:') return true;
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
    return window.Capacitor.isNativePlatform();
  }
  // If running inside Android WebView localhost without port 5173
  if (window.location && window.location.hostname === 'localhost' && !window.location.port) {
    return true;
  }
  return false;
};

/**
 * Mode of Operation:
 * 'standalone': 100% On-Device Standalone Full-Stack Engine (No external server needed)
 * 'live': Connects strictly to external FastAPI backend
 * 'auto': Tries live backend; smoothly falls back to Standalone Engine if unreachable
 */
export const getEngineMode = () => {
  try {
    const saved = localStorage.getItem('securepay_engine_mode');
    if (saved) return saved;
  } catch {}
  
  // By default on Android APK, use standalone engine so complete project works offline!
  if (isCapacitorOrMobile()) {
    return 'standalone';
  }
  return 'auto';
};

export const setEngineMode = (mode) => {
  try {
    localStorage.setItem('securepay_engine_mode', mode);
  } catch {}
  return mode;
};

/**
 * Dynamically resolves the active FastAPI Backend URL.
 */
export const getApiBaseUrl = () => {
  try {
    const saved = localStorage.getItem('securepay_api_url');
    if (saved && saved.trim()) {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch (e) {
    console.warn('localStorage not accessible:', e);
  }

  // Auto-detect IP if user opened web app on phone browser via laptop IP
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '0.0.0.0' && !host.includes('capacitor://')) {
      return `http://${host}:8000`;
    }
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return 'http://127.0.0.1:8000';
};

export const setApiBaseUrl = (newUrl) => {
  if (!newUrl || !newUrl.trim()) {
    localStorage.removeItem('securepay_api_url');
  } else {
    let clean = newUrl.trim().replace(/\/+$/, '');
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `http://${clean}`;
    }
    localStorage.setItem('securepay_api_url', clean);
  }
  const resolved = getApiBaseUrl();
  api.defaults.baseURL = resolved;
  return resolved;
};

export const resetApiBaseUrl = () => {
  localStorage.removeItem('securepay_api_url');
  const resolved = getApiBaseUrl();
  api.defaults.baseURL = resolved;
  return resolved;
};

export const testApiUrl = async (testUrl) => {
  let clean = (testUrl || getApiBaseUrl()).trim().replace(/\/+$/, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `http://${clean}`;
  }
  const startTime = Date.now();
  try {
    const res = await axios.get(`${clean}/health`, { timeout: 3500 });
    const latency = Date.now() - startTime;
    return {
      success: true,
      latency,
      status: res.status,
      data: res.data,
      url: clean,
    };
  } catch (err) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      latency,
      error: err.message || 'Connection failed',
      url: clean,
    };
  }
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentUrl = getApiBaseUrl();
    let msg = error.response?.data?.detail || error.response?.data?.msg || error.message || 'An error occurred';
    const isNetError = error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response;
    
    if (isNetError) {
      msg = `Cannot reach FastAPI backend server on ${currentUrl}.`;
    }
    
    const customError = {
      status: error.response?.status,
      message: msg,
      data: error.response?.data,
      isNetworkError: isNetError,
      serverUrl: currentUrl,
    };
    return Promise.reject(customError);
  }
);

/**
 * Universal safe execution wrapper:
 * If standalone mode is selected, or if the live backend is unreachable,
 * it runs the operation against the built-in standalone full-stack engine!
 */
const executeWithFallback = async (liveCall, standaloneCall) => {
  const mode = getEngineMode();

  if (mode === 'standalone') {
    return await standaloneCall();
  }

  try {
    return await liveCall();
  } catch (err) {
    if (mode === 'auto' && (err.isNetworkError || err.code === 'ERR_NETWORK' || !err.status)) {
      console.info('Live backend unreachable. Seamlessly activating Standalone Engine fallback.');
      return await standaloneCall();
    }
    throw err;
  }
};

export const authAPI = {
  login: (username, password) => 
    executeWithFallback(
      () => api.post('/login', { username, password }),
      () => standaloneEngine.login(username, password)
    ),

  register: (payload, legacyPassword) => {
    const regPayload = typeof payload === 'string' ? { username: payload, password: legacyPassword } : payload;
    return executeWithFallback(
      () => api.post('/register', regPayload),
      () => standaloneEngine.register(regPayload)
    );
  },

  getUsers: () => 
    executeWithFallback(
      () => api.get('/users'),
      () => standaloneEngine.getUsers()
    ),

  getUserProfile: (username) => 
    executeWithFallback(
      () => api.get(`/user-profile/${username}`),
      () => standaloneEngine.getUserProfile(username)
    ),
};

export const fraudAPI = {
  getHealth: () => 
    executeWithFallback(
      () => api.get('/health'),
      () => standaloneEngine.getHealth()
    ),

  getDashboard: (username) => 
    executeWithFallback(
      () => api.get(`/dashboard/${username}`),
      () => standaloneEngine.getDashboard(username)
    ),

  getTransactions: (username) => 
    executeWithFallback(
      () => api.get(`/transactions/${username}`),
      () => standaloneEngine.getTransactions(username)
    ),
  
  scanPayment: (formData) => 
    executeWithFallback(
      () => api.post('/scan-payment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      () => standaloneEngine.scanPayment(formData)
    ),

  confirmPayment: (paymentId, username, password) => 
    executeWithFallback(
      () => api.post('/confirm-payment', { payment_id: paymentId, username, password }),
      () => standaloneEngine.confirmPayment(paymentId, username, password)
    ),

  generateOTP: (username) => 
    executeWithFallback(
      () => api.post('/generate-otp', { username }),
      () => standaloneEngine.generateOTP(username)
    ),

  verifyOTP: (username, otp) => 
    executeWithFallback(
      () => api.post('/verify-otp', { username, otp }),
      () => standaloneEngine.verifyOTP(username, otp)
    ),

  directPay: (paymentData) => 
    executeWithFallback(
      () => api.post('/pay', paymentData),
      () => standaloneEngine.directPay(paymentData)
    ),
};

export const adminAPI = {
  login: (password) => 
    executeWithFallback(
      () => api.post('/admin/login', { password }),
      () => standaloneEngine.adminLogin(password)
    ),
  
  getStats: (token) => 
    executeWithFallback(
      () => api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
      () => standaloneEngine.getAdminStats(token)
    ),

  getTable: (tableName, search = '', token) => {
    const params = search ? `?q=${encodeURIComponent(search)}` : '';
    return executeWithFallback(
      () => api.get(`/admin/table/${tableName}${params}`, { headers: { Authorization: `Bearer ${token}` } }),
      () => standaloneEngine.getAdminTable(tableName, search, token)
    );
  },

  deleteRecord: (tableName, recordId, token) => 
    executeWithFallback(
      () => api.delete(`/admin/table/${tableName}/${recordId}`, { headers: { Authorization: `Bearer ${token}` } }),
      () => standaloneEngine.deleteAdminRecord(tableName, recordId, token)
    ),
};

export { standaloneEngine };
export default api;
