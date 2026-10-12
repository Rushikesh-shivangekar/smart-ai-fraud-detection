import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ScanQRPay } from './pages/ScanQRPay';
import { PayAnyone } from './pages/PayAnyone';
import { TransactionHistory } from './pages/TransactionHistory';
import { FraudSimulator } from './pages/FraudSimulator';

const MainLayout = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'scan-qr' && <ScanQRPay />}
        {activeTab === 'pay-anyone' && <PayAnyone />}
        {activeTab === 'history' && <TransactionHistory />}
        {activeTab === 'simulator' && <FraudSimulator />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '20px',
        textAlign: 'center',
        fontSize: '12.5px',
        color: 'var(--text-muted)',
        backgroundColor: 'rgba(11, 15, 25, 0.95)'
      }}>
        Smart AI Fraud Detection System for Digital & QR Payments • Capstone Project • React + FastAPI + PostgreSQL + ML/DL
      </footer>
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
