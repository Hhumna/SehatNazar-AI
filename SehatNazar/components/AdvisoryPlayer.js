import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';
import T from './T';
import { useLang } from '../lib/i18n';

export default function AdvisoryPlayer({ title, sub }) {
  const { isUrdu } = useLang();
  const wave = [6, 14, 21, 10, 17, 8, 15, 22, 9, 13];
  
  const rowDir = isUrdu ? 'row-reverse' : 'row';
  const autoMargin = isUrdu ? 'marginRight' : 'marginLeft';
  const alignLeft = isUrdu ? 'flex-end' : 'flex-start';
  
  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.24)',
      borderRadius: 18,
      paddingVertical: 9,
      paddingHorizontal: 12,
      flexDirection: rowDir,
      alignItems: 'center',
      gap: 11,
      marginTop: 14,
    }}>
      <View style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Ionicons name="play" size={18} color={theme.color.coralD} style={{ [autoMargin]: 3 }} />
      </View>
      <View style={{ flex: 1, alignItems: alignLeft }}>
        <T style={{ fontSize: 12.5, fontWeight: '700', color: '#FFFFFF' }}>{title}</T>
        <T style={{ fontSize: 10.5, color: '#FFFFFF', opacity: 0.9 }}>{sub}</T>
      </View>
      <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 2.5 }}>
        {wave.map((h, i) => (
          <View key={i} style={{
            width: 2.5,
            height: h,
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: 3
          }} />
        ))}
      </View>
    </View>
  );
}
