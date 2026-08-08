import React from 'react';
import { View } from 'react-native';
import theme from '../constants/theme';

export default function Card({ style, children, radius = theme.radius.lg }) {
  return (
    <View style={[{
      backgroundColor: theme.color.card,
      borderRadius: radius,
      padding: 14,
      ...theme.shadow,
    }, style]}>
      {children}
    </View>
  );
}
