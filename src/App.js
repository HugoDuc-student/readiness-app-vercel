import React, { useState, useEffect } from 'react';
import MorningForm from './components/MorningForm';
import PostSessionForm from './components/PostSessionForm';
import Dashboard from './components/Dashboard';
import { formatDateKey } from './metrics';

const STORAGE_KEY = 'enduraw_readiness_v1';

const today = new Date();
const todayKey = formatDateKey(today);

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
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
