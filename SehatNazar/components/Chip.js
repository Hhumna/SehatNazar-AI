import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';
import T from './T';

export default function Chip({ label, sub, colors, ghost }) {
  if (ghost) {
    return (
      <View style={{
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.sm,
        backgroundColor: theme.color.card,
        borderWidth: 1,
        borderColor: theme.color.lilac,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <T style={{ color: theme.color.ink, fontWeight: '700', fontSize: 14 }}>{label}</T>
        {sub && <T style={{ color: theme.color.ink3, fontWeight: '500', fontSize: 10 }}>{sub}</T>}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={colors || theme.grad.lilac}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.sm,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <T style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{label}</T>
      {sub && <T style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '500', fontSize: 10 }}>{sub}</T>}
    </LinearGradient>
  );
}
