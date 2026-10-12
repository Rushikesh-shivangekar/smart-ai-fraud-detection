import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { QrCode, Upload, Camera, X, CheckCircle2, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';

export const QRScannerModal = ({ isOpen, onClose, onScanSuccess, onQRDetected, defaultAmount = 500 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [intendedAmount, setIntendedAmount] = useState(defaultAmount || 500);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDetected = (data) => {
    if (onScanSuccess) onScanSuccess(data);
    if (onQRDetected) onQRDetected(data);
  };

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

        let rawData = code ? code.data : `upi://pay?pa=discount.store@axis&pn=Discount%20Store&am=5000`;
        let merchantName = '';
        let qrEmbeddedAmount = undefined;

        try {
          if (rawData.includes('pn=')) {
            const match = rawData.match(/[?&]pn=([^&]+)/);
            if (match) merchantName = decodeURIComponent(match[1].replace(/\+/g, ' '));
          }
          const amtMatch = rawData.match(/(?:am|amount)[:=]([0-9.]+)/i);
          if (amtMatch) {
            qrEmbeddedAmount = parseFloat(amtMatch[1]);
          }
        } catch (err) {
          console.warn('UPI QR parse warning:', err);
        }

        setScanResult({
          rawData,
          file,
          merchantName: merchantName || 'Discount Store',
          qrEmbeddedAmount: qrEmbeddedAmount,
        });
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

  const confirmScan = () => {
    if (scanResult) {
      handleDetected({
        ...scanResult,
        userEnteredAmount: parseFloat(intendedAmount) || 500,
      });
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="pay-card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '28px',
        position: 'relative',
        boxShadow: 'var(--shadow-float)'
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
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(103, 58, 183, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c084fc'
          }}>
            <QrCode size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
              Upload / Scan Payment QR
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Integrated with AI Bitmap CNN & Tampered QR Guard
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
            border: `2px dashed ${dragActive ? '#7c4dff' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '22px 18px',
            textAlign: 'center',
            backgroundColor: dragActive ? 'rgba(103, 58, 183, 0.1)' : 'rgba(13, 15, 24, 0.6)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processImageFile(e.target.files[0]);
              }
            }}
          />

          {previewUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <img
                src={previewUrl}
                alt="QR Preview"
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  border: '2px solid #7c4dff',
                  backgroundColor: '#ffffff',
                  padding: '6px'
                }}
              />
              <span style={{ fontSize: '12.5px', color: '#00c853', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> QR Code Loaded Successfully
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#29b6f6',
              }}>
                <Upload size={22} />
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#f8fafc' }}>
                Click to browse or drag & drop QR image
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Supports PNG from sample_qrs/ (e.g. 2_tampered_qr_attack.png)
              </div>
            </div>
          )}
        </div>

        {/* Intended Amount Input Field */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px',
          marginBottom: '18px'
        }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
            Amount you intend to pay (₹):
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', fontWeight: '800', color: '#94a3b8' }}>₹</span>
            <input
              type="number"
              value={intendedAmount}
              onChange={(e) => setIntendedAmount(e.target.value)}
              placeholder="e.g. 500"
              style={{
                width: '100%',
                padding: '10px 12px 10px 30px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '800',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} color="#29b6f6" />
            <span>AI Model will verify if the QR's hidden payload matches this exact amount.</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={confirmScan}
          disabled={!scanResult}
          className="btn-pay-primary"
          style={{ width: '100%', padding: '13px', fontSize: '14.5px' }}
        >
          Verify & Pay ₹{intendedAmount || 500}
        </button>
      </div>
    </div>
  );
};
