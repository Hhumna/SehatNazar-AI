import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sehatnazar.cases.v1';



export async function getCases() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : [];
    console.log(`[Storage] getCases read ${arr.length} cases`);
    return arr;
  } catch (e) {
    return [];
  }
}

export async function seedIfEmpty() {
  // Dynamic backend has no mock seed. App starts empty.
}

export function getStreak(cases) {
  if (!cases || cases.length === 0) {
    return { days: 0, week: generateWeek(new Set()) };
  }

  const daysSet = new Set(cases.map(c => new Date(c.createdAt).toDateString()));
  
  let days = 0;
  let d = new Date();
  
  // If no cases today, check if there was a case yesterday. If neither, streak is 0.
  if (!daysSet.has(d.toDateString())) {
    const yesterday = new Date(d);
    yesterday.setDate(yesterday.getDate() - 1);
    if (!daysSet.has(yesterday.toDateString())) {
      return { days: 0, week: generateWeek(daysSet) };
    } else {
      // Step back to yesterday to start counting
      d.setDate(d.getDate() - 1);
    }
  }

  while (daysSet.has(d.toDateString())) {
    days++;
    d.setDate(d.getDate() - 1);
  }

  return { days, week: generateWeek(daysSet) };
}

function generateWeek(daysSet) {
  const week = [];
  const today = new Date();
  const dayNames = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
  
  // Create last 7 days ending today
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    
    let state = 'none';
    if (daysSet.has(dateStr)) state = 'done';
    else if (i === 0) state = 'today';
    
    week.push({ d: dayNames[d.getDay()], state });
  }
  return week;
}

export async function addCase(partial) {
  try {
    const cases = await getCases();
    let maxId = 9039;
    cases.forEach(c => {
      const match = c.id.match(/^SR-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    });
    
    const newId = `SR-${maxId + 1}`;
    const newCase = {
      ...partial,
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    
    cases.unshift(newCase);
    await AsyncStorage.setItem(KEY, JSON.stringify(cases));
    console.log(`[Storage] addCase wrote ${cases.length} cases`);
    return newCase;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function syncPending() {
  try {
    // Simulate network upload
    await new Promise(resolve => setTimeout(resolve, 1400));
    const cases = await getCases();
    let changed = 0;
    const updated = cases.map(c => {
      if (c.status === 'PENDING') {
        changed++;
        return { ...c, status: 'SYNCED' };
      }
      return c;
    });
    
    if (changed > 0) {
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
      console.log(`[Storage] syncPending wrote ${updated.length} cases`);
    }
    return changed;
  } catch (e) {
    return 0;
  }
}

export async function counts() {
  try {
    const cases = await getCases();
    let pending = 0;
    let synced = 0;
    cases.forEach(c => {
      if (c.status === 'PENDING') pending++;
      else if (c.status === 'SYNCED') synced++;
    });
    return { total: cases.length, pending, synced };
  } catch (e) {
    return { total: 0, pending: 0, synced: 0 };
  }
}

export async function clearAllAndReseed() {
  try {
    await AsyncStorage.removeItem(KEY);
    await seedIfEmpty();
  } catch (e) {
    // ignore
  }
}
