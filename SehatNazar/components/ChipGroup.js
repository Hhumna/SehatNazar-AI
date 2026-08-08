import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';
import T from './T';

export default function ChipGroup({ options, selected, onToggle, multi, grad }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt, idx) => {
        const isObj = typeof opt === 'object';
        const id = isObj ? opt.id : opt;
        const label = isObj ? opt.label : opt;
        const itemGrad = (isObj && opt.grad) ? theme.grad[opt.grad] : (grad ? theme.grad[grad] : theme.grad.brand);

        const isSelected = multi ? selected.includes(id) : selected === id;

        return (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.7}
            onPress={() => onToggle(id)}
            style={{ borderRadius: theme.radius.pill }}
          >
            {isSelected ? (
              <LinearGradient
                colors={itemGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingHorizontal: theme.space.lg,
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <T style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{label}</T>
              </LinearGradient>
            ) : (
              <View
                style={{
                  paddingHorizontal: theme.space.lg,
                  paddingVertical: theme.space.sm,
                  borderRadius: theme.radius.pill,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1.6,
                  borderColor: '#E8DEFB',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <T style={{ color: theme.color.ink, fontWeight: '700', fontSize: 14 }}>{label}</T>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
