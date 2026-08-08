import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import theme from '../../constants/theme';
import AreaCard from '../../components/AreaCard';
import { evaluateDistrict } from '../../lib/engine';
import { getCases } from '../../lib/storage';
import { assessCluster } from '../../lib/ai';
import { getCachedAssessment, setCachedAssessment } from '../../lib/aiCache';
import { useLang } from '../../lib/i18n';
import T from '../../components/T';
import { useSession } from '../../lib/session';

export default function NearbyScreen() {
  const { t, lang, isUrdu } = useLang();
  const { profile } = useSession();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [clusters, setClusters] = useState([]);

  const loadPipeline = async () => {
    // 1. Get real cases
    const cases = await getCases();
    
    // Dynamic defaults for real deployment
    const ucs = profile?.uc ? [profile.uc] : [];
    // Find other UCs from the cases
    cases.forEach(c => {
      if (c.uc && !ucs.includes(c.uc)) ucs.push(c.uc);
    });

    const baselines = {};
    const rain = {};
    ucs.forEach(u => {
      baselines[u] = 1; // Default baseline
      rain[u] = false;
    });

    // 2. Run Engine
    const { results } = evaluateDistrict({
      cases,
      ucs,
      now: new Date().toISOString(),
      baselines,
      rain
    });

    const severityMap = { 'ALERT': 3, 'WATCH': 2, 'NORMAL': 1 };
    
    const activeClusters = Object.keys(results)
      .sort((a, b) => {
        if (a === profile?.uc) return -1;
        if (b === profile?.uc) return 1;
        return severityMap[results[b].level] - severityMap[results[a].level];
      })
      .map(uc => ({
        uc,
        result: results[uc],
        assessment: null,
        loading: true
      }));

    setClusters(activeClusters);

    // 2. Fetch Assessments
    for (const cluster of activeClusters) {
      try {
        const cached = await getCachedAssessment(cluster.uc, cluster.result.evaluatedAt, lang);
        if (cached) {
          updateClusterAssessment(cluster.uc, cached);
          continue;
        }

        const context = {
          district: profile?.district || 'Vehari',
          villages: profile?.village ? [profile.village] : ['Chak 112'],
          rainfall: rain[cluster.uc] ? 'Heavy' : 'Normal',
          baseline: baselines[cluster.uc],
          inRing: cluster.result.threshold < 3,
          isUrdu
        };

        const assessment = await assessCluster(cluster.result, cases, context);
        await setCachedAssessment(cluster.uc, cluster.result.evaluatedAt, assessment, lang);
        updateClusterAssessment(cluster.uc, assessment);
      } catch (err) {
        // AI fetch failed, it shouldn't normally happen due to fallback in ai.js, but just in case
        updateClusterAssessment(cluster.uc, null);
      }
    }
  };

  const updateClusterAssessment = (uc, assessment) => {
    setClusters(prev => prev.map(c => 
      c.uc === uc ? { ...c, assessment, loading: false } : c
    ));
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPipeline();
    setRefreshing(false);
  };

  const rowDir = isUrdu ? 'row-reverse' : 'row';
  const autoMarginRev = isUrdu ? 'marginLeft' : 'marginRight';
  const autoMargin = isUrdu ? 'marginRight' : 'marginLeft';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.color.bg }}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.color.lilacD} />
        }
      >
        <View style={{ flexDirection: rowDir, alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6 }}>
          <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              ...theme.shadow,
              [autoMarginRev]: 12
            }}
          >
            <Ionicons name={isUrdu ? "chevron-forward" : "chevron-back"} size={20} color={theme.color.purple} style={{ [autoMargin]: -2 }} />
          </TouchableOpacity>
          <T style={{ fontSize: 18, fontWeight: '700', color: theme.color.ink }}>{t('nearby_areas')}</T>
        </View>

        <T style={{ fontSize: 12.5, color: theme.color.ink3, marginHorizontal: 20, marginBottom: 4 }}>
          {t('nearby_sub')}
        </T>

        <View style={{ paddingHorizontal: 18, gap: 11, marginTop: 10 }}>
          {clusters.map((c) => (
            <AreaCard key={c.uc} uc={c.uc} cluster={c.result} assessment={c.assessment} loading={c.loading} />
          ))}
          {clusters.length === 0 && (
             <T style={{ textAlign: 'center', marginTop: 40, color: theme.color.ink3 }}>{t('no_active_clusters')}</T>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
