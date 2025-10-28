// 文件路径: src/RegisterScreen.tsx

import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View, TextInput, Pressable, Alert} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {registerUser} from '@app/store/redux/slices/userSlice';
import type {RootStackParamList} from '@app/navigation/types';
import {palette, spacing, typography} from '@app/theme';
import type { RootState } from '@app/store/redux/store';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const selectUserStatus = (state: RootState) => state.user.status;
const selectUserError = (state: RootState): string | undefined =>state.auth.error ?? undefined;
const RegisterScreen = ({navigation}: Props): JSX.Element => {
  const dispatch = useAppDispatch();

  const accounts     = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const activeUser = useMemo(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const authStatus = useAppSelector(selectUserStatus);
  const authError  = useAppSelector(selectUserError);

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | undefined>();

  useEffect(() => {
    if (activeUser) {
      const nextRoute = activeUser.hasCompletedProfile ? 'MainTabs' : 'PetOnboarding';
      navigation.reset({
        index: 0,
        routes: [{ name: nextRoute as keyof RootStackParamList }],
      });
    }
  }, [activeUser, navigation]);

  useEffect(() => {
    if (authStatus === 'failed') {
  setError(authError ?? undefined);
};
    if (authStatus === 'succeeded') {
      Alert.alert('注册成功！', '请设置您的宠物信息。');
      navigation.reset({ index: 0, routes: [{ name: 'PetOnboarding' }] });
    }
  }, [authStatus, authError, navigation]);

  const handleRegister = () => {
    const trimmedName  = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setError('请填写昵称、邮箱和密码');
      return;
    }
    if (password.length < 6) {
      setError('密码必须至少为6个字符');
      return;
    }

    setError(undefined);
    dispatch(registerUser({ name: trimmedName, email: trimmedEmail, password }));
  };

  const isLoading = authStatus === 'loading';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>创建新账号</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="昵称"
        placeholderTextColor={palette.textSecondary}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false} // 可选：避免邮箱被自动更正
        placeholder="邮箱"
        placeholderTextColor={palette.textSecondary}
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        // textContentType="password"   // iOS 可选
        // autoComplete="password"      // Android 可选
        placeholder="密码 (至少6位)"
        placeholderTextColor={palette.textSecondary}
        editable={!isLoading}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? '注册中...' : '立即注册'}</Text>
      </Pressable>

      <Pressable
        style={styles.linkButton}
        onPress={() => navigation.navigate('Login')}
        disabled={isLoading}
      >
        <Text style={styles.linkText}>已有账号？点击登录</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  primaryButton: {
    backgroundColor: palette.secondary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  linkButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    color: palette.primary,
    fontSize: typography.body,
  },
  error: {
    color: '#d32f2f',
    marginBottom: spacing.sm,
  },
});

export default RegisterScreen;
