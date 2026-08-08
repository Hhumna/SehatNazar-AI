import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../constants/theme';
import GradientCard from './GradientCard';
import Pill from './Pill';
import T from './T';
import { useLang } from '../lib/i18n';
import { iso } from '../lib/bidi';

export default function AreaCard({ uc, cluster, assessment, loading }) {
  const { t, isUrdu } = useLang();
  if (!cluster || cluster.level === 'NORMAL') return null;

  const level = cluster.level;
  
  let gradColors, textColor, iconColor;
  if (level === 'ALERT') {
    gradColors = theme.grad.alert;
    textColor = '#FFFFFF';
    iconColor = '#FFFFFF';
  } else if (level === 'WATCH') {
    gradColors = theme.grad.watch;
    textColor = '#6A4405';
    iconColor = '#6A4405';
  } else {
    gradColors = theme.grad.safe;
    textColor = '#0C5744';
    iconColor = '#0C5744';
  }

  const tag = `CLUSTER · ${iso(uc)}`;
  const icon = level === 'ALERT' ? 'warning' : 'eye';

  const rowDir = isUrdu ? 'row-reverse' : 'row';
  const autoMargin = isUrdu ? 'marginRight' : 'marginLeft';
  const autoMarginRev = isUrdu ? 'marginLeft' : 'marginRight';
  const alignLeft = isUrdu ? 'flex-end' : 'flex-start';

  return (
    <GradientCard colors={gradColors} radius={24} style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
      {/* Decorative circle */}
      <View style={{
        position: 'absolute',
        top: -55,
        right: isUrdu ? null : -35,
        left: isUrdu ? -35 : null,
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.25)',
        zIndex: 1
      }} />

      <View style={{ zIndex: 2 }}>
        {/* Header row */}
        <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 11 }}>
          <View style={{
            width: 42,
            height: 42,
            borderRadius: 15,
            backgroundColor: 'rgba(255,255,255,0.32)',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Ionicons name={icon} size={21} color={iconColor} />
          </View>
          <View style={{ flex: 1, alignItems: alignLeft }}>
            <T style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.3, color: textColor, opacity: 0.9 }}>{tag}</T>
            {loading ? (
              <T style={{ fontSize: 17, fontWeight: '700', color: textColor, marginTop: 2 }}>Assessing cluster...</T>
            ) : (
              <T style={{ fontSize: 17, fontWeight: '700', color: textColor, marginTop: 2 }}>
                {assessment?.syndromic_pattern || (cluster.syndrome ? t(cluster.syndrome.id) : '')}
              </T>
            )}
          </View>
        </View>

        {loading ? (
          <View style={{ marginTop: 20, marginBottom: 10, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color={textColor} />
            <T style={{ fontSize: 12, color: textColor, marginTop: 8 }}>Gemini AI is analysing the cases...</T>
          </View>
        ) : assessment ? (
          <>
            {/* Differentials pills */}
            <View style={{ flexDirection: rowDir, flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {assessment.differentials.map((diff, idx) => (
                <View key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <T style={{ fontSize: 11, fontWeight: '600', color: textColor }}>{diff}</T>
                </View>
              ))}
            </View>

            {/* Risk score / Confidence meter */}
            <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 10, marginTop: 14 }}>
              <View style={{ flex: 1, height: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.4)', flexDirection: rowDir }}>
                <View style={{ width: `${Math.round(assessment.risk_score * 100)}%`, height: 8, borderRadius: 6, backgroundColor: '#FFFFFF' }} />
              </View>
              <T style={{ fontSize: 12.5, fontWeight: '700', color: textColor }}>{iso(`${Math.round(assessment.risk_score * 100)}%`)} {t('risk')}</T>
            </View>

            {/* Why flagged panel */}
            <View style={{
              marginTop: 14,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 14
            }}>
              <T style={{ fontSize: 10.5, fontWeight: '700', letterSpacing: 1.1, color: theme.color.ink3, textAlign: isUrdu ? 'right' : 'left' }}>{t('why_flagged').toUpperCase()}</T>
              {cluster.reasons.map((r, i) => {
                const pass = r.pass;
                return (
                  <View key={i} style={{ flexDirection: rowDir, alignItems: 'center', marginTop: 8 }}>
                    <Ionicons name={pass ? "checkmark-circle" : "close-circle"} size={14} color={pass ? theme.color.mintD : theme.color.coralD} />
                    <T style={{ fontSize: 11.5, color: theme.color.ink, [autoMargin]: 6 }}>
                      {t(`reason_${r.key}`, { n: r.n, need: r.need, baseline: r.baseline })}
                    </T>
                  </View>
                );
              })}
            </View>

            {/* AI evidence panel */}
            <View style={{
              marginTop: 10,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 14
            }}>
              <T style={{ fontSize: 10.5, fontWeight: '700', letterSpacing: 1.1, color: theme.color.purple, textAlign: isUrdu ? 'right' : 'left' }}>{t('what_ai_says').toUpperCase()}</T>
              <T style={{ fontSize: 12, lineHeight: 18, color: theme.color.ink, marginTop: 8, textAlign: isUrdu ? 'right' : 'left' }}>
                {assessment.evidence_reasoning}
              </T>
            </View>

            {/* Recommended actions */}
            <View style={{
              marginTop: 10,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 14
            }}>
              <T style={{ fontSize: 10.5, fontWeight: '700', letterSpacing: 1.1, color: theme.color.ink3, textAlign: isUrdu ? 'right' : 'left' }}>{t('recommended_actions').toUpperCase()}</T>
              {assessment.recommended_actions.map((item, idx) => (
                <View key={idx} style={{ flexDirection: rowDir, marginTop: 8, alignItems: 'flex-start' }}>
                  <LinearGradient
                    colors={theme.grad.mint}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 14, height: 14, borderRadius: 5, marginTop: 4 }}
                  />
                  <T style={{ flex: 1, fontSize: 12, lineHeight: 17, color: theme.color.ink, paddingHorizontal: 8, textAlign: isUrdu ? 'right' : 'left' }}>{item}</T>
                </View>
              ))}
            </View>

            {/* Advisory Player Area */}
            <View style={{
              marginTop: 10,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 14,
              flexDirection: rowDir,
              alignItems: 'center'
            }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="play" size={18} color={textColor} style={{ [autoMargin]: 2 }} />
              </View>
              <View style={{ flex: 1, [autoMargin]: 12 }}>
                <T style={{ fontSize: 11, fontWeight: '700', color: textColor, opacity: 0.9 }}>{t('advisory_title')}</T>
                <T style={{ fontSize: 11.5, color: textColor, marginTop: 2, lineHeight: 16 }} numberOfLines={3}>
                  "{assessment.advisory_roman_urdu}"
                </T>
              </View>
            </View>
            
            {/* Tiny Badge */}
            <View style={{ alignItems: isUrdu ? 'flex-start' : 'flex-end', marginTop: 12 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}>
                <T style={{ fontSize: 8, fontWeight: '800', letterSpacing: 0.5, color: textColor }}>
                  {assessment.source === 'gemini' ? 'AI' : 'OFFLINE'}
                </T>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </GradientCard>
  );
}
