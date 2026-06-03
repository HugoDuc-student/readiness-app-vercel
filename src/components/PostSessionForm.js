import React, { useState } from 'react';
import { SliderItem, SectionTitle, SubmitButton, SuccessBanner, MetricCard, Card, WarnBanner } from './UI';
import { calcFatigueTraining, calcDelta, interpretDelta, colorFromScore, COLOR_MAP } from '../metrics';

const FEELING_OPTS = [
  { val: -5, label: 'Très mauvais' },
  { val: -3, label: 'Mauvais' },
  { val: 0, label: 'Neutre' },
  { val: 3, label: 'Bien' },
  { val: 5, label: 'Très bien' },
];

const RPE_LABELS = {
  0: 'Repos', 1: 'Très léger', 2: 'Léger', 3: 'Modéré',
  4: 'Assez dur', 5: 'Dur', 6: 'Dur+', 7: 'Très dur',
  8: 'Très dur+', 9: 'Extrême', 10: 'Max absolu',
};

export default function PostSessionForm({ existing, morningData, onSave }) {
  const [rpe, setRpe] = useState(5);
  const [postFatigue, setPostFatigue] = useState(4);
  const [feeling, setFeeling] = useState(0);
  const [motivation, setMotivation] = useState(4);
  const [sessionHr, setSessionHr] = useState('');
  const [duration, setDuration] = useState('');
  const [saved, setSaved] = useState(false);

  if (existing) {
    const ft = existing.fatigue_training;
    const delta = morningData ? calcDelta(morningData.fatigue_overall, ft) : null;
    const interp = delta !== null ? interpretDelta(delta) : null;
    return (
      <div style={styles.section}>
        <SuccessBanner>Bilan post-séance déjà enregistré</SuccessBanner>
        <div style={styles.metricsGrid}>
          <MetricCard label="Fatigue séance" value={ft.toFixed(1)} unit="sur 10" color={colorFromScore(ft)} />
          {delta !== null && (
            <MetricCard label="Δ fatigue" value={(delta > 0 ? '+' : '') + delta.toFixed(1)} unit="vs matin" color={interp.color} />
          )}
        </div>
        {interp && (
          <Card style={{ borderLeft: `3px solid ${COLOR_MAP[interp.color]}` }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: COLOR_MAP[interp.color] }}>{interp.label}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 4 }}>{interp.detail}</div>
          </Card>
        )}
      </div>
    );
  }

  if (saved) {
    const ft = calcFatigueTraining({ rpe, postFatigue, feeling, motivation, sessionHr, duration });
    const delta = morningData ? calcDelta(morningData.fatigue_overall, ft) : null;
    const interp = delta !== null ? interpretDelta(delta) : null;
    return (
      <div style={styles.section}>
        <SuccessBanner>Bilan post-séance enregistré</SuccessBanner>
        <div style={styles.metricsGrid}>
          <MetricCard label="Fatigue séance" value={ft.toFixed(1)} unit="sur 10" color={colorFromScore(ft)} />
          {delta !== null && (
            <MetricCard label="Δ fatigue" value={(delta > 0 ? '+' : '') + delta.toFixed(1)} unit="vs matin" color={interp.color} />
          )}
        </div>
        {interp && (
          <Card style={{ borderLeft: `3px solid ${COLOR_MAP[interp.color]}` }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: COLOR_MAP[interp.color] }}>{interp.label}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 4 }}>{interp.detail}</div>
          </Card>
        )}
      </div>
    );
  }

  const ft = calcFatigueTraining({ rpe, postFatigue, feeling, motivation, sessionHr, duration });
  const delta = morningData ? calcDelta(morningData.fatigue_overall, ft) : null;
  const interp = delta !== null ? interpretDelta(delta) : null;

  const handleSave = () => {
    const load = duration ? rpe * Number(duration) : null;
    onSave('post_session', {
      rpe, postFatigue, feeling, motivation,
      sessionHr: sessionHr || null,
      duration: duration || null,
      fatigue_training: ft,
      training_load: load,
    });
    setSaved(true);
  };

  return (
    <div style={styles.section}>
      {!morningData && (
        <WarnBanner>⚠️ Aucun bilan matin aujourd'hui — le delta de fatigue ne sera pas calculé.</WarnBanner>
      )}

      <SectionTitle>Effort perçu</SectionTitle>

      <Card>
        <div style={styles.wearableLabel}>RPE — effort perçu <span style={styles.refBadge}>Borg CR10</span></div>
        <div style={styles.wearableSub}>Intensité globale de la séance</div>
        <div style={styles.rpeGrid}>
          {[0,1,2,3,4,5,6,7,8,9,10].map(v => (
            <button
              key={v}
              onClick={() => setRpe(v)}
              style={{
                ...styles.rpeBtn,
                background: rpe === v ? 'var(--green)' : 'transparent',
                color: rpe === v ? '#fff' : 'var(--gray-600)',
                borderColor: rpe === v ? 'var(--green)' : 'var(--gray-200)',
                gridColumn: v === 10 ? 'span 2' : undefined,
              }}
            >
              <span style={{ fontWeight: 600 }}>{v}</span>
              <span style={{ fontSize: 9, lineHeight: 1.2 }}>{RPE_LABELS[v]}</span>
            </button>
          ))}
        </div>
      </Card>

      <SectionTitle>État post-séance</SectionTitle>

      <SliderItem
        label="Fatigue post-effort"
        sub="Comment vous sentez-vous après la séance ?"
        min={1} max={7} value={postFatigue} onChange={setPostFatigue}
        lowLabel="frais" highLabel="épuisé"
      />

      <Card>
        <div style={styles.wearableLabel}>Affect post-séance <span style={styles.refBadge}>Feeling Scale</span></div>
        <div style={styles.wearableSub}>Valence émotionnelle — Hardy & Rejeski (1989)</div>
        <div style={styles.feelingGrid}>
          {FEELING_OPTS.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setFeeling(val)}
              style={{
                ...styles.feelingBtn,
                background: feeling === val ? 'var(--green)' : 'transparent',
                color: feeling === val ? '#fff' : 'var(--gray-600)',
                borderColor: feeling === val ? 'var(--green)' : 'var(--gray-200)',
              }}
            >
              <span style={{ fontWeight: 600 }}>{val > 0 ? '+' : ''}{val}</span>
              <span style={{ fontSize: 10 }}>{label}</span>
            </button>
          ))}
        </div>
      </Card>

      <SliderItem
        label="Motivation demain"
        sub="Envie de vous entraîner demain ?"
        min={1} max={7} value={motivation} onChange={setMotivation}
        invert={true} lowLabel="aucune" highLabel="maximale"
      />

      <SectionTitle badge="optionnel">Données wearable</SectionTitle>

      <Card>
        <div style={styles.wearableLabel}>FC moyenne séance</div>
        <div style={styles.wearableSub}>Fréquence cardiaque moyenne pendant l'effort</div>
        <input type="number" placeholder="ex. 155 bpm" value={sessionHr} onChange={e => setSessionHr(e.target.value)} style={{ marginTop: 8 }} />
      </Card>
      <Card>
        <div style={styles.wearableLabel}>Durée de la séance</div>
        <div style={styles.wearableSub}>Durée totale incluant échauffement</div>
        <input type="number" placeholder="ex. 60 min" value={duration} onChange={e => setDuration(e.target.value)} style={{ marginTop: 8 }} />
        {duration && rpe && (
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>
            Charge interne (Foster) : <strong>{rpe * Number(duration)} UA</strong>
          </div>
        )}
      </Card>

      {delta !== null && interp && (
        <Card style={{ borderLeft: `3px solid ${COLOR_MAP[interp.color]}`, background: 'var(--gray-50)', border: 'none', borderLeft: `3px solid ${COLOR_MAP[interp.color]}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: COLOR_MAP[interp.color], fontFamily: 'var(--font-mono)' }}>
              {delta > 0 ? '+' : ''}{delta.toFixed(1)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Δ fatigue (matin → séance)</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: COLOR_MAP[interp.color] }}>{interp.label}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 3 }}>{interp.detail}</div>
        </Card>
      )}

      <SubmitButton onClick={handleSave}>Enregistrer le bilan post-séance</SubmitButton>
    </div>
  );
}

const styles = {
  section: { padding: '16px 16px 32px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 },
  wearableLabel: { fontSize: 14, fontWeight: 500, color: 'var(--gray-900)' },
  wearableSub: { fontSize: 12, color: 'var(--gray-400)', marginTop: 2 },
  refBadge: {
    fontSize: 10,
    background: 'var(--green-light)',
    color: 'var(--green-dark)',
    padding: '2px 8px',
    borderRadius: 20,
    fontWeight: 400,
    marginLeft: 6,
  },
  rpeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 6,
    marginTop: 10,
  },
  rpeBtn: {
    padding: '8px 4px',
    border: '1px solid',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    transition: 'all 0.12s',
    fontFamily: 'var(--font)',
  },
  feelingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 6,
    marginTop: 10,
  },
  feelingBtn: {
    padding: '10px 4px',
    border: '1px solid',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    transition: 'all 0.12s',
    fontFamily: 'var(--font)',
  },
};
