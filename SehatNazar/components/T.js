import React from 'react';
import { Text } from 'react-native';
import { useLang } from '../lib/i18n';

export default function T({ style, children, ...props }) {
  const { isUrdu, font, dir } = useLang();

  const baseStyle = {
    fontFamily: font,
    textAlign: isUrdu ? 'right' : 'left',
    writingDirection: dir,
  };

  // Extract fontSize and lineHeight from styles to calculate adjusted lineHeight
  let currentLineHeight = null;
  let currentFontSize = 14;

  const flattenStyle = Array.isArray(style) ? style.flat(Infinity) : [style];
  flattenStyle.forEach(s => {
    if (s && s.fontSize) currentFontSize = s.fontSize;
    if (s && s.lineHeight) currentLineHeight = s.lineHeight;
  });

  const urduStyle = isUrdu ? {
    letterSpacing: 0,
    lineHeight: currentLineHeight ? currentLineHeight * 1.35 : currentFontSize * 1.35 * 1.35, // rough estimate if no explicit line height
  } : {};

  // For numbers in Urdu, ensure they don't break direction unnecessarily, but React Native text layout handles Western digits well.
  
  return (
    <Text style={[baseStyle, style, urduStyle]} {...props}>
      {children}
    </Text>
  );
}
