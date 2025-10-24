import React from 'react';
import {RouteProp, useRoute} from '@react-navigation/native';
import {StyleSheet, Text, View} from 'react-native';
import Screen from '@app/components/common/Screen';
import type {RootStackParamList} from '@app/navigation/types';
import {palette, spacing, typography} from '@app/theme';

type ServiceDetailsRoute = RouteProp<RootStackParamList, 'ServiceDetails'>;

const ServiceDetailsScreen = (): JSX.Element => {
  const route = useRoute<ServiceDetailsRoute>();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>本地服务详情</Text>
        <Text style={styles.body}>
          功能占位：根据 serviceId（{route.params?.serviceId ?? '未知'}）加载本地服务信息。
        </Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing.md
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  body: {
    fontSize: typography.body,
    color: palette.textSecondary
  }
});

export default ServiceDetailsScreen;
