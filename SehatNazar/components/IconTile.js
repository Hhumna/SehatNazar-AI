import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';

export default function IconTile({ children, colors = theme.grad.lilac }) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {children}
    </LinearGradient>
  );
}
