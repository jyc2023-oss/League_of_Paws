import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View, Alert, FlatList} from 'react-native';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {recordHabitCheckIn} from '@app/store/redux/slices/contentSlice';

const HABIT_OPTIONS = [
  {id: 'feeding', label: '按时喂食'},
  {id: 'walking', label: '带宠物散步'},
  {id: 'training', label: '完成训练项目'},
  {id: 'grooming', label: '梳理毛发'},
  {id: 'health', label: '健康观察记录'}
] as const;

const HabitCheckInScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const habits = useAppSelector(state => state.community.habits);

  const activeUser = useMemo(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const [selected, setSelected] = useState<string[]>([]);

  const toggleHabit = (id: string) => {
    setSelected(current =>
      current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id]
    );
  };

  const handleSubmit = () => {
    if (!activeUser) {
      Alert.alert('提示', '请先登录账号。');
      return;
    }

    if (selected.length === 0) {
      Alert.alert('提示', '至少选择一项已完成的任务。');
      return;
    }

    dispatch(
      recordHabitCheckIn({
        userId: activeUser.id,
        completedTasks: selected,
        note: `今日完成 ${selected.length} 项任务`
      })
    );
    setSelected([]);
    Alert.alert('打卡成功', '已记录今日习惯打卡。');
  };

  const renderItem = ({item}: {item: (typeof HABIT_OPTIONS)[number]}) => {
    const isActive = selected.includes(item.id);
    return (
      <Pressable
        onPress={() => toggleHabit(item.id)}
        style={[styles.habitCard, isActive && styles.habitCardActive]}>
        <Text style={[styles.habitText, isActive && styles.habitTextActive]}>
          {item.label}
        </Text>
      </Pressable>
    );
  };

  const latestHabits = habits
    .filter(record => record.userId === activeUserId)
    .slice(0, 5);

  return (
    <Screen padded={true}>
      <View style={styles.container}>
        <Text style={styles.title}>每日习惯打卡</Text>
        <Text style={styles.subtitle}>
          选择今天已完成的任务，系统会生成陪伴度与坚持度分析。
        </Text>

        <FlatList
          data={HABIT_OPTIONS}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.habitRow}
          renderItem={renderItem}
          scrollEnabled={false}
        />

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>记录今日打卡</Text>
        </Pressable>

        {latestHabits.length > 0 && (
          <View style={styles.history}>
            <Text style={styles.historyTitle}>最近打卡</Text>
            {latestHabits.map(record => (
              <View key={record.id} style={styles.historyRow}>
                <Text style={styles.historyDate}>
                  {new Date(record.date).toLocaleDateString()}
                </Text>
                <Text style={styles.historySummary}>
                  完成 {record.completedTasks.length} 项任务
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.textPrimary
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 20
  },
  habitRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  habitCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginRight: spacing.md
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
  submitButton: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md
  },
  submitText: {
    color: '#fff',
    fontWeight: '600'
  },
  history: {
    marginTop: spacing.lg
  },
  historyTitle: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderColor: palette.border
  },
  historyDate: {
    color: palette.textPrimary
  },
  historySummary: {
    color: palette.textSecondary
  }
});

export default HabitCheckInScreen;
