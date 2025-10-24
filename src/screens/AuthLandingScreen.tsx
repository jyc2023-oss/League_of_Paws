import React from 'react';
import {StyleSheet, Text, View, Pressable} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '@app/navigation/types';
import {palette, spacing, typography} from '@app/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthLanding'>;

const AuthLandingScreen = ({navigation}: Props): JSX.Element => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>欢迎来到汪者荣耀</Text>
      <Text style={styles.subtitle}>
        登录或注册账号，开始管理你的宠物健康与社区互动。
      </Text>

      <Pressable
        style={[styles.button, styles.primaryButton]}
        onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>登录已有账号</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Register')}>
        <Text style={[styles.buttonText, styles.secondaryText]}>注册新账号</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: palette.background
  },
  title: {
    fontSize: typography.title,
    color: palette.textPrimary,
    fontWeight: '700'
  },
  subtitle: {
    textAlign: 'center',
    color: palette.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    fontSize: typography.body,
    lineHeight: 22
  },
  button: {
    width: '100%',
    paddingVertical: spacing.sm,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: spacing.md
  },
  primaryButton: {
    backgroundColor: palette.primary,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 3
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: palette.primary,
    backgroundColor: '#fff'
  },
  buttonText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#fff'
  },
  secondaryText: {
    color: palette.primary
  }
});

export default AuthLandingScreen;
