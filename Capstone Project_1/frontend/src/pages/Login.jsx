import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User, ArrowRight, CheckCircle, Zap } from 'lucide-react';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('demo_user');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login, register, loading, isSystemOnline } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password');
      return;
    }

    if (isRegister) {
      const res = await register(username, password);
      if (res.success) {
        setSuccessMsg('Account created successfully! Signing in...');
        setTimeout(() => login(username, password), 800);
      } else {
        setError(res.message);
      }
    } else {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.message);
      }
    }
  };

  const handleDemoFill = (type) => {
    if (type === 'aditi') {
      setUsername('aditi');
      setPassword('aditi1234');
    } else {
      setUsername('demo_user');
      setPassword('password123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      position: 'relative'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '36px',
        position: 'relative',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(59, 130, 246, 0.25)'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)'
          }}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', color: '#f8fafc' }}>
            FraudGuard AI
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Smart AI Fraud Detection System for Digital & QR Payments
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            style={{
              flex: 1,
              padding: '9px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: !isRegister ? '#3b82f6' : 'transparent',
              color: !isRegister ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            style={{
              flex: 1,
              padding: '9px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: isRegister ? '#3b82f6' : 'transparent',
              color: isRegister ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Register
          </button>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: '#f87171',
            fontSize: '13px',
            marginBottom: '18px',
          }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: '#34d399',
            fontSize: '13px',
            marginBottom: '18px',
          }}>
            {successMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Username / Phone ID
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="glass-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                style={{ paddingLeft: '40px' }}
              />
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Account Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="glass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '13px', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Create Secure Account' : 'Secure Login')}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Fast Autofill Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
            Quick Demo Autofill:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleDemoFill('demo')}
              className="btn-secondary"
              style={{ flex: 1, padding: '7px 10px', fontSize: '12px' }}
            >
              <Zap size={14} color="#60a5fa" /> Demo User
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('aditi')}
              className="btn-secondary"
              style={{ flex: 1, padding: '7px 10px', fontSize: '12px' }}
            >
              <Zap size={14} color="#a855f7" /> Aditi (DB User)
            </button>
          </div>
        </div>

        {/* Engine status footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
          Connected to FastAPI Backend • Port 8000
        </div>
      </div>
    </div>
  );
};
