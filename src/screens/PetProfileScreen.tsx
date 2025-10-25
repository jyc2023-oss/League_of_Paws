import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {
  PetHealthProfile,
  mockPetHealthProfile,
  VaccineRecord,
  MedicalCheckup,
  AllergyRecord,
  ExerciseRecord
} from '@app/types';
import {fetchPetHealthProfile} from '@app/services/api/petHealthApi';
import type {RootStackParamList} from '@app/navigation/types';
import {usePetStore} from '@app/store/zustand/petStore';

type PetProfileRoute = RouteProp<RootStackParamList, 'PetProfile'>;

const Section = ({title, children}: {title: string; children: React.ReactNode}): JSX.Element => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const PetProfileScreen = (): JSX.Element => {
  const route = useRoute<PetProfileRoute>();
  const activePetId = usePetStore(state => state.activePetId);
  const petId = route.params?.petId ?? activePetId ?? mockPetHealthProfile.id;

  const [profile, setProfile] = useState<PetHealthProfile | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchPetHealthProfile(petId)
      .then(data => {
        if (isMounted) {
          setProfile(data);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile(mockPetHealthProfile);
          setError('暂时无法获取最新档案，已展示缓存数据。');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [petId]);

  const summary = useMemo(() => {
    if (!profile) {
      return null;
    }
    const nextVaccine = profile.vaccines[0];
    return {
      name: profile.name,
      breed: profile.breed,
      age: profile.age,
      weight: profile.weightKg,
      nextVaccine: nextVaccine?.name,
      schedule: profile.feedingPlan.schedule.join(' / ')
    };
  }, [profile]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.hint}>正在加载宠物档案...</Text>
        </View>
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text style={styles.error}>没有找到宠物档案</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>健康档案</Text>
        {error && <Text style={styles.warning}>{error}</Text>}

        {summary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryName}>{summary.name}</Text>
            <Text style={styles.summaryMeta}>
              {summary.breed} ｜ {summary.age} 岁 ｜ {summary.weight.toFixed(1)} kg
            </Text>
            <Text style={styles.summaryMeta}>喂食时间：{summary.schedule}</Text>
            {summary.nextVaccine && (
              <Text style={styles.summaryMeta}>下一次疫苗：{summary.nextVaccine}</Text>
            )}
          </View>
        )}

        <Section title="疫苗记录">
          {profile.vaccines.map((record: VaccineRecord) => (
            <View key={record.id} style={styles.card}>
              <Text style={styles.cardTitle}>{record.name}</Text>
              <Text style={styles.cardMeta}>
                {record.date} ｜ {record.clinic}
              </Text>
              <Text style={styles.cardMeta}>主治医生：{record.vet}</Text>
              {record.notes && <Text style={styles.cardNotes}>{record.notes}</Text>}
            </View>
          ))}
        </Section>

        <Section title="体检报告">
          {profile.checkups.map((checkup: MedicalCheckup) => (
            <View key={checkup.id} style={styles.card}>
              <Text style={styles.cardTitle}>{checkup.date}</Text>
              <Text style={styles.cardMeta}>
                {checkup.clinic} ｜ {checkup.vet}
              </Text>
              <Text style={styles.cardMeta}>体重：{checkup.weightKg.toFixed(1)} kg</Text>
              <Text style={styles.cardNotes}>{checkup.summary}</Text>
            </View>
          ))}
        </Section>

        <Section title="过敏史">
          {profile.allergies.map((allergy: AllergyRecord) => (
            <View key={allergy.id} style={styles.card}>
              <Text style={styles.cardTitle}>{allergy.allergen}</Text>
              <Text style={styles.cardMeta}>反应：{allergy.reaction}</Text>
              <Text style={styles.cardMeta}>严重程度：{translateSeverity(allergy.severity)}</Text>
              {allergy.notes && <Text style={styles.cardNotes}>{allergy.notes}</Text>}
            </View>
          ))}
        </Section>

        <Section title="喂食计划">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{profile.feedingPlan.food}</Text>
            <Text style={styles.cardMeta}>
              每餐 {profile.feedingPlan.caloriesPerMeal} kcal ｜{' '}
              {profile.feedingPlan.schedule.join('、')}
            </Text>
            {profile.feedingPlan.notes && (
              <Text style={styles.cardNotes}>{profile.feedingPlan.notes}</Text>
            )}
          </View>
        </Section>

        <Section title="运动记录">
          {profile.exerciseRecords.map((exercise: ExerciseRecord) => (
            <View key={exercise.id} style={styles.card}>
              <Text style={styles.cardTitle}>
                {exercise.activity} ｜ {exercise.durationMinutes} min
              </Text>
              <Text style={styles.cardMeta}>
                {exercise.date} ｜ 强度：{translateIntensity(exercise.intensity)}
              </Text>
            </View>
          ))}
        </Section>
      </ScrollView>
    </Screen>
  );
};

const translateSeverity = (level: AllergyRecord['severity']): string => {
  switch (level) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    default:
      return '低';
  }
};

const translateIntensity = (level: ExerciseRecord['intensity']): string => {
  switch (level) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    default:
      return '低';
  }
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  hint: {
    marginTop: spacing.sm,
    color: palette.textSecondary
  },
  error: {
    color: palette.primary,
    fontSize: typography.body
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
  summaryCard: {
    backgroundColor: palette.background,
    padding: spacing.md,
    borderRadius: 16,
    borderColor: palette.border,
    borderWidth: 1,
    marginBottom: spacing.lg
  },
  summaryName: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.textPrimary
  },
  summaryMeta: {
    marginTop: 4,
    color: palette.textSecondary
  },
  section: {
    marginBottom: spacing.lg
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary
  },
  cardMeta: {
    marginTop: 4,
    color: palette.textSecondary
  },
  cardNotes: {
    marginTop: spacing.xs,
    color: palette.textPrimary,
    lineHeight: 20
  }
});

export default PetProfileScreen;
