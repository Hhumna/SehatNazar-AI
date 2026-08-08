import React from 'react';
import { View } from 'react-native';
import theme from '../constants/theme';
import T from './T';

export default function Pill({ label, bg, color }) {
  return (
    <View style={{
      backgroundColor: bg,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.space.md,
      paddingVertical: theme.space.xs,
    }}>
      <T style={{
        color: color,
        fontWeight: '600',
        fontSize: 12,
      }}>
        {label}
      </T>
    </View>
  );
}
