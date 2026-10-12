import React, { useState, useEffect, useRef } from 'react';
import { fraudAPI } from '../api/client';
import { ShieldCheck, Lock, RefreshCw, X, AlertCircle } from 'lucide-react';

export const OTPModal = ({ isOpen, onClose, username, defaultOtp, onSuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [currentOtpHint, setCurrentOtpHint] = useState(defaultOtp || '');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (defaultOtp) {
      setCurrentOtpHint(defaultOtp);
    }
  }, [defaultOtp]);

  useEffect(() => {
    if (!isOpen) {
      setOtp(['', '', '', '']);
      setError('');
      return;
    }
    inputRefs.current[0]?.focus();
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (val, index) => {
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    setError('');

    if (val && index < 3) {
      inputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIdx(index - 1);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fraudAPI.generateOTP(username);
      if (res.data?.otp) {
        setCurrentOtpHint(res.data.otp);
        setTimer(60);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 4) {
      setError('Please enter all 4 digits of the OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fraudAPI.verifyOTP(username, fullOtp);
      if (res.data?.status === 'verified') {
        onSuccess?.();
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'OTP Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        animation: 'fadeIn 0.2s ease',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.2)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Lock size={28} color="#f59e0b" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', marginBottom: '6px' }}>
            Medium Risk Transaction Detected
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Our AI detected unusual patterns. Please enter the 4-digit One-Time Password sent to your registered device.
          </p>
        </div>

        {/* OTP Demo Banner */}
        {currentOtpHint && (
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '12.5px', color: '#93c5fd' }}>Demo Security Code:</span>
            <span style={{
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '3px',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#60a5fa'
            }}>
              {currentOtpHint}
            </span>
          </div>
        )}

        {/* OTP Input Fields */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '20px' }}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                style={{
                  width: '54px',
                  height: '60px',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  fontFamily: 'JetBrains Mono, monospace',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: `2px solid ${idx === activeIdx ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '12px',
                  color: '#f8fafc',
                  outline: 'none',
                  boxShadow: idx === activeIdx ? '0 0 15px rgba(245, 158, 11, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '16px',
              justifyContent: 'center'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || otp.join('').length !== 4}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
            }}
          >
            {loading ? 'Verifying with AI Engine...' : 'Verify OTP & Authorize Payment'}
          </button>
        </form>

        {/* Resend Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '20px',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}>
          <span>Didn't receive code?</span>
          {timer > 0 ? (
            <span>Resend in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={14} /> Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
