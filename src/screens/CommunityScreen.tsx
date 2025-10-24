import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Screen from '@app/components/common/Screen';
import {spacing, typography, palette} from '@app/theme';

const CommunityScreen = (): JSX.Element => (
  <Screen>
    <View style={styles.container}>
      <Text style={styles.title}>社区广场</Text>
      <Text style={styles.description}>
        未来将在这里接入宠物圈子、问题互助、救助信息等内容流组件。
      </Text>
    </View>
  </Screen>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  title: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md
  },
  description: {
    fontSize: typography.body,
    color: palette.textSecondary,
    textAlign: 'center'
  }
});

export default CommunityScreen;
