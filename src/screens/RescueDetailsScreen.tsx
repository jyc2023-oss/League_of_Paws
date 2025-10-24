import React from 'react';
import {RouteProp, useRoute} from '@react-navigation/native';
import {StyleSheet, Text, View} from 'react-native';
import Screen from '@app/components/common/Screen';
import type {RootStackParamList} from '@app/navigation/types';
import {palette, spacing, typography} from '@app/theme';

type RescueDetailsRoute = RouteProp<RootStackParamList, 'RescueDetails'>;

const RescueDetailsScreen = (): JSX.Element => {
  const route = useRoute<RescueDetailsRoute>();

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>救助信息</Text>
        <Text style={styles.body}>
          功能占位：根据 rescueId（{route.params?.rescueId ?? '未知'}）加载救助详情。
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

export default RescueDetailsScreen;
