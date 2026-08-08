import React, { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
import T from '../components/T';
import { useLang } from '../lib/i18n';
import { useSession } from '../lib/session';
import { updateProfile, signOut } from '../lib/auth';
import { counts } from '../lib/storage';
import { iso } from '../lib/bidi';

export default function ProfileScreen() {
  const router = useRouter();
  const { t, isUrdu, toggleLang } = useLang();
  const { profile, refreshSession } = useSession();
  
  const [stats, setStats] = useState({ total: 0, pending: 0, synced: 0 });
  const [editing, setEditing] = useState(false);
  
  // Editable fields
  const [phone, setPhone] = useState(profile?.phone || '');
  const [village, setVillage] = useState(profile?.village || '');
  const [name, setName] = useState(profile?.name || '');

  useEffect(() => {
    async function loadStats() {
      const s = await counts();
      setStats(s);
    }
    loadStats();
  }, []);

  if (!profile) return null;

  const handleSave = async () => {
    try {
      await updateProfile({ phone, village, name, nameUr: name });
      await refreshSession();
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', 'Could not update profile');
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      t('sign_out'),
      t('sign_out_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('yes_sign_out'), style: 'destructive', onPress: async () => {
            await signOut();
            await refreshSession(); // this will set profile to null
            router.replace('/(auth)/signin');
          }
        }
      ]
    );
  };

  const rowDir = isUrdu ? 'row-reverse' : 'row';
  const autoMarginRev = isUrdu ? 'marginLeft' : 'marginRight';

  const InfoRow = ({ label, value, editable, onChange }) => (
    <View style={{ flexDirection: rowDir, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F5', alignItems: 'center' }}>
      <T style={{ width: 100, fontSize: 13, color: theme.color.ink3, textAlign: isUrdu ? 'right' : 'left' }}>{label}</T>
      {editable ? (
        <TextInput
          style={{ flex: 1, fontSize: 15, color: theme.color.ink, fontWeight: '500', textAlign: isUrdu ? 'right' : 'left', padding: 0 }}
          value={value}
          onChangeText={onChange}
        />
      ) : (
        <T style={{ flex: 1, fontSize: 15, color: theme.color.ink, fontWeight: '500', textAlign: isUrdu ? 'right' : 'left' }}>{iso(value)}</T>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <LinearGradient colors={theme.grad.lilac} start={{x:0,y:0}} end={{x:1,y:1}} style={{ paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 24, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: rowDir, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={isUrdu ? "chevron-forward" : "chevron-back"} size={24} color={theme.color.brand} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)}>
            <T style={{ fontSize: 15, fontWeight: '700', color: theme.color.brand, marginTop: 10 }}>{editing ? t('save') : t('edit')}</T>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.color.brand, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <T style={{ fontSize: 26, fontWeight: '700', color: '#FFF' }}>{profile.initials}</T>
          </View>
          <T style={{ fontSize: 20, fontWeight: '700', color: theme.color.ink }}>{profile.name}</T>
          <T style={{ fontSize: 13, color: theme.color.ink2, marginTop: 4 }}>LHW ID · {profile.lhwId || 'N/A'}</T>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 10 }}>
        <InfoRow label={t('phone')} value={phone} editable={editing} onChange={setPhone} />
        <InfoRow label={t('full_name')} value={name} editable={editing} onChange={setName} />
        <InfoRow label={t('district')} value={profile.district} editable={false} />
        <InfoRow label={t('tehsil')} value={profile.tehsil} editable={false} />
        <InfoRow label={t('uc')} value={profile.uc} editable={false} />
        <InfoRow label={t('village')} value={village} editable={editing} onChange={setVillage} />
        <InfoRow label={t('joined')} value={new Date(profile.createdAt).toLocaleDateString()} editable={false} />

        <View style={{ flexDirection: rowDir, justifyContent: 'space-between', alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
          <T style={{ fontSize: 16, fontWeight: '700', color: theme.color.ink }}>{t('stats')}</T>
        </View>
        
        <View style={{ flexDirection: rowDir, gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: '#F7F7FA', borderRadius: 16, padding: 16, alignItems: 'center' }}>
            <T style={{ fontSize: 24, fontWeight: '700', color: theme.color.brand }}>{stats.total}</T>
            <T style={{ fontSize: 11, color: theme.color.ink3, marginTop: 4 }}>{t('total_cases')}</T>
          </View>
          <View style={{ flex: 1, backgroundColor: '#F7F7FA', borderRadius: 16, padding: 16, alignItems: 'center' }}>
            <T style={{ fontSize: 24, fontWeight: '700', color: theme.color.lavD }}>{stats.pending}</T>
            <T style={{ fontSize: 11, color: theme.color.ink3, marginTop: 4 }}>{t('pending')}</T>
          </View>
        </View>

        <TouchableOpacity onPress={toggleLang} style={{ marginTop: 32, alignItems: 'center', padding: 16, backgroundColor: theme.color.lav, borderRadius: 12 }}>
          <T style={{ fontSize: 15, fontWeight: '700', color: theme.color.brand }}>
            {isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
          </T>
        </TouchableOpacity>

        <TouchableOpacity onPress={confirmSignOut} style={{ marginTop: 40, alignItems: 'center' }}>
          <T style={{ fontSize: 15, fontWeight: '700', color: theme.color.coralD }}>{t('sign_out')}</T>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
