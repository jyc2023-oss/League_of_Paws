import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {HabitAnalytics, mockHabitAnalytics} from '@app/types';
import {fetchHabitAnalytics} from '@app/services/api/petHealthApi';
import type {RootStackParamList} from '@app/navigation/types';
import {usePetStore} from '@app/store/zustand/petStore';

type HabitRoute = RouteProp<RootStackParamList, 'HabitAnalytics'>;

const HabitAnalyticsScreen = (): JSX.Element => {
  const route = useRoute<HabitRoute>();
  const activePetId = usePetStore(state => state.activePetId);
  const petId = route.params?.petId ?? activePetId ?? mockHabitAnalytics.petId;

  const [analytics, setAnalytics] = useState<HabitAnalytics | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchHabitAnalytics(petId)
      .then(data => {
        if (mounted) {
          setAnalytics(data);
          setError(null);
        }
      })
      .catch(() => {
        if (mounted) {
          setAnalytics(mockHabitAnalytics);
          setError('使用本地分析数据');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [petId]);

  const progressMetrics = useMemo(() => {
    if (!analytics) {
      return [];
    }
    return [
      {
        label: '陪伴度',
        value: analytics.companionshipScore,
        color: palette.primary,
        description: '高陪伴有助于缓解宠物分离焦虑'
      },
      {
        label: '坚持度',
        value: analytics.consistencyScore,
        color: palette.secondary,
        description: '稳定的喂食与运动是体重管理核心'
      }
    ];
  }, [analytics]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loading}>正在分析陪伴习惯...</Text>
        </View>
      </Screen>
    );
  }

  if (!analytics) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.error}>暂无行为分析数据</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>陪伴度与坚持度分析</Text>
        {error && <Text style={styles.warning}>{error}</Text>}

        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>连续达成天数</Text>
          <Text style={styles.streakValue}>{analytics.streakDays} 天</Text>
          <Text style={styles.streakHint}>保持 21 天即可形成稳定习惯</Text>
        </View>

        {progressMetrics.map(metric => (
          <View key={metric.label} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={[styles.metricValue, {color: metric.color}]}>{metric.value}</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${metric.value}%`,
                    backgroundColor: metric.color
                  }
                ]}
              />
            </View>
            <Text style={styles.metricDescription}>{metric.description}</Text>
          </View>
        ))}

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>行为洞察</Text>
          {analytics.insights.map((insight, index) => (
            <View key={insight} style={styles.insightRow}>
              <View style={styles.bullet} />
              <Text style={styles.insightText}>
                {index + 1}. {insight}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.xl
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loading: {
    marginTop: spacing.sm,
    color: palette.textSecondary
  },
  error: {
    color: palette.primary
  },
  warning: {
    color: palette.accent,
    marginBottom: spacing.sm
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  streakCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: palette.background
  },
  streakLabel: {
    color: palette.textSecondary
  },
  streakValue: {
    fontSize: typography.title,
    fontWeight: '700',
    marginTop: spacing.xs,
    color: palette.textPrimary
  },
  streakHint: {
    marginTop: spacing.xs,
    color: palette.textSecondary
  },
  metricCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#fff'
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm
  },
  metricLabel: {
    fontWeight: '600',
    color: palette.textPrimary
  },
  metricValue: {
    fontWeight: '700',
    fontSize: typography.heading
  },
  progressBar: {
    height: 10,
    borderRadius: 10,
    backgroundColor: palette.border,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%'
  },
  metricDescription: {
    marginTop: spacing.sm,
    color: palette.textSecondary
  },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: palette.background
  },
  insightTitle: {
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.accent,
    marginRight: spacing.sm
  },
  insightText: {
    flex: 1,
    color: palette.textPrimary,
    lineHeight: 20
  }
});

export default HabitAnalyticsScreen;
