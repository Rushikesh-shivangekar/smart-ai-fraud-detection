import React from 'react';
import { Cpu, CreditCard, UserCheck, QrCode } from 'lucide-react';

export const ScoreBreakdown = ({ debugScores = {} }) => {
  const models = [
    {
      id: 'transaction',
      name: 'Transaction Random Forest',
      weight: '30%',
      icon: Cpu,
      color: '#3b82f6',
      score: debugScores.transaction ?? 12.0,
      description: 'Evaluates amount deviation, merchant category, time of day, and location.',
    },
    {
      id: 'credit',
      name: 'Credit Risk Classifier',
      weight: '25%',
      icon: CreditCard,
      color: '#8b5cf6',
      score: debugScores.credit ?? 10.5,
      description: 'Analyzes demographic baselines and credit velocity patterns.',
    },
    {
      id: 'behavior',
      name: 'Behavioral Anomaly Net',
      weight: '20%',
      icon: UserCheck,
      color: '#06b6d4',
      score: debugScores.behavior ?? 8.0,
      description: 'Detects unusual spending speed, device swaps, and login frequency anomalies.',
    },
    {
      id: 'qr_image',
      name: 'Deep Learning QR CNN',
      weight: '25%',
      icon: QrCode,
      color: '#ec4899',
      score: debugScores.qr_image ?? (debugScores.qr ?? 5.0),
      description: 'Scans QR bitmap structure and payload integrity against tampering.',
    },
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
          4-Layer AI Ensemble Breakdown
        </h4>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Weighted Aggregation
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {models.map((m) => {
          const Icon = m.icon;
          const scoreVal = Math.min(Math.max(m.score, 0), 100);
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    backgroundColor: `${m.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={14} color={m.color} />
                  </div>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{m.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({m.weight})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontWeight: '700',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: scoreVal > 60 ? '#ef4444' : scoreVal > 30 ? '#f59e0b' : '#10b981'
                  }}>
                    {scoreVal.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${scoreVal}%`,
                  height: '100%',
                  backgroundColor: m.color,
                  borderRadius: '3px',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
