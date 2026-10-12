import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AdminAuthModal } from './components/AdminAuthModal';
import { AdminDatabasePanel } from './components/AdminDatabasePanel';
import { ServerSettingsModal } from './components/ServerSettingsModal';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ScanQRPay } from './pages/ScanQRPay';
import { PayAnyone } from './pages/PayAnyone';
import { TransactionHistory } from './pages/TransactionHistory';
import { FraudSimulator } from './pages/FraudSimulator';
import { 
  Home, 
  QrCode, 
  Send, 
  History, 
  ShieldCheck,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

const MainLayout = () => {
  const { user, checkHealth } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Admin Database Portal States
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('securepay_admin_token') || '');

  // Server Connection Settings Modal State
  const [showServerSettings, setShowServerSettings] = useState(false);

  const handleOpenAdmin = () => {
    if (adminToken) {
      setShowAdminPanel(true);
    } else {
      setShowAdminAuth(true);
    }
  };

  const handleAdminAuthSuccess = (token) => {
    setAdminToken(token);
    setShowAdminAuth(false);
    setShowAdminPanel(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('securepay_admin_token');
    setAdminToken('');
    setShowAdminPanel(false);
  };

  const bottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'scan-qr', label: 'Scan QR', icon: QrCode },
    { id: 'pay-anyone', label: 'Pay', icon: Send },
    { id: 'history', label: 'History', icon: History },
    { id: 'simulator', label: 'AI Guard', icon: ShieldCheck },
  ];

  return (
    <div className="phone-wrapper-canvas">
      {/* Desktop Ambient Header */}
      <div className="desktop-showcase-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '0.05em',
            padding: '3px 8px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #7c4dff 0%, #1a73e8 100%)',
            color: '#ffffff'
          }}>
            SECUREPAY AI
          </span>
          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
            AI-Powered QR & Digital Payment Fraud Detection System
          </span>
        </div>
      </div>

      {/* Main Smartphone Shell (Interactive Mockup) */}
      <div className="phone-frame">
        {/* Top Speaker Notch / Dynamic Island */}
        <div className="phone-notch-container">
          <div className="phone-dynamic-island">
            <div className="phone-camera-lens" />
            <div className="phone-speaker-grille" />
          </div>
        </div>

        {/* Mobile Status Bar (9:41, 5G, Wi-Fi, 100% Battery) */}
        <div className="phone-status-bar">
          <span className="phone-status-time">9:41</span>
          <div className="phone-status-icons">
            <Signal size={13} />
            <Wifi size={13} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '10px', fontWeight: '700' }}>100%</span>
              <Battery size={14} />
            </div>
          </div>
        </div>

        {/* Inner Scrollable App Screen */}
        <div className="app-shell">
          {!user ? (
            <Login onOpenServerSettings={() => setShowServerSettings(true)} />
          ) : (
            <>
              {/* Mobile App Header */}
              <Navbar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onOpenAdmin={handleOpenAdmin}
                onOpenServerSettings={() => setShowServerSettings(true)}
              />

              {/* Screen Content Body */}
              <main className="app-screen-content">
                {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
                {activeTab === 'scan-qr' && <ScanQRPay setActiveTab={setActiveTab} />}
                {activeTab === 'pay-anyone' && <PayAnyone setActiveTab={setActiveTab} />}
                {activeTab === 'history' && <TransactionHistory setActiveTab={setActiveTab} />}
                {activeTab === 'simulator' && <FraudSimulator setActiveTab={setActiveTab} />}
              </main>

              {/* Bottom Mobile Navigation Dock */}
              <nav className="phone-bottom-nav">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`phone-nav-item ${isActive ? 'active' : ''}`}
                    >
                      <div className="phone-nav-icon-wrap">
                        <Icon size={19} />
                      </div>
                      <span className="phone-nav-label">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </>
          )}

          {/* Bottom Home Indicator Gesture Bar */}
          <div className="phone-home-indicator">
            <div className="phone-home-bar" />
          </div>
        </div>
      </div>

      {/* Backend Server Settings & IP Configuration Modal */}
      <ServerSettingsModal
        isOpen={showServerSettings}
        onClose={() => setShowServerSettings(false)}
        onServerChanged={checkHealth}
      />

      {/* Admin Password Verification Modal */}
      <AdminAuthModal
        isOpen={showAdminAuth}
        onClose={() => setShowAdminAuth(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* Admin Full Database Management Modal Panel */}
      <AdminDatabasePanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        onLogout={handleAdminLogout}
        token={adminToken}
      />
    </div>
  );
};


export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
