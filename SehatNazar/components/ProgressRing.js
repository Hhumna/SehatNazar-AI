import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import theme from '../constants/theme';

export default function ProgressRing({ size = 74, value, total }) {
  const r = 31;
  const strokeWidth = 9;
  const cx = 37;
  const cy = 37;
  const dash = 195;
  const progress = value / total;
  const offset = dash * (1 - progress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 74 74`}>
        <Defs>
          <SvgLinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#9B7BF0" />
            <Stop offset="100%" stopColor="#FF8FC0" />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="#F1E9FF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dash}
          strokeDashoffset={offset}
          fill="none"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: theme.color.ink }}>{value}</Text>
        <Text style={{ fontSize: 8.5, color: theme.color.ink3, marginTop: -2 }}>of {total}</Text>
      </View>
    </View>
  );
}
