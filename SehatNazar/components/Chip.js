import React from 'react';
import { View } from 'react-native';
import theme from '../constants/theme';
import T from './T';

export default function Chip({ label, sub, colors, ghost }) {
  // Extract primary color from gradient array or default to lilacD
  const baseColor = colors ? colors[1] : theme.color.lilacD;

  if (ghost) {
    return (
      <View style={{
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.space.lg,
        paddingVertical: theme.space.sm,
        backgroundColor: theme.color.card,
        borderWidth: 1,
        borderColor: baseColor,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <T style={{ color: theme.color.ink, fontWeight: '700', fontSize: 14 }}>{label}</T>
        {sub && <T style={{ color: theme.color.ink3, fontWeight: '500', fontSize: 10 }}>{sub}</T>}
      </View>
    );
  }

  // 10% opacity hex = 1A
  const rgbaColor = baseColor + '1A';

  return (
    <View style={{
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.space.lg,
      paddingVertical: theme.space.sm,
      backgroundColor: rgbaColor,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <T style={{ color: baseColor, fontWeight: '700', fontSize: 14 }}>{label}</T>
      {sub && <T style={{ color: baseColor, opacity: 0.8, fontWeight: '500', fontSize: 10 }}>{sub}</T>}
    </View>
  );
}
