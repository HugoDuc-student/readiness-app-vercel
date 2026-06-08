import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
  BarChart, Bar
} from 'recharts';
import { MetricCard, Card, SectionTitle } from './UI';
import { colorFromScore, COLOR_MAP, interpretDelta, calcDelta, formatDateShort } from '../metrics';

function exportCSV(entries) {
  const rows = [
    ['date','sommeil','fatigue_matin','douleurs','stress','vitalite','hooper','hrv','fc_repos','fatigue_overall','rpe','fatigue_post','feeling','motivation','fc_seance','duree_min','charge_interne','fatigue_training','delta_fatigue']
  ];
  Object.keys(entries).sort().forEach(d => {
    const m = entries[d]?.morning;
    const p = entries[d]?.post_session;
    const delta = m && p ? (p.fatigue_training - m.fatigue_overall).toFixed(1) : '';
    rows.push([
      d,
      m?.sleep ?? '', m?.fatigue ?? '', m?.soreness ?? '', m?.stress ?? '', m?.vitality ?? '',
      m?.hooper ?? '', m?.hrv ?? '', m?.restingHr ?? '', m?.fatigue_overall?.toFixed(1) ?? '',
      p?.rpe ?? '', p?.postFatigue ?? '', p?.feeling ?? '', p?.motivation ?? '',
      p?.sessionHr ?? '', p?.duration ?? '', p?.training_load ?? '',
      p?.fatigue_training?.toFixed(1) ?? '', delta,
    ]);
  });
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `enduraw_readiness_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 500, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>{p.name} : {p.value?.toFixed(1)}</div>
      ))}
    </div>
  );
};

export default function Dashboard({ entries }) {
  const days = Object.keys(entries).sort();
  const last7 = days.slice(-7);
  const last14 = days.slice(-14);

  const chartData = useMemo(() => last14.map(d => ({
    date: formatDateShort(d),
    'Fatigue matin': entries[d]?.morning?.fatigue_overall ?? null,
    'Fatigue séance': entries[d]?.post_session?.fatigue_training ?? null,
    'Δ': entries[d]?.morning && entries[d]?.post_session
      ? calcDelta(entries[d].morning.fatigue_overall, entries[d].post_session.fatigue_training)
      : null,
    hooper: entries[d]?.morning?.hooper ?? null,
  })), [entries, last14]);

  const hoopers = last7.map(d => entries[d]?.morning?.hooper).filter(Boolean);
  const avgHooper = hoopers.length ? (hoopers.reduce((a, b) => a + b, 0) / hoopers.length).toFixed(1) : '—';

  const fos = last7.map(d => entries[d]?.morning?.fatigue_overall).filter(v => v != null);
  const avgFo = fos.length ? (fos.reduce((a, b) => a + b, 0) / fos.length).toFixed(1) : '—';

  const deltas = last7.map(d => {
    if (!entries[d]?.morning || !entries[d]?.post_session) return null;
    return calcDelta(entries[d].morning.fatigue_overall, entries[d].post_session.fatigue_training);
  }).filter(v => v != null);
  const avgDelta = deltas.length ? (deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(1) : '—';

  const latestDay = last7[last7.length - 1];
  const latest = latestDay ? entries[latestDay] : null;
  const latestDelta = latest?.morning && latest?.post_session
    ? calcDelta(latest.morning.fatigue_overall, latest.post_session.fatigue_training) : null;

  const hooTrend = last7.map(d => ({ date: formatDateShort(d), hooper: entries[d]?.morning?.hooper ?? null }));

  if (days.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--gray-400)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>Aucune donnée encore</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>Commencez par le bilan matin pour voir vos données ici.</div>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Résumé — 7 derniers jours</span>
        <button
          onClick={() => exportCSV(entries)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'transparent', border: '1px solid var(--gray-200)', borderRadius: 8, fontSize: 12, fontWeight: 500, color: 'var(--gray-600)', cursor: 'pointer', fontFamily: 'var(--font)' }}
        >
          ↓ Exporter CSV
        </button>
      </div>

      <div style={styles.metricsGrid}>
        <MetricCard
          label="Fatigue moy."
          value={avgFo !== '—' ? avgFo : '—'}
          unit="sur 10"
          color={avgFo !== '—' ? colorFromScore(Number(avgFo)) : undefined}
        />
        <MetricCard
          label="Hooper moy."
          value={avgHooper}
          unit="sur 28"
          color={avgHooper !== '—' ? colorFromScore(Number(avgHooper) / 28 * 10) : undefined}
        />
        {avgDelta !== '—' && (
          <MetricCard
            label="Δ moy. séance"
            value={(Number(avgDelta) > 0 ? '+' : '') + avgDelta}
            unit="matin → séance"
            color={Number(avgDelta) < 0 ? 'green' : Number(avgDelta) > 2 ? 'red' : 'amber'}
          />
        )}
        <MetricCard
          label="Jours tracés"
          value={days.length}
          unit="entrées totales"
        />
      </div>

      <Card>
        <div style={styles.chartTitle}>Fatigue matin vs post-séance</div>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 12 }}>fatigue_overall · fatigue_training · 14 jours</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={6.5} stroke={COLOR_MAP.red} strokeDasharray="4 4" strokeOpacity={0.4} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Fatigue matin" stroke={COLOR_MAP.green} strokeWidth={2} dot={{ r: 3 }} connectNulls />
            <Line type="monotone" dataKey="Fatigue séance" stroke={COLOR_MAP.red} strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div style={styles.chartTitle}>Delta fatigue (Δ matin → séance)</div>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 12 }}>Positif = séance fatiguante · Négatif = séance régénératrice</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="var(--gray-400)" />
            <Bar dataKey="Δ" fill={COLOR_MAP.amber} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div style={styles.chartTitle}>Hooper index</div>
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 12 }}>Seuils : &lt;14 récupéré · 14–21 partiel · &gt;21 sous-récupération</div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={hooTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
            <YAxis domain={[4, 28]} tick={{ fontSize: 11, fill: 'var(--gray-400)' }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={14} stroke={COLOR_MAP.green} strokeDasharray="4 4" strokeOpacity={0.5} />
            <ReferenceLine y={21} stroke={COLOR_MAP.red} strokeDasharray="4 4" strokeOpacity={0.5} />
            <Line type="monotone" dataKey="hooper" stroke="#378ADD" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle>Historique</SectionTitle>
      {days.slice().reverse().map(d => {
        const e = entries[d];
        const delta = e?.morning && e?.post_session
          ? calcDelta(e.morning.fatigue_overall, e.post_session.fatigue_training) : null;
        const interp = delta !== null ? interpretDelta(delta) : null;
        return (
          <div key={d} style={styles.historyItem}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>
                {new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                {e?.morning ? '☀️ matin' : ''}
                {e?.morning && e?.post_session ? '  ·  ' : ''}
                {e?.post_session ? `🏃 ${e.post_session.duration ? e.post_session.duration + ' min' : 'séance'}` : ''}
              </div>
              {interp && <div style={{ fontSize: 11, color: COLOR_MAP[interp.color], marginTop: 3 }}>{interp.label}</div>}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {e?.morning && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: COLOR_MAP[colorFromScore(e.morning.fatigue_overall)], fontFamily: 'var(--font-mono)' }}>
                    {e.morning.fatigue_overall.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>matin</div>
                </div>
              )}
              {e?.post_session && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: COLOR_MAP[colorFromScore(e.post_session.fatigue_training)], fontFamily: 'var(--font-mono)' }}>
                    {e.post_session.fatigue_training.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>séance</div>
                </div>
              )}
              {delta !== null && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: COLOR_MAP[interp.color], fontFamily: 'var(--font-mono)' }}>
                    {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>Δ</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  section: { padding: '16px 16px 40px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
  chartTitle: { fontSize: 14, fontWeight: 500, color: 'var(--gray-900)' },
  historyItem: {
    background: '#fff',
    border: '1px solid var(--gray-100)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
};
