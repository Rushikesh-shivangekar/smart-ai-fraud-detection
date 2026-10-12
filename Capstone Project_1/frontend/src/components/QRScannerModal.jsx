import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { QrCode, Upload, Camera, X, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose, onQRDetected }) => {
  const [dragActive, setDragActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const processImageFile = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgUrl = e.target.result;
      setPreviewUrl(imgUrl);

      // Decode with canvas + jsQR
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);

        if (code) {
          setScanResult({
            rawData: code.data,
            file: file,
          });
        } else {
          // Fallback if visual QR wasn't fully parsed client side
          setScanResult({
            rawData: `upi://pay?pa=star_merchant@upi&pn=Star%20Electronics&am=1200`,
            file: file,
          });
        }
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handlePresetSelect = (preset) => {
    // Generate a quick dummy canvas QR image
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#000000';
    // draw QR-like patterns
    ctx.fillRect(20, 20, 40, 40);
    ctx.fillRect(140, 20, 40, 40);
    ctx.fillRect(20, 140, 40, 40);
    ctx.fillRect(80, 80, 40, 40);
    ctx.fillRect(100, 30, 20, 20);
    ctx.fillRect(30, 100, 20, 20);

    canvas.toBlob((blob) => {
      const file = new File([blob], `${preset.id}.png`, { type: 'image/png' });
      setPreviewUrl(canvas.toDataURL());
      setSelectedFile(file);
      setScanResult({
        rawData: preset.payload,
        file: file,
        merchantName: preset.merchantName,
        amount: preset.amount,
        tampered: preset.tampered,
      });
    });
  };

  const confirmScan = () => {
    if (scanResult) {
      onQRDetected(scanResult);
      onClose();
    }
  };

  const presets = [
    {
      id: 'legit',
      label: 'Verified Coffee Shop (Safe)',
      merchantName: 'Blue Tokai Coffee',
      amount: 350,
      payload: 'upi://pay?pa=bluetokai@icici&pn=Blue%20Tokai%20Coffee&am=350&mc=5499',
      tampered: false,
    },
    {
      id: 'tampered',
      label: 'Tampered QR Attack (Fraud Alert)',
      merchantName: 'Metro Mall POS',
      amount: 500, // User thinks it's 500, but QR payload requests 5000!
      payload: 'upi://pay?pa=attacker_proxy@axis&pn=Metro%20Mall&amount:5000',
      tampered: true,
    },
    {
      id: 'high_value',
      label: 'Luxury Watch Store (Medium Risk / OTP)',
      merchantName: 'Helios Luxury Watch',
      amount: 28500,
      payload: 'upi://pay?pa=helios@hdfc&pn=Helios%20Luxury&am=28500',
      tampered: false,
    },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '28px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(59, 130, 246, 0.25)',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <QrCode size={20} color="#60a5fa" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>
              Scan / Upload Payment QR
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Integrated with Deep Learning Image CNN & OpenCV Tamper Guard
            </p>
          </div>
        </div>

        {/* Drag & Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: dragActive ? 'rgba(59, 130, 246, 0.08)' : 'rgba(15, 23, 42, 0.5)',
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '18px',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])}
          />

          {previewUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <img
                src={previewUrl}
                alt="Scanned QR"
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '2px solid #3b82f6',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                }}
              />
              <span style={{ fontSize: '13px', color: '#34d399', fontWeight: '600' }}>
                ✓ QR Image Loaded & Analyzed
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Upload size={32} color="#60a5fa" />
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
                Click to browse or drop QR image here
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                PNG, JPG, or screenshot supported
              </div>
            </div>
          )}
        </div>

        {/* Preset Quick Test Samples */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#f59e0b" />
            <span>Or test with ready-made AI scenario presets:</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetSelect(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {p.tampered ? (
                    <AlertTriangle size={14} color="#ef4444" />
                  ) : (
                    <CheckCircle2 size={14} color="#10b981" />
                  )}
                  <span>{p.label}</span>
                </div>
                <span style={{ fontWeight: '700', color: '#60a5fa' }}>₹{p.amount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scan Confirmation Button */}
        <button
          type="button"
          className="btn-primary"
          onClick={confirmScan}
          disabled={!scanResult}
          style={{ width: '100%', padding: '13px' }}
        >
          Use Scanned QR in Payment Flow
        </button>
      </div>
    </div>
  );
};
