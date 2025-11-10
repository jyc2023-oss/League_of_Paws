import React, {useMemo} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Screen from '@app/components/common/Screen';
import {usePetStore} from '@app/store/zustand/petStore';
import {useAppSelector} from '@app/store/redux/hooks';
import {spacing, typography, palette} from '@app/theme';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@app/navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = (): JSX.Element => {
  const navigation = useNavigation<Navigation>();
  const pets = usePetStore(state => state.pets);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const habits = useAppSelector(state => state.community.habits);

  const todaySummary = useMemo(() => {
    const today = new Date().toDateString();
    const record = habits.find(
      item =>
        item.userId === activeUserId &&
        new Date(item.date).toDateString() === today
    );
    if (!record) {
      return '今日还未打卡，点击下方按钮开始记录。';
    }
    return `今日已完成 ${record.completedTasks.length} 项任务，继续保持！`;
  }, [habits, activeUserId]);

  return (
    <Screen padded={true}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>今日概览</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>活跃宠物</Text>
          {pets.map(pet => (
            <View key={pet.id} style={styles.petRow}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petMeta}>
                {pet.species === 'dog'
                  ? '犬类'
                  : pet.species === 'cat'
                  ? '猫类'
                  : '其他'}{' '}
                · {`约 ${Math.floor((pet.ageInMonths ?? 0) / 12)} 岁`}
              </Text>
            </View>
          ))}
          {pets.length === 0 && (
            <Text style={styles.emptyText}>
              添加宠物后，将在此展示健康概览。
            </Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>习惯打卡</Text>
          <Text style={styles.summaryText}>{todaySummary}</Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('HabitCheckIn')}>
            <Text style={styles.primaryButtonText}>立即打卡</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>社区动态</Text>
          <Text style={styles.summaryText}>
            发布宠物动态或救助信息，积累点赞与资深荣誉。
          </Text>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.secondaryButton, styles.actionButton]}
              onPress={() => navigation.navigate('CreatePost')}>
              <Text style={styles.secondaryButtonText}>发布动态</Text>
            </Pressable>
            <Pressable
              style={[
                styles.secondaryButton,
                styles.actionButton,
                styles.actionButtonLast
              ]}
              onPress={() => navigation.navigate('RescueSubmission')}>
              <Text style={styles.secondaryButtonText}>救助信息</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.lg
  },
  title: {
    fontSize: typography.title,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  card: {
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
    marginBottom: spacing.lg
  },
  cardTitle: {
    fontSize: typography.heading,
    fontWeight: '500',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  petRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs
  },
  petName: {
    fontSize: typography.body,
    color: palette.textPrimary,
    fontWeight: '500'
  },
  petMeta: {
    fontSize: typography.caption,
    color: palette.textSecondary
  },
  emptyText: {
    fontSize: typography.body,
    color: palette.textSecondary,
    marginTop: spacing.sm
  },
  summaryText: {
    fontSize: typography.body,
    color: palette.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 20
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    marginRight: spacing.sm
  },
  actionButtonLast: {
    marginRight: 0
  },
  secondaryButtonText: {
    color: palette.primary,
    fontWeight: '600'
  }
});

export default HomeScreen;
