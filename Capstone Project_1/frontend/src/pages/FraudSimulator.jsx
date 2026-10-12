import React, { useState } from 'react';
import { fraudAPI } from '../api/client';
import { RiskGauge } from '../components/RiskGauge';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { 
  Sliders, 
  Play, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw,
  Cpu,
  Fingerprint,
  QrCode
} from 'lucide-react';

export const FraudSimulator = () => {
  const [amount, setAmount] = useState(500);
  const [qrAmount, setQrAmount] = useState(500);
  const [category, setCategory] = useState('shopping_pos');
  const [location, setLocation] = useState('Mumbai');
  const [frequency, setFrequency] = useState(1);
  const [merchant, setMerchant] = useState('Demo Merchant Store');

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const payload = {
        username: 'ai_sandbox_user',
        amt: parseFloat(amount) || 0,
        qr_amount: parseFloat(qrAmount) || 0,
        gender: 'M',
        category,
        location,
        frequency: parseInt(frequency) || 1,
        merchant_name: merchant,
        device_id: 'sandbox-device',
      };

      const res = await fraudAPI.directPay(payload);
      setSimResult(res.data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setAmount(preset.amount);
    setQrAmount(preset.qrAmount);
    setCategory(preset.category);
    setLocation(preset.location);
    setFrequency(preset.frequency);
    setMerchant(preset.merchant);
  };

  const attackScenarios = [
    {
      name: '1. Legitimate POS Purchase',
      tag: 'SAFE',
      tagColor: '#10b981',
      desc: 'Typical daytime grocery checkout with matching QR payload.',
      amount: 450,
      qrAmount: 450,
      category: 'grocery_pos',
      location: 'Mumbai',
      frequency: 1,
      merchant: 'Reliance Smart Supermarket',
    },
    {
      name: '2. Velocity Surge / High Spend',
      tag: 'OTP REQUIRED',
      tagColor: '#f59e0b',
      desc: 'Rapid succession of high-value electronics purchases triggering 2FA.',
      amount: 24500,
      qrAmount: 24500,
      category: 'shopping_pos',
      location: 'Bangalore',
      frequency: 5,
      merchant: 'Croma Digital Store',
    },
    {
      name: '3. Malicious QR Tamper Attack',
      tag: 'FRAUD ATTACK',
      tagColor: '#ef4444',
      desc: 'Attacker overlays QR code requesting ₹10,000 when customer intends to pay ₹500.',
      amount: 500,
      qrAmount: 10000,
      category: 'shopping_pos',
      location: 'Delhi',
      frequency: 1,
      merchant: 'Intercepted UPI Gateway',
    },
    {
      name: '4. Midnight Location Anomaly',
      tag: 'BLOCKED',
      tagColor: '#ef4444',
      desc: 'Out-of-pattern midnight luxury transaction with rapid device swaps.',
      amount: 49000,
      qrAmount: 49000,
      category: 'travel',
      location: 'Unknown International IP',
      frequency: 8,
      merchant: 'Offshore Crypto Exchange',
    },
  ];

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge badge-verify">AI Defense Sandbox</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Interactive Capstone Threat Lab</span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>
          AI Fraud Scenario Simulator
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Stress-test the ensemble fraud engine with custom parameters and simulated cyber-fraud attacks.
        </p>
      </div>

      {/* Preset Scenario Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        {attackScenarios.map((s, idx) => (
          <div
            key={idx}
            className="glass-card"
            onClick={() => applyPreset(s)}
            style={{ padding: '18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: s.tagColor, backgroundColor: `${s.tagColor}15`, padding: '2px 8px', borderRadius: '4px' }}>
                  {s.tag}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#60a5fa' }}>₹{s.amount}</span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
                {s.name}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {s.desc}
              </p>
            </div>

            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '11.5px', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Click to load scenario
            </div>
          </div>
        ))}
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid-2">
        {/* Controls */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="#f59e0b" />
            Simulator Threat Parameters
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Merchant Label
              </label>
              <input
                type="text"
                className="glass-input"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Customer Entered (₹)
                </label>
                <input
                  type="number"
                  className="glass-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  QR Code Payload (₹)
                </label>
                <input
                  type="number"
                  className="glass-input"
                  value={qrAmount}
                  onChange={(e) => setQrAmount(e.target.value)}
                  style={{
                    borderColor: Math.abs(amount - qrAmount) > 0.01 ? '#ef4444' : 'var(--border-color)',
                  }}
                />
              </div>
            </div>

            {Math.abs(amount - qrAmount) > 0.01 && (
              <div style={{ padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontSize: '12px', color: '#fca5a5' }}>
                ⚠️ <strong>Simulated Tampering:</strong> User enters ₹{amount} but QR code demands ₹{qrAmount}!
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  className="glass-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="shopping_pos" style={{ background: '#1e293b' }}>Shopping (POS)</option>
                  <option value="grocery_pos" style={{ background: '#1e293b' }}>Grocery</option>
                  <option value="food_dining" style={{ background: '#1e293b' }}>Food & Dining</option>
                  <option value="travel" style={{ background: '#1e293b' }}>Travel</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Velocity / Frequency
                </label>
                <input
                  type="number"
                  className="glass-input"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  min="1"
                  max="10"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={runSimulation}
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                marginTop: '10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin-slow" size={18} />
                  Evaluating Ensemble Models...
                </>
              ) : (
                <>
                  <Play size={18} />
                  Run AI Fraud Simulation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Simulation Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {simResult ? (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '14px', textAlign: 'center' }}>
                Simulation Threat Output
              </h4>

              <RiskGauge score={simResult.score} riskLevel={simResult.risk_level} />

              <div style={{ marginTop: '20px' }}>
                <ScoreBreakdown debugScores={simResult.debug_scores} />
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{
              padding: '60px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '380px'
            }}>
              <Cpu size={54} color="rgba(255, 255, 255, 0.15)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                AI Simulator Ready
              </h3>
              <p style={{ fontSize: '13.5px', maxWidth: '340px', lineHeight: '1.5' }}>
                Pick a scenario above or customize the threat sliders to see how the 4 AI models classify the transaction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
