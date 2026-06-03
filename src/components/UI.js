import React from 'react';
import { COLOR_MAP, colorFromScore } from '../metrics';

// ─── SLIDER ITEM ──────────────────────────────────────────────────────────────
export function SliderItem({ label, sub, min = 1, max = 7, value, onChange, invert = false, lowLabel, highLabel }) {
  const score = invert ? (max + 1 - value) / max * 10 : value / max * 10;
  const color = colorFromScore(score);

  return (
    <div style={styles.card}>
      <div style={styles.itemLabel}>{label}</div>
      {sub && <div style={styles.itemSub}>{sub}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <input
          type="range" min={min} max={max} step={1} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: COLOR_MAP[color] }}
        />
        <span style={{ ...styles.sliderVal, color: COLOR_MAP[color] }}>{value}</span>
      </div>
      <div style={styles.scaleLabels}>
        <span>{lowLabel || 'faible'}</span>
        <span>{highLabel || 'élevé'}</span>
      </div>
    </div>
  );
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────
export function MetricCard({ label, value, unit, color, large }) {
  const c = color ? COLOR_MAP[color] : 'var(--gray-900)';
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={{ fontSize: large ? 32 : 26, fontWeight: 600, color: c, lineHeight: 1, marginTop: 4 }}>
        {value}
      </div>
      {unit && <div style={styles.metricUnit}>{unit}</div>}
    </div>
  );
}

// ─── SECTION TITLE ────────────────────────────────────────────────────────────
export function SectionTitle({ children, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: 4 }}>
      <span style={styles.sectionTitle}>{children}</span>
      {badge && <span style={styles.optBadge}>{badge}</span>}
    </div>
  );
}

// ─── SUBMIT BUTTON ────────────────────────────────────────────────────────────
export function SubmitButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...styles.submitBtn, opacity: disabled ? 0.5 : 1 }}
    >
      {children}
    </button>
  );
}

// ─── SUCCESS BANNER ───────────────────────────────────────────────────────────
export function SuccessBanner({ children }) {
  return (
    <div style={styles.successBanner}>
      <span style={{ fontSize: 18 }}>✓</span>
      <span style={{ fontSize: 13, color: '#085041', fontWeight: 500 }}>{children}</span>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <div style={{ ...styles.card, ...style }}>{children}</div>;
}

// ─── WARNING BANNER ───────────────────────────────────────────────────────────
export function WarnBanner({ children }) {
  return (
    <div style={styles.warnBanner}>{children}</div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={styles.progressTrack}>
      <div style={{ ...styles.progressFill, width: `${pct}%`, background: COLOR_MAP[color] || COLOR_MAP.green }} />
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  card: {
    background: '#fff',
    border: '1px solid var(--gray-100)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
    marginBottom: 10,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--gray-900)',
  },
  itemSub: {
    fontSize: 12,
    color: 'var(--gray-400)',
    marginTop: 2,
  },
  sliderVal: {
    fontSize: 18,
    fontWeight: 600,
    minWidth: 28,
    textAlign: 'right',
    fontFamily: 'var(--font-mono)',
  },
  scaleLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
    fontSize: 10,
    color: 'var(--gray-400)',
  },
  metricCard: {
    background: '#fff',
    border: '1px solid var(--gray-100)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
  },
  metricLabel: {
    fontSize: 11,
    color: 'var(--gray-400)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    fontWeight: 500,
  },
  metricUnit: {
    fontSize: 11,
    color: 'var(--gray-400)',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--gray-400)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  optBadge: {
    fontSize: 10,
    background: 'var(--gray-100)',
    color: 'var(--gray-600)',
    padding: '2px 8px',
    borderRadius: 20,
  },
  submitBtn: {
    width: '100%',
    padding: '15px',
    background: 'var(--green)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
    fontFamily: 'var(--font)',
    letterSpacing: '-0.2px',
    transition: 'opacity 0.15s',
  },
  successBanner: {
    background: 'var(--green-light)',
    border: '1px solid var(--green-mid)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  warnBanner: {
    background: 'var(--amber-light)',
    border: '1px solid #EF9F27',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    fontSize: 12,
    color: '#633806',
    marginBottom: 14,
  },
  progressTrack: {
    height: 4,
    background: 'var(--gray-100)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
};
