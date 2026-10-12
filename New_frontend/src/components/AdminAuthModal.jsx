import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldAlert, KeyRound, RefreshCw, X } from 'lucide-react';
import { adminAPI } from '../api/client';

export const AdminAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin security password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await adminAPI.login(password.trim());
      if (res.data?.token) {
        sessionStorage.setItem('securepay_admin_token', res.data.token);
        setPassword('');
        onSuccess(res.data.token);
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err) {
      console.error('Admin auth failed:', err);
      setError(err.message || 'Authentication failed. Please verify your admin password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 13, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 99999
    }}>
      <div style={{
        maxWidth: '380px',
        width: '100%',
        backgroundColor: '#121524',
        border: '1px solid rgba(124, 77, 255, 0.45)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(124, 77, 255, 0.25)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '8px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={15} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #7c4dff 0%, #d946ef 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
            boxShadow: '0 8px 20px rgba(124, 77, 255, 0.4)'
          }}>
            <Lock size={24} color="#ffffff" />
          </div>

          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Admin Database Access
          </h3>
          <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
            Backend MySQL Inspector & Management Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(244, 67, 54, 0.15)',
            border: '1px solid rgba(244, 67, 54, 0.4)',
            borderRadius: '10px',
            padding: '10px 12px',
            color: '#ff8a80',
            fontSize: '11.5px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={16} color="#f44336" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
              Admin Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="pay-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter backend admin password"
                style={{ paddingLeft: '36px', paddingRight: '36px', height: '42px', fontSize: '13px' }}
                autoFocus
                required
              />
              <KeyRound size={15} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{
            fontSize: '10.5px',
            color: '#64748b',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            padding: '8px 10px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            🔒 <strong>Security Policy:</strong> Password is verified securely. (Default Admin Password: <code>admin1234</code>).
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-pay-primary"
            style={{
              width: '100%',
              padding: '11px',
              fontSize: '13.5px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #7c4dff 0%, #d946ef 100%)'
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Verifying on Backend...</span>
              </>
            ) : (
              <span>Unlock Admin Panel</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
