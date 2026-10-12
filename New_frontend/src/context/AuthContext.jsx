import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, fraudAPI, getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl, getEngineMode, setEngineMode } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fraud_guard_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [balance, setBalance] = useState(50000.0);
  const [stats, setStats] = useState({ transactions: 0, fraud_alerts: 0, recent_transactions: [] });
  const [isSystemOnline, setIsSystemOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverUrl, setServerUrlState] = useState(() => getApiBaseUrl());

  const [engineMode, setEngineModeState] = useState(() => getEngineMode());

  const checkHealth = useCallback(async () => {
    try {
      const res = await fraudAPI.getHealth();
      const online = res.data?.status === 'healthy' || res.status === 200;
      setIsSystemOnline(true);
      if (res.data?.mode?.includes('standalone')) {
        setEngineModeState('standalone');
      }
      return online;
    } catch {
      // In auto or standalone, system remains operational through built-in engine
      setIsSystemOnline(true);
      setEngineModeState('standalone');
      return true;
    }
  }, []);

  const switchEngineMode = (mode) => {
    setEngineMode(mode);
    setEngineModeState(mode);
    checkHealth();
  };

  const updateServerUrl = async (newUrl) => {
    const active = setApiBaseUrl(newUrl);
    setServerUrlState(active);
    await checkHealth();
    return active;
  };

  const resetServerUrl = async () => {
    const active = resetApiBaseUrl();
    setServerUrlState(active);
    await checkHealth();
    return active;
  };

  const refreshDashboard = async (username) => {
    const targetUser = username || user?.username;
    if (!targetUser) return;
    try {
      const res = await fraudAPI.getDashboard(targetUser);
      if (res.data) {
        setBalance(res.data.balance ?? 50000.0);
        setStats({
          transactions: res.data.transactions ?? 0,
          fraud_alerts: res.data.fraud_alerts ?? 0,
          recent_transactions: res.data.recent_transactions ?? [],
        });
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  useEffect(() => {
    if (user?.username) {
      refreshDashboard(user.username);
    }
  }, [user?.username]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(username, password);
      const backendUser = res.data.user || {};
      const userData = {
        id: backendUser.id,
        username: backendUser.username || username,
        full_name: backendUser.full_name || username,
        email: backendUser.email || '',
        phone: backendUser.phone || '',
        account_number: backendUser.account_number || '',
        upiId: backendUser.upi_id || `${username}@securepay`,
        created_at: backendUser.created_at || null,
      };
      setUser(userData);
      localStorage.setItem('fraud_guard_user', JSON.stringify(userData));
      await refreshDashboard(username);
      return { success: true, message: res.data.msg || 'Logged in successfully', user: userData };
    } catch (err) {
      return { 
        success: false, 
        message: err.message || 'Login failed',
        isNetworkError: err.isNetworkError || false,
        serverUrl: err.serverUrl || serverUrl
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationPayload, password) => {
    setLoading(true);
    try {
      let payload = registrationPayload;
      if (typeof registrationPayload === 'string') {
        payload = { username: registrationPayload, password };
      }
      const res = await authAPI.register(payload);
      const backendUser = res.data.user || {};
      const userData = {
        id: backendUser.id,
        username: backendUser.username || payload.username,
        full_name: backendUser.full_name || payload.full_name || payload.username,
        email: backendUser.email || payload.email || '',
        phone: backendUser.phone || payload.phone || '',
        account_number: backendUser.account_number || '',
        upiId: backendUser.upi_id || `${payload.username}@securepay`,
        created_at: backendUser.created_at || null,
      };
      return { success: true, message: res.data.msg || 'Account created successfully in MySQL database', user: userData };
    } catch (err) {
      return { 
        success: false, 
        message: err.message || 'Registration failed',
        isNetworkError: err.isNetworkError || false,
        serverUrl: err.serverUrl || serverUrl
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fraud_guard_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        balance,
        stats,
        isSystemOnline,
        engineMode,
        switchEngineMode,
        serverUrl,
        loading,
        login,
        register,
        logout,
        refreshDashboard,
        checkHealth,
        updateServerUrl,
        resetServerUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
