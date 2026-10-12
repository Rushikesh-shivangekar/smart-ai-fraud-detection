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
  ArrowUpDown,
  Download
} from 'lucide-react';

export const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState('ALL');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fraudAPI.getTransactions(user?.username || 'demo_user');
      setTransactions(res.data || []);
    } catch (err) {
      console.warn('Error fetching transactions:', err);
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
    
    if (filterResult === 'ALL') return matchesSearch;
    if (filterResult === 'ALLOW') return matchesSearch && (tx.result === 'ALLOW' || tx.result === 'SUCCESS');
    if (filterResult === 'VERIFY') return matchesSearch && (tx.result === 'VERIFY' || tx.result === 'VERIFIED_ALLOW');
    if (filterResult === 'BLOCK') return matchesSearch && (tx.result === 'BLOCK' || tx.fraud_flag);
    return matchesSearch;
  });

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>
            Transaction History & Security Audit Log
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Complete audit trail with AI risk levels, reasons, and timestamps stored in PostgreSQL.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchTransactions}
            className="btn-secondary"
            style={{ padding: '10px 16px', fontSize: '13px' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin-slow' : ''} />
            Refresh Log
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <input
            type="text"
            className="glass-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by merchant, location, or reason..."
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'ALLOW', label: 'Safe / Allowed' },
            { id: 'VERIFY', label: 'OTP Verified' },
            { id: 'BLOCK', label: 'Fraud Blocked' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterResult(f.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: filterResult === f.id ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                backgroundColor: filterResult === f.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: filterResult === f.id ? '#93c5fd' : 'var(--text-secondary)',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="animate-spin-slow" style={{ margin: '0 auto 12px', display: 'block' }} />
            <p>Loading security audit logs...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>ID / Time</th>
                  <th style={{ padding: '14px 20px' }}>Merchant / Recipient</th>
                  <th style={{ padding: '14px 20px' }}>Location</th>
                  <th style={{ padding: '14px 20px' }}>Amount</th>
                  <th style={{ padding: '14px 20px' }}>AI Risk Score</th>
                  <th style={{ padding: '14px 20px' }}>Decision</th>
                  <th style={{ padding: '14px 20px' }}>Reason / Audit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, idx) => {
                  const isBlocked = tx.fraud_flag || tx.result === 'BLOCK';
                  const isVerify = tx.result === 'VERIFY' || tx.result === 'VERIFIED_ALLOW';
                  const riskScore = tx.risk ?? 15;

                  return (
                    <tr
                      key={tx.id || idx}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isBlocked ? 'rgba(239, 68, 68, 0.04)' : 'transparent')}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '600', color: '#f8fafc' }}>
                          #{tx.id}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {new Date(tx.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '600', color: '#f8fafc' }}>{tx.merchant_name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>user: {tx.username}</div>
                      </td>

                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                        {tx.location || 'Online'}
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          fontWeight: '700',
                          fontFamily: 'JetBrains Mono, monospace',
                          color: isBlocked ? '#ef4444' : '#f8fafc',
                          fontSize: '15px'
                        }}>
                          ₹{parseFloat(tx.amount || 0).toFixed(2)}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontWeight: '700',
                            fontFamily: 'JetBrains Mono, monospace',
                            color: riskScore > 60 ? '#ef4444' : riskScore > 30 ? '#f59e0b' : '#10b981'
                          }}>
                            {riskScore}
                          </span>
                          <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(riskScore, 100)}%`,
                              height: '100%',
                              backgroundColor: riskScore > 60 ? '#ef4444' : riskScore > 30 ? '#f59e0b' : '#10b981'
                            }} />
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span className={`badge ${isBlocked ? 'badge-block' : isVerify ? 'badge-verify' : 'badge-safe'}`}>
                          {isBlocked ? 'Blocked' : isVerify ? 'OTP Verified' : 'Allowed'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        {tx.reason || 'AI Scored'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <History size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.5 }} />
            <p style={{ fontSize: '14px' }}>No matching transaction logs found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
