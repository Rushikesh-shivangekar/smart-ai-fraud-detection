import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet, 
  ArrowUpRight, 
  ShieldAlert, 
  ShieldCheck, 
  QrCode, 
  Send, 
  Sliders, 
  Clock, 
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const Dashboard = ({ setActiveTab }) => {
  const { user, balance, stats } = useAuth();

  const cards = [
    {
      title: 'Digital Wallet Balance',
      value: `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: 'UPI Active • Zero Fraud Loss',
      icon: Wallet,
      color: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.15)',
    },
    {
      title: 'Total Transactions',
      value: stats.transactions,
      subtitle: 'Real-time AI Scanned',
      icon: TrendingUp,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
    },
    {
      title: 'Fraud Attempts Blocked',
      value: stats.fraud_alerts,
      subtitle: 'Tampered QRs & Anomalies',
      icon: ShieldAlert,
      color: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.15)',
    },
  ];

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-safe">AI Guard Active</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>UPI: {user?.upiId || `${user?.username}@upi`}</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.username}! 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Your account is actively protected by 4-layer AI fraud detection models and live QR tamper verification.
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('scan-qr')}
            className="btn-primary"
            style={{ padding: '12px 20px', fontSize: '14px' }}
          >
            <QrCode size={18} />
            Scan QR Code
          </button>
          <button
            onClick={() => setActiveTab('pay-anyone')}
            className="btn-secondary"
            style={{ padding: '12px 20px', fontSize: '14px' }}
          >
            <Send size={18} />
            Send UPI Money
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: c.bgGlow,
                filter: 'blur(30px)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>{c.title}</span>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: `${c.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} color={c.color} />
                </div>
              </div>

              <div style={{ fontSize: '30px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#f8fafc', marginBottom: '4px' }}>
                {c.value}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                {c.subtitle}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Row: Recent Transactions & AI Defense Overview */}
      <div className="grid-2">
        {/* Recent Transactions List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#60a5fa" />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                Recent AI-Monitored Payments
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              View All <ChevronRight size={15} />
            </button>
          </div>

          {stats.recent_transactions && stats.recent_transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.recent_transactions.map((tx) => {
                const isBlocked = tx.fraud_flag || tx.result === 'BLOCK';
                const isVerify = tx.result === 'VERIFY' || tx.result === 'VERIFIED_ALLOW';
                return (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {isBlocked ? (
                          <ShieldAlert size={18} color="#ef4444" />
                        ) : (
                          <ShieldCheck size={18} color="#10b981" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
                          {tx.merchant_name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.location}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '700',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: isBlocked ? '#ef4444' : '#f8fafc'
                      }}>
                        ₹{tx.amount?.toFixed(2)}
                      </div>
                      <span className={`badge ${isBlocked ? 'badge-block' : isVerify ? 'badge-verify' : 'badge-safe'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {isBlocked ? 'Blocked' : isVerify ? 'OTP Verified' : 'Safe'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
              <p style={{ fontSize: '14px' }}>No payments recorded yet.</p>
              <p style={{ fontSize: '12.5px', marginTop: '4px' }}>Scan a QR code to run your first real-time fraud analysis.</p>
            </div>
          )}
        </div>

        {/* AI Defense Engine Capabilities */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={20} color="#10b981" />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>
                AI Multi-Layer Protection Engine
              </h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '18px' }}>
              Every transaction is screened in sub-seconds against 4 distinct machine learning & deep learning models:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500' }}>
                  <strong>Transaction RF Model (30%):</strong> Evaluates category, amount distribution, location anomaly.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'rgba(139, 92, 246, 0.08)', borderRadius: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
                <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500' }}>
                  <strong>Credit Risk Classifier (25%):</strong> Analyzes payment velocity and historical spend limits.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'rgba(6, 182, 212, 0.08)', borderRadius: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />
                <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500' }}>
                  <strong>Behavior Anomaly Net (20%):</strong> Compares session speed, device IDs, and frequency spikes.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'rgba(236, 72, 153, 0.08)', borderRadius: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ec4899' }} />
                <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500' }}>
                  <strong>Deep Learning QR CNN (25%):</strong> Inspects QR image encoding & protects against tampering.
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Want to test attacks?</span>
            <button
              onClick={() => setActiveTab('simulator')}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '12.5px' }}
            >
              <Sliders size={14} color="#f59e0b" /> Launch AI Sandbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
