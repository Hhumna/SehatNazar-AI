import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import theme from '../../constants/theme';
import { symptomOptions } from '../../data/options';
import { getCases, getStreak } from '../../lib/storage';
import { SYNDROMES } from '../../lib/syndromes.js';
import { evaluateDistrict } from '../../lib/engine';
import GradientCard from '../../components/GradientCard';
import Card from '../../components/Card';
import Pill from '../../components/Pill';
import AdvisoryPlayer from '../../components/AdvisoryPlayer';
import ProgressRing from '../../components/ProgressRing';
import T from '../../components/T';
import { useLang } from '../../lib/i18n';
import { iso } from '../../lib/bidi';
import { useSession } from '../../lib/session';

export default function HomeScreen() {
  const router = useRouter();
  const { t, isUrdu, toggleLang } = useLang();
  const { profile } = useSession();
  
  const [todaysCases, setTodaysCases] = React.useState([]);
  const [streak, setStreak] = React.useState({ days: 0, week: [] });
  const [alert, setAlert] = React.useState(null);

  const rounds = { total: 20 };

  useFocusEffect(
    React.useCallback(() => {
      getCases().then(allCases => {
        // Only count cases by this user
        const myCases = allCases.filter(c => c.workerId === profile?.id);
        
        const todayStr = new Date().toDateString();
        const today = myCases.filter(c => new Date(c.createdAt).toDateString() === todayStr);
        setTodaysCases(today);
        setStreak(getStreak(myCases));

        if (profile?.uc) {
          const { results } = evaluateDistrict({
            cases: allCases,
            ucs: [profile.uc],
            now: new Date().toISOString(),
            baselines: { [profile.uc]: 1 },
            rain: { [profile.uc]: false }
          });
          if (results[profile.uc]?.level === 'ALERT') {
            setAlert(results[profile.uc]);
          } else {
            setAlert(null);
          }
        }
      });
    }, [profile?.id, profile?.uc])
  );

  const dynamicBreakdown = [];
  if (todaysCases.length === 0) {
    dynamicBreakdown.push({ label: t('no_cases_yet'), hot: false });
  } else {
    const symCounts = {};
    todaysCases.forEach(c => {
      c.symptoms.forEach(s => {
        symCounts[s] = (symCounts[s] || 0) + 1;
      });
    });
    
    const sorted = Object.entries(symCounts).sort((a,b) => b[1] - a[1]).slice(0, 3);
    const dengueCore = SYNDROMES.find(s => s.id === 'DENGUE_LIKE')?.core || [];
    
    sorted.forEach(([sId, count]) => {
      const labelName = t(`symptom_${sId}`);
      dynamicBreakdown.push({
        label: `${count} ${labelName}`,
        hot: dengueCore.includes(sId)
      });
    });
  }

  const rowDir = isUrdu ? 'row-reverse' : 'row';
  const autoMargin = isUrdu ? 'marginRight' : 'marginLeft';
  const autoMarginRev = isUrdu ? 'marginLeft' : 'marginRight';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        
        {/* 1. Header with greeting and stats */}
        <View style={{ flexDirection: rowDir, alignItems: 'center', paddingHorizontal: 18, marginTop: 4 }}>
          {/* Avatar */}
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <LinearGradient
              colors={theme.grad.brand}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...theme.shadow }}
            >
              <T style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>{profile?.initials}</T>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={{ flex: 1, [autoMarginRev]: 12, [autoMargin]: 12, minHeight: 52, justifyContent: 'center' }}>
            <T style={{ fontSize: 13, color: theme.color.ink3 }}>{isUrdu ? 'السلام علیکم' : 'Assalam-o-Alaikum'}</T>
            <T style={{ fontSize: 16.5, fontWeight: '700', color: theme.color.ink, marginTop: -1 }}>
              {isUrdu ? profile?.nameUr : profile?.name}
            </T>
            <T style={{ fontSize: 11.5, color: theme.color.ink3, marginTop: 1 }}>{iso(profile?.uc)} · {iso(profile?.village)}</T>
          </View>
          
          {/* Language Toggle */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={toggleLang}
            style={{
              height: 34,
              backgroundColor: '#FFFFFF',
              borderRadius: 17,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 4,
              marginHorizontal: 8,
              ...theme.shadow
            }}
          >
            <View style={{ 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 13, 
              backgroundColor: isUrdu ? theme.color.purple : 'transparent' 
            }}>
              <T style={{ fontSize: 11, fontWeight: '700', color: isUrdu ? '#FFFFFF' : theme.color.ink3 }}>اردو</T>
            </View>
            <View style={{ 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 13, 
              backgroundColor: !isUrdu ? theme.color.purple : 'transparent' 
            }}>
              <T style={{ fontSize: 11, fontWeight: '700', color: !isUrdu ? '#FFFFFF' : theme.color.ink3 }}>EN</T>
            </View>
          </TouchableOpacity>

          <View style={{
            width: 38,
            height: 38,
            borderRadius: 13,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.shadow
          }}>
            <Ionicons name="notifications-outline" size={20} color={theme.color.lilacD} />
            <View style={{
              position: 'absolute',
              top: 8,
              right: 9,
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: theme.color.coralD,
              borderWidth: 1.5,
              borderColor: '#FFFFFF'
            }} />
          </View>
        </View>

        {/* 2. Status band */}
        {alert && (
          <GradientCard
            colors={theme.grad.alert}
            style={{
              marginHorizontal: 18,
              marginTop: 14,
              paddingTop: 20,
              paddingBottom: 18,
              paddingHorizontal: 18,
              shadowColor: '#FF5A78',
              shadowOpacity: 0.35,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 12 },
              elevation: 8,
            }}
            radius={theme.radius.xl}
          >
            {/* Decorative glow */}
            <View style={{
              position: 'absolute',
              top: -60,
              right: -40,
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: 'rgba(255,255,255,0.22)'
            }} />
            <View style={{
              position: 'absolute',
              bottom: -40,
              left: -20,
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: 'rgba(255,255,255,0.14)'
            }} />

            {/* Tag pill */}
            <View style={{
              alignSelf: isUrdu ? 'flex-end' : 'flex-start',
              backgroundColor: 'rgba(255,255,255,0.28)',
              paddingVertical: 5,
              paddingHorizontal: 11,
              borderRadius: 999
            }}>
              <T style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.3, color: '#FFFFFF' }}>
                {t('your_area')} · {iso(profile?.uc)}
              </T>
            </View>

            <T style={{ fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginTop: 10 }}>{t('outbreak_alert')}</T>
            <T numberOfLines={3} style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 19, opacity: 0.96, marginTop: 5 }}>{t('alert_detail')}</T>
            
            <AdvisoryPlayer title={t('advisory_title')} sub={t('advisory_sub')} />
          </GradientCard>
        )}

        {/* 3. Section header */}
        <View style={{ flexDirection: rowDir, alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingHorizontal: 18, paddingBottom: 10 }}>
          <T style={{ fontSize: 15, fontWeight: '700', color: theme.color.ink }}>{t('todays_rounds')}</T>
          <T style={{ fontSize: 12, fontWeight: '700', color: theme.color.lilacD }}>{t('see_all')}</T>
        </View>

        {/* 4. Rounds card */}
        <Card style={{ marginHorizontal: 18, flexDirection: rowDir, alignItems: 'center', padding: 14 }}>
          <ProgressRing value={todaysCases.length} total={rounds.total} />
          
          <View style={{ flex: 1, [autoMarginRev]: 15 }}>
            <T style={{ fontSize: 14.5, fontWeight: '700', color: theme.color.ink }}>{todaysCases.length} {t('houses_visited')}</T>
            <T style={{ fontSize: 12, color: theme.color.ink3, lineHeight: 17, marginTop: 2 }}>{t('houses_left', { n: Math.max(0, rounds.total - todaysCases.length) })}. {t('ahead_of_yesterday')}</T>
            
            <View style={{ flexDirection: rowDir, flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {dynamicBreakdown.map((item, idx) => (
                <Pill key={idx} label={item.label} bg={item.hot ? '#FFE9EE' : theme.color.lav} color={item.hot ? theme.color.coralD : theme.color.lilacD} />
              ))}
            </View>
          </View>
        </Card>

        {/* 5. Streak card */}
        <Card style={{ marginHorizontal: 18, marginTop: 12 }}>
          <View style={{ flexDirection: rowDir, alignItems: 'center' }}>
            <Ionicons name="flame" size={16} color={theme.color.butterD} />
            <T style={{ fontSize: 14.5, fontWeight: '700', color: theme.color.ink, [autoMarginRev]: 6 }}>{t('days_reporting', { n: streak.days })}</T>
            <T style={{ fontSize: 11.5, color: theme.color.ink3, [autoMargin]: 'auto' }}>{t('keep_going')}</T>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            {streak.week && streak.week.map((day, idx) => (
              <View key={idx} style={{ alignItems: 'center', gap: 6 }}>
                {day.state === 'done' ? (
                  <LinearGradient
                    colors={theme.grad.mint}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </LinearGradient>
                ) : day.state === 'today' ? (
                  <LinearGradient
                    colors={theme.grad.lilac}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFFFFF' }} />
                  </LinearGradient>
                ) : (
                  <View style={{ width: 30, height: 30, borderRadius: 11, backgroundColor: theme.color.lav }} />
                )}
                <T style={{ fontSize: 10, fontWeight: '700', color: theme.color.ink3 }}>{t(`day_${day.d}`)}</T>
              </View>
            ))}
          </View>
        </Card>

        {/* 6. Primary CTA */}
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/log')} style={{
          marginHorizontal: 18,
          marginTop: 20,
          shadowColor: '#9B6EDC',
          shadowOpacity: 0.4,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 12 },
          elevation: 8,
        }}>
          <LinearGradient
            colors={theme.grad.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 60,
              borderRadius: 22,
              flexDirection: rowDir,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Ionicons name="mic" size={19} color="#FFFFFF" />
            <T style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF' }}>{t('log_a_case')}</T>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
