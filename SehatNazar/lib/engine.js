import { SYNDROMES } from './syndromes.js';

export const ADJACENCY = {
  'UC-11': ['UC-12'],
  'UC-12': ['UC-11','UC-13'],
  'UC-13': ['UC-12','UC-14'],
  'UC-14': ['UC-13'],
};

export function cohesion(cases, syndrome) {
  if (!cases || cases.length === 0 || !syndrome) return 0;
  let matches = 0;
  for (const c of cases) {
    let overlap = 0;
    for (const sym of c.symptoms) {
      if (syndrome.core.includes(sym)) overlap++;
    }
    if (overlap >= 2) matches++;
  }
  return Math.round((matches / cases.length) * 100) / 100;
}

export function bestSyndrome(cases) {
  if (!cases || cases.length === 0) return { syndrome: null, cohesion: 0 };
  let best = null;
  let maxC = -1;
  for (const syn of SYNDROMES) {
    const c = cohesion(cases, syn);
    if (c > maxC) {
      maxC = c;
      best = syn;
    }
  }
  return { syndrome: best, cohesion: maxC };
}

export function windowCases(cases, uc, nowISO, hours) {
  const now = new Date(nowISO).getTime();
  const limit = now - hours * 60 * 60 * 1000;
  return cases.filter(c => c.uc === uc && new Date(c.createdAt).getTime() >= limit && new Date(c.createdAt).getTime() <= now);
}

export function detect({ cases, uc, now, baseline, heavyRain, inRing }) {
  const windowHours = inRing ? 96 : 72;
  const inWindow = windowCases(cases, uc, now, windowHours);
  const n = inWindow.length;
  const { syndrome, cohesion: cValue } = bestSyndrome(inWindow);
  
  const liftVal = n / Math.max(baseline, 1);
  const lift = Math.round(liftVal * 10) / 10;
  const cohesionRounded = Math.round(cValue * 100) / 100;

  let threshold = 4;
  if (heavyRain && syndrome && syndrome.vector) threshold = 3;
  if (inRing) threshold = 2;

  const cohesionReq = inRing ? 0.5 : 0.6;

  const fired = n >= threshold && cohesionRounded >= cohesionReq && lift >= 2.0;

  const reasons = [];
  reasons.push({ key: 'cases_count', n, need: threshold, pass: n >= threshold });
  reasons.push({ key: 'pattern_share', n: Math.round(cohesionRounded * 100), need: Math.round(cohesionReq * 100), pass: cohesionRounded >= cohesionReq });
  reasons.push({ key: 'times_usual', n: lift, need: 2.0, baseline, pass: lift >= 2.0 });

  return {
    fired, n, cohesion: cohesionRounded, lift, threshold, cohesionReq, window: windowHours,
    syndrome, uc, evaluatedAt: now,
    reasons,
    level: fired ? (lift >= 3 ? 'ALERT' : 'WATCH') : 'NORMAL',
  };
}

export function ringFor(uc) {
  return ADJACENCY[uc] || [];
}

export function evaluateDistrict({ cases, ucs, now, baselines, rain }) {
  const results = {};
  const rings = new Set();
  
  // Pass 1: standard detection
  for (const uc of ucs) {
    const res = detect({ 
      cases, 
      uc, 
      now, 
      baseline: baselines[uc] || 1, 
      heavyRain: !!rain[uc], 
      inRing: false 
    });
    results[uc] = res;
    if (res.fired) {
      const neighbors = ringFor(uc);
      for (const nb of neighbors) rings.add(nb);
    }
  }

  // Pass 2: Re-run for ring UCs
  for (const uc of Array.from(rings)) {
    const res = detect({ 
      cases, 
      uc, 
      now, 
      baseline: baselines[uc] || 1, 
      heavyRain: !!rain[uc], 
      inRing: true 
    });
    results[uc] = res;
  }

  return { results, rings: Array.from(rings) };
}
