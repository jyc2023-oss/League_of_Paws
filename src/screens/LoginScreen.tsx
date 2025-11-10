import React, {useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {loginUserAsync} from '@app/store/redux/slices/userSlice';
import type {RootStackParamList} from '@app/navigation/types';
import {palette, spacing, typography} from '@app/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({navigation}: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const loginStatus = useAppSelector(state => state.auth.status);
  const loginError = useAppSelector(state => state.auth.error);
  const activeUser = useMemo(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | undefined>();

  useEffect(() => {
    if (activeUser) {
      const nextRoute = activeUser.hasCompletedProfile
        ? 'MainTabs'
        : 'PetOnboarding';
      navigation.reset({
        index: 0,
        routes: [{name: nextRoute as keyof RootStackParamList}]
      });
    }
  }, [activeUser, navigation]);

  // 显示来自Redux的错误信息
  useEffect(() => {
    if (loginError) {
      setLocalError(loginError);
    }
  }, [loginError]);

  const handleLogin = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 清除之前的错误
    setLocalError(undefined);

    // 验证输入
    if (trimmedEmail.length === 0) {
      setLocalError('请输入邮箱');
      return;
    }

    if (trimmedPassword.length === 0) {
      setLocalError('请输入密码');
      return;
    }

    // 调用登录API
    dispatch(loginUserAsync({
      email: trimmedEmail,
      password: trimmedPassword
    }));
  };

  const isLoading = loginStatus === 'loading';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>登录账号</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="邮箱"
        placeholderTextColor={palette.textSecondary}
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="密码"
        placeholderTextColor={palette.textSecondary}
        editable={!isLoading}
      />
      {(localError || loginError) && (
        <Text style={styles.error}>{localError || loginError}</Text>
      )}

      <Pressable 
        style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
        <Text style={styles.buttonText}>立即登录</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.linkButton}
        onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>还没有账号？前往注册</Text>
      </Pressable>

      <Pressable
        style={styles.linkButton}
        onPress={() => {
          Alert.alert('提示', '暂未接入第三方登录，请使用邮箱方式体验。');
        }}>
        <Text style={styles.linkTextMuted}>第三方登录功能暂未开放</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xl
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: palette.textPrimary,
    marginBottom: spacing.sm
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  linkButton: {
    marginTop: spacing.sm,
    alignItems: 'center'
  },
  linkText: {
    color: palette.primary,
    fontSize: typography.body
  },
  linkTextMuted: {
    color: palette.textSecondary,
    fontSize: typography.caption
  },
  error: {
    color: '#d32f2f',
    marginBottom: spacing.sm
  },
  primaryButtonDisabled: {
    opacity: 0.6
  }
});

export default LoginScreen;
