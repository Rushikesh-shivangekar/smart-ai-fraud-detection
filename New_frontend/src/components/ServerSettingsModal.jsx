import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Wifi, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Laptop, 
  Smartphone, 
  Globe, 
  Check, 
  Info,
  ExternalLink,
  Save,
  RotateCcw
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl, testApiUrl, getEngineMode, setEngineMode } from '../api/client';

export const ServerSettingsModal = ({ isOpen, onClose, onServerChanged }) => {
  const [engineMode, setEngineModeState] = useState(() => getEngineMode());
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [testStatus, setTestStatus] = useState({ state: 'idle', message: '', latency: null });
  const [isSaving, setIsSaving] = useState(false);

  // Common preconfigured presets
  const presets = [
    { label: 'Laptop Wi-Fi IP (Recommended for APK)', url: 'http://172.22.37.151:8000', icon: Smartphone },
    { label: 'Localhost (PC Browser)', url: 'http://127.0.0.1:8000', icon: Laptop },
  ];

  useEffect(() => {
    if (isOpen) {
      setEngineModeState(getEngineMode());
      const active = getApiBaseUrl();
      setCurrentUrl(active);
      setInputUrl(active);
      setTestStatus({ state: 'idle', message: '', latency: null });
      // Auto test current connection
      runTest(active);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runTest = async (urlToTest) => {
    const target = urlToTest || inputUrl;
    if (!target.trim()) {
      setTestStatus({ state: 'error', message: 'Please enter a valid URL', latency: null });
      return;
    }
    setTestStatus({ state: 'testing', message: 'Pinging FastAPI /health endpoint...', latency: null });
    const result = await testApiUrl(target);
    if (result.success) {
      setTestStatus({
        state: 'success',
        message: `Connected! FastAPI Status: ${result.data?.status || 'Healthy'}`,
        latency: result.latency,
      });
    } else {
      setTestStatus({
        state: 'error',
        message: `Failed: ${result.error}. Ensure backend is running with --host 0.0.0.0 and your phone is on the same Wi-Fi.`,
        latency: result.latency,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setEngineMode(engineMode);
    const cleaned = setApiBaseUrl(inputUrl);
    setCurrentUrl(cleaned);
    if (onServerChanged) {
      await onServerChanged(cleaned);
    }
    setIsSaving(false);
    onClose();
  };

  const handleReset = () => {
    const defaultUrl = resetApiBaseUrl();
    setInputUrl(defaultUrl);
    setCurrentUrl(defaultUrl);
    runTest(defaultUrl);
  };

  const handlePresetSelect = (url) => {
    setInputUrl(url);
    runTest(url);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: '#131622',
        border: '1px solid rgba(124, 77, 255, 0.35)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 77, 255, 0.2)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(124, 77, 255, 0.12) 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c4dff 0%, #1a73e8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 77, 255, 0.4)'
            }}>
              <Server size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>
                Backend Server Settings
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                Connect APK / Mobile App to FastAPI Backend
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Architecture Mode Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>
              ⚙️ Deployment & Execution Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setEngineModeState('standalone')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: engineMode === 'standalone' ? 'rgba(0, 200, 83, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1.5px solid ${engineMode === 'standalone' ? '#00c853' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '12.5px', color: engineMode === 'standalone' ? '#69f0ae' : '#ffffff' }}>
                  <span>⚡ Standalone Mode</span>
                  {engineMode === 'standalone' && <Check size={14} color="#00c853" />}
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', lineHeight: 1.3 }}>
                  100% On-Device. Works on phone without PC or server. Perfect for APK.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEngineModeState('auto')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  backgroundColor: engineMode !== 'standalone' ? 'rgba(124, 77, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1.5px solid ${engineMode !== 'standalone' ? '#7c4dff' : 'rgba(255, 255, 255, 0.08)'}`,
                  color: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '12.5px', color: engineMode !== 'standalone' ? '#b388ff' : '#ffffff' }}>
                  <span>🌐 Live Backend IP</span>
                  {engineMode !== 'standalone' && <Check size={14} color="#7c4dff" />}
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', lineHeight: 1.3 }}>
                  Connects to laptop's FastAPI backend over Wi-Fi.
                </span>
              </button>
            </div>
          </div>

          {/* Active Status Badge */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                Currently Configured URL:
              </span>
              <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'JetBrains Mono, monospace', color: '#7c4dff', marginTop: '2px', wordBreak: 'break-all' }}>
                {currentUrl}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: testStatus.state === 'success' ? 'rgba(0, 200, 83, 0.15)' : testStatus.state === 'error' ? 'rgba(244, 67, 54, 0.15)' : 'rgba(255, 152, 0, 0.15)',
              border: `1px solid ${testStatus.state === 'success' ? 'rgba(0, 200, 83, 0.4)' : testStatus.state === 'error' ? 'rgba(244, 67, 54, 0.4)' : 'rgba(255, 152, 0, 0.4)'}`,
              fontSize: '11px',
              fontWeight: '700',
              color: testStatus.state === 'success' ? '#00c853' : testStatus.state === 'error' ? '#f44336' : '#ff9800',
              flexShrink: 0
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: testStatus.state === 'success' ? '#00c853' : testStatus.state === 'error' ? '#f44336' : '#ff9800'
              }} />
              <span>{testStatus.state === 'success' ? 'Online' : testStatus.state === 'error' ? 'Offline' : 'Testing...'}</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px' }}>
              ⚡ 1-Click Quick Presets
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {presets.map((preset, idx) => {
                const Icon = preset.icon;
                const isSelected = inputUrl === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(preset.url)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(124, 77, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isSelected ? 'rgba(124, 77, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={16} color={isSelected ? '#c084fc' : '#94a3b8'} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                          {preset.label}
                        </div>
                        <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8' }}>
                          {preset.url}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check size={16} color="#00c853" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Server URL Input */}
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
              Custom Backend Server URL
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://172.22.37.151:8000 or https://xyz.ngrok-free.app"
                className="pay-input"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12.5px',
                  flex: 1
                }}
              />
              <button
                type="button"
                onClick={() => runTest(inputUrl)}
                disabled={testStatus.state === 'testing'}
                style={{
                  padding: '0 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(124, 77, 255, 0.2)',
                  border: '1px solid rgba(124, 77, 255, 0.4)',
                  color: '#c084fc',
                  fontWeight: '700',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <RefreshCw size={14} className={testStatus.state === 'testing' ? 'animate-spin' : ''} />
                Test
              </button>
            </div>
          </div>

          {/* Test Status Feedback Result */}
          {testStatus.message && (
            <div style={{
              borderRadius: '10px',
              padding: '10px 14px',
              backgroundColor: testStatus.state === 'success' ? 'rgba(0, 200, 83, 0.12)' : testStatus.state === 'error' ? 'rgba(244, 67, 54, 0.12)' : 'rgba(124, 77, 255, 0.12)',
              border: `1px solid ${testStatus.state === 'success' ? 'rgba(0, 200, 83, 0.35)' : testStatus.state === 'error' ? 'rgba(244, 67, 54, 0.35)' : 'rgba(124, 77, 255, 0.35)'}`,
              fontSize: '11.5px',
              color: testStatus.state === 'success' ? '#69f0ae' : testStatus.state === 'error' ? '#ff8a80' : '#b388ff',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              {testStatus.state === 'success' ? (
                <CheckCircle2 size={16} color="#00c853" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : testStatus.state === 'error' ? (
                <AlertCircle size={16} color="#f44336" style={{ flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <RefreshCw size={16} color="#7c4dff" className="animate-spin" style={{ flexShrink: 0, marginTop: '2px' }} />
              )}
              <div style={{ flex: 1 }}>
                <div>{testStatus.message}</div>
                {testStatus.latency !== null && (
                  <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
                    Response Time: {testStatus.latency} ms
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Android APK Connection Explainer */}
          <div style={{
            backgroundColor: 'rgba(26, 115, 232, 0.1)',
            border: '1px solid rgba(26, 115, 232, 0.3)',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '11px',
            color: '#93c5fd',
            lineHeight: 1.5
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', marginBottom: '4px', color: '#60a5fa' }}>
              <Info size={14} />
              <span>Why does the Android APK show "Cannot reach FastAPI"?</span>
            </div>
            <p style={{ margin: 0 }}>
              • On an Android phone, <b>127.0.0.1</b> refers to the phone itself.
              <br />
              • To connect the APK to your laptop, select your laptop's Wi-Fi IP address (<b>http://172.22.37.151:8000</b>).
              <br />
              • Ensure your Android phone and laptop are connected to the <b>same Wi-Fi</b> or phone hotspot.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          background: 'rgba(10, 12, 20, 0.6)'
        }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '11.5px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 8px'
            }}
          >
            <RotateCcw size={13} />
            Reset to Default
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c4dff 0%, #1a73e8 100%)',
                border: 'none',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 15px rgba(124, 77, 255, 0.4)'
              }}
            >
              <Save size={14} />
              {isSaving ? 'Saving...' : 'Save & Connect'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
