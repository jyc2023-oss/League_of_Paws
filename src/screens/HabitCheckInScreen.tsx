import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {recordHabitCheckIn} from '@app/store/redux/slices/contentSlice';
import {usePetStore} from '@app/store/zustand/petStore';
import {
  fetchHabitEntries,
  recordHabitEntry as recordHabitEntryApi
} from '@app/services/api/petHealthApi';
import type {HabitEntry} from '@app/types';

const HABIT_OPTIONS = [
  {id: 'feeding', label: '按时喂食', requiresFeeding: true},
  {id: 'walking', label: '宠物运动', requiresExercise: true},
  {id: 'weight', label: '称重记录', requiresWeight: true},
  {id: 'training', label: '完成训练项目'},
  {id: 'grooming', label: '梳理毛发'},
  {id: 'health', label: '健康观察记录'}
] as const;

const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildRecentDateOptions = (days = 7) => {
  const today = new Date();
  const list = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const value = formatDate(date);
    const label =
      i === 0 ? `今天 ${value.slice(5)}` : `${date.getMonth() + 1}-${date.getDate()}`;
    list.push({label, value});
  }
  return list;
};

const HabitCheckInScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const token = useAppSelector(state => state.auth.token);
  const activeUser = useMemo(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const pets = usePetStore(state => state.pets);
  const activePetId = usePetStore(state => state.activePetId);
  const petId = activePetId ?? pets[0]?.id;
  const petName =
    pets.find(pet => pet.id === petId)?.name ?? (pets.length > 0 ? pets[0].name : '宠物');

  const dateOptions = useMemo(() => buildRecentDateOptions(), []);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]?.value ?? formatDate(new Date()));
  useEffect(() => {
    if (dateOptions.length > 0) {
      setSelectedDate(dateOptions[0].value);
    }
  }, [dateOptions]);

  const [selected, setSelected] = useState<string[]>([]);
  const [feedingAmount, setFeedingAmount] = useState('');
  const [exerciseMinutes, setExerciseMinutes] = useState('');
  const [weightValue, setWeightValue] = useState('');
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<HabitEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const habitLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    HABIT_OPTIONS.forEach(option => {
      map[option.id] = option.label;
    });
    return map;
  }, []);

  const toggleHabit = (id: string) => {
    setSelected(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    );
  };

  const loadHistory = useCallback(() => {
    if (!petId || !token) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    fetchHabitEntries(petId, token, 7)
      .then(data => {
        setHistory(data);
        setHistoryError(null);
      })
      .catch(() => {
        setHistory([]);
        setHistoryError('暂时无法获取打卡记录，请稍后重试。');
      })
      .finally(() => {
        setHistoryLoading(false);
      });
  }, [petId, token]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const requiresFeeding = selected.includes('feeding');
  const requiresExercise = selected.includes('walking');
  const requiresWeight = selected.includes('weight');

  const validateInputs = () => {
    if (!activeUser || !token) {
      Alert.alert('提示', '请先登录账号。');
      return false;
    }
    if (!petId) {
      Alert.alert('提示', '请先在宠物中心创建或选择宠物。');
      return false;
    }
    if (selected.length === 0) {
      Alert.alert('提示', '至少选择一项已完成的任务。');
      return false;
    }
    if (requiresFeeding && (!feedingAmount || Number.isNaN(Number(feedingAmount)))) {
      Alert.alert('提示', '请输入今日喂食量（克）。');
      return false;
    }
    if (requiresExercise && (!exerciseMinutes || Number.isNaN(Number(exerciseMinutes)))) {
      Alert.alert('提示', '请输入运动时长（分钟）。');
      return false;
    }
    if (requiresWeight && (!weightValue || Number.isNaN(Number(weightValue)))) {
      Alert.alert('提示', '请输入今日体重（公斤）。');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setSelected([]);
    setFeedingAmount('');
    setExerciseMinutes('');
    setWeightValue('');
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!validateInputs() || !petId || !token || !activeUser) {
      return;
    }
    const payload = {
      date: selectedDate,
      completedTasks: selected,
      feedingGrams: requiresFeeding ? Number(feedingAmount) : undefined,
      exerciseMinutes: requiresExercise ? Number(exerciseMinutes) : undefined,
      weightKg: requiresWeight ? Number(weightValue) : undefined,
      notes: notes.trim() || undefined
    };
    try {
      setSubmitting(true);
      await recordHabitEntryApi(petId, token, payload);
      dispatch(
        recordHabitCheckIn({
          userId: activeUser.id,
          completedTasks: selected,
          note: `完成 ${selected.length} 项任务`
        })
      );
      resetForm();
      loadHistory();
      Alert.alert('打卡成功', `${petName} 的健康数据已更新，可在趋势报告查看变化。`);
    } catch (error) {
      Alert.alert('错误', '记录打卡失败，请稍后再试。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen padded={true}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>每日习惯打卡</Text>
        <Text style={styles.subtitle}>
          为 {petName} 记录喂食、运动、体重等数据，健康趋势报告会在提交后实时更新。
        </Text>
        {!petId && (
          <Text style={styles.warning}>
            暂无可用宠物，请先在“宠物管理”中创建宠物档案。
          </Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择日期（近 7 天）</Text>
          <View style={styles.chipRow}>
            {dateOptions.map(option => {
              const active = selectedDate === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSelectedDate(option.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>完成的任务</Text>
          <View style={styles.habitGrid}>
            {HABIT_OPTIONS.map(option => {
              const isActive = selected.includes(option.id);
              return (
                <Pressable
                  key={option.id}
                  onPress={() => toggleHabit(option.id)}
                  style={[styles.habitCard, isActive && styles.habitCardActive]}
                >
                  <Text style={[styles.habitText, isActive && styles.habitTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {requiresFeeding && (
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>今日喂食量（克）</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="例如 320"
              value={feedingAmount}
              onChangeText={setFeedingAmount}
            />
          </View>
        )}

        {requiresExercise && (
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>运动时长（分钟）</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="例如 30"
              value={exerciseMinutes}
              onChangeText={setExerciseMinutes}
            />
          </View>
        )}

        {requiresWeight && (
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>今日体重（kg）</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="例如 11.3"
              value={weightValue}
              onChangeText={setWeightValue}
            />
          </View>
        )}

        <View style={styles.inputBlock}>
          <Text style={styles.inputLabel}>健康备注（可选）</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            textAlignVertical="top"
            placeholder="补充健康观察、护理提示等内容"
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <Pressable
          style={[styles.submitButton, (!petId || submitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!petId || submitting}
        >
          <Text style={styles.submitText}>{submitting ? '提交中…' : '记录今日打卡'}</Text>
        </Pressable>

        <View style={styles.history}>
          <Text style={styles.historyTitle}>最近打卡</Text>
          {historyLoading && (
            <View style={styles.historyLoading}>
              <ActivityIndicator color={palette.primary} />
              <Text style={[styles.historyHint, styles.historyLoadingText]}>
                正在同步记录...
              </Text>
            </View>
          )}
          {!historyLoading && historyError && <Text style={styles.warning}>{historyError}</Text>}
          {!historyLoading && history.length === 0 && !historyError && (
            <Text style={styles.historyHint}>最近还没有数据，快去打卡吧。</Text>
          )}
          {!historyLoading &&
            history.map(entry => (
              <View key={entry.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDate}>{entry.date}</Text>
                  <Text style={styles.historySummary}>
                    完成 {entry.completedTasks.length} 项任务
                  </Text>
                </View>
                <View style={styles.metricsRow}>
                  <Text style={styles.historyMetric}>
                    喂食：{entry.feedingGrams ?? '--'} g
                  </Text>
                  <Text style={styles.historyMetric}>
                    运动：{entry.exerciseMinutes ?? '--'} min
                  </Text>
                  <Text style={styles.historyMetric}>
                    体重：{entry.weightKg ?? '--'} kg
                  </Text>
                </View>
                {entry.completedTasks.length > 0 && (
                  <View style={styles.taskTagRow}>
                    {entry.completedTasks.map(task => (
                      <View key={`${entry.id}-${task}`} style={styles.taskTag}>
                        <Text style={styles.taskTagText}>
                          {habitLabelMap[task] ?? task}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                {entry.notes ? <Text style={styles.historyNotes}>备注：{entry.notes}</Text> : null}
              </View>
            ))}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.textPrimary
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 20
  },
  warning: {
    color: palette.accent,
    marginBottom: spacing.md
  },
  section: {
    marginBottom: spacing.lg
  },
  sectionTitle: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs
  },
  chip: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.xs
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  chipText: {
    color: palette.textSecondary,
    fontWeight: '500'
  },
  chipTextActive: {
    color: '#fff'
  },
  habitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm
  },
  habitCard: {
    width: '48%',
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  habitCardActive: {
    backgroundColor: palette.secondary,
    borderColor: palette.secondary
  },
  habitText: {
    color: palette.textSecondary,
    fontWeight: '500'
  },
  habitTextActive: {
    color: '#fff'
  },
  inputBlock: {
    marginBottom: spacing.md
  },
  inputLabel: {
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: palette.textPrimary
  },
  textArea: {
    minHeight: 90
  },
  submitButton: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm
  },
  submitButtonDisabled: {
    opacity: 0.5
  },
  submitText: {
    color: '#fff',
    fontWeight: '600'
  },
  history: {
    marginTop: spacing.xl
  },
  historyTitle: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  historyLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  historyLoadingText: {
    marginLeft: spacing.sm
  },
  historyHint: {
    color: palette.textSecondary
  },
  historyCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#fff'
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs
  },
  historyDate: {
    color: palette.textPrimary,
    fontWeight: '600'
  },
  historySummary: {
    color: palette.textSecondary
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs
  },
  historyMetric: {
    color: palette.textSecondary,
    fontSize: typography.caption
  },
  taskTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    marginHorizontal: -spacing.xs
  },
  taskTag: {
    backgroundColor: palette.background,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.xs
  },
  taskTagText: {
    color: palette.textSecondary,
    fontSize: typography.caption
  },
  historyNotes: {
    marginTop: spacing.xs,
    color: palette.textPrimary
  }
});

export default HabitCheckInScreen;
