// ─── METRICS ENGINE ───────────────────────────────────────────────────────────
// All formulas are documented here for scientific traceability.

/**
 * HOOPER INDEX (Hooper & Mackinnon, 1995)
 * 4 items × 1–7 scale. Higher = worse recovery.
 * Range: 4–28
 */
export function calcHooper({ sleep, fatigue, soreness, stress }) {
  return sleep + fatigue + soreness + stress;
}

/**
 * FATIGUE_OVERALL — morning baseline (0–10)
 * Captures pre-training readiness from subjective + optional wearable data.
 *
 * Subjective component (always present):
 *   Negative items (fatigue, stress, soreness) increase score.
 *   Positive items (sleep quality, vitality) decrease score.
 *
 * Wearable component (optional):
 *   HRV (RMSSD): lower than typical baseline → higher fatigue signal
 *   Resting HR: elevated above baseline → higher fatigue signal
 *
 * Weights: subj=0.60, hrv=0.25, hr=0.15 (when wearables present)
 */
export function calcFatigueOverall({ sleep, fatigue, soreness, stress, vitality, hrv, restingHr }) {
  // Normalise each item to 0–1 (all oriented: high = more fatigued)
  const subjScore =
    (fatigue / 7 + stress / 7 + soreness / 7 + (8 - sleep) / 7 + (8 - vitality) / 7) / 5;

  const hasHrv = hrv !== null && hrv !== '' && !isNaN(Number(hrv));
  const hasHr = restingHr !== null && restingHr !== '' && !isNaN(Number(restingHr));

  if (!hasHrv && !hasHr) {
    return Math.round(subjScore * 100) / 10; // 0–10
  }

  // HRV: reference 60ms (healthy endurance athlete average)
  // Below 60 = more fatigue, above = less
  const hrvScore = hasHrv ? Math.min(1, Math.max(0, 1 - Number(hrv) / 60)) : null;

  // Resting HR: reference 50bpm. Above = more fatigue.
  const hrScore = hasHr ? Math.min(1, Math.max(0, (Number(restingHr) - 50) / 30)) : null;

  let total = subjScore * 0.60;
  let weightUsed = 0.60;

  if (hrvScore !== null) { total += hrvScore * 0.25; weightUsed += 0.25; }
  if (hrScore !== null) { total += hrScore * 0.15; weightUsed += 0.15; }

  // Renormalise if only one wearable present
  total = total / weightUsed;

  return Math.round(total * 100) / 10;
}

/**
 * FATIGUE_TRAINING — post-session score (0–10)
 * Captures subjective + physiological training load.
 *
 * Subjective: RPE (Borg CR10), post-fatigue, Feeling Scale, motivation J+1
 * Wearable: session avg HR intensity, internal load (Foster 1998: RPE × duration)
 *
 * Weights: subj=0.50, hrIntensity=0.30, load=0.20 (when wearables present)
 */
export function calcFatigueTraining({ rpe, postFatigue, feeling, motivation, sessionHr, duration }) {
  // Feeling Scale: −5 to +5 → remap to 0–1 fatigue (positive = less fatigue)
  const feelingNorm = (5 - feeling) / 10; // +5 → 0, −5 → 1

  const subjScore =
    (postFatigue / 7 + rpe / 10 + feelingNorm + (8 - motivation) / 7) / 4;

  const hasHr = sessionHr !== null && sessionHr !== '' && !isNaN(Number(sessionHr));
  const hasDur = duration !== null && duration !== '' && !isNaN(Number(duration));

  if (!hasHr && !hasDur) {
    return Math.round(subjScore * 100) / 10;
  }

  // HR intensity: session avg / estimated HRmax (185 bpm default endurance athlete)
  const hrIntensity = hasHr ? Math.min(1, Number(sessionHr) / 185) : null;

  // Internal load (Foster 1998): RPE × duration, normalised to 0–1 (ref: 600 AU = hard session)
  const internalLoad = hasDur ? Math.min(1, (rpe * Number(duration)) / 600) : null;

  let total = subjScore * 0.50;
  let weightUsed = 0.50;

  if (hrIntensity !== null) { total += hrIntensity * 0.30; weightUsed += 0.30; }
  if (internalLoad !== null) { total += internalLoad * 0.20; weightUsed += 0.20; }

  total = total / weightUsed;

  return Math.round(total * 100) / 10;
}

/**
 * DELTA FATIGUE
 * Δ = fatigue_training − fatigue_overall
 * Positive = session increased fatigue (expected)
 * Negative = session was regenerative (well-being post-exercise effect)
 */
export function calcDelta(fatigueOverall, fatigueTraining) {
  return Math.round((fatigueTraining - fatigueOverall) * 10) / 10;
}

export function interpretDelta(delta) {
  if (delta < -2) return { label: 'Séance régénératrice', detail: 'Effet well-being post-effort détecté. Bonne tolérance.', color: 'green' };
  if (delta <= 1) return { label: 'État stable', detail: 'Séance bien tolérée. Récupération normale attendue.', color: 'amber' };
  if (delta <= 3) return { label: 'Fatigue modérée', detail: 'Accumulation normale. Surveiller le bilan demain matin.', color: 'amber' };
  return { label: 'Charge élevée', detail: 'Fatigue significative post-séance. Prioriser la récupération.', color: 'red' };
}

export function colorFromScore(score) {
  if (score <= 3.5) return 'green';
  if (score <= 6.5) return 'amber';
  return 'red';
}

export const COLOR_MAP = {
  green: '#1D9E75',
  amber: '#BA7517',
  red: '#E24B4A',
};

export function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

export function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
