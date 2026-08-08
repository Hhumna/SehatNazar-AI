import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import theme from '../../constants/theme';
import { getCases, clearAllAndReseed } from '../../lib/storage';
import { signOut, setOnboarded } from '../../lib/auth';
import { useSession } from '../../lib/session';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import { symptomOptions } from '../../data/options';
import T from '../../components/T';
import { useLang } from '../../lib/i18n';

export default function RecordsScreen() {
  const [cases, setCases] = useState([]);
  const { t, isUrdu } = useLang();
  const { profile, refreshSession } = useSession();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      getCases().then(all => {
        if (profile?.id) {
          setCases(all.filter(c => c.workerId === profile.id));
        } else {
          setCases([]);
        }
      });
    }, [profile?.id])
  );

  const rowDir = isUrdu ? 'row-reverse' : 'row';

  const handleResetApp = async () => {
    await clearAllAndReseed();
    await setOnboarded(false);
    await signOut();
    await refreshSession();
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      {/* Temporary debug row */}
      <TouchableOpacity onLongPress={handleResetApp} style={{ backgroundColor: theme.color.lav, padding: 8, alignItems: 'center' }}>
        <T style={{ fontSize: 12, fontWeight: 'bold', color: theme.color.purple }}>
          storage: {cases.length} cases (Long press to completely reset app)
        </T>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 18 }} showsVerticalScrollIndicator={false}>
        <T style={{ fontSize: 24, fontWeight: '700', color: theme.color.ink, marginBottom: 16, textAlign: isUrdu ? 'right' : 'left' }}>
          {isUrdu ? profile?.nameUr : profile?.name}'s {t('my_records')}
        </T>
        
        {cases.length === 0 ? (
          <T style={{ color: theme.color.ink3 }}>{t('no_cases_here')}</T>
        ) : (
          cases.map(c => (
            <Card key={c.id} style={{ marginBottom: 12, padding: 14 }}>
              <View style={{ flexDirection: rowDir, justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <T style={{ fontSize: 14, fontWeight: '700', color: theme.color.ink }}>{c.id}</T>
                <T style={{ fontSize: 11, color: theme.color.ink3 }}>{new Date(c.createdAt).toLocaleDateString()}</T>
              </View>
              
              <T style={{ fontSize: 13, color: theme.color.ink2, marginBottom: 8, textAlign: isUrdu ? 'right' : 'left' }}>
                {isUrdu ? `${t(c.gender === 'Boy / Man' ? 'gender_male' : 'gender_female')} · ${c.age.includes('Baby') ? t('age_baby') : c.age.includes('Child') ? t('age_child') : c.age.includes('Adult') ? t('age_adult') : t('age_elder')}` : `${c.age} · ${c.gender}`}
              </T>
              
              <View style={{ flexDirection: rowDir, flexWrap: 'wrap', gap: 6 }}>
                {c.symptoms.map(sId => {
                  const s = symptomOptions.find(opt => opt.id === sId);
                  return s ? <Chip key={sId} label={t(s.id)} colors={theme.grad[s.grad]} /> : null;
                })}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
