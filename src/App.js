import React, { useState, useEffect } from 'react';
import MorningForm from './components/MorningForm';
import PostSessionForm from './components/PostSessionForm';
import Dashboard from './components/Dashboard';
import { formatDateKey } from './metrics';

const STORAGE_KEY = 'enduraw_readiness_v1';

const today = new Date();
const todayKey = formatDateKey(today);

function generateDemoData() {
  const data = {};
  const scenarios = [
    { sleep:5, fatigue:4, soreness:3, stress:3, vitality:5, hrv:'58', restingHr:'51', rpe:6, postFatigue:5, feeling:3, motivation:5, sessionHr:'158', duration:'55' },
    { sleep:3, fatigue:6, soreness:5, stress:5, vitality:2, hrv:'38', restingHr:'62', rpe:7, postFatigue:6, feeling:-3, motivation:3, sessionHr:'168', duration:'70' },
    { sleep:6, fatigue:3, soreness:2, stress:2, vitality:6, hrv:'65', restingHr:'48', rpe:5, postFatigue:3, feeling:5, motivation:6, sessionHr:'148', duration:'45' },
    { sleep:4, fatigue:5, soreness:4, stress:4, vitality:3, hrv:'44', restingHr:'57', rpe:8, postFatigue:6, feeling:-1, motivation:4, sessionHr:'172', duration:'80' },
    { sleep:6, fatigue:2, soreness:2, stress:2, vitality:7, hrv:'72', restingHr:'46', rpe:4, postFatigue:2, feeling:5, motivation:7, sessionHr:'140', duration:'40' },
    { sleep:5, fatigue:3, soreness:3, stress:3, vitality:5, hrv:'60', restingHr:'50', rpe:6, postFatigue:4, feeling:3, motivation:5, sessionHr:'155', duration:'60' },
    { sleep:2, fatigue:7, soreness:6, stress:6, vitality:1, hrv:'31', restingHr:'68', rpe:8, postFatigue:7, feeling:-5, motivation:2, sessionHr:'175', duration:'75' },
    { sleep:6, fatigue:3, soreness:2, stress:2, vitality:6, hrv:'68', restingHr:'47', rpe:5, postFatigue:3, feeling:4, motivation:6, sessionHr:'150', duration:'50' },
    { sleep:5, fatigue:4, soreness:3, stress:3, vitality:4, hrv:'55', restingHr:'53', rpe:7, postFatigue:5, feeling:1, motivation:4, sessionHr:'162', duration:'65' },
    { sleep:7, fatigue:2, soreness:1, stress:1, vitality:7, hrv:'75', restingHr:'44', rpe:4, postFatigue:2, feeling:5, motivation:7, sessionHr:'138', duration:'35' },
  ];

  for (let i = scenarios.length - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - (scenarios.length - i));
    const key = formatDateKey(d);
    const s = scenarios[i];
    const hooper = s.sleep + s.fatigue + s.soreness + s.stress;
    const subjMorn = (s.fatigue/7 + s.stress/7 + s.soreness/7 + (8-s.sleep)/7 + (8-s.vitality)/7) / 5;
    const hrvScore = Math.min(1, Math.max(0, 1 - Number(s.hrv)/60));
    const hrScore = Math.min(1, Math.max(0, (Number(s.restingHr)-50)/30));
    const fo = Math.round(((subjMorn*0.60 + hrvScore*0.25 + hrScore*0.15)) * 100) / 10;
    const feelingNorm = (5 - s.feeling) / 10;
    const subjPost = (s.postFatigue/7 + s.rpe/10 + feelingNorm + (8-s.motivation)/7) / 4;
    const hrInt = Math.min(1, Number(s.sessionHr)/185);
    const load = Math.min(1, (s.rpe * Number(s.duration))/600);
    const ft = Math.round(((subjPost*0.50 + hrInt*0.30 + load*0.20)) * 100) / 10;
    data[key] = {
      morning: { sleep: s.sleep, fatigue: s.fatigue, soreness: s.soreness, stress: s.stress, vitality: s.vitality, hrv: s.hrv, restingHr: s.restingHr, sleepDur: null, hooper, fatigue_overall: fo },
      post_session: { rpe: s.rpe, postFatigue: s.postFatigue, feeling: s.feeling, motivation: s.motivation, sessionHr: s.sessionHr, duration: s.duration, fatigue_training: ft, training_load: s.rpe * Number(s.duration) },
    };
  }
  return data;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const demo = generateDemoData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    return demo;
  } catch {
    return generateDemoData();
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function App() {
  const [tab, setTab] = useState('morning');
  const [entries, setEntries] = useState(loadData);

  const todayEntries = entries[todayKey] || {};

  const handleSave = (moment, data) => {
    const updated = {
      ...entries,
      [todayKey]: { ...todayEntries, [moment]: data },
    };
    setEntries(updated);
    saveData(updated);
  };

  const dateDisplay = today.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const tabs = [
    { id: 'morning', label: 'Matin', icon: '☀️', done: !!todayEntries.morning },
    { id: 'post', label: 'Séance', icon: '🏃', done: !!todayEntries.post_session },
    { id: 'dashboard', label: 'Données', icon: '📊', done: false },
  ];

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.logo}>
            <span style={styles.logoMark}>endur</span>
            <span style={styles.logoAccent}>aw</span>
            <span style={styles.logoDivider}> · </span>
            <span style={styles.logoSub}>readiness</span>
          </div>
          <div style={styles.dateBadge}>{dateDisplay}</div>
        </div>
        <nav style={styles.nav}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                ...styles.navBtn,
                background: tab === t.id ? 'var(--green)' : 'transparent',
                color: tab === t.id ? '#fff' : 'var(--gray-600)',
                borderColor: tab === t.id ? 'var(--green)' : 'var(--gray-200)',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.done && <span style={styles.doneDot} />}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'morning' && (
          <MorningForm
            existing={todayEntries.morning || null}
            onSave={handleSave}
          />
        )}
        {tab === 'post' && (
          <PostSessionForm
            existing={todayEntries.post_session || null}
            morningData={todayEntries.morning || null}
            onSave={handleSave}
          />
        )}
        {tab === 'dashboard' && (
          <Dashboard entries={entries} />
        )}
      </main>
    </div>
  );
}

const styles = {
  app: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    background: 'var(--gray-50)',
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid var(--gray-100)',
    padding: '14px 16px 10px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logo: {
    fontSize: 16,
    letterSpacing: '-0.3px',
  },
  logoMark: {
    fontWeight: 600,
    color: 'var(--gray-900)',
  },
  logoAccent: {
    fontWeight: 600,
    color: 'var(--green)',
  },
  logoDivider: {
    color: 'var(--gray-200)',
  },
  logoSub: {
    fontWeight: 400,
    color: 'var(--gray-400)',
    fontSize: 14,
  },
  dateBadge: {
    fontSize: 11,
    color: 'var(--gray-400)',
    background: 'var(--gray-50)',
    padding: '4px 10px',
    borderRadius: 20,
    border: '1px solid var(--gray-100)',
    textTransform: 'capitalize',
  },
  nav: {
    display: 'flex',
    gap: 6,
  },
  navBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: '9px 6px',
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--font)',
    transition: 'all 0.15s',
    position: 'relative',
  },
  doneDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--green-mid)',
  },
};
