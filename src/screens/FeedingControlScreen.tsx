import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {
  FeedingReminder,
  PetHealthProfile,
  mockPetHealthProfile,
  mockFeedingReminders
} from '@app/types';
import {
  createFeedingReminder,
  fetchFeedingReminders,
  fetchPetHealthProfile,
  updateFeedingReminder
} from '@app/services/api/petHealthApi';
import type {RootStackParamList} from '@app/navigation/types';
import {usePetStore} from '@app/store/zustand/petStore';

type FeedingRoute = RouteProp<RootStackParamList, 'FeedingControl'>;

const FeedingControlScreen = (): JSX.Element => {
  const route = useRoute<FeedingRoute>();
  const activePetId = usePetStore(state => state.activePetId);
  const petId = route.params?.petId ?? activePetId ?? mockPetHealthProfile.id;

  const [profile, setProfile] = useState<PetHealthProfile>(mockPetHealthProfile);
  const [reminders, setReminders] = useState<FeedingReminder[]>(mockFeedingReminders);
  const [label, setLabel] = useState('喂食提醒');
  const [time, setTime] = useState('07:30');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([fetchPetHealthProfile(petId), fetchFeedingReminders(petId)])
      .then(([profileData, reminderData]) => {
        if (mounted) {
          setProfile(profileData);
          setReminders(reminderData);
        }
      })
      .catch(() => {
        if (mounted) {
          setProfile(mockPetHealthProfile);
          setReminders(mockFeedingReminders);
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

  const handleCreateReminder = async (): Promise<void> => {
    try {
      const created = await createFeedingReminder(petId, {label, time, enabled});
      setReminders(prev => [...prev, created]);
      const nextDate = computeNextReminderTime(time);
      Alert.alert(
        '提醒已设定',
        `下一次将在 ${nextDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} 提醒`
      );
    } catch (error) {
      console.warn('[FeedingControl] 设置提醒失败', error);
      Alert.alert('温馨提示', '暂时无法设置提醒，请稍后再试');
    }
  };
  const handleToggleReminder = async (reminder: FeedingReminder, value: boolean): Promise<void> => {
    setReminders(prev =>
      prev.map(item => (item.id === reminder.id ? {...item, enabled: value} : item))
    );
    try {
      await updateFeedingReminder(petId, reminder.id, {enabled: value});
    } catch (error) {
      console.warn('[FeedingControl] 更新提醒失败', error);
    }
  };

  const renderReminder = ({item}: {item: FeedingReminder}): JSX.Element => (
    <View style={styles.reminderItem}>
      <View>
        <Text style={styles.reminderLabel}>{item.label}</Text>
        <Text style={styles.reminderTime}>{item.time}</Text>
      </View>
      <Switch
        trackColor={{false: palette.border, true: palette.secondary}}
        thumbColor="#fff"
        value={item.enabled}
        onValueChange={value => handleToggleReminder(item, value)}
      />
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
          <Text style={styles.loading}>正在同步喂食计划...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>远程喂食控制</Text>
        <Text style={styles.subtitle}>
          当前宠物：{profile.name} ｜ 日均喂食 {profile.feedingPlan.caloriesPerMeal} kcal
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>设置喂食提醒</Text>
          <TextInput
            style={styles.input}
            placeholder="提醒名称"
            value={label}
            onChangeText={setLabel}
          />
          <TextInput
            style={styles.input}
            placeholder="时间（24h，例如 07:30）"
            value={time}
            onChangeText={setTime}
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>启用提醒</Text>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{false: palette.border, true: palette.primary}}
            />
          </View>
          <Pressable style={styles.primaryButton} onPress={handleCreateReminder}>
            <Text style={styles.primaryButtonText}>保存并推送提醒</Text>
          </Pressable>
        </View>

        <Text style={styles.listTitle}>提醒列表</Text>
        <FlatList
          data={reminders}
          keyExtractor={item => item.id}
          renderItem={renderReminder}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.empty}>暂未设置提醒，可通过上方表单添加。</Text>
          }
        />
      </View>
    </Screen>
  );
};

const computeNextReminderTime = (time: string): Date => {
  const [hour, minute] = time.split(':').map(part => parseInt(part, 10));
  const now = new Date();
  const triggerDate = new Date(now);
  triggerDate.setHours(hour ?? 0, minute ?? 0, 0, 0);
  if (triggerDate <= now) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }
  return triggerDate;
};

const styles = StyleSheet.create({
  container: {
    flex: 1
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
  title: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs
  },
  subtitle: {
    color: palette.textSecondary,
    marginBottom: spacing.lg
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: palette.background
  },
  formTitle: {
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: palette.textPrimary
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    backgroundColor: '#fff'
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  switchLabel: {
    color: palette.textPrimary,
    fontWeight: '500'
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  listTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  listContainer: {
    paddingBottom: spacing.lg
  },
  reminderItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  reminderLabel: {
    fontWeight: '600',
    color: palette.textPrimary
  },
  reminderTime: {
    color: palette.textSecondary,
    marginTop: 2
  },
  separator: {
    height: spacing.sm
  },
  empty: {
    textAlign: 'center',
    color: palette.textSecondary,
    marginTop: spacing.lg
  }
});

export default FeedingControlScreen;
