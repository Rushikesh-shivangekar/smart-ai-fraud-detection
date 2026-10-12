import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export const RiskGauge = ({ score = 0, riskLevel = 'Low', size = 180 }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Semi-circular or 240-degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * normalizedScore) / 100;

  const getColor = () => {
    if (normalizedScore < 30) return { main: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: 'Safe / Legitimate' };
    if (normalizedScore < 70) return { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: 'Suspicious / Verify' };
    return { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', text: 'Fraud Risk Blocked' };
  };

  const status = getColor();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <svg width={size} height={size * 0.85} style={{ overflow: 'visible' }}>
        {/* Glow Filter */}
        <defs>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Track Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={status.main}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#gauge-glow)"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease' }}
        />
      </svg>

      {/* Center Value */}
      <div style={{
        position: 'absolute',
        top: '36%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '38px',
          fontWeight: '800',
          fontFamily: 'Outfit, sans-serif',
          color: status.main,
          lineHeight: '1',
          textShadow: `0 0 20px ${status.glow}`
        }}>
          {score.toFixed(1)}
          <span style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-muted)' }}>/100</span>
        </div>
        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '4px' }}>
          FRAUD INDEX
        </div>
      </div>

      {/* Decision Status Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: `${status.main}1a`,
        border: `1px solid ${status.main}4d`,
        color: status.main,
        fontSize: '13px',
        fontWeight: '700',
        marginTop: '-10px',
        boxShadow: `0 4px 15px ${status.glow}`
      }}>
        {normalizedScore < 30 ? (
          <ShieldCheck size={16} />
        ) : normalizedScore < 70 ? (
          <AlertTriangle size={16} />
        ) : (
          <ShieldAlert size={16} />
        )}
        <span>{riskLevel.toUpperCase()} RISK • {status.text}</span>
      </div>
    </div>
  );
};
