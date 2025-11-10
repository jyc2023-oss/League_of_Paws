import React, {useMemo, useState} from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Screen from '@app/components/common/Screen';
import {palette, spacing, typography} from '@app/theme';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {
  submitRescueCase,
  updateRescueStatus,
  RescueCase
} from '@app/store/redux/slices/contentSlice';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@app/navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const RescueSubmissionScreen = (): JSX.Element => {
  const navigation = useNavigation<Navigation>();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const rescueCases = useAppSelector(state => state.community.rescueCases);

  const activeUser = useMemo(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    if (!activeUserId) {
      Alert.alert('提示', '请先登录账号。');
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim()) {
      Alert.alert('提示', '请完整填写救助信息。');
      return;
    }

    dispatch(
      submitRescueCase({
        userId: activeUserId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim()
      })
    );

    setTitle('');
    setDescription('');
    setLocation('');
    Alert.alert('发布成功', '救助信息已提交到社区。');
  };

  const handleStatusUpdate = (rescue: RescueCase, status: RescueCase['status']) => {
    dispatch(updateRescueStatus({caseId: rescue.id, status}));
  };

  return (
    <Screen padded={true}>
      <View style={styles.container}>
        <Text style={styles.title}>发布救助信息</Text>
        <Text style={styles.subtitle}>
          上传流浪动物或紧急救助情况，方便志愿者及时响应。
        </Text>

        <Text style={styles.label}>标题</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="例如：城南公园发现受伤流浪狗"
          placeholderTextColor={palette.textSecondary}
        />

        <Text style={styles.label}>详细描述</Text>
        <TextInput
          style={styles.textarea}
          value={description}
          onChangeText={setDescription}
          placeholder="说明动物状态、所需帮助、联系方式等"
          placeholderTextColor={palette.textSecondary}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>发现位置</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="精确到街道或地标"
          placeholderTextColor={palette.textSecondary}
        />

        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>发布救助信息</Text>
        </Pressable>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>最新救助动态</Text>
          <Text style={styles.listSubtitle}>
            资深用户可协助更新处理状态
          </Text>
        </View>

        {rescueCases.map(rescue => (
          <Pressable
            key={rescue.id}
            style={styles.rescueCard}
            onPress={() =>
              navigation.navigate('RescueDetails', {rescueId: rescue.id})
            }>
            <Text style={styles.rescueTitle}>{rescue.title}</Text>
            <Text style={styles.rescueMeta}>
              发布日期：{new Date(rescue.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.rescueMeta}>状态：{translateStatus(rescue.status)}</Text>
            <Text style={styles.rescueMeta}>位置：{rescue.location}</Text>
            <Text style={styles.rescueDescription}>{rescue.description}</Text>

            {activeUser?.role === 'senior' && (
              <View style={styles.statusRow}>
                <Pressable
                  style={styles.statusButton}
                  onPress={() => handleStatusUpdate(rescue, 'in_progress')}>
                  <Text style={styles.statusText}>标记处理中</Text>
                </Pressable>
                <Pressable
                  style={[styles.statusButton, styles.statusButtonSuccess]}
                  onPress={() => handleStatusUpdate(rescue, 'resolved')}>
                  <Text style={styles.statusText}>标记已解决</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </Screen>
  );
};

const translateStatus = (status: RescueCase['status']): string => {
  switch (status) {
    case 'open':
      return '待响应';
    case 'in_progress':
      return '处理中';
    case 'resolved':
      return '已解决';
    default:
      return status;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.lg
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: palette.textPrimary
  },
  subtitle: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg
  },
  label: {
    fontSize: typography.caption,
    color: palette.textSecondary,
    marginBottom: spacing.xs
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  textarea: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.body,
    color: palette.textPrimary,
    marginBottom: spacing.md,
    minHeight: 140
  },
  submitButton: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  submitText: {
    color: '#fff',
    fontWeight: '600'
  },
  listHeader: {
    marginBottom: spacing.sm
  },
  listTitle: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary
  },
  listSubtitle: {
    fontSize: typography.caption,
    color: palette.textSecondary
  },
  rescueCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#fff'
  },
  rescueTitle: {
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs
  },
  rescueDescription: {
    color: palette.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20
  },
  rescueMeta: {
    fontSize: typography.caption,
    color: palette.textSecondary,
    marginTop: spacing.xs
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.sm
  },
  statusButton: {
    backgroundColor: palette.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginLeft: spacing.sm
  },
  statusButtonSuccess: {
    backgroundColor: palette.primary
  },
  statusText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default RescueSubmissionScreen;
