import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View, TextInput, Pressable} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAppDispatch, useAppSelector} from '@app/store/redux/hooks';
import {registerUser} from '@app/store/redux/slices/userSlice';
import type {RootStackParamList} from '@app/navigation/types';
import {palette, spacing, typography} from '@app/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({navigation}: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.auth.accounts);
  const activeUserId = useAppSelector(state => state.auth.activeUserId);
  const activeUser = useMemo(
    () => accounts.find(account => account.id === activeUserId),
    [accounts, activeUserId]
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();

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

  const handleRegister = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length === 0 || trimmedEmail.length === 0) {
      setError('请填写昵称和邮箱');
      return;
    }

    const duplicate = accounts.find(
      account => account.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (duplicate) {
      setError('该邮箱已注册，请改用登录');
      return;
    }

    setError(undefined);
    dispatch(registerUser({name: trimmedName, email: trimmedEmail}));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>创建新账号</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="昵称"
        placeholderTextColor={palette.textSecondary}
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="邮箱"
        placeholderTextColor={palette.textSecondary}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.primaryButton} onPress={handleRegister}>
        <Text style={styles.buttonText}>立即注册</Text>
      </Pressable>

      <Pressable
        style={styles.linkButton}
        onPress={() => navigation.navigate('Login')}>
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
    backgroundColor: palette.secondary,
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
    marginTop: spacing.md,
    alignItems: 'center'
  },
  linkText: {
    color: palette.primary,
    fontSize: typography.body
  },
  error: {
    color: '#d32f2f',
    marginBottom: spacing.sm
  }
});

export default RegisterScreen;
