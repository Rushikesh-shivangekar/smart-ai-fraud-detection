import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fraudAPI } from '../api/client';
import { RiskGauge } from '../components/RiskGauge';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { QRScannerModal } from '../components/QRScannerModal';
import { OTPModal } from '../components/OTPModal';
import { 
  QrCode, 
  Upload, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Zap,
  ShoppingBag,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ScanQRPay = () => {
  const { user, refreshDashboard } = useAuth();

  // Form State
  const [enteredAmount, setEnteredAmount] = useState(500);
  const [merchantName, setMerchantName] = useState('Metro Coffee & Eats');
  const [category, setCategory] = useState('shopping_pos');
  const [location, setLocation] = useState('Mumbai');
  const [gender, setGender] = useState('M');
  const [frequency, setFrequency] = useState(1);
  const [qrFile, setQrFile] = useState(null);
  const [qrRawData, setQrRawData] = useState('');
  const [password, setPassword] = useState('password123');

  // Flow State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQRDetected = (data) => {
    setQrFile(data.file);
    setQrRawData(data.rawData || '');
    if (data.merchantName) setMerchantName(data.merchantName);
    if (data.amount) setEnteredAmount(data.amount);
    setAnalysisResult(null);
    setPaymentSuccess(null);
    setErrorMsg('');
  };

  const handleAnalyzePayment = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setPaymentSuccess(null);
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('username', user?.username || 'demo_user');
      formData.append('entered_amount', parseFloat(enteredAmount) || 0);
      formData.append('gender', gender);
      formData.append('category', category);
      formData.append('location', location);
      formData.append('frequency', parseInt(frequency) || 1);
      formData.append('merchant_name', merchantName);
      formData.append('device_id', 'chrome-win11-web');

      if (qrFile) {
        formData.append('qr_image', qrFile);
      }
      if (qrRawData) {
        formData.append('qr_raw_data', qrRawData);
      }

      const res = await fraudAPI.scanPayment(formData);
      setAnalysisResult(res.data);

      if (res.data.decision === 'BLOCK') {
        setErrorMsg('AI Security Warning: High Fraud Risk Detected! This transaction has been locked.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'AI Scan Failed to process');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmPayment = async (e) => {
    e?.preventDefault();
    if (!analysisResult?.payment_id) return;

    setConfirming(true);
    setErrorMsg('');

    try {
      const res = await fraudAPI.confirmPayment(
        analysisResult.payment_id,
        user?.username || 'demo_user',
        password
      );

      if (res.data.status === 'verify') {
        // Triggers OTP modal
        setOtpCode(res.data.otp || '1234');
        setIsOtpOpen(true);
      } else if (res.data.status === 'success') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setPaymentSuccess({
          msg: res.data.msg || 'Payment Successful!',
          amount: enteredAmount,
          merchant: merchantName,
          score: res.data.score
        });
        await refreshDashboard();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment confirmation failed');
    } finally {
      setConfirming(false);
    }
  };

  const handleOtpSuccess = async () => {
    setIsOtpOpen(false);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setPaymentSuccess({
      msg: 'OTP Verified • Payment Completed Successfully!',
      amount: enteredAmount,
      merchant: merchantName,
      score: analysisResult?.score || 45.0
    });
    await refreshDashboard();
  };

  const resetForm = () => {
    setAnalysisResult(null);
    setPaymentSuccess(null);
    setQrFile(null);
    setQrRawData('');
    setErrorMsg('');
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>
            Scan & Pay QR with AI Protection
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Real-time payload inspection, amount validation, and multi-model threat analysis.
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="btn-primary"
          style={{ padding: '10px 18px' }}
        >
          <QrCode size={18} />
          {qrFile ? 'Change QR Code' : 'Scan / Upload QR'}
        </button>
      </div>

      {/* Main Grid: Form on Left, Analysis Preview on Right */}
      <div className="grid-2">
        {/* Payment Form */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={18} color="#60a5fa" />
            Transaction Details
          </h3>

          {/* QR Status Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: qrFile ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.08)',
            border: `1px solid ${qrFile ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.2)'}`,
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <QrCode size={20} color={qrFile ? '#10b981' : '#60a5fa'} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                  {qrFile ? 'QR Code Scanned & Loaded' : 'No QR Attached'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {qrFile ? (qrRawData ? qrRawData.slice(0, 38) + '...' : 'Bitmap Image Ready') : 'Using manual entry mode'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {qrFile ? 'Re-scan' : 'Open Scanner'}
            </button>
          </div>

          <form onSubmit={handleAnalyzePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Merchant Name / UPI ID
              </label>
              <input
                type="text"
                className="glass-input"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. Star Electronics"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  className="glass-input"
                  value={enteredAmount}
                  onChange={(e) => setEnteredAmount(e.target.value)}
                  placeholder="₹ 500"
                  required
                />
              </div>

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
                  <option value="food_dining" style={{ background: '#1e293b' }}>Food & Dining</option>
                  <option value="grocery_pos" style={{ background: '#1e293b' }}>Grocery</option>
                  <option value="travel" style={{ background: '#1e293b' }}>Travel / Transit</option>
                  <option value="entertainment" style={{ background: '#1e293b' }}>Entertainment</option>
                  <option value="gas_transport" style={{ background: '#1e293b' }}>Gas / Fuel</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Transaction Location
                </label>
                <input
                  type="text"
                  className="glass-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai"
                />
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
              type="submit"
              className="btn-primary"
              disabled={analyzing}
              style={{ width: '100%', padding: '13px', marginTop: '6px' }}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="animate-spin-slow" size={18} />
                  Running 4-Tier AI Fraud Analysis...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Analyze Threat & Verify QR
                </>
              )}
            </button>
          </form>

          {/* Quick preset tests */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Quick Threat Scenarios:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '6px 10px' }}
                onClick={() => {
                  setEnteredAmount(250);
                  setMerchantName('Starbucks Coffee');
                  setCategory('food_dining');
                  setFrequency(1);
                  setQrRawData('upi://pay?pa=starbucks@hdfc&pn=Starbucks&am=250');
                }}
              >
                Safe Coffee (₹250)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '6px 10px', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={() => {
                  setEnteredAmount(500); // User types 500
                  setMerchantName('Discount Electronics');
                  setCategory('shopping_pos');
                  setFrequency(1);
                  // But QR payload demands 5000!
                  setQrRawData('upi://pay?pa=thief@icici&pn=Discount%20Electronics&amount:5000');
                }}
              >
                Tampered QR Attack (₹500 vs ₹5000)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '6px 10px', borderColor: 'rgba(245, 158, 11, 0.3)' }}
                onClick={() => {
                  setEnteredAmount(18000);
                  setMerchantName('Croma Electronics');
                  setCategory('shopping_pos');
                  setFrequency(4);
                  setQrRawData('upi://pay?pa=croma@tatapay&pn=Croma&am=18000');
                }}
              >
                High Velocity (₹18,000 / OTP)
              </button>
            </div>
          </div>
        </div>

        {/* AI Result & Confirmation Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Payment Success State */}
          {paymentSuccess ? (
            <div className="glass-panel" style={{
              padding: '36px 24px',
              textAlign: 'center',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={36} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#f8fafc', marginBottom: '6px' }}>
                Payment Approved & Transferred!
              </h3>
              <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#10b981', margin: '10px 0' }}>
                ₹{parseFloat(paymentSuccess.amount).toFixed(2)}
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Sent to <strong>{paymentSuccess.merchant}</strong> • AI Security Score: {paymentSuccess.score?.toFixed(1)}/100
              </p>
              <button
                onClick={resetForm}
                className="btn-primary"
                style={{ padding: '12px 24px' }}
              >
                Start New Transaction
              </button>
            </div>
          ) : analysisResult ? (
            <>
              {/* Risk Gauge Card */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginBottom: '14px', textAlign: 'center' }}>
                  Real-Time AI Threat Assessment
                </h4>

                <RiskGauge
                  score={analysisResult.score}
                  riskLevel={analysisResult.risk_level}
                />

                {/* Tampering Alert */}
                {analysisResult.tampered && (
                  <div style={{
                    marginTop: '20px',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <AlertTriangle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '12.5px', color: '#fca5a5' }}>
                      <strong>Malicious QR Code Tampering Detected!</strong> The QR metadata requested ₹{analysisResult.qr_amount_detected}, but you entered ₹{analysisResult.entered_amount}. Transaction blocked to protect your funds.
                    </div>
                  </div>
                )}
              </div>

              {/* Model Breakdown Component */}
              <ScoreBreakdown debugScores={analysisResult.debug_scores} />

              {/* Password Final Confirmation (If not blocked) */}
              {analysisResult.decision !== 'BLOCK' ? (
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc', marginBottom: '10px' }}>
                    Confirm & Authorize Payment
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    Risk verified as {analysisResult.risk_level}. Enter your account password to confirm transferring <strong>₹{enteredAmount}</strong> to <strong>{merchantName}</strong>.
                  </p>

                  <form onSubmit={handleConfirmPayment} style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="password"
                      className="glass-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Account Password"
                      required
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={confirming}
                      style={{ whiteSpace: 'nowrap', padding: '12px 20px' }}
                    >
                      {confirming ? 'Processing...' : 'Authorize'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="glass-panel" style={{
                  padding: '18px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  textAlign: 'center'
                }}>
                  <ShieldAlert size={28} color="#ef4444" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#f87171' }}>
                    Payment Execution Blocked by AI Defense
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Our automated security guard prevented unauthorized debit of your wallet.
                  </p>
                </div>
              )}
            </>
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
              <QrCode size={54} color="rgba(255, 255, 255, 0.15)" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                AI Fraud Engine Standing By
              </h3>
              <p style={{ fontSize: '13.5px', maxWidth: '340px', lineHeight: '1.5' }}>
                Fill in the payment details on the left or scan a QR code to run live neural threat evaluation.
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

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onQRDetected={handleQRDetected}
      />

      {/* OTP Verification Modal */}
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
