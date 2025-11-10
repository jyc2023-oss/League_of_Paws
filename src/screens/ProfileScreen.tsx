import React, {useMemo} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Screen from '@app/components/common/Screen';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {setThemePreference} from '@app/store/redux/slices/appSlice';
import {
  logout,
  promoteUser,
  UserRole
} from '@app/store/redux/slices/userSlice';
import {palette, spacing, typography} from '@app/theme';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@app/navigation/types';

const themeOrder: Array<'light' | 'dark' | 'system'> = [
  'light',
  'dark',
  'system'
];

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = (): JSX.Element => {
  const navigation = useNavigation<Navigation>();
  const dispatch = useAppDispatch();
  const themePreference = useAppSelector(state => state.app.themePreference);
  const accounts = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);

  const activeUser = useMemo(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const cycleTheme = () => {
    const currentIdx = themeOrder.indexOf(themePreference);
    const nextTheme = themeOrder[(currentIdx + 1) % themeOrder.length];
    dispatch(setThemePreference(nextTheme));
  };

  const handlePromote = (targetRole: UserRole) => {
    if (!activeUser) {
      return;
    }
    dispatch(
      promoteUser({
        userId: activeUser.id,
        targetRole
      })
    );
    Alert.alert('权限更新', '已切换至资深用户权限。');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigation.reset({
      index: 0,
      routes: [{name: 'AuthLanding'}]
    });
  };

  return (
    <Screen padded={true}>
      <View style={styles.container}>
        <Text style={styles.title}>个人中心</Text>
        {activeUser ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{activeUser.name}</Text>
            <Text style={styles.bodyText}>邮箱：{activeUser.email}</Text>
            <Text style={styles.bodyText}>
              角色：
              {activeUser.role === 'senior' ? '资深用户' : '普通用户'}
            </Text>
            <Text style={styles.bodyText}>
              已登记宠物：{activeUser.petsCount} 只
            </Text>
            <Text style={styles.bodyText}>
              档案完善：{activeUser.hasCompletedProfile ? '已完成' : '待完成'}
            </Text>
            {activeUser.role === 'normal' && (
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={() => handlePromote('senior')}>
                <Text style={styles.buttonText}>申请资深认证</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.button, styles.dangerButton]}
              onPress={handleLogout}>
              <Text style={styles.buttonDangerText}>退出登录</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.bodyText}>请登录后查看个人信息。</Text>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{name: 'AuthLanding'}]
                })
              }>
              <Text style={styles.buttonText}>前往登录</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>外观偏好</Text>
          <Text style={styles.bodyText}>当前主题：{themePreference}</Text>
          <Pressable style={styles.button} onPress={cycleTheme}>
            <Text style={styles.buttonText}>切换主题模式</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>快速入口</Text>
          <View style={styles.linkRow}>
            <Pressable
              style={styles.linkButton}
              onPress={() => navigation.navigate('HabitCheckIn')}>
              <Text style={styles.linkText}>每日打卡</Text>
            </Pressable>
            <Pressable
              style={[styles.linkButton, styles.linkButtonLast]}
              onPress={() => navigation.navigate('CreatePost')}>
              <Text style={styles.linkText}>发布动态</Text>
            </Pressable>
          </View>
          <View style={styles.linkRow}>
            <Pressable
              style={styles.linkButton}
              onPress={() => navigation.navigate('ServiceFinder')}>
              <Text style={styles.linkText}>本地服务</Text>
            </Pressable>
            <Pressable
              style={[styles.linkButton, styles.linkButtonLast]}
              onPress={() => navigation.navigate('RescueSubmission')}>
              <Text style={styles.linkText}>救助发布</Text>
            </Pressable>
          </View>
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
  secondaryButton: {
    backgroundColor: palette.primary
  },
  dangerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d32f2f'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  buttonDangerText: {
    color: '#d32f2f',
    fontWeight: '600'
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm
  },
  linkButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.primary,
    borderRadius: 16,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    marginRight: spacing.sm
  },
  linkButtonLast: {
    marginRight: 0
  },
  linkText: {
    color: palette.primary,
    fontWeight: '600'
  }
});

export default ProfileScreen;
