import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import theme from '../constants/theme';
import { View } from 'react-native';
import { useFonts, NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
import * as SplashScreen from 'expo-splash-screen';
import { LanguageProvider } from '../lib/i18n';
import { SessionProvider } from '../lib/session';
import { seedIfEmpty } from '../lib/storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold,
  });

  React.useEffect(() => {
    seedIfEmpty();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <LanguageProvider>
      <SessionProvider>
        <View style={{ flex: 1, backgroundColor: theme.color.bg }}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </View>
      </SessionProvider>
    </LanguageProvider>
  );
}
