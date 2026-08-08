import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import * as SplashScreen from 'expo-splash-screen';
import { useSession } from '../lib/session';
import { hasOnboarded } from '../lib/auth';
import T from '../components/T';
import theme from '../constants/theme';
import { useLang } from '../lib/i18n';

export default function SplashGate() {
  const router = useRouter();
  const { isLoading, profile } = useSession();
  const { isUrdu } = useLang();

  useEffect(() => {
    async function checkState() {
      await SplashScreen.hideAsync();
      
      // Minimum display time
      await new Promise(resolve => setTimeout(resolve, 1200));

      const onboarded = await hasOnboarded();

      if (!onboarded) {
        router.replace('/onboarding');
      } else if (!profile) {
        router.replace('/(auth)/signin');
      } else {
        router.replace('/(tabs)');
      }
    }

    if (!isLoading) {
      checkState();
    }
  }, [isLoading, profile, router]);

  return (
    <LinearGradient
      colors={theme.grad.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{
        width: 96,
        height: 96,
        borderRadius: 32,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        ...theme.shadow
      }}>
        <Svg width={48} height={48} viewBox="0 0 48 48">
          <Circle cx="24" cy="24" r="18" stroke={theme.color.brand} strokeWidth="3.5" fill="none" />
          <Circle cx="24" cy="24" r="10" stroke={theme.color.lilacD} strokeWidth="3.5" fill="none" />
          <Circle cx="24" cy="24" r="4" fill={theme.color.brand} />
        </Svg>
      </View>
      <T style={{ fontSize: 30, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 }}>SehatNazar</T>
      <T style={{ fontSize: 13, color: '#FFFFFF', opacity: 0.85, marginBottom: 40 }}>
        {isUrdu ? 'پہلی آواز، پہلا دفاع' : 'First voice, first defence'}
      </T>
      <ActivityIndicator size="small" color="#FFFFFF" style={{ position: 'absolute', bottom: 60 }} />
    </LinearGradient>
  );
}
