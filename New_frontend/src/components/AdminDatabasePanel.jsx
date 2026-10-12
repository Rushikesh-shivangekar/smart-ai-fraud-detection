import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Users, 
  CreditCard, 
  ShieldAlert, 
  History, 
  KeyRound, 
  Search, 
  Trash2, 
  RefreshCw, 
  X, 
  LogOut, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  ArrowUpDown
} from 'lucide-react';
import { adminAPI } from '../api/client';

export const AdminDatabasePanel = ({ isOpen, onClose, onLogout, token }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }

  const tabs = [
    { id: 'users', label: 'Users', icon: Users, table: 'fraud_system.users' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, table: 'fraud_system.transactions' },
    { id: 'fraud_alerts', label: 'Fraud Alerts', icon: ShieldAlert, table: 'fraud_system.transactions (Blocked)' },
    { id: 'login_history', label: 'Login History', icon: History, table: 'fraud_system.login_history' },
    { id: 'otp_verification', label: 'OTP Logs', icon: KeyRound, table: 'fraud_system.otp_verification' },
  ];

  // Fetch stats and active table data
  const loadStats = async () => {
    try {
      const res = await adminAPI.getStats(token);
      setStats(res.data);
    } catch (err) {
      console.warn('Failed to load stats:', err);
      if (err.status === 401) {
        onLogout();
      }
    }
  };

  const loadTableData = async (tab = activeTab, query = searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getTable(tab, query, token);
      setRecords(res.data.records || []);
    } catch (err) {
      console.error('Failed to load table data:', err);
      setError(err.message || 'Failed to fetch database table records.');
      if (err.status === 401) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      loadStats();
      loadTableData(activeTab, searchQuery);
    }
  }, [isOpen, activeTab, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadTableData(activeTab, searchQuery);
  };

  const handleDelete = async (recordId) => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await adminAPI.deleteRecord(activeTab, recordId, token);
      setSuccessMsg(res.data?.message || `Record #${recordId} deleted successfully.`);
      setDeleteConfirm(null);
      // Refresh current table and stats
      loadTableData(activeTab, searchQuery);
      loadStats();
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || `Failed to delete record #${recordId}.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 13, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      zIndex: 99998
    }}>
      <div style={{
        maxWidth: '920px',
        width: '100%',
        maxHeight: '90vh',
        backgroundColor: '#0f121d',
        border: '1px solid rgba(124, 77, 255, 0.35)',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(124, 77, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(26, 30, 48, 0.8) 0%, rgba(15, 18, 29, 0.8) 100%)',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c4dff 0%, #00c853 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(124, 77, 255, 0.4)'
            }}>
              <Database size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Admin Database Control Panel
                </h3>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(0, 200, 83, 0.15)',
                  color: '#00c853',
                  border: '1px solid rgba(0, 200, 83, 0.3)'
                }}>
                  MySQL: localhost:3306
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                Full CRUD control across MySQL tables with Localhost API Protection
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => { loadStats(); loadTableData(activeTab, searchQuery); }}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#e2e8f0',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Refresh Data"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              style={{
                background: 'rgba(244, 67, 54, 0.12)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#ff8a80',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Exit Admin Mode"
            >
              <LogOut size={13} />
              <span>Logout Admin</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Metric Cards Banner */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            padding: '14px 20px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ background: 'rgba(124, 77, 255, 0.1)', border: '1px solid rgba(124, 77, 255, 0.25)', borderRadius: '12px', padding: '10px 12px' }}>
              <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '600', display: 'block' }}>Total Users</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>{stats.total_users}</span>
            </div>
            <div style={{ background: 'rgba(0, 200, 83, 0.1)', border: '1px solid rgba(0, 200, 83, 0.25)', borderRadius: '12px', padding: '10px 12px' }}>
              <span style={{ fontSize: '11px', color: '#69f0ae', fontWeight: '600', display: 'block' }}>Transactions</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>{stats.total_transactions}</span>
            </div>
            <div style={{ background: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.25)', borderRadius: '12px', padding: '10px 12px' }}>
              <span style={{ fontSize: '11px', color: '#ff8a80', fontWeight: '600', display: 'block' }}>Fraud Blocked</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#ff5252' }}>{stats.fraud_alerts_blocked}</span>
            </div>
            <div style={{ background: 'rgba(26, 115, 232, 0.1)', border: '1px solid rgba(26, 115, 232, 0.25)', borderRadius: '12px', padding: '10px 12px' }}>
              <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: '600', display: 'block' }}>Login Logs</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>{stats.total_login_logs}</span>
            </div>
          </div>
        )}

        {/* Tab Selection & Search Row */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '10px' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: isActive ? '700' : '600',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? '#7c4dff' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 2px 8px rgba(124, 77, 255, 0.4)' : 'none'
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="pay-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search username, ID, status..."
                style={{ paddingLeft: '32px', paddingRight: '28px', height: '34px', fontSize: '12px', width: '220px' }}
              />
              <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); loadTableData(activeTab, ''); }}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="btn-pay-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', height: '34px' }}
            >
              Filter
            </button>
          </form>
        </div>

        {/* Feedback Notifications */}
        {error && (
          <div style={{ margin: '10px 20px 0', backgroundColor: 'rgba(244, 67, 54, 0.15)', border: '1px solid rgba(244, 67, 54, 0.4)', borderRadius: '8px', padding: '8px 12px', color: '#ff8a80', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div style={{ margin: '10px 20px 0', backgroundColor: 'rgba(0, 200, 83, 0.15)', border: '1px solid rgba(0, 200, 83, 0.4)', borderRadius: '8px', padding: '8px 12px', color: '#69f0ae', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Table Body */}
        <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, padding: '14px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#7c4dff' }} />
              <p style={{ fontSize: '12px' }}>Querying MySQL Database...</p>
            </div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <Database size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ fontSize: '13px', fontWeight: '600' }}>No records found in table</p>
              <p style={{ fontSize: '11px' }}>Try clearing the search query or register/transact new activity.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#e2e8f0' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', fontWeight: '700' }}>ID</th>
                  {activeTab === 'users' && (
                    <>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Username</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Full Name</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Email</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Phone</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Balance</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Created At</th>
                    </>
                  )}
                  {(activeTab === 'transactions' || activeTab === 'fraud_alerts') && (
                    <>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>User</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Merchant</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Amount</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Result</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Risk Score</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Reason</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Timestamp</th>
                    </>
                  )}
                  {activeTab === 'login_history' && (
                    <>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Username</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Status</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>IP Address</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Device Info</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Login Time</th>
                    </>
                  )}
                  {activeTab === 'otp_verification' && (
                    <>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Username</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>OTP Code</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Status</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Created At</th>
                    </>
                  )}
                  <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '10px', fontWeight: '700', color: '#7c4dff' }}>#{row.id}</td>
                    
                    {activeTab === 'users' && (
                      <>
                        <td style={{ padding: '10px' }}>
                          <span style={{ fontWeight: '700', color: '#ffffff' }}>{row.username}</span>
                          <span style={{ fontSize: '10px', color: '#7c4dff', display: 'block' }}>@{row.username}</span>
                        </td>
                        <td style={{ padding: '10px' }}>{row.full_name || '—'}</td>
                        <td style={{ padding: '10px', color: '#94a3b8' }}>{row.email || '—'}</td>
                        <td style={{ padding: '10px', color: '#94a3b8' }}>{row.phone || '—'}</td>
                        <td style={{ padding: '10px', fontWeight: '700', color: '#00c853' }}>
                          ₹{(row.balance || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px', fontSize: '11px', color: '#64748b' }}>{row.created_at || '—'}</td>
                      </>
                    )}

                    {(activeTab === 'transactions' || activeTab === 'fraud_alerts') && (
                      <>
                        <td style={{ padding: '10px', fontWeight: '700' }}>{row.username}</td>
                        <td style={{ padding: '10px' }}>{row.merchant_name || 'UPI Transfer'}</td>
                        <td style={{ padding: '10px', fontWeight: '700', color: '#ffffff' }}>
                          ₹{(row.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontSize: '10.5px',
                            fontWeight: '800',
                            backgroundColor: row.result === 'BLOCK' ? 'rgba(244, 67, 54, 0.15)' : (row.result === 'VERIFY' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(0, 200, 83, 0.15)'),
                            color: row.result === 'BLOCK' ? '#f44336' : (row.result === 'VERIFY' ? '#ff9800' : '#00c853'),
                            border: `1px solid ${row.result === 'BLOCK' ? 'rgba(244, 67, 54, 0.3)' : (row.result === 'VERIFY' ? 'rgba(255, 152, 0, 0.3)' : 'rgba(0, 200, 83, 0.3)')}`
                          }}>
                            {row.result}
                          </span>
                        </td>
                        <td style={{ padding: '10px', fontWeight: '700', color: row.risk >= 70 ? '#f44336' : (row.risk >= 30 ? '#ff9800' : '#00c853') }}>
                          {row.risk}%
                        </td>
                        <td style={{ padding: '10px', fontSize: '11px', color: '#94a3b8' }}>{row.reason || 'AI Scored'}</td>
                        <td style={{ padding: '10px', fontSize: '11px', color: '#64748b' }}>{row.timestamp || '—'}</td>
                      </>
                    )}

                    {activeTab === 'login_history' && (
                      <>
                        <td style={{ padding: '10px', fontWeight: '700' }}>{row.username}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '700',
                            backgroundColor: row.status === 'SUCCESS' ? 'rgba(0, 200, 83, 0.15)' : 'rgba(124, 77, 255, 0.15)',
                            color: row.status === 'SUCCESS' ? '#00c853' : '#a78bfa'
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px', color: '#94a3b8' }}>{row.ip_address}</td>
                        <td style={{ padding: '10px', color: '#64748b', fontSize: '11px' }}>{row.device_info || 'Web'}</td>
                        <td style={{ padding: '10px', fontSize: '11px', color: '#64748b' }}>{row.login_time}</td>
                      </>
                    )}

                    {activeTab === 'otp_verification' && (
                      <>
                        <td style={{ padding: '10px', fontWeight: '700' }}>{row.username}</td>
                        <td style={{ padding: '10px', fontWeight: '800', color: '#ffd54f', letterSpacing: '2px' }}>{row.otp_code}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '700',
                            backgroundColor: row.status === 'VERIFIED' ? 'rgba(0, 200, 83, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                            color: row.status === 'VERIFIED' ? '#00c853' : '#ff9800'
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px', fontSize: '11px', color: '#64748b' }}>{row.created_at}</td>
                      </>
                    )}

                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ id: row.id, name: row.username || `Record #${row.id}` })}
                        style={{
                          background: 'rgba(244, 67, 54, 0.1)',
                          border: '1px solid rgba(244, 67, 54, 0.25)',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          color: '#f44336',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          transition: 'all 0.15s ease'
                        }}
                        title={`Delete #${row.id}`}
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Status */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#94a3b8'
        }}>
          <span>Showing <strong>{records.length}</strong> records from table <code>{tabs.find(t => t.id === activeTab)?.table}</code></span>
          <span>Admin JWT Active • Expiry 2 Hours</span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 100000
        }}>
          <div style={{
            maxWidth: '360px',
            width: '100%',
            backgroundColor: '#161926',
            border: '1px solid rgba(244, 67, 54, 0.4)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <ShieldAlert size={20} color="#f44336" />
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>
                Confirm MySQL Deletion
              </h4>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4', marginBottom: '16px' }}>
              Are you sure you want to permanently delete <strong>{deleteConfirm.name}</strong> (ID #{deleteConfirm.id}) from MySQL table <code>{activeTab}</code>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="btn-pay-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm.id)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#f44336',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
