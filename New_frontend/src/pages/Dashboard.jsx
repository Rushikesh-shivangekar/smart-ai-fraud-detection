import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckBalanceModal } from '../components/CheckBalanceModal';
import { 
  QrCode, 
  Send, 
  Smartphone, 
  Building2, 
  Wallet, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  ChevronRight, 
  ArrowUpRight, 
  Zap, 
  TrendingUp, 
  Sparkles,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

export const Dashboard = ({ setActiveTab }) => {
  const { user, balance, stats, refreshDashboard } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isBalanceRevealed, setIsBalanceRevealed] = useState(false);
  const [isCheckBalanceModalOpen, setIsCheckBalanceModalOpen] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDashboard();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Contacts & Businesses with Security & Verification Statuses
  const frequentContacts = [
    { 
      name: 'Rahul Sharma', 
      upi: 'rahul.sharma@okaxis', 
      initials: 'RS', 
      color: '#7c4dff', 
      defaultAmt: 650,
      trustStatus: 'VERIFIED',
      trustType: 'verified'
    },
    { 
      name: 'Vijay Supermart', 
      upi: 'vijay.mart@paytm', 
      initials: 'VS', 
      color: '#10b981', 
      defaultAmt: 1450,
      trustStatus: 'TRUSTED MERCHANT',
      trustType: 'merchant'
    },
    { 
      name: 'Priya Patel', 
      upi: 'priya.patel@icici', 
      initials: 'PP', 
      color: '#00897b', 
      defaultAmt: 1200,
      trustStatus: 'VERIFIED',
      trustType: 'verified'
    },
    { 
      name: 'Metro Coffee', 
      upi: 'metro.coffee@ybl', 
      initials: 'MC', 
      color: '#f57c00', 
      defaultAmt: 450,
      trustStatus: 'TRUSTED MERCHANT',
      trustType: 'merchant'
    },
    { 
      name: 'Aditi Nair', 
      upi: 'aditi.nair@okhdfcbank', 
      initials: 'AN', 
      color: '#ec4899', 
      defaultAmt: 850,
      trustStatus: 'VERIFIED',
      trustType: 'verified'
    },
    { 
      name: 'Unknown Payee', 
      upi: 'xyz.merchant@upi', 
      initials: 'UP', 
      color: '#ff9800', 
      defaultAmt: 2500,
      trustStatus: 'PROCEED WITH CAUTION',
      trustType: 'warning'
    },
  ];

  const quickServices = [
    { label: 'Mobile Recharge', icon: Smartphone, color: '#7c4dff', action: () => setActiveTab('pay-anyone') },
    { label: 'Electricity Bill', icon: Zap, color: '#f57c00', action: () => setActiveTab('pay-anyone') },
    { label: 'Credit Card Bill', icon: CreditCard, color: '#29b6f6', action: () => setActiveTab('pay-anyone') },
    { label: 'Online Shopping', icon: ShoppingBag, color: '#10b981', action: () => setActiveTab('scan-qr') },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Personalized Greeting Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px',
        marginBottom: '-6px'
      }}>
        <div>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Welcome back,</span>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
            {user?.full_name || user?.username || 'User'} 👋
          </h3>
        </div>
        <div style={{
          fontSize: '10.5px',
          fontWeight: '700',
          padding: '4px 9px',
          borderRadius: '20px',
          background: 'rgba(124, 77, 255, 0.15)',
          border: '1px solid rgba(124, 77, 255, 0.35)',
          color: '#b388ff',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Sparkles size={12} color="#ffd54f" />
          <span>{user?.upiId || `${user?.username || 'user'}@securepay`}</span>
        </div>
      </div>

      {/* 1. PROMINENT AI SECURITY STATUS CARD (Capstone Feature Requirement) */}
      <div 
        className="ai-security-status-card pay-card-clickable"
        onClick={() => setActiveTab('simulator')}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 200, 83, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00c853'
            }}>
              <ShieldCheck size={18} className="animate-pulse-glow" />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#69f0ae', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                AI Security Status
              </div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                Excellent Protection
              </div>
            </div>
          </div>

          {/* Security Score Badge */}
          <div style={{
            background: 'rgba(0, 200, 83, 0.15)',
            border: '1.5px solid rgba(0, 200, 83, 0.4)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            textAlign: 'right'
          }}>
            <span style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#00c853' }}>
              92
            </span>
            <span style={{ fontSize: '12px', color: '#69f0ae', fontWeight: '600' }}>/100</span>
          </div>
        </div>

        {/* 3 Active Verification Checks */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: '6px',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(0, 200, 83, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0', fontWeight: '600' }}>
            <Check size={14} color="#00c853" strokeWidth={3} />
            <span>QR Scanning Protected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0', fontWeight: '600' }}>
            <Check size={14} color="#00c853" strokeWidth={3} />
            <span>AI Fraud Detection Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0', fontWeight: '600' }}>
            <Check size={14} color="#00c853" strokeWidth={3} />
            <span>Transaction Monitoring Active</span>
          </div>
        </div>

        {/* Action Link to AI Security Center */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '11.5px' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            4 AI Models Active • Zero Threats Active
          </span>
          <span style={{ color: '#69f0ae', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
            View AI Guard <ChevronRight size={13} />
          </span>
        </div>
      </div>

      {/* 2. Primary Bank Card with Secure Balance */}
      <div 
        className="pay-card"
        style={{
          background: 'linear-gradient(135deg, #241042 0%, #111a47 50%, #0b2254 100%)',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 10px 28px -4px rgba(36, 16, 66, 0.45)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '10.5px',
              fontWeight: '700',
              padding: '2.5px 7px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              letterSpacing: '0.04em'
            }}>
              PRIMARY UPI ACCOUNT
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)' }}>
              HDFC Bank •••• 4092
            </span>
          </div>

          <button
            onClick={handleRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Refresh balance"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin-slow' : ''} />
          </button>
        </div>

        {/* Secure Balance Area */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' }}>
            Available Bank Balance
          </span>

          {!isBalanceRevealed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  fontFamily: 'Outfit, sans-serif',
                  color: 'rgba(255, 255, 255, 0.65)',
                  letterSpacing: '4px'
                }}>
                  ••••••••
                </span>
              </div>

              <button
                onClick={() => setIsCheckBalanceModalOpen(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Eye size={14} /> Check Balance
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>

              <button
                onClick={() => setIsBalanceRevealed(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <EyeOff size={13} /> Hide
              </button>
            </div>
          )}
        </div>

        {/* Balance Card Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.9)' }}>
            <ShieldCheck size={15} color="#00e676" />
            <span>Zero Liability • Protected by AI</span>
          </div>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Statement <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* 3. Transfer Money (Core UPI Actions) */}
      <div className="pay-card" style={{ padding: '18px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', padding: '0 4px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: '#f8fafc' }}>
            Transfer Money
          </h3>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.04em' }}>
            INSTANT UPI
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px'
        }}>
          {/* Action 1: To Mobile / Contact */}
          <button 
            className="action-circle-btn"
            onClick={() => setActiveTab('pay-anyone')}
          >
            <div className="action-icon-circle action-circle-purple">
              <Smartphone size={22} color="#ffffff" />
            </div>
            <span className="action-label">To Mobile / Contact</span>
          </button>

          {/* Action 2: To Bank / UPI ID */}
          <button 
            className="action-circle-btn"
            onClick={() => setActiveTab('pay-anyone')}
          >
            <div className="action-icon-circle action-circle-blue">
              <Building2 size={22} color="#ffffff" />
            </div>
            <span className="action-label">To Bank / UPI ID</span>
          </button>

          {/* Action 3: Scan Any QR */}
          <button 
            className="action-circle-btn"
            onClick={() => setActiveTab('scan-qr')}
          >
            <div className="action-icon-circle action-circle-teal">
              <QrCode size={22} color="#ffffff" />
            </div>
            <span className="action-label">Scan Any QR</span>
          </button>

          {/* Action 4: Check Balance */}
          <button 
            className="action-circle-btn"
            onClick={() => setIsCheckBalanceModalOpen(true)}
          >
            <div className="action-icon-circle action-circle-amber">
              <Wallet size={22} color="#ffffff" />
            </div>
            <span className="action-label">Check Balance</span>
          </button>
        </div>
      </div>

      {/* 4. People & Businesses with AI Verification Indicators */}
      <div className="pay-card" style={{ padding: '16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
              People & Businesses
            </h3>
            <span style={{ fontSize: '10px', color: '#00c853', fontWeight: '700' }}>• AI Monitored</span>
          </div>
          <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: '600', cursor: 'pointer' }} onClick={() => setActiveTab('pay-anyone')}>
            View All
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          {frequentContacts.map((contact, i) => (
            <button
              key={i}
              className="contact-avatar-item"
              onClick={() => setActiveTab('pay-anyone')}
            >
              <div 
                className="contact-avatar-circle"
                style={{ backgroundColor: contact.color }}
              >
                {contact.initials}
                {/* Micro Verified Icon */}
                <span style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: contact.trustType === 'warning' ? '#ff9800' : '#00c853',
                  border: '2px solid #131622',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: '900'
                }}>
                  {contact.trustType === 'warning' ? '!' : '✓'}
                </span>
              </div>
              <span className="contact-name">{contact.name}</span>
              <span className={`trust-badge ${contact.trustType === 'verified' ? 'trust-badge-verified' : contact.trustType === 'merchant' ? 'trust-badge-merchant' : 'trust-badge-warning'}`}>
                {contact.trustStatus}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. UPI Utility Services */}
      <div className="pay-card" style={{ padding: '16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f8fafc' }}>
            Recharge & Pay Bills
          </h3>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>UPI AUTOPAY</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px'
        }}>
          {quickServices.map((srv, i) => {
            const Icon = srv.icon;
            return (
              <button
                key={i}
                className="action-circle-btn"
                onClick={srv.action}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: srv.color
                }}>
                  <Icon size={18} />
                </div>
                <span className="action-label" style={{ fontSize: '10.5px' }}>{srv.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Recent Transactions List with Risk Labels */}
      <div className="pay-card" style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: '#f8fafc' }}>
            Recent Transactions
          </h3>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: 'none',
              border: 'none',
              color: '#c084fc',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            See all
          </button>
        </div>

        {stats.recent_transactions && stats.recent_transactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.recent_transactions.slice(0, 4).map((tx, idx) => {
              const isBlocked = tx.result === 'BLOCK' || tx.fraud_flag;
              const isVerify = tx.result === 'VERIFY' || tx.result === 'VERIFIED_ALLOW';
              return (
                <div
                  key={tx.id || idx}
                  onClick={() => setActiveTab('history')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: isBlocked ? 'rgba(244, 67, 54, 0.15)' : 'rgba(124, 77, 255, 0.15)',
                      border: `1px solid ${isBlocked ? 'rgba(244, 67, 54, 0.3)' : 'rgba(124, 77, 255, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isBlocked ? '#f44336' : '#c084fc',
                      fontWeight: '700',
                      fontSize: '13px'
                    }}>
                      {isBlocked ? <ShieldAlert size={17} /> : (tx.merchant_name || 'UPI').slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                        {tx.merchant_name || 'Digital UPI Payee'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>{tx.location || 'Mumbai'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      fontFamily: 'Outfit, sans-serif',
                      color: isBlocked ? '#f44336' : '#ffffff'
                    }}>
                      -₹{Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>

                    <div style={{ marginTop: '2px' }}>
                      {isBlocked ? (
                        <span className="upi-chip upi-chip-block" style={{ fontSize: '9.5px', padding: '1.5px 5px' }}>FRAUD BLOCKED</span>
                      ) : isVerify ? (
                        <span className="upi-chip upi-chip-verify" style={{ fontSize: '9.5px', padding: '1.5px 5px' }}>OTP VERIFIED</span>
                      ) : (
                        <span className="upi-chip upi-chip-safe" style={{ fontSize: '9.5px', padding: '1.5px 5px' }}>SAFE TRANSACTION</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
            <Wallet size={28} style={{ margin: '0 auto 6px auto', opacity: 0.4 }} />
            <p style={{ fontSize: '12.5px' }}>No transactions recorded yet.</p>
            <button
              onClick={() => setActiveTab('scan-qr')}
              className="btn-pay-primary"
              style={{ marginTop: '10px', padding: '7px 14px', fontSize: '12px' }}
            >
              <QrCode size={14} /> Make First Payment
            </button>
          </div>
        )}
      </div>

      {/* Check Bank Balance Modal */}
      <CheckBalanceModal 
        isOpen={isCheckBalanceModalOpen} 
        onClose={() => setIsCheckBalanceModalOpen(false)} 
        onBalanceRevealed={() => setIsBalanceRevealed(true)} 
      />

    </div>
  );
};
