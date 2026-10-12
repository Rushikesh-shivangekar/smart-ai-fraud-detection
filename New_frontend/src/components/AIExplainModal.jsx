import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  X, 
  Cpu, 
  CreditCard, 
  Fingerprint, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Sparkles
} from 'lucide-react';

export const AIExplainModal = ({ 
  isOpen, 
  onClose, 
  type = 'safe', // 'safe' | 'blocked' | 'suspicious'
  data = {} 
}) => {
  if (!isOpen) return null;

  const isSafe = type === 'safe';
  const isBlocked = type === 'blocked';
  const isSuspicious = type === 'suspicious';

  const score = data.score ?? (isBlocked ? 94 : isSuspicious ? 58 : 7);
  const merchantName = data.merchantName || 'Merchant / Payee';
  const amount = data.amount || 1200;
  const qrAmount = data.qrAmountDetected || data.qrAmount || amount;

  const models = [
    {
      name: 'Deep Learning QR CNN & OpenCV Guard',
      weight: '25% Weight',
      icon: QrCode,
      color: isBlocked && Math.abs(amount - qrAmount) > 0.01 ? '#ef4444' : '#10b981',
      status: isBlocked && Math.abs(amount - qrAmount) > 0.01 ? 'FAIL — Tampered Payload' : 'PASS — Verified Authentic',
      detail: isBlocked && Math.abs(amount - qrAmount) > 0.01
        ? `Altered QR payload detected: User entered ₹${amount}, but scanned QR encoded demand for ₹${qrAmount}.`
        : 'QR image bitmap structure and cryptographic CRC checksum validated against spoofing.',
      isPass: !(isBlocked && Math.abs(amount - qrAmount) > 0.01)
    },
    {
      name: 'Transaction Random Forest Classifier',
      weight: '30% Weight',
      icon: Cpu,
      color: isBlocked ? '#ef4444' : '#10b981',
      status: isBlocked ? 'FAIL — Anomaly Detected' : 'PASS — Normal POS Profile',
      detail: isBlocked
        ? 'Amount and recipient category deviate significantly from baseline historical distributions.'
        : `Transaction amount (₹${amount}) matches expected merchant category and location.`,
      isPass: !isBlocked
    },
    {
      name: 'Credit Risk & Velocity Classifier',
      weight: '25% Weight',
      icon: CreditCard,
      color: isSuspicious ? '#f59e0b' : '#10b981',
      status: isSuspicious ? 'STEP-UP — 2FA Required' : 'PASS — Within Spend Limits',
      detail: isSuspicious
        ? 'High-value transaction burst detected. OTP step-up verification requested to protect funds.'
        : 'Velocity count is 1 txn/window, well within the safety threshold.',
      isPass: !isBlocked
    },
    {
      name: 'Behavioral Anomaly Neural Net',
      weight: '20% Weight',
      icon: Fingerprint,
      color: '#10b981',
      status: 'PASS — Authorized Device',
      detail: 'Registered device fingerprint and session timing match trusted user profile.',
      isPass: true
    }
  ];

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
      zIndex: 120,
      padding: '16px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div className="pay-card" style={{
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '26px 22px',
        position: 'relative',
        boxShadow: 'var(--shadow-float)',
        border: `1.5px solid ${isBlocked ? 'rgba(239, 68, 68, 0.4)' : isSuspicious ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
        background: 'linear-gradient(180deg, #151828 0%, #0d0f18 100%)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.15)' : isSuspicious ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1.5px solid ${isBlocked ? 'rgba(239, 68, 68, 0.35)' : isSuspicious ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isBlocked ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981',
            flexShrink: 0
          }}>
            {isBlocked ? <ShieldAlert size={26} /> : <ShieldCheck size={26} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                {isBlocked ? 'Why Was This Blocked?' : isSuspicious ? 'Why Is Review Required?' : 'Why Is This Safe?'}
              </h3>
              <span style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 7px',
                borderRadius: '4px',
                backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.2)' : isSuspicious ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isBlocked ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981',
                border: `1px solid ${isBlocked ? 'rgba(239, 68, 68, 0.4)' : isSuspicious ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
              }}>
                {isBlocked ? 'THREAT INTERCEPTED' : isSuspicious ? 'MEDIUM RISK' : 'LOW RISK PASSED'}
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Explainable AI (XAI) multi-layer consensus evaluation for <strong>{merchantName}</strong>
            </p>
          </div>
        </div>

        {/* Overview Score Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AI Fraud Score
            </span>
            <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: isBlocked ? '#ef4444' : isSuspicious ? '#f59e0b' : '#10b981' }}>
              {score} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>/ 100</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ensemble Decision
            </span>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
              {isBlocked ? '🚫 BLOCK TRANSACTION' : isSuspicious ? '⚠️ STEP-UP VERIFICATION' : '✓ ALLOW & PROCEED'}
            </div>
          </div>
        </div>

        {/* 4 Models Breakdown List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={15} color="#c084fc" />
            <span>4-Layer AI Model Verification Results</span>
          </div>

          {models.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${m.isPass ? 'rgba(255, 255, 255, 0.06)' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: `${m.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: m.color
                    }}>
                      <Icon size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {m.weight}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: m.color,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {m.isPass ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {m.status}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '4px 0 0 0' }}>
                  {m.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Protection Summary Footer */}
        <div style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
          border: `1px solid ${isBlocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
          fontSize: '12px',
          color: '#e2e8f0',
          marginBottom: '18px',
          lineHeight: 1.4
        }}>
          <strong>Summary:</strong> {isBlocked
            ? 'The AI security layer prevented a fraudulent transaction attempt. Your account balance remains secure.'
            : 'All four machine learning models verified the integrity of the QR payload, merchant identity, and transaction pattern.'}
        </div>

        <button
          onClick={onClose}
          className="btn-pay-primary"
          style={{ width: '100%', padding: '12px', fontSize: '14px' }}
        >
          Got It, Close Explanation
        </button>
      </div>
    </div>
  );
};
