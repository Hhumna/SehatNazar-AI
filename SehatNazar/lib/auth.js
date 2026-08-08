import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const SESSION_KEY = 'sehatnazar.session';
const PROFILE_KEY = 'sehatnazar.profile';
const ONBOARDED_KEY = 'sehatnazar.onboarded';

export async function getSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function hasOnboarded() {
  try {
    const val = await AsyncStorage.getItem(ONBOARDED_KEY);
    return val === 'true';
  } catch (e) {
    return false;
  }
}

export async function setOnboarded(value) {
  try {
    if (value) {
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(ONBOARDED_KEY);
    }
  } catch (e) {}
}



async function hashPin(pin) {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    pin
  );
}

export async function signUp(fields) {
  const { pin, ...profileData } = fields;
  
  const pinHash = await hashPin(pin);
  
  const profile = {
    ...profileData,
    id: `LHW-${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    pinHash
  };

  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    // Auto sign-in
    const sessionData = { ...profile };
    delete sessionData.pinHash; // don't keep hash in active session if we don't want to
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return sessionData;
  } catch (e) {
    throw new Error('Failed to save profile');
  }
}

export async function signIn(phone, pin) {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) throw new Error('No account found on this device');
    
    const profile = JSON.parse(raw);
    if (profile.phone !== phone) {
      throw new Error('Incorrect phone number');
    }

    const inputHash = await hashPin(pin);
    if (profile.pinHash !== inputHash) {
      throw new Error('Incorrect PIN');
    }

    const sessionData = { ...profile };
    delete sessionData.pinHash;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    return sessionData;
  } catch (e) {
    throw e;
  }
}

export async function signOut() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {}
}

export async function updateProfile(patch) {
  try {
    const session = await getSession();
    if (!session) throw new Error('Not logged in');

    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) throw new Error('Profile missing');
    
    const profile = JSON.parse(raw);
    const updatedProfile = { ...profile, ...patch };
    
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    
    const sessionData = { ...updatedProfile };
    delete sessionData.pinHash;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    return sessionData;
  } catch (e) {
    throw e;
  }
}

export async function resetPin(phone, newPin) {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) throw new Error('No account found');
    
    const profile = JSON.parse(raw);
    if (profile.phone !== phone) throw new Error('Incorrect phone');
    
    const pinHash = await hashPin(newPin);
    const updatedProfile = { ...profile, pinHash };
    
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    
    const sessionData = { ...updatedProfile };
    delete sessionData.pinHash;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    return sessionData;
  } catch (e) {
    throw e;
  }
}
