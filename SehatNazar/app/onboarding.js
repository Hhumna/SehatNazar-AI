import React, { useState, useRef } from 'react';
import { View, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import theme from '../constants/theme';
import T from '../components/T';
import { useLang } from '../lib/i18n';
import { setOnboarded } from '../lib/auth';

const { width } = Dimensions.get('window');

const Slide1Svg = () => (
  <Svg width={120} height={120} viewBox="0 0 100 100">
    <Rect x="30" y="20" width="40" height="70" rx="8" fill="none" stroke={theme.color.brand} strokeWidth="4" />
    <Circle cx="50" cy="80" r="3" fill={theme.color.brand} />
    <Path d="M 65 30 Q 80 40 65 50" fill="none" stroke={theme.color.lilacD} strokeWidth="3" strokeLinecap="round" />
    <Path d="M 72 25 Q 90 40 72 55" fill="none" stroke={theme.color.lilacD} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <Path d="M 35 30 Q 20 40 35 50" fill="none" stroke={theme.color.lilacD} strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

const Slide2Svg = () => (
  <Svg width={120} height={120} viewBox="0 0 100 100">
    <Line x1="30" y1="30" x2="70" y2="30" stroke={theme.color.lav} strokeWidth="3" strokeDasharray="4 4" />
    <Line x1="70" y1="30" x2="50" y2="70" stroke={theme.color.lav} strokeWidth="3" strokeDasharray="4 4" />
    <Line x1="50" y1="70" x2="30" y2="30" stroke={theme.color.lav} strokeWidth="3" strokeDasharray="4 4" />
    
    <Circle cx="30" cy="30" r="10" fill={theme.color.mintD} />
    <Circle cx="70" cy="30" r="10" fill={theme.color.mintD} />
    <Circle cx="50" cy="70" r="12" fill={theme.color.coralD} />
    
    <Circle cx="30" cy="30" r="4" fill="#FFF" />
    <Circle cx="70" cy="30" r="4" fill="#FFF" />
    <Path d="M 45 70 L 55 70 M 50 65 L 50 75" stroke="#FFF" strokeWidth="2" />
  </Svg>
);

const Slide3Svg = () => (
  <Svg width={120} height={120} viewBox="0 0 100 100">
    <Rect x="30" y="25" width="40" height="60" rx="8" fill="none" stroke={theme.color.brand} strokeWidth="4" />
    <Path d="M 50 50 L 50 35 L 45 40 M 50 35 L 55 40" fill="none" stroke={theme.color.lilacD} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M 40 65 L 60 65" stroke={theme.color.lilacD} strokeWidth="4" strokeLinecap="round" />
    <Path d="M 40 75 L 50 75" stroke={theme.color.lilacD} strokeWidth="4" strokeLinecap="round" />
  </Svg>
);

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, isUrdu, toggleLang } = useLang();
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const slides = [
    {
      id: 's1',
      title: 'onboarding_1_title',
      body: 'onboarding_1_body',
      Svg: Slide1Svg
    },
    {
      id: 's2',
      title: 'onboarding_2_title',
      body: 'onboarding_2_body',
      Svg: Slide2Svg
    },
    {
      id: 's3',
      title: 'onboarding_3_title',
      body: 'onboarding_3_body',
      Svg: Slide3Svg
    }
  ];

  const handleFinish = async () => {
    await setOnboarded(true);
    router.replace('/(auth)/signup');
  };

  const handleNext = () => {
    if (index === slides.length - 1) {
      handleFinish();
    } else {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, zIndex: 10 }}>
        {index === 0 ? (
          <TouchableOpacity onPress={toggleLang} style={{ backgroundColor: theme.color.lav, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
            <T style={{ fontSize: 13, fontWeight: '700', color: theme.color.brand }}>
              {isUrdu ? 'English' : 'اردو'}
            </T>
          </TouchableOpacity>
        ) : <View />}
        <TouchableOpacity onPress={handleFinish}>
          <T style={{ fontSize: 15, fontWeight: '600', color: theme.color.ink3 }}>{t('skip')}</T>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={{ width, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 60 }}>
            <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
              <item.Svg />
            </View>
            <T style={{ fontSize: 24, fontWeight: '700', color: theme.color.ink, textAlign: 'center', marginBottom: 16 }}>
              {t(item.title)}
            </T>
            <T style={{ fontSize: 14, color: theme.color.ink2, textAlign: 'center', lineHeight: 22 }}>
              {t(item.body)}
            </T>
          </View>
        )}
      />

      <View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, paddingHorizontal: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                height: 7,
                width: i === index ? 20 : 7,
                borderRadius: 4,
                backgroundColor: i === index ? theme.color.brand : theme.color.lav
              }}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={theme.grad.brand}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 16, borderRadius: 16, alignItems: 'center', ...theme.shadow }}
          >
            <T style={{ fontSize: 17, fontWeight: '700', color: '#FFFFFF' }}>
              {index === slides.length - 1 ? t('get_started') : t('next')}
            </T>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
