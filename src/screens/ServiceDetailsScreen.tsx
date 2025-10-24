import React, {useMemo} from 'react';
import {RouteProp, useRoute} from '@react-navigation/native';
import {StyleSheet, Text, View} from 'react-native';
import Screen from '@app/components/common/Screen';
import type {RootStackParamList} from '@app/navigation/types';
import {palette, spacing, typography} from '@app/theme';
import {useAppSelector} from '@app/store/redux/hooks';

type ServiceDetailsRoute = RouteProp<RootStackParamList, 'ServiceDetails'>;

const ServiceDetailsScreen = (): JSX.Element => {
  const route = useRoute<ServiceDetailsRoute>();
  const services = useAppSelector(state => state.community.services);
  const record = useMemo(
    () => services.find(item => item.id === route.params?.serviceId) ?? null,
    [services, route.params?.serviceId]
  );

  return (
    <Screen padded={true}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {record?.serviceName ?? '本地服务详情'}
        </Text>
        <Text style={styles.meta}>
          状态：{record ? translateStatus(record.status) : '暂无数据'}
        </Text>
        {record?.visitedAt && (
          <Text style={styles.meta}>
            完成时间：{new Date(record.visitedAt).toLocaleString()}
          </Text>
        )}
        <Text style={styles.body}>
          {record
            ? '来自服务清单的记录，可在社区服务页面继续更新状态。'
            : '请从社区服务列表中选择项目后再进入查看详情。'}
        </Text>
      </View>
    </Screen>
  );
};

const translateStatus = (status: string): string => {
  switch (status) {
    case 'planned':
      return '待完成';
    case 'completed':
      return '已完成';
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

export default ServiceDetailsScreen;
