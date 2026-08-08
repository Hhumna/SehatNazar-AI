import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import theme from '../../constants/theme';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import ChipGroup from '../../components/ChipGroup';
import { symptomOptions, ageGroups, genders, fakeTranscript, fakeParsed } from '../../data/options';
import { addCase } from '../../lib/storage';
import T from '../../components/T';
import { useLang } from '../../lib/i18n';
import { useSession } from '../../lib/session';
import { iso } from '../../lib/bidi';

export default function LogScreen() {
  const router = useRouter();
  const { t, isUrdu, setLang } = useLang();
  const { profile } = useSession();

  const [mode, setMode]       = useState('speak');  // 'speak' | 'tap'
  const [phase, setPhase]     = useState('idle');   // 'idle'|'recording'|'thinking'|'parsed'
  const [transcript, setTranscript] = useState('');
  const [age, setAge]         = useState(null);
  const [gender, setGender]   = useState(null);
  const [symptoms, setSymptoms] = useState([]);     // array of ids
  const [duration, setDuration] = useState(null);
  const [saved, setSaved]     = useState(false);

  // Waveform animation
  const animValue = useRef(new Animated.Value(0)).current;

  // Timers and Guards
  const timers = useRef({ type: null, think: null, saved: null });
  const busy = useRef(false);
  const mounted = useRef(true);

  const clearAllTimers = () => {
    if (timers.current.type) clearInterval(timers.current.type);
    if (timers.current.think) clearTimeout(timers.current.think);
    if (timers.current.saved) clearTimeout(timers.current.saved);
    timers.current = { type: null, think: null, saved: null };
  };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearAllTimers();
    };
  }, []);

  useEffect(() => {
    if (phase === 'recording') {
      Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      animValue.stopAnimation();
      animValue.setValue(0);
    }
  }, [phase, animValue]);

  const handleMicPress = () => {
    if (busy.current) return;
    clearAllTimers();
    busy.current = true;

    if (phase === 'idle') {
      setPhase('recording');
      setTranscript('');
      let n = 0;
      timers.current.type = setInterval(() => {
        if (!mounted.current) return;
        n += 1;
        setTranscript(fakeTranscript.slice(0, n));
        if (n >= fakeTranscript.length) {
          if (timers.current.type) clearInterval(timers.current.type);
        }
      }, 45);
      busy.current = false;
    } else if (phase === 'recording') {
      setTranscript(fakeTranscript);
      setPhase('thinking');
      timers.current.think = setTimeout(() => {
        if (!mounted.current) return;
        setPhase('parsed');
        setAge(fakeParsed.age);
        setGender(fakeParsed.gender);
        setSymptoms(fakeParsed.symptoms);
        setDuration(fakeParsed.duration);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        busy.current = false;
      }, 1200);
    } else {
      busy.current = false;
    }
  };

  const isSaveEnabled = age && symptoms.length > 0;

  const handleSave = async () => {
    if (!isSaveEnabled || saved) return;
    
    await addCase({
      workerId: profile?.id,
      uc: profile?.uc,
      village: profile?.village,
      age,
      gender,
      symptoms,
      duration,
      transcript: phase === 'parsed' ? fakeTranscript : undefined
    });

    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearAllTimers();
    timers.current.saved = setTimeout(() => {
      if (!mounted.current) return;
      setSaved(false);
      setPhase('idle');
      setMode('speak');
      setTranscript('');
      setAge(null);
      setGender(null);
      setSymptoms([]);
      setDuration(null);
    }, 2000);
  };

  const renderWaveform = () => {
    const freezeHeights = [7,16,24,11,19,26,9,17,23,12,20,7,15,22,10];
    const bars = 15;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 14, height: 26 }}>
        {Array.from({ length: bars }).map((_, i) => {
          let scaleY = 5 / 26;
          if (phase === 'thinking' || phase === 'parsed') {
            scaleY = freezeHeights[i] / 26;
          } else if (phase === 'recording') {
            scaleY = animValue.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: [0, 0.25, 0.5, 0.75, 1].map(x => 
                (6 + 10 * (Math.sin(x * Math.PI * 2 + (i / bars) * Math.PI * 2) + 1)) / 26
              )
            });
          }

          return (
            <Animated.View
              key={i}
              style={{
                width: 3.5,
                height: 26,
                borderRadius: 3,
                backgroundColor: theme.color.lilacD,
                opacity: phase === 'idle' ? 0.35 : 0.85,
                transform: [{ scaleY }]
              }}
            />
          );
        })}
      </View>
    );
  };

  let caption = t('tap_mic');
  if (phase === 'recording') caption = t('listening');
  if (phase === 'thinking') caption = t('understanding');
  if (phase === 'parsed') caption = t('we_heard');

  const rowDir = isUrdu ? 'row-reverse' : 'row';
  const autoMarginRev = isUrdu ? 'marginLeft' : 'marginRight';
  const autoMargin = isUrdu ? 'marginRight' : 'marginLeft';

  // Translate mapped options for ChipGroup
  const translatedAges = ageGroups.map(a => {
    if (a === 'Baby 0-5') return { id: a, label: t('age_baby') };
    if (a === 'Child 6-17') return { id: a, label: t('age_child') };
    if (a === 'Adult 18-59') return { id: a, label: t('age_adult') };
    if (a === 'Elder 60+') return { id: a, label: t('age_elder') };
    return { id: a, label: a };
  });

  const translatedGenders = genders.map(g => {
    if (g === 'Girl / Woman') return { id: g, label: t('gender_female') };
    if (g === 'Boy / Man') return { id: g, label: t('gender_male') };
    return { id: g, label: g };
  });

  const translatedSymptoms = symptomOptions.map(s => ({
    ...s,
    label: t(s.id)
  }));

  const translatedDurations = ['Today','2 days','3-5 days','A week or more'].map(d => {
    let key = '';
    if (d === 'Today') key = 'duration_today';
    else if (d === '2 days') key = 'duration_2days';
    else if (d === '3-5 days') key = 'duration_3to5days';
    else key = 'duration_week';
    return { id: d, label: t(key) };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: rowDir, alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 }}>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              ...theme.shadow,
              [autoMarginRev]: 12
            }}
          >
            <Ionicons name={isUrdu ? "chevron-forward" : "chevron-back"} size={20} color={theme.color.purple} style={{ [autoMargin]: -2 }} />
          </TouchableOpacity>
          <T style={{ fontSize: 18, fontWeight: '700', color: theme.color.ink }}>{t('new_case')}</T>

          <View style={{ flex: 1 }} />

          {/* Language Toggle */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => setLang(isUrdu ? 'en' : 'ur')}
            style={{
              height: 34,
              backgroundColor: '#FFFFFF',
              borderRadius: 17,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 4,
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
        </View>

        {/* Context Card */}
        <Card style={{ marginHorizontal: 18, marginTop: 12, paddingVertical: 12, paddingHorizontal: 15 }}>
          <T style={{ fontSize: 12, lineHeight: 19 }}>
            <T style={{ fontWeight: '700', color: theme.color.ink }}>{iso(profile?.uc)} · {iso(profile?.village)}</T>
            <T style={{ color: theme.color.ink2 }}> · {t('location_found')} · 09:41, 6 Aug</T>
          </T>
          <T style={{ fontSize: 12, color: theme.color.ink2, marginTop: 2 }}>
            {t('nothing_to_type')}
          </T>
        </Card>

        {/* Mode toggle */}
        <View style={{
          flexDirection: rowDir,
          backgroundColor: theme.color.lav,
          borderRadius: 20,
          padding: 5,
          marginHorizontal: 18,
          marginTop: 13
        }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMode('speak')}
            style={[{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
            }, mode === 'speak' && {
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              ...theme.shadow
            }]}
          >
            <T style={{ fontSize: 13.5, fontWeight: '700', color: mode === 'speak' ? theme.color.purple : theme.color.ink3 }}>{t('speak')}</T>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMode('tap')}
            style={[{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
            }, mode === 'tap' && {
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              ...theme.shadow
            }]}
          >
            <T style={{ fontSize: 13.5, fontWeight: '700', color: mode === 'tap' ? theme.color.purple : theme.color.ink3 }}>{t('tap')}</T>
          </TouchableOpacity>
        </View>

        {/* Recorder panel */}
        {mode === 'speak' && (
          <LinearGradient
            colors={['#F3ECFF', '#FFEDF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              marginHorizontal: 18,
              marginTop: 14,
              borderRadius: theme.radius.xl,
              paddingTop: 20,
              paddingHorizontal: 16,
              paddingBottom: 18,
              alignItems: 'center'
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleMicPress}
              style={{
                shadowColor: '#9B6EDC',
                shadowOpacity: 0.4,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 12 },
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={theme.grad.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: 39,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name="mic" size={30} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            
            {renderWaveform()}

            <T style={{ fontSize: 13, fontWeight: '700', color: theme.color.purple, marginTop: 10 }}>{caption}</T>

            {phase !== 'idle' && (
              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                paddingVertical: 12,
                paddingHorizontal: 14,
                marginTop: 12,
                alignSelf: 'stretch'
              }}>
                <T style={{ textAlign: isUrdu ? 'right' : 'left', fontSize: 13, lineHeight: 20, color: theme.color.ink }}>
                  “{transcript}”
                </T>
              </View>
            )}
          </LinearGradient>
        )}

        {/* We heard this block */}
        {mode === 'speak' && phase === 'parsed' && (
          <View style={{ marginHorizontal: 18, marginTop: 14 }}>
            <View style={{ flexDirection: rowDir, alignItems: 'center' }}>
              <T style={{ fontSize: 14, fontWeight: '700', color: theme.color.ink }}>{t('we_heard')}</T>
              <T style={{ fontSize: 11.5, color: theme.color.ink3, [autoMargin]: 'auto' }}>{t('tap_to_fix')}</T>
            </View>
            
            <View style={{ flexDirection: rowDir, flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {age && <Chip label={translatedAges.find(a => a.id === age)?.label} sub={fakeParsed.ageNote} colors={theme.grad.lilac} />}
              {gender && <Chip label={translatedGenders.find(g => g.id === gender)?.label} colors={theme.grad.lilac} />}
              {symptoms.map(sId => {
                const s = translatedSymptoms.find(opt => opt.id === sId);
                return s ? <Chip key={sId} label={s.label} colors={theme.grad[s.grad]} /> : null;
              })}
              {duration && <Chip label={translatedDurations.find(d => d.id === duration)?.label} colors={theme.grad.lilac} />}
              
              <TouchableOpacity activeOpacity={0.7} onPress={() => setMode('tap')}>
                <Chip label={t('add')} ghost={true} />
              </TouchableOpacity>
            </View>
            
            <T style={{ fontSize: 11.5, color: theme.color.ink3, lineHeight: 18, marginTop: 12 }}>
              {t('check_before_save')}
            </T>
          </View>
        )}

        {/* TAP mode block */}
        {mode === 'tap' && (
          <View style={{ marginTop: 2 }}>
            <View style={{ marginHorizontal: 18, marginTop: 18 }}>
              <T style={{ fontSize: 13, fontWeight: '700', color: theme.color.ink, marginBottom: 9 }}>{t('who_patient')}</T>
              <ChipGroup 
                options={translatedAges} 
                selected={age} 
                onToggle={setAge} 
                multi={false} 
                grad="lilac" 
              />
            </View>

            <View style={{ marginHorizontal: 18, marginTop: 18 }}>
              <T style={{ fontSize: 13, fontWeight: '700', color: theme.color.ink, marginBottom: 9 }}>{t('girl_or_boy')}</T>
              <ChipGroup 
                options={translatedGenders} 
                selected={gender} 
                onToggle={setGender} 
                multi={false} 
                grad="lilac" 
              />
            </View>

            <View style={{ marginHorizontal: 18, marginTop: 18 }}>
              <T style={{ fontSize: 13, fontWeight: '700', color: theme.color.ink, marginBottom: 9 }}>{t('what_you_saw')}</T>
              <ChipGroup 
                options={translatedSymptoms} 
                selected={symptoms} 
                onToggle={(id) => {
                  if (symptoms.includes(id)) {
                    setSymptoms(symptoms.filter(s => s !== id));
                  } else {
                    setSymptoms([...symptoms, id]);
                  }
                }} 
                multi={true} 
              />
            </View>

            <View style={{ marginHorizontal: 18, marginTop: 18 }}>
              <T style={{ fontSize: 13, fontWeight: '700', color: theme.color.ink, marginBottom: 9 }}>{t('since_when')}</T>
              <ChipGroup 
                options={translatedDurations} 
                selected={duration} 
                onToggle={setDuration} 
                multi={false} 
                grad="lilac" 
              />
            </View>
          </View>
        )}

        {/* Save Button */}
        <View style={{ marginHorizontal: 18, marginTop: 20, marginBottom: 24 }}>
          {saved ? (
            <LinearGradient
              colors={theme.grad.mint}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 60,
                borderRadius: 22,
                flexDirection: rowDir,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
            >
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              <View>
                <T style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>{t('case_saved')}</T>
                <T style={{ fontSize: 12, color: '#FFFFFF' }}>{t('sent_to_district')}</T>
              </View>
            </LinearGradient>
          ) : (
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handleSave} 
              disabled={!isSaveEnabled}
              style={{ opacity: isSaveEnabled ? 1 : 0.45 }}
            >
              <LinearGradient
                colors={theme.grad.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 60,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <T style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF' }}>{t('save_case')}</T>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
