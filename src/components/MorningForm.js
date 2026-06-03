import React, { useState } from 'react';
import { SliderItem, SectionTitle, SubmitButton, SuccessBanner, MetricCard, Card, ProgressBar } from './UI';
import { calcHooper, calcFatigueOverall, colorFromScore, COLOR_MAP } from '../metrics';

export default function MorningForm({ existing, onSave }) {
  const [sleep, setSleep] = useState(4);
  const [fatigue, setFatigue] = useState(4);
  const [soreness, setSoreness] = useState(4);
  const [stress, setStress] = useState(4);
  const [vitality, setVitality] = useState(4);
  const [hrv, setHrv] = useState('');
  const [restingHr, setRestingHr] = useState('');
  const [sleepDur, setSleepDur] = useState('');
  const [saved, setSaved] = useState(false);

  if (existing) {
    const hoopers = existing.hooper;
    const fo = existing.fatigue_overall;
    return (
      <div style={styles.section}>
        <SuccessBanner>Bilan matin déjà enregistré aujourd'hui</SuccessBanner>
        <div style={styles.metricsGrid}>
          <MetricCard label="Hooper index" value={hoopers} unit="sur 28" color={colorFromScore(hoopers / 28 * 10)} />
          <MetricCard label="Fatigue globale" value={fo.toFixed(1)} unit="sur 10" color={colorFromScore(fo)} />
        </div>
        <Card style={{ background: 'var(--gray-50)', border: 'none' }}>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>Détail Hooper</div>
          {[['Sommeil', existing.sleep], ['Fatigue', existing.fatigue], ['Douleurs', existing.soreness], ['Stress', existing.stress]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: 'var(--gray-600)' }}>{l}</span>
              <span style={{ fontWeight: 500 }}>{v}/7</span>
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (saved) {
    const hoopers = calcHooper({ sleep, fatigue, soreness, stress });
    const fo = calcFatigueOverall({ sleep, fatigue, soreness, stress, vitality, hrv, restingHr });
    return (
      <div style={styles.section}>
        <SuccessBanner>Bilan matin enregistré avec succès</SuccessBanner>
        <div style={styles.metricsGrid}>
          <MetricCard label="Hooper index" value={hoopers} unit="sur 28" color={colorFromScore(hoopers / 28 * 10)} />
          <MetricCard label="Fatigue globale" value={fo.toFixed(1)} unit="sur 10" color={colorFromScore(fo)} />
        </div>
        {hrv && <div style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center', marginTop: 8 }}>Données wearable intégrées dans le calcul</div>}
      </div>
    );
  }

  const hoopers = calcHooper({ sleep, fatigue, soreness, stress });
  const hooColor = colorFromScore(hoopers / 28 * 10);
  const fo = calcFatigueOverall({ sleep, fatigue, soreness, stress, vitality, hrv, restingHr });

  const handleSave = () => {
    onSave('morning', {
      sleep, fatigue, soreness, stress, vitality,
      hrv: hrv || null,
      restingHr: restingHr || null,
      sleepDur: sleepDur || null,
      hooper: hoopers,
      fatigue_overall: fo,
    });
    setSaved(true);
  };

  return (
    <div style={styles.section}>
      <SectionTitle>Récupération &amp; bien-être</SectionTitle>

      <SliderItem
        label="Qualité du sommeil"
        sub="Comment avez-vous dormi ?"
        min={1} max={7} value={sleep} onChange={setSleep}
        invert={true} lowLabel="mauvais" highLabel="excellent"
      />
      <SliderItem
        label="Fatigue générale"
        sub="Niveau de fatigue ressenti au réveil"
        min={1} max={7} value={fatigue} onChange={setFatigue}
        lowLabel="reposé" highLabel="épuisé"
      />
      <SliderItem
        label="Douleurs musculaires"
        sub="Courbatures, tensions ou raideurs"
        min={1} max={7} value={soreness} onChange={setSoreness}
        lowLabel="aucune" highLabel="intenses"
      />
      <SliderItem
        label="Stress perçu"
        sub="Charge mentale globale (vie + entraînement)"
        min={1} max={7} value={stress} onChange={setStress}
        lowLabel="serein" highLabel="très stressé"
      />
      <SliderItem
        label="Vitalité subjective"
        sub="Énergie, entrain, envie d'être actif"
        min={1} max={7} value={vitality} onChange={setVitality}
        invert={true} lowLabel="aucune" highLabel="excellente"
      />

      <div style={styles.liveCard}>
        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 6 }}>Hooper index en temps réel</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 32, fontWeight: 600, color: COLOR_MAP[hooColor], fontFamily: 'var(--font-mono)' }}>{hoopers}</span>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>/ 28</span>
        </div>
        <ProgressBar value={hoopers} max={28} color={hooColor} />
        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>
          {hoopers <= 14 ? 'Bonne récupération' : hoopers <= 21 ? 'Récupération partielle' : 'Sous-récupération détectée'}
        </div>
      </div>

      <SectionTitle badge="optionnel">Données wearable</SectionTitle>

      <Card>
        <div style={styles.wearableLabel}>HRV matin (RMSSD)</div>
        <div style={styles.wearableSub}>Mesuré dès le réveil, avant de se lever</div>
        <input type="number" placeholder="ex. 45 ms" value={hrv} onChange={e => setHrv(e.target.value)} style={{ marginTop: 8 }} />
      </Card>
      <Card>
        <div style={styles.wearableLabel}>FC au repos</div>
        <div style={styles.wearableSub}>Fréquence cardiaque au repos ce matin</div>
        <input type="number" placeholder="ex. 52 bpm" value={restingHr} onChange={e => setRestingHr(e.target.value)} style={{ marginTop: 8 }} />
      </Card>
      <Card>
        <div style={styles.wearableLabel}>Durée du sommeil</div>
        <div style={styles.wearableSub}>Durée totale de sommeil (heures)</div>
        <input type="number" step="0.5" placeholder="ex. 7.5 h" value={sleepDur} onChange={e => setSleepDur(e.target.value)} style={{ marginTop: 8 }} />
      </Card>

      {(hrv || restingHr) && (
        <div style={{ ...styles.liveCard, borderColor: 'var(--green-mid)' }}>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>Fatigue globale (wearable intégré)</div>
          <span style={{ fontSize: 28, fontWeight: 600, color: COLOR_MAP[colorFromScore(fo)], fontFamily: 'var(--font-mono)' }}>{fo.toFixed(1)}</span>
          <span style={{ fontSize: 13, color: 'var(--gray-400)', marginLeft: 6 }}>/ 10</span>
        </div>
      )}

      <SubmitButton onClick={handleSave}>Enregistrer le bilan matin</SubmitButton>
    </div>
  );
}

const styles = {
  section: { padding: '16px 16px 32px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 },
  liveCard: {
    background: 'var(--gray-50)',
    border: '1px solid var(--gray-100)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 16px',
    marginBottom: 16,
    marginTop: 4,
  },
  wearableLabel: { fontSize: 14, fontWeight: 500, color: 'var(--gray-900)' },
  wearableSub: { fontSize: 12, color: 'var(--gray-400)', marginTop: 2 },
};
