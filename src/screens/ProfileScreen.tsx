import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Screen from '@app/components/common/Screen';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {setThemePreference} from '@app/store/redux/slices/appSlice';
import {palette, spacing, typography} from '@app/theme';

const themeOrder: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

const ProfileScreen = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const {themePreference, isOnboarded} = useAppSelector(state => state.app);

  const cycleTheme = () => {
    const currentIdx = themeOrder.indexOf(themePreference);
    const nextTheme = themeOrder[(currentIdx + 1) % themeOrder.length];
    dispatch(setThemePreference(nextTheme));
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>我的</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>账户状态</Text>
          <Text style={styles.bodyText}>引导流程：{isOnboarded ? '已完成' : '未完成'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>外观偏好</Text>
          <Text style={styles.bodyText}>当前主题：{themePreference}</Text>
          <Pressable style={styles.button} onPress={cycleTheme}>
            <Text style={styles.buttonText}>切换主题模式</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.lg
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.textPrimary
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    marginTop: spacing.md
  },
  cardTitle: {
    fontSize: typography.heading,
    fontWeight: '600',
    color: palette.textPrimary
  },
  bodyText: {
    fontSize: typography.body,
    color: palette.textSecondary,
    marginTop: spacing.xs
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: palette.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.sm
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default ProfileScreen;
