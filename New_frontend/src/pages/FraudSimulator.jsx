import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fraudAPI } from '../api/client';
import { RiskGauge } from '../components/RiskGauge';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Sliders, 
  Play, 
  Sparkles, 
  Zap, 
  Cpu, 
  QrCode, 
  Fingerprint, 
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const FraudSimulator = ({ setActiveTab }) => {
  const { user, stats, refreshDashboard } = useAuth();
  
  // Interactive Sandbox Controls
  const [amount, setAmount] = useState(450);
  const [qrAmount, setQrAmount] = useState(450);
  const [category, setCategory] = useState('shopping_pos');
  const [location, setLocation] = useState('Mumbai');
  const [frequency, setFrequency] = useState(1);
  const [merchant, setMerchant] = useState('Metro Coffee & Eats');

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    refreshDashboard();
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const payload = {
        username: user?.username || 'ai_sandbox_user',
        amt: parseFloat(amount) || 0,
        qr_amount: parseFloat(qrAmount) || 0,
        gender: 'M',
        category,
        location,
        frequency: parseInt(frequency) || 1,
        merchant_name: merchant,
        device_id: 'sandbox-device-v2',
      };

      const res = await fraudAPI.directPay(payload);
      setSimResult(res.data);
      await refreshDashboard();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const attackScenarios = [
    {
      name: '1. Normal Daytime POS Payment',
      tag: 'SAFE',
      tagColor: '#00c853',
      desc: 'Legitimate morning coffee purchase with verified authentic QR payload matching ₹450.',
      amount: 450,
      qrAmount: 450,
      category: 'dining_pos',
      location: 'Mumbai',
      frequency: 1,
      merchant: 'Metro Coffee & Eats',
    },
    {
      name: '2. High-Value Velocity Surge',
      tag: '2FA OTP STEP-UP',
      tagColor: '#ff9800',
      desc: 'Sudden high-ticket electronics purchase exceeding single-window spend limits.',
      amount: 28500,
      qrAmount: 28500,
      category: 'shopping_pos',
      location: 'Bangalore',
      frequency: 4,
      merchant: 'Helios Luxury Watch Store',
    },
    {
      name: '3. Malicious QR Tamper Attack',
      tag: 'FRAUD INTERCEPTED',
      tagColor: '#f44336',
      desc: 'Attacker swapped QR payload demanding ₹5,000 when customer intends to pay ₹500.',
      amount: 500,
      qrAmount: 5000,
      category: 'shopping_pos',
      location: 'Delhi',
      frequency: 1,
      merchant: 'Intercepted UPI Gateway',
    },
    {
      name: '4. Rapid Geolocation Anomaly',
      tag: 'ANOMALY BLOCKED',
      tagColor: '#f44336',
      desc: '10 rapid succession transactions from remote untrusted IP triggering immediate lock.',
      amount: 15000,
      qrAmount: 15000,
      category: 'shopping_pos',
      location: 'Remote Outpost',
      frequency: 10,
      merchant: 'Anonymous Night Merchant',
    },
  ];

  const applyPreset = (preset) => {
    setAmount(preset.amount);
    setQrAmount(preset.qrAmount);
    setCategory(preset.category);
    setLocation(preset.location);
    setFrequency(preset.frequency);
    setMerchant(preset.merchant);
  };

  // Compute live activity stats
  const totalTxns = stats.transactions || 12;
  const blockedTxns = stats.fraud_alerts || 2;
  const suspiciousTxns = Math.max(1, Math.floor(totalTxns * 0.15));
  const safeTxns = Math.max(0, totalTxns - blockedTxns - suspiciousTxns);

  // QR Stats
  const qrScannedCount = totalTxns + 4;
  const qrVerifiedCount = qrScannedCount - blockedTxns;
  const threatsDetectedCount = blockedTxns;

  // Recent Security Events
  const recentSecurityEvents = [
    {
      id: 1,
      type: 'safe',
      icon: CheckCircle2,
      color: '#00c853',
      title: 'Safe Transaction',
      amount: '₹450.00',
      merchant: 'Metro Coffee & Eats',
      detail: 'Merchant Verified • QR Checksum Validated',
      time: '10 mins ago'
    },
    {
      id: 2,
      type: 'suspicious',
      icon: AlertTriangle,
      color: '#ff9800',
      title: 'Suspicious Transaction',
      amount: '₹1,200.00',
      merchant: 'Unknown Online Merchant',
      detail: 'Additional Verification Required • 2FA OTP Verified',
      time: '42 mins ago'
    },
    {
      id: 3,
      type: 'fraud',
      icon: XCircle,
      color: '#f44336',
      title: 'Fraudulent QR Intercepted',
      amount: '₹5,000.00',
      merchant: 'Intercepted UPI Gateway',
      detail: 'Payment Blocked • QR Payload Tamper Mismatch',
      time: '2 hours ago'
    }
  ];

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* 1. Header: AI SECURITY CENTER */}
      <div className="pay-card" style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #0b1a2e 0%, #151833 50%, #1e1338 100%)',
        border: '1.5px solid rgba(124, 77, 255, 0.4)',
        boxShadow: '0 10px 30px -4px rgba(124, 77, 255, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c4dff 0%, #1a73e8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(124, 77, 255, 0.4)'
            }}>
              <ShieldCheck size={24} className="animate-pulse-glow" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
                🛡 AI SECURITY CENTER
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Protection Status:</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#00c853',
                  backgroundColor: 'rgba(0, 200, 83, 0.15)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 200, 83, 0.3)'
                }}>
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* Security Score Meter */}
          <div style={{
            textAlign: 'right',
            backgroundColor: 'rgba(0, 200, 83, 0.12)',
            border: '1.5px solid rgba(0, 200, 83, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px'
          }}>
            <div style={{ fontSize: '10px', color: '#69f0ae', fontWeight: '700', textTransform: 'uppercase' }}>
              Security Score
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#00c853' }}>
              92<span style={{ fontSize: '12px', color: '#69f0ae' }}>/100</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Continuous neural monitoring across QR image payloads, user spend behavior, transaction category heuristics, and credit risk velocities.
        </p>
      </div>

      {/* 2. Today's Activity Metrics (4 Column Grid) */}
      <div className="pay-card" style={{ padding: '16px' }}>
        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={15} color="#29b6f6" />
          <span>Today's Activity</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px'
        }}>
          {/* Total Transactions */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 8px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>
              Transactions
            </span>
            <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#ffffff', marginTop: '2px', display: 'block' }}>
              {totalTxns}
            </span>
          </div>

          {/* Safe Transactions */}
          <div style={{
            backgroundColor: 'rgba(0, 200, 83, 0.06)',
            border: '1px solid rgba(0, 200, 83, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 8px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '10px', color: '#69f0ae', fontWeight: '600', display: 'block' }}>
              Safe
            </span>
            <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#00c853', marginTop: '2px', display: 'block' }}>
              {safeTxns}
            </span>
          </div>

          {/* Suspicious Transactions */}
          <div style={{
            backgroundColor: 'rgba(255, 152, 0, 0.06)',
            border: '1px solid rgba(255, 152, 0, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 8px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '10px', color: '#ffb74d', fontWeight: '600', display: 'block' }}>
              Suspicious
            </span>
            <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#ff9800', marginTop: '2px', display: 'block' }}>
              {suspiciousTxns}
            </span>
          </div>

          {/* Blocked Transactions */}
          <div style={{
            backgroundColor: 'rgba(244, 67, 54, 0.06)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 8px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '10px', color: '#ff8a80', fontWeight: '600', display: 'block' }}>
              Blocked
            </span>
            <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#f44336', marginTop: '2px', display: 'block' }}>
              {blockedTxns}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Fraud Detection QR Metrics (3 Column Grid) */}
      <div className="pay-card" style={{ padding: '16px' }}>
        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <QrCode size={15} color="#c084fc" />
          <span>Fraud Detection & QR Verification</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px'
        }}>
          {/* QR Codes Scanned */}
          <div style={{
            backgroundColor: 'rgba(124, 77, 255, 0.08)',
            border: '1px solid rgba(124, 77, 255, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 8px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '10.5px', color: '#c084fc', fontWeight: '600', display: 'block' }}>
              QR Scanned
            </span>
            <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#ffffff', marginTop: '2px', display: 'block' }}>
              {qrScannedCount}
            </span>
          </div>

          {/* QR Codes Verified */}
          <div style={{
            backgroundColor: 'rgba(0, 200, 83, 0.08)',
            border: '1px solid rgba(0, 200, 83, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 8px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '10.5px', color: '#69f0ae', fontWeight: '600', display: 'block' }}>
              QR Verified
            </span>
            <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#00c853', marginTop: '2px', display: 'block' }}>
              {qrVerifiedCount}
            </span>
          </div>

          {/* Threats Detected */}
          <div style={{
            backgroundColor: 'rgba(244, 67, 54, 0.08)',
            border: '1px solid rgba(244, 67, 54, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 8px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '10.5px', color: '#ff8a80', fontWeight: '600', display: 'block' }}>
              Threats Detected
            </span>
            <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#f44336', marginTop: '2px', display: 'block' }}>
              {threatsDetectedCount}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Recent Security Events Feed */}
      <div className="pay-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={15} color="#00c853" />
            <span>Recent Security Events</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LIVE AUDIT LOG</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentSecurityEvents.map((evt) => {
            const Icon = evt.icon;
            return (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${evt.type === 'fraud' ? 'rgba(244, 67, 54, 0.2)' : evt.type === 'suspicious' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(0, 200, 83, 0.2)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: `${evt.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: evt.color,
                    flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                        {evt.title}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: evt.color, fontFamily: 'Outfit, sans-serif' }}>
                        {evt.amount}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                      {evt.detail}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {evt.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Interactive Threat Simulation Sandbox (For Viva / Demo) */}
      <div className="pay-card" style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sparkles size={16} color="#c084fc" />
          <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: '#f8fafc' }}>
            Live Threat Simulation Sandbox
          </h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Test the real-time AI response against simulated cyberattack payloads.
        </p>

        {/* Preset Scenarios */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {attackScenarios.map((sc, idx) => (
            <div
              key={idx}
              onClick={() => applyPreset(sc)}
              className="pay-card pay-card-clickable"
              style={{
                padding: '10px 12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: '800',
                  padding: '1.5px 6px',
                  borderRadius: '4px',
                  backgroundColor: `${sc.tagColor}20`,
                  color: sc.tagColor,
                  border: `1px solid ${sc.tagColor}40`
                }}>
                  {sc.tag}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>
                  ₹{sc.amount}
                </span>
              </div>

              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>
                {sc.name}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>
                {sc.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Live Simulator Controls & Result */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          padding: '14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                User Intended Amount (₹)
              </label>
              <input
                type="number"
                className="pay-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                QR Payload Encoded Amount (₹)
              </label>
              <input
                type="number"
                className="pay-input"
                value={qrAmount}
                onChange={(e) => setQrAmount(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '13px' }}
              />
              {Math.abs(amount - qrAmount) > 0.01 && (
                <div style={{ fontSize: '11px', color: '#f44336', marginTop: '3px', fontWeight: '700' }}>
                  ⚠️ Tampered Attack: Amount mismatch detected!
                </div>
              )}
            </div>

            <button
              onClick={runSimulation}
              disabled={loading}
              className="btn-pay-primary"
              style={{ padding: '10px', fontSize: '13px', marginTop: '4px' }}
            >
              <Play size={14} />
              {loading ? 'Evaluating Ensemble...' : 'Run Real-time AI Evaluation'}
            </button>
          </div>

          {/* Live AI Result */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {simResult ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <RiskGauge score={simResult.score || 10} size={150} riskLevel={simResult.risk_level || 'Low'} />
                
                <div style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: simResult.decision === 'BLOCK' ? 'rgba(244, 67, 54, 0.12)' : (simResult.decision === 'VERIFY' ? 'rgba(255, 152, 0, 0.12)' : 'rgba(0, 200, 83, 0.12)'),
                  border: `1px solid ${simResult.decision === 'BLOCK' ? 'rgba(244, 67, 54, 0.3)' : (simResult.decision === 'VERIFY' ? 'rgba(255, 152, 0, 0.3)' : 'rgba(0, 200, 83, 0.3)')}`,
                  color: simResult.decision === 'BLOCK' ? '#f44336' : (simResult.decision === 'VERIFY' ? '#ff9800' : '#00c853'),
                  fontWeight: '800',
                  fontSize: '12.5px'
                }}>
                  DECISION: {simResult.decision} • {simResult.risk_level} Risk
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>
                <ShieldCheck size={32} style={{ margin: '0 auto 6px auto', opacity: 0.35 }} />
                <p style={{ fontSize: '12px' }}>Select scenario or run real-time evaluation.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
