import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {LineChart} from 'react-native-chart-kit';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {HealthTrendReport, mockHealthTrendReport} from '@app/types';
import {fetchHealthTrendReport} from '@app/services/api/petHealthApi';
import type {RootStackParamList} from '@app/navigation/types';
import {usePetStore} from '@app/store/zustand/petStore';

const chartWidth = Dimensions.get('window').width - spacing.lg * 2;

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: '#ffffff',
  backgroundGradientToOpacity: 0,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(255, 138, 101, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(82, 96, 109, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: palette.secondary
  }
};

type HealthRoute = RouteProp<RootStackParamList, 'HealthReport'>;

const HealthReportScreen = (): JSX.Element => {
  const route = useRoute<HealthRoute>();
  const activePetId = usePetStore(state => state.activePetId);
  const petId = route.params?.petId ?? activePetId ?? mockHealthTrendReport.petId;

  const [report, setReport] = useState<HealthTrendReport | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchHealthTrendReport(petId)
      .then(data => {
        if (mounted) {
          setReport(data);
          setError(null);
        }
      })
      .catch(() => {
        if (mounted) {
          setReport(mockHealthTrendReport);
          setError('使用本地趋势数据，稍后再试。');
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

  const labels = useMemo(() => report?.points.map(point => point.date.slice(5)) ?? [], [report]);
  const feedingData = useMemo(
    () => report?.points.map(point => point.feedingGrams) ?? [],
    [report]
  );
  const exerciseData = useMemo(
    () => report?.points.map(point => point.exerciseMinutes) ?? [],
    [report]
  );
  const weightData = useMemo(() => report?.points.map(point => point.weightKg) ?? [], [report]);

  const summary = useMemo(() => {
    if (!report) {
      return null;
    }
    const latest = report.points[report.points.length - 1];
    const avgWeight =
      report.points.reduce((total, point) => total + point.weightKg, 0) / report.points.length;
    return {
      latestWeight: latest.weightKg.toFixed(1),
      avgWeight: avgWeight.toFixed(1),
      avgExercise: Math.round(
        report.points.reduce((total, point) => total + point.exerciseMinutes, 0) /
          report.points.length
      ),
      avgFeeding: Math.round(
        report.points.reduce((total, point) => total + point.feedingGrams, 0) /
          report.points.length
      )
    };
  }, [report]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loading}>正在生成报告...</Text>
        </View>
      </Screen>
    );
  }

  if (!report) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.error}>暂无健康趋势数据</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>健康趋势报告</Text>
        {error && <Text style={styles.warning}>{error}</Text>}

        {summary && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>最新体重</Text>
              <Text style={styles.summaryValue}>{summary.latestWeight}kg</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>平均体重</Text>
              <Text style={styles.summaryValue}>{summary.avgWeight}kg</Text>
            </View>
          </View>
        )}

        {summary && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>日均喂食</Text>
              <Text style={styles.summaryValue}>{summary.avgFeeding}g</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>日均运动</Text>
              <Text style={styles.summaryValue}>{summary.avgExercise}min</Text>
            </View>
          </View>
        )}

        <ChartBlock
          title="每日喂食趋势（g）"
          data={{
            labels,
            datasets: [{data: feedingData, color: () => palette.primary, strokeWidth: 2}]
          }}
        />

        <ChartBlock
          title="每日运动时长（min）"
          data={{
            labels,
            datasets: [{data: exerciseData, color: () => palette.secondary, strokeWidth: 2}]
          }}
        />

        <ChartBlock
          title="体重变化（kg）"
          data={{
            labels,
            datasets: [{data: weightData, color: () => palette.accent, strokeWidth: 2}]
          }}
          decimalPlaces={2}
        />
      </ScrollView>
    </Screen>
  );
};

type ChartBlockProps = {
  title: string;
  data: {
    labels: string[];
    datasets: {
      data: number[];
      color?: (opacity?: number) => string;
      strokeWidth?: number;
    }[];
  };
  decimalPlaces?: number;
};

const ChartBlock = ({title, data, decimalPlaces}: ChartBlockProps): JSX.Element => (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>{title}</Text>
    <LineChart
      width={chartWidth}
      height={220}
      data={data}
      chartConfig={{...chartConfig, decimalPlaces: decimalPlaces ?? chartConfig.decimalPlaces}}
      bezier
      style={styles.chart}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
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
    marginBottom: spacing.lg
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  summaryCard: {
    flex: 1,
    backgroundColor: palette.background,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    marginHorizontal: spacing.xs
  },
  summaryLabel: {
    color: palette.textSecondary,
    fontSize: typography.caption
  },
  summaryValue: {
    marginTop: spacing.xs,
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border
  },
  chartTitle: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: '600',
    color: palette.textPrimary
  },
  chart: {
    marginRight: spacing.sm
  }
});

export default HealthReportScreen;
