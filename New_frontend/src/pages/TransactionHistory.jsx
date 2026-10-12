import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fraudAPI } from '../api/client';
import { 
  History, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  Check, 
  X, 
  ChevronRight,
  FileText,
  Building2,
  Calendar,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const TransactionHistory = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('ALL'); // 'ALL' | 'SAFE' | 'SUSPICIOUS' | 'BLOCKED'
  const [selectedTx, setSelectedTx] = useState(null);

  // Sample fallback transactions for immediate viva / demonstration
  const sampleFallbackTxns = [
    {
      id: 101,
      merchant_name: 'Rahul Sharma',
      amount: 1200.0,
      location: 'Delhi',
      result: 'ALLOW',
      risk: 6,
      fraud_flag: false,
      reason: 'Safe Transaction • Legitimate P2P Transfer',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 102,
      merchant_name: 'Coffee Shop',
      amount: 450.0,
      location: 'Mumbai',
      result: 'ALLOW',
      risk: 8,
      fraud_flag: false,
      reason: 'Verified Merchant • Validated QR Payload',
      timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    },
    {
      id: 103,
      merchant_name: 'Unknown Merchant',
      amount: 2500.0,
      location: 'Bangalore',
      result: 'VERIFY',
      risk: 54,
      fraud_flag: false,
      reason: 'Suspicious • High Velocity Burst (OTP Verified)',
      timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    },
    {
      id: 104,
      merchant_name: 'Fake QR Gateway',
      amount: 5000.0,
      location: 'Delhi',
      result: 'BLOCK',
      risk: 94,
      fraud_flag: true,
      reason: 'Blocked by AI • Tampered QR Payload Mismatch',
      timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    }
  ];

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fraudAPI.getTransactions(user?.username || 'demo_user');
      if (res.data && res.data.length > 0) {
        setTransactions(res.data);
      } else {
        setTransactions(sampleFallbackTxns);
      }
    } catch (err) {
      console.warn('Error fetching transactions, using demo fallback:', err);
      setTransactions(sampleFallbackTxns);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const filtered = transactions.filter((tx) => {
    const matchesSearch = 
      tx.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const isBlocked = tx.result === 'BLOCK' || tx.fraud_flag || (tx.risk && tx.risk >= 70);
    const isSuspicious = tx.result === 'VERIFY' || tx.result === 'VERIFIED_ALLOW' || (tx.risk && tx.risk >= 30 && tx.risk < 70);
    const isSafe = !isBlocked && !isSuspicious;

    if (filterResult === 'ALL') return true;
    if (filterResult === 'SAFE') return isSafe;
    if (filterResult === 'SUSPICIOUS') return isSuspicious;
    if (filterResult === 'BLOCKED') return isBlocked;
    return true;
  });

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
            Transaction History
          </h2>
          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            All UPI payments secured by AI multi-model analysis & fraud detection
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="btn-pay-secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin-slow' : ''} />
          Refresh
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="pay-card" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="pay-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by merchant, location, or risk..."
            style={{ paddingLeft: '34px', padding: '9px 12px 9px 34px', fontSize: '12.5px' }}
          />
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* 4 Required Filter Tabs: All, Safe, Suspicious, Blocked */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'SAFE', label: 'Safe', color: '#00c853' },
            { id: 'SUSPICIOUS', label: 'Suspicious', color: '#ff9800' },
            { id: 'BLOCKED', label: 'Blocked', color: '#f44336' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterResult(f.id)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                border: filterResult === f.id ? `1px solid ${f.color || '#7c4dff'}` : '1px solid rgba(255, 255, 255, 0.08)',
                background: filterResult === f.id ? `${f.color || '#7c4dff'}25` : 'rgba(255, 255, 255, 0.03)',
                color: filterResult === f.id ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '11.5px',
                fontWeight: filterResult === f.id ? '800' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {f.id !== 'ALL' && <span style={{ color: f.color, marginRight: '4px' }}>●</span>}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List with Detailed Risk Statuses */}
      <div className="pay-card" style={{ padding: '8px 12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={22} className="animate-spin-slow" style={{ margin: '0 auto 6px auto' }} />
            <p style={{ fontSize: '12px' }}>Loading transactions from AI database...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((tx, idx) => {
              const isBlocked = tx.result === 'BLOCK' || tx.fraud_flag || (tx.risk && tx.risk >= 70);
              const isSuspicious = tx.result === 'VERIFY' || tx.result === 'VERIFIED_ALLOW' || (tx.risk && tx.risk >= 30 && tx.risk < 70);
              
              const statusColor = isBlocked ? '#f44336' : isSuspicious ? '#ff9800' : '#00c853';
              const statusLabel = isBlocked 
                ? 'Blocked by AI' 
                : isSuspicious 
                  ? 'Suspicious' 
                  : (tx.merchant_name?.toLowerCase().includes('coffee') || tx.merchant_name?.toLowerCase().includes('mart') ? 'Verified Merchant' : 'Safe Transaction');

              const dateStr = new Date(tx.timestamp).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={tx.id || idx}
                  onClick={() => setSelectedTx(tx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 6px',
                    borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-xs)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: `${statusColor}18`,
                      border: `1.5px solid ${statusColor}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: statusColor,
                      fontWeight: '800',
                      fontSize: '13px',
                      flexShrink: 0
                    }}>
                      {isBlocked ? <ShieldAlert size={18} /> : (tx.merchant_name || 'UPI').slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#ffffff' }}>
                        {tx.merchant_name || 'Digital UPI Payee'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span style={{ color: statusColor, fontWeight: '700' }}>
                          ● {statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <div style={{
                        fontSize: '14.5px',
                        fontWeight: '800',
                        fontFamily: 'Outfit, sans-serif',
                        color: isBlocked ? '#f44336' : '#ffffff'
                      }}>
                        -₹{Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>

                      <div style={{ marginTop: '1px' }}>
                        <span className={`upi-chip ${isBlocked ? 'upi-chip-block' : isSuspicious ? 'upi-chip-verify' : 'upi-chip-safe'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {isBlocked ? 'BLOCKED' : isSuspicious ? 'SUSPICIOUS' : 'SAFE'}
                        </span>
                      </div>
                    </div>

                    <ChevronRight size={15} color="var(--text-muted)" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
            <FileText size={28} style={{ margin: '0 auto 6px auto', opacity: 0.35 }} />
            <p style={{ fontSize: '12.5px' }}>No transactions found matching filter.</p>
          </div>
        )}
      </div>

      {/* Detailed Payment Statement Receipt Modal */}
      {selectedTx && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px'
        }}>
          <div className="pay-card" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '24px 20px',
            position: 'relative',
            boxShadow: 'var(--shadow-float)',
            border: `1.5px solid ${(selectedTx.result === 'BLOCK' || selectedTx.fraud_flag) ? 'rgba(244, 67, 54, 0.4)' : 'rgba(0, 200, 83, 0.4)'}`
          }}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedTx(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            {/* Receipt Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: (selectedTx.result === 'BLOCK' || selectedTx.fraud_flag) ? 'rgba(244, 67, 54, 0.15)' : 'rgba(0, 200, 83, 0.15)',
                border: `2px solid ${(selectedTx.result === 'BLOCK' || selectedTx.fraud_flag) ? '#f44336' : '#00c853'}`,
                color: (selectedTx.result === 'BLOCK' || selectedTx.fraud_flag) ? '#f44336' : '#00c853',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                {(selectedTx.result === 'BLOCK' || selectedTx.fraud_flag) ? <ShieldAlert size={26} /> : <Check size={26} />}
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '2px' }}>
                ₹{Number(selectedTx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p style={{ fontSize: '12.5px', color: (selectedTx.result === 'BLOCK' || selectedTx.fraud_flag) ? '#f44336' : '#00c853', fontWeight: '700' }}>
                {(selectedTx.result === 'BLOCK' || selectedTx.fraud_flag) ? 'Transaction Blocked (Fraud Risk)' : 'Paid Successfully via SecurePay UPI'}
              </p>
            </div>

            {/* Details Table */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>To</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>{selectedTx.merchant_name || 'Merchant'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date & Time</span>
                <span style={{ color: '#ffffff' }}>{new Date(selectedTx.timestamp).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>UPI Ref No.</span>
                <span style={{ color: '#ffffff', fontFamily: 'JetBrains Mono, monospace' }}>{selectedTx.id ? `TXN${selectedTx.id * 1029384}` : 'UPI8392019482'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Location</span>
                <span style={{ color: '#ffffff' }}>{selectedTx.location || 'Mumbai'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>AI Risk Score</span>
                <span style={{
                  color: selectedTx.risk >= 70 ? '#f44336' : selectedTx.risk >= 30 ? '#ff9800' : '#00c853',
                  fontWeight: '800'
                }}>
                  {selectedTx.risk ?? 8} / 100
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>AI Evaluation</span>
                <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{selectedTx.reason || 'AI Ensemble Analysis'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="btn-pay-primary"
              style={{ width: '100%', padding: '11px', fontSize: '13.5px' }}
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
