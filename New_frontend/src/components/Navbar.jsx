import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  QrCode, 
  LogOut, 
  Copy, 
  Check, 
  User, 
  Bell,
  Sparkles,
  Lock,
  Server,
  Settings
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenAdmin, onOpenServerSettings }) => {
  const { user, isSystemOnline, serverUrl, logout } = useAuth();
  const [copied, setCopied] = useState(false);

  const upiId = user?.upiId || `${user?.username || 'user'}@securepay`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header style={{
      position: 'relative',
      top: 0,
      zIndex: 40,
      flexShrink: 0,
      background: 'rgba(10, 12, 20, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '8px 12px',
      marginBottom: '4px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        {/* Left: App Logo & User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* User Profile Avatar with Initials */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c4dff 0%, #00897b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '13px',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(124, 77, 255, 0.35)',
              position: 'relative',
              flexShrink: 0
            }}
          >
            {(user?.username || 'U').slice(0, 2).toUpperCase()}
            <span style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-1px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isSystemOnline ? '#00c853' : '#ff9800',
              border: '2px solid #0a0c14'
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: '800',
                fontSize: '16px',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff 0%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                SecurePay
              </span>
              <span style={{
                fontSize: '9px',
                fontWeight: '800',
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'linear-gradient(135deg, #7c4dff 0%, #1a73e8 100%)',
                color: '#ffffff',
                letterSpacing: '0.04em'
              }}>
                AI
              </span>
            </div>

            {/* UPI ID Pill */}
            <button
              onClick={copyUpi}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                cursor: 'pointer',
                padding: 0,
                marginTop: '1px'
              }}
              title="Click to copy UPI ID"
            >
              <span>{upiId}</span>
              {copied ? <Check size={11} color="#00c853" /> : <Copy size={10} color="#94a3b8" />}
            </button>
          </div>
        </div>

        {/* Right: AI Protection Badge & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Prominent AI Protection: ACTIVE Badge */}
          <div 
            onClick={() => setActiveTab('simulator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 9px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 200, 83, 0.12)',
              border: '1px solid rgba(0, 200, 83, 0.35)',
              cursor: 'pointer',
              fontSize: '10.5px',
              fontWeight: '700',
              color: '#00c853',
              boxShadow: '0 0 10px rgba(0, 200, 83, 0.15)',
              transition: 'all 0.2s ease'
            }}
            title="AI Protection Engine: ACTIVE"
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#00c853',
              display: 'inline-block',
              boxShadow: '0 0 6px #00c853'
            }} className="animate-pulse-glow" />
            <span>AI: ACTIVE</span>
          </div>

          {/* Quick Scan Button */}
          <button
            onClick={() => setActiveTab('scan-qr')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Scan any QR Code"
          >
            <QrCode size={15} />
          </button>

          {/* Server Settings Button */}
          <button
            onClick={onOpenServerSettings}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isSystemOnline ? 'rgba(0, 200, 83, 0.1)' : 'rgba(255, 152, 0, 0.15)',
              border: `1px solid ${isSystemOnline ? 'rgba(0, 200, 83, 0.3)' : 'rgba(255, 152, 0, 0.4)'}`,
              color: isSystemOnline ? '#69f0ae' : '#ffb74d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={`Backend Server: ${serverUrl} (${isSystemOnline ? 'Online' : 'Offline'})`}
          >
            <Server size={14} />
          </button>


          {/* Logout Button */}
          <button
            onClick={logout}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.25)',
              color: '#f44336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
