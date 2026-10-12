import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  ArrowRight,
  Wallet
} from 'lucide-react';

export const CheckBalanceModal = ({ isOpen, onClose, onBalanceRevealed }) => {
  const { user, balance, refreshDashboard } = useAuth();
  const [pin, setPin] = useState(['', '', '', '']);
  const [activeIdx, setActiveIdx] = useState(0);
  const [status, setStatus] = useState('pin'); // 'pin' | 'loading' | 'success'
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      setPin(['', '', '', '']);
      setStatus('pin');
      setError('');
      return;
    }
    setStatus('pin');
    setPin(['', '', '', '']);
    setError('');
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeypadPress = (digit) => {
    if (status !== 'pin') return;
    const emptyIdx = pin.findIndex((val) => val === '');
    if (emptyIdx !== -1) {
      const newPin = [...pin];
      newPin[emptyIdx] = digit;
      setPin(newPin);
      setError('');
      if (emptyIdx < 3) {
        inputRefs.current[emptyIdx + 1]?.focus();
        setActiveIdx(emptyIdx + 1);
      }
    }
  };

  const handleBackspace = () => {
    if (status !== 'pin') return;
    const lastFilledIdx = pin.map((v) => v !== '').lastIndexOf(true);
    if (lastFilledIdx !== -1) {
      const newPin = [...pin];
      newPin[lastFilledIdx] = '';
      setPin(newPin);
      inputRefs.current[lastFilledIdx]?.focus();
      setActiveIdx(lastFilledIdx);
      setError('');
    }
  };

  const handleInputChange = (val, index) => {
    if (isNaN(val)) return;
    const newPin = [...pin];
    newPin[index] = val.slice(-1);
    setPin(newPin);
    setError('');

    if (val && index < 3) {
      inputRefs.current[index + 1]?.focus();
      setActiveIdx(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIdx(index - 1);
    }
  };

  const verifyPinAndCheck = async () => {
    const enteredPin = pin.join('');
    if (enteredPin.length < 4) {
      setError('Please enter your 4-digit UPI PIN');
      return;
    }

    setStatus('loading');
    setError('');

    // Fetch latest balance from backend
    await refreshDashboard();

    setTimeout(() => {
      setStatus('success');
      if (onBalanceRevealed) onBalanceRevealed();
    }, 600);
  };

  const handleFastDemoCheck = () => {
    setPin(['1', '2', '3', '4']);
    setStatus('loading');
    setTimeout(async () => {
      await refreshDashboard();
      setStatus('success');
      if (onBalanceRevealed) onBalanceRevealed();
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '16px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div className="pay-card" style={{
        maxWidth: '430px',
        width: '100%',
        padding: '28px 24px',
        position: 'relative',
        boxShadow: 'var(--shadow-float)',
        border: '1px solid rgba(103, 58, 183, 0.35)',
        background: 'linear-gradient(180deg, #16192b 0%, #0d0f18 100%)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        {/* Bank Header Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                HDFC Bank
              </h3>
              <span style={{
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa'
              }}>
                PRIMARY
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Savings Account •••• 4092
            </p>
          </div>
        </div>

        {/* State 1: Enter UPI PIN */}
        {status === 'pin' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#f8fafc' }}>
                Enter 4-Digit UPI PIN
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Protected by End-to-End UPI & AI Fraud Guard
              </p>
            </div>

            {/* PIN Input Dots / Boxes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '18px' }}>
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  style={{
                    width: '50px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: '800',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${digit ? '#7c4dff' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '12px',
                    color: '#ffffff',
                    outline: 'none',
                    boxShadow: digit ? '0 0 12px rgba(124, 77, 255, 0.35)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>

            {error && (
              <div style={{ color: '#f44336', fontSize: '12px', textAlign: 'center', marginBottom: '14px' }}>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={verifyPinAndCheck}
              disabled={pin.join('').length !== 4}
              className="btn-pay-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14.5px', marginBottom: '10px' }}
            >
              Verify PIN & Fetch Balance
            </button>

            {/* Fast 1-Click Demo Fill */}
            <button
              type="button"
              onClick={handleFastDemoCheck}
              style={{
                width: '100%',
                padding: '9px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-sm)',
                color: '#c084fc',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} /> 1-Click Instant Check (Demo)
            </button>
          </div>
        )}

        {/* State 2: Loading Animation */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(124, 77, 255, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
              marginBottom: '14px'
            }}>
              <RefreshCw size={28} className="animate-spin-slow" />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
              Fetching Live Bank Balance...
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Communicating securely with HDFC Bank Core CBS
            </p>
          </div>
        )}

        {/* State 3: Success Balance Display */}
        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(0, 200, 83, 0.15)',
              border: '1px solid rgba(0, 200, 83, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00c853',
              marginBottom: '12px'
            }}>
              <CheckCircle2 size={30} />
            </div>

            <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Available Bank Balance
            </span>

            <div style={{
              fontSize: '34px',
              fontWeight: '800',
              fontFamily: 'Outfit, sans-serif',
              color: '#ffffff',
              margin: '6px 0 16px 0',
              letterSpacing: '-0.02em'
            }}>
              ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>

            <div style={{
              backgroundColor: 'rgba(0, 200, 83, 0.08)',
              border: '1px solid rgba(0, 200, 83, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <ShieldCheck size={18} color="#00e676" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '11.5px', color: '#e2e8f0' }}>
                <strong>Account Secured:</strong> Zero liability protection with real-time AI anomaly detection active.
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn-pay-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14.5px' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
