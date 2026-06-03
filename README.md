# Enduraw · Readiness App

Application mobile de suivi quotidien de l'état de forme des athlètes.

## Lancer localement

```bash
npm install
npm start
```

## Déployer sur Vercel

```bash
npm install -g vercel
vercel
```

Ou connecter le repo GitHub à [vercel.com](https://vercel.com) pour un déploiement automatique.

## Architecture

```
src/
├── App.js              # Composant principal + navigation
├── metrics.js          # Moteur de calcul (Hooper, fatigue_overall, fatigue_training, delta)
├── index.css           # Variables CSS globales + styles de base
└── components/
    ├── UI.js           # Composants réutilisables (SliderItem, MetricCard, etc.)
    ├── MorningForm.js  # Formulaire bilan matin
    ├── PostSessionForm.js  # Formulaire post-séance
    └── Dashboard.js    # Visualisation longitudinale (recharts)
```

## Métriques calculées

### `fatigue_overall` (bilan matin)
Score composite 0–10 combinant :
- **Hooper Index** (Hooper & Mackinnon, 1995) : sommeil, fatigue, douleurs, stress (×4 items, 1–7)
- **Vitalité subjective** (Ryan & Frederick, 1997) : énergie perçue
- **HRV matin (RMSSD)** *(optionnel)* : signal de récupération autonome
- **FC repos** *(optionnel)* : indicateur de charge systémique

Poids : subjectif 60 % · HRV 25 % · FC repos 15 % (si wearables présents)

### `fatigue_training` (post-séance)
Score composite 0–10 combinant :
- **RPE** (Borg CR10) : effort perçu global
- **Fatigue post-effort** (1–7)
- **Feeling Scale** (Hardy & Rejeski, 1989) : affect post-exercice (−5 à +5)
- **Motivation J+1** (1–7)
- **FC moyenne séance** *(optionnel)* : intensité physiologique
- **Charge interne** *(optionnel)* : RPE × durée (Foster et al., 1998)

Poids : subjectif 50 % · intensité HR 30 % · charge interne 20 % (si wearables présents)

### `Δ fatigue = fatigue_training − fatigue_overall`
| Δ | Interprétation |
|---|---|
| < −2 | Séance régénératrice |
| −2 à +1 | État stable |
| +1 à +3 | Fatigue modérée (normal) |
| > +3 | Charge élevée — récupération à prioriser |

## Données

Stockées localement via `localStorage` (clé : `enduraw_readiness_v1`).
Structure : `{ "YYYY-MM-DD": { morning: {...}, post_session: {...} } }`

## Axes d'amélioration

1. **Back-end + authentification** : multi-athlètes, données persistantes
2. **Intégration API wearables** : Garmin Connect, Polar Flow, Apple HealthKit
3. **Notifications push** : rappel matin et post-séance
4. **Modèle prédictif** : alertes de surentraînement basées sur tendance 7j
5. **Test cognitif** : Stroop simplifié pour mesure de la fatigue centrale
6. **Cycle menstruel** : intégration via API wearable pour contextualisation hormonale

## Références scientifiques

- Hooper, S.L., & Mackinnon, L.T. (1995). Monitoring overtraining in athletes. *Sports Medicine*, 20(5), 321–327.
- Ryan, R.M., & Frederick, C.M. (1997). On energy, personality and health. *Journal of Personality*, 65(3), 529–565.
- Hardy, C.J., & Rejeski, W.J. (1989). Not what, but how one feels. *Journal of Sport & Exercise Psychology*, 11(3), 304–317.
- Foster, C., et al. (1998). A new approach to monitoring exercise training. *Journal of Strength and Conditioning Research*, 15(1), 109–115.
- Borg, G. (1982). Psychophysical bases of perceived exertion. *Medicine & Science in Sports & Exercise*, 14(5), 377–381.
