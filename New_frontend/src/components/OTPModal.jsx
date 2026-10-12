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
      <div className="pay-card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '30px',
        position: 'relative',
        animation: 'fadeIn 0.2s ease',
        boxShadow: 'var(--shadow-float)'
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
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 152, 0, 0.15)',
            border: '1.5px solid rgba(255, 152, 0, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px'
          }}>
            <Lock size={26} color="#ff9800" />
          </div>
          <h3 style={{ fontSize: '19px', fontWeight: '800', color: '#f8fafc', marginBottom: '4px' }}>
            2-Factor Security Verification
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            AI detected unusual transaction velocity. Enter the 4-digit code to authorize payment.
          </p>
        </div>

        {/* OTP Demo Banner */}
        {currentOtpHint && (
          <div style={{
            backgroundColor: 'rgba(103, 58, 183, 0.15)',
            border: '1px solid rgba(103, 58, 183, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: '600' }}>Demo Security Code:</span>
            <span style={{
              fontSize: '17px',
              fontWeight: '800',
              letterSpacing: '3px',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#ffffff'
            }}>
              {currentOtpHint}
            </span>
          </div>
        )}

        {/* OTP Input Fields */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
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
                  width: '52px',
                  height: '56px',
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: '700',
                  fontFamily: 'JetBrains Mono, monospace',
                  backgroundColor: 'rgba(13, 15, 24, 0.8)',
                  border: `2px solid ${idx === activeIdx ? '#7c4dff' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '12px',
                  color: '#ffffff',
                  outline: 'none',
                  boxShadow: idx === activeIdx ? '0 0 15px rgba(124, 77, 255, 0.3)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#f44336',
              fontSize: '12.5px',
              marginBottom: '16px',
              justifyContent: 'center'
            }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 4}
            className="btn-pay-primary"
            style={{ width: '100%', padding: '13px', fontSize: '15px' }}
          >
            {loading ? 'Verifying with AI Engine...' : 'Authorize Payment'}
          </button>
        </form>

        {/* Resend Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '18px',
          fontSize: '12.5px',
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
                color: '#29b6f6',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={13} /> Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
