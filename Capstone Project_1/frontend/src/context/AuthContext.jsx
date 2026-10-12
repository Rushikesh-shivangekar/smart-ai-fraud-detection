import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, fraudAPI } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fraud_guard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [balance, setBalance] = useState(50000.0);
  const [stats, setStats] = useState({ transactions: 0, fraud_alerts: 0, recent_transactions: [] });
  const [isSystemOnline, setIsSystemOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    try {
      const res = await fraudAPI.getHealth();
      setIsSystemOnline(res.data?.status === 'healthy' || res.status === 200);
    } catch {
      setIsSystemOnline(false);
    }
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
  }, []);

  useEffect(() => {
    if (user?.username) {
      refreshDashboard(user.username);
    }
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(username, password);
      const userData = { username: res.data.username || username, upiId: `${username}@securepay` };
      setUser(userData);
      localStorage.setItem('fraud_guard_user', JSON.stringify(userData));
      await refreshDashboard(username);
      return { success: true, message: res.data.msg || 'Logged in successfully' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password) => {
    setLoading(true);
    try {
      const res = await authAPI.register(username, password);
      return { success: true, message: res.data.msg || 'Account created successfully' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
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
        loading,
        login,
        register,
        logout,
        refreshDashboard,
        checkHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
