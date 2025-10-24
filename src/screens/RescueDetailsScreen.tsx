import React, {useMemo} from 'react';
import {RouteProp, useRoute} from '@react-navigation/native';
import {StyleSheet, Text, View} from 'react-native';
import Screen from '@app/components/common/Screen';
import type {RootStackParamList} from '@app/navigation/types';
import {palette, spacing, typography} from '@app/theme';
import {useAppSelector} from '@app/store/redux/hooks';

type RescueDetailsRoute = RouteProp<RootStackParamList, 'RescueDetails'>;

const RescueDetailsScreen = (): JSX.Element => {
  const route = useRoute<RescueDetailsRoute>();
  const rescueCases = useAppSelector(state => state.community.rescueCases);
  const rescue = useMemo(
    () =>
      rescueCases.find(item => item.id === route.params?.rescueId) ?? null,
    [rescueCases, route.params?.rescueId]
  );

  return (
    <Screen padded={true}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {rescue?.title ?? '救助信息详情'}
        </Text>
        <Text style={styles.meta}>
          状态：
          {rescue
            ? translateStatus(rescue.status)
            : '未找到对应救助记录'}
        </Text>
        {rescue ? (
          <>
            <Text style={styles.meta}>
              发布时间：{new Date(rescue.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.meta}>位置：{rescue.location}</Text>
            <Text style={styles.body}>{rescue.description}</Text>
          </>
        ) : (
          <Text style={styles.body}>
            可能是链接失效或记录已被删除，请返回社区重新选择。
          </Text>
        )}
      </View>
    </Screen>
  );
};

const translateStatus = (status: string): string => {
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
  meta: {
    color: palette.textSecondary,
    marginTop: spacing.xs
  },
  body: {
    fontSize: typography.body,
    color: palette.textSecondary,
    marginTop: spacing.md,
    lineHeight: 20
  }
});

export default RescueDetailsScreen;
