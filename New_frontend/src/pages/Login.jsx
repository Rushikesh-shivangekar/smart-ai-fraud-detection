import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RefreshCw,
  CreditCard,
  KeyRound,
  Shield,
  Server,
  Settings,
  Wifi
} from 'lucide-react';
import { ServerSettingsModal } from '../components/ServerSettingsModal';

export const Login = ({ onOpenServerSettings: propOpenServerSettings }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [internalServerModal, setInternalServerModal] = useState(false);
  
  // Login fields
  const [username, setUsername] = useState('demo_user');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Feedback
  const [error, setError] = useState('');
  const [isNetworkErr, setIsNetworkErr] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register, loading, isSystemOnline, engineMode, switchEngineMode, serverUrl, checkHealth } = useAuth();

  const handleOpenSettings = () => {
    if (propOpenServerSettings) {
      propOpenServerSettings();
    } else {
      setInternalServerModal(true);
    }
  };

  // Calculate password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: '' };
    if (pwd.length < 4) return { score: 1, text: 'Too short (min 4 chars)', color: '#f44336' };
    if (pwd.length < 6) return { score: 2, text: 'Medium strength', color: '#ff9800' };
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) {
      return { score: 3, text: 'Strong password', color: '#00c853' };
    }
    return { score: 2, text: 'Good password', color: '#00897b' };
  };

  const pwdStrength = getPasswordStrength(regPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsNetworkErr(false);
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    const res = await login(username.trim(), password);
    if (!res.success) {
      setError(res.message);
      setIsNetworkErr(res.isNetworkError || res.message?.includes('Cannot reach FastAPI'));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsNetworkErr(false);
    setSuccessMsg('');

    if (!regUsername.trim()) {
      setError('Username is required.');
      return;
    }
    if (regUsername.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    const payload = {
      username: regUsername.trim().toLowerCase(),
      password: regPassword,
      full_name: regFullName.trim() || regUsername.trim(),
      email: regEmail.trim() || undefined,
      phone: regPhone.trim() || undefined,
    };

    const res = await register(payload);
    if (res.success) {
      setSuccessMsg(`Welcome, ${payload.full_name}! Registered into MySQL. Signing you in...`);
      setTimeout(async () => {
        await login(payload.username, payload.password);
      }, 1200);
    } else {
      setError(res.message);
      setIsNetworkErr(res.isNetworkError || res.message?.includes('Cannot reach FastAPI'));
    }
  };

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 14px',
      position: 'relative'
    }}>
      {/* Main Glass Authentication Card */}
      <div className="pay-card" style={{
        maxWidth: '430px',
        width: '100%',
        padding: '24px 20px',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 25px rgba(124, 77, 255, 0.25)',
        border: '1px solid rgba(124, 77, 255, 0.35)',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, rgba(26, 30, 46, 0.95) 0%, rgba(15, 18, 28, 0.98) 100%)'
      }}>
        
        {/* Top Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '16px', position: 'relative' }}>
          
          {/* Quick Server Settings Button Top Right */}
          <button
            type="button"
            onClick={handleOpenSettings}
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '6px 10px',
              color: isSystemOnline ? '#69f0ae' : '#ffb74d',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s ease'
            }}
            title="Configure Backend Server IP / URL"
          >
            <Server size={13} />
            <span>⚙️ Server IP</span>
          </button>

          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c4dff 0%, #1a73e8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
            boxShadow: '0 8px 24px rgba(124, 77, 255, 0.45)'
          }}>
            <ShieldCheck size={30} color="#ffffff" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff', margin: 0 }}>
              SecurePay UPI
            </h2>
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              padding: '2px 7px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #7c4dff 0%, #00c853 100%)',
              color: '#ffffff',
            }}>
              AI 2.0
            </span>
          </div>

          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '8px' }}>
            Smart AI Fraud Shield & Digital UPI Gateway
          </p>

          {/* Server Connection Status Pill */}
          <div 
            onClick={handleOpenSettings}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: engineMode === 'standalone' ? 'rgba(0, 200, 83, 0.15)' : (isSystemOnline ? 'rgba(0, 200, 83, 0.12)' : 'rgba(255, 152, 0, 0.15)'),
              border: `1px solid ${engineMode === 'standalone' ? 'rgba(0, 200, 83, 0.45)' : (isSystemOnline ? 'rgba(0, 200, 83, 0.35)' : 'rgba(255, 152, 0, 0.4)')}`,
              cursor: 'pointer',
              fontSize: '11px',
              color: engineMode === 'standalone' ? '#69f0ae' : (isSystemOnline ? '#69f0ae' : '#ffd54f'),
              fontWeight: '600',
              fontFamily: 'JetBrains Mono, monospace'
            }}
            title="Click to view/change engine mode or server URL"
          >
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#00c853',
              boxShadow: '0 0 8px #00c853'
            }} />
            <span>
              {engineMode === 'standalone' 
                ? '⚡ Standalone Mode: Complete App Active' 
                : (isSystemOnline ? 'Backend: Connected' : '⚡ Standalone Fallback Ready')}
            </span>
          </div>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); setIsNetworkErr(false); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '9px',
              backgroundColor: !isRegister ? '#7c4dff' : 'transparent',
              color: !isRegister ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '12.5px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: !isRegister ? '0 4px 12px rgba(124, 77, 255, 0.4)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); setIsNetworkErr(false); setSuccessMsg(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '9px',
              backgroundColor: isRegister ? '#7c4dff' : 'transparent',
              color: isRegister ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '12.5px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: isRegister ? '0 4px 12px rgba(124, 77, 255, 0.4)' : 'none'
            }}
          >
            Register New User
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(244, 67, 54, 0.15)',
            border: '1px solid rgba(244, 67, 54, 0.4)',
            borderRadius: '12px',
            padding: '12px 14px',
            color: '#ff8a80',
            fontSize: '12px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} color="#f44336" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ lineHeight: 1.4 }}>{error}</span>
            </div>

            {isNetworkErr && (
              <div style={{
                marginTop: '4px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(244, 67, 54, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#ffcdd2' }}>
                    Tip: Run the entire project directly inside this APK without any server:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      switchEngineMode('standalone');
                      setError('');
                      setIsNetworkErr(false);
                    }}
                    style={{
                      backgroundColor: '#00c853',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 8px rgba(0, 200, 83, 0.4)'
                    }}
                  >
                    <span>⚡ Use Standalone Engine</span>
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleOpenSettings}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#b388ff',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Or connect to laptop's Wi-Fi IP address...
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(0, 200, 83, 0.15)',
            border: '1px solid rgba(0, 200, 83, 0.4)',
            borderRadius: '10px',
            padding: '10px 14px',
            color: '#69f0ae',
            fontSize: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} color="#00c853" style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ----------------- SIGN IN FORM ----------------- */}
        {!isRegister ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Username / UPI ID
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="pay-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. demo_user, aditi, rushi_user"
                  style={{ paddingLeft: '38px', paddingRight: '100px' }}
                  required
                />
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <span style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontWeight: '600',
                  pointerEvents: 'none'
                }}>
                  @securepay
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Password / Security PIN
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="pay-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft: '38px', paddingRight: '38px' }}
                  required
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '11px'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Quick Demo:</span>
              <button
                type="button"
                onClick={() => { setUsername('demo_user'); setPassword('password123'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c084fc',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                demo_user (₹50,000)
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pay-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14.5px',
                marginTop: '2px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #7c4dff 0%, #1a73e8 100%)'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Connecting to Backend...</span>
                </>
              ) : (
                <>
                  <span>Sign In to SecurePay</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ----------------- REGISTER FORM ----------------- */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="pay-input"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Adarsh Sharma"
                  style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
                  required
                />
                <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Desired Username / UPI Handle
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="pay-input"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. adarsh or rahul123"
                  style={{ paddingLeft: '36px', paddingRight: '90px', height: '40px', fontSize: '13px' }}
                  required
                />
                <KeyRound size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                <span style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '11px',
                  color: '#7c4dff',
                  fontWeight: '700',
                  pointerEvents: 'none'
                }}>
                  @securepay
                </span>
              </div>
              {regUsername && (
                <span style={{ fontSize: '10.5px', color: '#00c853', marginTop: '2px', display: 'block' }}>
                  ✓ Your UPI ID: <strong>{regUsername}@securepay</strong>
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="pay-input"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@mail.com"
                    style={{ paddingLeft: '34px', height: '38px', fontSize: '12px' }}
                  />
                  <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    className="pay-input"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    style={{ paddingLeft: '34px', height: '38px', fontSize: '12px' }}
                  />
                  <Phone size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Password / UPI PIN
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  className="pay-input"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 4 characters"
                  style={{ paddingLeft: '34px', paddingRight: '34px', height: '38px', fontSize: '13px' }}
                  required
                />
                <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {pwdStrength.text && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <div style={{
                    flex: 1,
                    height: '3px',
                    borderRadius: '2px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(pwdStrength.score / 3) * 100}%`,
                      height: '100%',
                      backgroundColor: pwdStrength.color,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '10px', color: pwdStrength.color, fontWeight: '600' }}>
                    {pwdStrength.text}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  className="pay-input"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  style={{ paddingLeft: '34px', height: '38px', fontSize: '13px' }}
                  required
                />
                <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                {regConfirmPassword && (
                  <span style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '11px',
                    color: regPassword === regConfirmPassword ? '#00c853' : '#f44336',
                    fontWeight: '700'
                  }}>
                    {regPassword === regConfirmPassword ? '✓ Match' : '✗ Mismatch'}
                  </span>
                )}
              </div>
            </div>

            {/* Welcome Bonus & DB Persistence Pill */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(124, 77, 255, 0.15) 0%, rgba(0, 200, 83, 0.12) 100%)',
              border: '1px solid rgba(124, 77, 255, 0.3)',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '2px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="#ffd54f" />
                <span style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: '600' }}>
                  Initial Wallet Credit:
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#00c853' }}>
                ₹50,000.00
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pay-primary"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '14px',
                marginTop: '4px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #7c4dff 0%, #00897b 100%)'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Saving to MySQL...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Save to MySQL</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Internal Server Modal fallback if triggered independently */}
      <ServerSettingsModal
        isOpen={internalServerModal}
        onClose={() => setInternalServerModal(false)}
        onServerChanged={checkHealth}
      />
    </div>
  );
};
