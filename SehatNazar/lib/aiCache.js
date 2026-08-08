import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'sehatnazar.ai_cache.';

export async function getCachedAssessment(uc, evaluatedAt, lang = 'en') {
  try {
    const key = `${CACHE_KEY_PREFIX}${lang}.${uc}_${evaluatedAt}`;
    const data = await AsyncStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch (e) {
    // Ignore errors
  }
  return null;
}

export async function setCachedAssessment(uc, evaluatedAt, assessment, lang = 'en') {
  try {
    const key = `${CACHE_KEY_PREFIX}${lang}.${uc}_${evaluatedAt}`;
    await AsyncStorage.setItem(key, JSON.stringify(assessment));
  } catch (e) {
    // Ignore errors
  }
}
