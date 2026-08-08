import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';

export default function GradientCard({ style, children, radius = theme.radius.lg, colors }) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{
        borderRadius: radius,
        padding: 14,
        overflow: 'hidden',
        ...theme.shadow,
      }, style]}
    >
      {children}
    </LinearGradient>
  );
}
