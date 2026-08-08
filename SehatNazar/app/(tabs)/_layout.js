import React from 'react';
import { Tabs } from 'react-native';
import { Tabs as ExpoTabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { useLang } from '../../lib/i18n';

export default function TabLayout() {
  const { t, font } = useLang();
  return (
    <ExpoTabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor: '#F0E9FB',
        borderTopWidth: 1,
        height: 64,
        paddingBottom: 10,
        flexDirection: 'row', // Force LTR for tabs
      },
      tabBarActiveTintColor: theme.color.lilacD,
      tabBarInactiveTintColor: theme.color.ink3,
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '700',
        fontFamily: font,
      },
    }}>
      <ExpoTabs.Screen
        name="index"
        options={{
          title: t('tab_home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="log"
        options={{
          title: t('tab_log'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'mic' : 'mic-outline'} size={24} color={color} />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="nearby"
        options={{
          title: t('tab_nearby'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'warning' : 'warning-outline'} size={24} color={color} />
          ),
        }}
      />
      <ExpoTabs.Screen
        name="records"
        options={{
          title: t('tab_records'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'sync-circle' : 'sync-circle-outline'} size={24} color={color} />
          ),
        }}
      />
    </ExpoTabs>
  );
}
