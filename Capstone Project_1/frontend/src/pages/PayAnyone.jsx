import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fraudAPI } from '../api/client';
import { RiskGauge } from '../components/RiskGauge';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { OTPModal } from '../components/OTPModal';
import { 
  Send, 
  Smartphone, 
  UserCheck, 
  CheckCircle2, 
  ShieldAlert, 
  Zap, 
  RefreshCw,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PayAnyone = () => {
  const { user, refreshDashboard } = useAuth();

  const [recipient, setRecipient] = useState('rahul.sharma@okaxis');
  const [amount, setAmount] = useState(1200);
  const [category, setCategory] = useState('shopping_pos');
  const [location, setLocation] = useState('Delhi');
  const [frequency, setFrequency] = useState(1);
  const [note, setNote] = useState('Dinner split');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const payload = {
        username: user?.username || 'demo_user',
        amt: parseFloat(amount) || 0,
        qr_amount: parseFloat(amount) || 0,
        gender: 'M',
        category: category,
        location: location,
        frequency: parseInt(frequency) || 1,
        merchant_name: recipient,
        device_id: 'chrome-desktop-v2',
      };

      const res = await fraudAPI.directPay(payload);
      setResult(res.data);

      if (res.data.status === 'verify') {
        setOtpCode(res.data.otp || '1234');
        setIsOtpOpen(true);
      } else if (res.data.status === 'success') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        await refreshDashboard();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = async () => {
    setIsOtpOpen(false);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setResult((prev) => ({
      ...prev,
      status: 'success',
      decision: 'ALLOW',
      msg: 'OTP Verified • Funds Transferred Successfully!'
    }));
    await refreshDashboard();
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>
          Pay Anyone via UPI ID or Mobile
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Transfer money with continuous machine learning velocity and anomaly monitoring.
        </p>
      </div>

      <div className="grid-2">
        {/* Transfer Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Recipient UPI ID / Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="glass-input"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. mobile@upi or 9876543210"
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <Smartphone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  className="glass-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₹ 1000"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Spending Category
                </label>
                <select
                  className="glass-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="shopping_pos" style={{ background: '#1e293b' }}>Shopping</option>
                  <option value="food_dining" style={{ background: '#1e293b' }}>Food & Dining</option>
                  <option value="grocery_pos" style={{ background: '#1e293b' }}>Grocery</option>
                  <option value="travel" style={{ background: '#1e293b' }}>Travel</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Location
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Delhi"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Transaction Velocity (Hour)
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Payment Note (Optional)
              </label>
              <input
                type="text"
                className="glass-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What is this for?"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '13px', marginTop: '6px' }}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin-slow" size={18} />
                  Evaluating Threat & Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send ₹{amount || 0} via AI UPI Guard
                </>
              )}
            </button>
          </form>

          {/* Quick presets */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Quick Test Contacts:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '6px 10px' }}
                onClick={() => { setRecipient('mom@okaxis'); setAmount(500); setFrequency(1); }}
              >
                Mom (₹500 - Safe)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '6px 10px' }}
                onClick={() => { setRecipient('landlord@sbi'); setAmount(15000); setFrequency(1); }}
              >
                Rent (₹15,000 - Regular)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '6px 10px', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => { setRecipient('unknown_gambling@crypto'); setAmount(45000); setFrequency(8); setLocation('Unknown VPN'); }}
              >
                Rapid Spike (₹45,000 - Fraud Risk)
              </button>
            </div>
          </div>
        </div>

        {/* AI Result Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {result ? (
            <div className="glass-panel" style={{ padding: '24px' }}>
              {result.status === 'success' ? (
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <CheckCircle2 size={32} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc' }}>
                    {result.msg}
                  </h3>
                  <div style={{ fontSize: '26px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#10b981', marginTop: '6px' }}>
                    ₹{parseFloat(amount).toFixed(2)}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <ShieldAlert size={32} color="#ef4444" />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>
                    {result.msg}
                  </h3>
                </div>
              )}

              <RiskGauge score={result.score} riskLevel={result.risk_level} />
              <div style={{ marginTop: '20px' }}>
                <ScoreBreakdown debugScores={result.debug_scores} />
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
              <Send size={54} color="rgba(255, 255, 255, 0.15)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Instant UPI Fraud Screening
              </h3>
              <p style={{ fontSize: '13.5px', maxWidth: '340px', lineHeight: '1.5' }}>
                Enter UPI details on the left to evaluate risk and execute a zero-latency protected transfer.
              </p>
            </div>
          )}

          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              color: '#f87171',
              fontSize: '13px'
            }}>
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      <OTPModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        username={user?.username || 'demo_user'}
        defaultOtp={otpCode}
        onSuccess={handleOtpSuccess}
      />
    </div>
  );
};
